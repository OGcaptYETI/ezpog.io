import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { getProject } from '@/services/firestore/projects';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { Project } from '@/types';
import type { FieldTeam } from '@/types/fieldTeams';
import { 
  ArrowLeft, 
  Edit, 
  MoreVertical, 
  TrendingUp, 
  Users as UsersIcon, 
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { ProjectModal } from '@/components/projects/ProjectModal';

type TabId = 'overview' | 'stores' | 'team' | 'milestones';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [assignedStores, setAssignedStores] = useState<any[]>([]);
  const [assignedTeams, setAssignedTeams] = useState<FieldTeam[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // RBAC permissions
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (project && activeTab === 'stores' && project.assignedStores && project.assignedStores.length > 0) {
      loadAssignedStores();
    }
  }, [activeTab, project]);

  useEffect(() => {
    if (project && activeTab === 'team' && project.assignedTeams && project.assignedTeams.length > 0) {
      loadAssignedTeams();
    }
  }, [activeTab, project]);

  const loadProject = async () => {
    if (!projectId) return;
    
    try {
      const projectData = await getProject(projectId);
      if (projectData) {
        setProject(projectData);
      } else {
        showToast('Project not found', 'error');
        navigate('/dashboard/projects');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      showToast('Failed to load project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value: any): string => {
    if (!value) return 'N/A';
    try {
      if (value instanceof Date) return value.toLocaleDateString();
      if (value.toDate && typeof value.toDate === 'function') return value.toDate().toLocaleDateString();
      if (value.seconds) return new Date(value.seconds * 1000).toLocaleDateString();
      return new Date(value).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'on_hold': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'planning': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const loadAssignedStores = async () => {
    if (!project?.assignedStores || project.assignedStores.length === 0) return;

    setLoadingStores(true);
    try {
      const storesQuery = query(
        collection(db, 'stores'),
        where(documentId(), 'in', project.assignedStores.slice(0, 10)) // Firestore limit
      );
      const storesSnapshot = await getDocs(storesQuery);
      const storesData = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAssignedStores(storesData);
    } catch (error) {
      console.error('Error loading assigned stores:', error);
    } finally {
      setLoadingStores(false);
    }
  };

  const loadAssignedTeams = async () => {
    if (!project?.assignedTeams || project.assignedTeams.length === 0) return;

    setLoadingTeams(true);
    try {
      const teamsQuery = query(
        collection(db, 'fieldTeams'),
        where(documentId(), 'in', project.assignedTeams.slice(0, 10)) // Firestore limit
      );
      const teamsSnapshot = await getDocs(teamsQuery);
      const teamsData = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FieldTeam[];
      setAssignedTeams(teamsData);
    } catch (error) {
      console.error('Error loading assigned teams:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleModalSave = async () => {
    await loadProject();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Project not found</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/projects')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                {project.priority}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{project.projectId}</p>
            {project.description && (
              <p className="text-gray-700 mt-4">{project.description}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            {canEdit && (
              <Button onClick={() => setIsEditModalOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
            )}
            <button className="p-2 hover:bg-gray-100 rounded">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{project.completionPercentage || 0}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{project.totalStores || 0}</div>
            <div className="text-sm text-gray-500">Total Stores</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <UsersIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{project.teamMembers?.length || 0}</div>
            <div className="text-sm text-gray-500">Team Members</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {project.milestones?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Milestones</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: FileText },
              { id: 'stores', name: 'Stores', icon: Building2 },
              { id: 'team', name: 'Team', icon: UsersIcon },
              { id: 'milestones', name: 'Milestones', icon: CheckCircle2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Project Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Dates */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Timeline
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target End:</span>
                      <span className="font-medium">{formatDate(project.targetEndDate)}</span>
                    </div>
                    {project.actualEndDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Actual End:</span>
                        <span className="font-medium">{formatDate(project.actualEndDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Info */}
                {(project.chainName || project.region) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </h3>
                    <div className="space-y-2 text-sm">
                      {project.chainName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chain:</span>
                          <span className="font-medium">{project.chainName}</span>
                        </div>
                      )}
                      {project.region && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Region:</span>
                          <span className="font-medium">{project.region}</span>
                        </div>
                      )}
                      {project.district && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">District:</span>
                          <span className="font-medium">{project.district}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Budget Info */}
                {(project.estimatedBudget || project.estimatedLaborHours) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Budget & Resources
                    </h3>
                    <div className="space-y-2 text-sm">
                      {project.estimatedBudget && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Budget:</span>
                          <span className="font-medium">
                            {project.currency} {project.estimatedBudget.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {project.actualBudget && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Actual Budget:</span>
                          <span className="font-medium">
                            {project.currency} {project.actualBudget.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {project.estimatedLaborHours && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Est. Labor Hours:</span>
                          <span className="font-medium">{project.estimatedLaborHours.toLocaleString()} hrs</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Project Type */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Project Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{project.projectType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{formatDate(project.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created By:</span>
                      <span className="font-medium">{project.createdByName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Overall Progress</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{project.completedStores || 0} of {project.totalStores || 0} stores completed</span>
                    <span className="font-semibold">{project.completionPercentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all"
                      style={{ width: `${project.completionPercentage || 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{project.inProgressStores || 0} in progress</span>
                    <span>{(project.totalStores || 0) - (project.completedStores || 0) - (project.inProgressStores || 0)} not started</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {project.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Project Notes</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{project.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stores' && (
            <div>
              {loadingStores ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
                </div>
              ) : assignedStores.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Assigned Stores ({project.assignedStores?.length || 0})
                    </h3>
                    <Link 
                      to="/dashboard/stores"
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View All Stores →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignedStores.map((store) => (
                      <Link
                        key={store.id}
                        to={`/dashboard/stores/${store.id}`}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          <Building2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{store.storeName}</h4>
                            <p className="text-sm text-gray-600">{store.storeId || store.storeNumber}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {store.city}, {store.state} {store.zipCode}
                            </p>
                            {store.region && (
                              <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                                {store.region}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {project.assignedStores && project.assignedStores.length > 10 && (
                    <p className="text-sm text-gray-500 text-center mt-4">
                      Showing first 10 of {project.assignedStores.length} stores
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stores Assigned</h3>
                  <p className="text-gray-600 mb-6">
                    Assign stores to this project from the Stores page
                  </p>
                  {canEdit && (
                    <Button onClick={() => setIsEditModalOpen(true)}>
                      Edit Project
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-8">
              {/* Assigned Field Teams */}
              {loadingTeams ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                </div>
              ) : assignedTeams.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Assigned Field Teams ({assignedTeams.length})
                    </h3>
                    {canEdit && (
                      <Button 
                        onClick={() => setIsEditModalOpen(true)}
                        size="sm"
                        variant="outline"
                      >
                        <UsersIcon className="w-4 h-4 mr-2" />
                        Manage Teams
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignedTeams.map((team) => (
                      <Link
                        key={team.id}
                        to={`/dashboard/field-teams/${team.id}`}
                        className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors border-2 border-blue-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            team.type === 'internal' ? 'bg-blue-600' : 'bg-purple-600'
                          }`}>
                            <UsersIcon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900">{team.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {team.type === 'internal' ? 'Internal Team' : '1099 Contractor'}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                              <span>{team.members?.length || 0} members</span>
                              {team.assignedStores && (
                                <span>• {team.assignedStores.length} stores</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : project.assignedTeams && project.assignedTeams.length > 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <UsersIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-600">Loading assigned teams...</p>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <UsersIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Field Teams Assigned</h4>
                  <p className="text-gray-600 mb-4">Assign field teams to this project to track their progress</p>
                  {canEdit && (
                    <Button onClick={() => setIsEditModalOpen(true)}>
                      <UsersIcon className="w-4 h-4 mr-2" />
                      Assign Teams
                    </Button>
                  )}
                </div>
              )}

              {/* Individual Team Members */}
              {project.teamMembers && project.teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.teamMembers.map((member, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <UsersIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{member.displayName}</h4>
                          <p className="text-sm text-gray-600 truncate">{member.email}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Team Members</h3>
                  <p className="text-gray-600">Add team members by editing the project</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'milestones' && (
            <div>
              {project.milestones && project.milestones.length > 0 ? (
                <div className="space-y-4">
                  {project.milestones.map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className={`bg-gray-50 rounded-lg p-4 border-l-4 ${
                        milestone.completed ? 'border-green-500' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {milestone.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Clock className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className={`font-semibold ${milestone.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                              {milestone.name}
                            </h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>Target: {formatDate(milestone.targetDate)}</span>
                              {milestone.completedDate && (
                                <span className="text-green-600">
                                  Completed: {formatDate(milestone.completedDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Milestones</h3>
                  <p className="text-gray-600">Add milestones by editing the project</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleModalSave}
        project={project}
        mode="edit"
      />
    </div>
  );
}

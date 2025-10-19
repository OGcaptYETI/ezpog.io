import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { getProjectsByOrganization, deleteProject } from '@/services/firestore/projects';
import type { Project } from '@/types';
import { FolderKanban, Plus, Search, Grid3x3, List, Filter, MoreVertical, Edit, Trash2, Lock, Calendar, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { ProjectModal } from '@/components/projects/ProjectModal';

type ViewMode = 'grid' | 'list';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '' as '' | 'draft' | 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled',
    projectType: '' as '' | 'reset' | 'refresh' | 'new_store' | 'seasonal' | 'remodel' | 'compliance_check' | 'emergency',
    priority: '' as '' | 'low' | 'medium' | 'high' | 'urgent',
  });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);

  // Permission checks
  const canCreate = user?.role === 'admin' || user?.role === 'manager';
  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (user?.organizationId) {
      loadProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organizationId]);

  async function loadProjects() {
    if (!user?.organizationId) return;
    
    try {
      const projectsData = await getProjectsByOrganization(
        user.organizationId,
        filters.status || filters.projectType || filters.priority
          ? {
              status: filters.status || undefined,
              projectType: filters.projectType || undefined,
              priority: filters.priority || undefined,
            }
          : undefined
      );
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateProject = () => {
    setModalMode('create');
    setSelectedProject(undefined);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    if (!canEdit) {
      showToast('You do not have permission to edit projects', 'error');
      return;
    }
    setModalMode('edit');
    setSelectedProject(project);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (projectId: string) => {
    if (!canDelete) {
      showToast('You do not have permission to delete projects', 'error');
      return;
    }
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await deleteProject(projectId);
      await loadProjects();
      setOpenMenuId(null);
      showToast('Project deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('Failed to delete project. Check your permissions.', 'error');
    }
  };

  const handleModalSave = async () => {
    await loadProjects();
  };

  const filteredProjects = projects.filter(p => {
    const search = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(search) ||
      p.projectId?.toLowerCase().includes(search) ||
      p.chainName?.toLowerCase().includes(search)
    );
  });

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
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-indigo-600" />
            Projects
          </h1>
          <p className="text-gray-600 mt-1">Manage POG execution and reset projects</p>
        </div>
        <div className="flex gap-3">
          {canCreate ? (
            <Button onClick={handleCreateProject}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          ) : (
            <Button disabled className="opacity-50 cursor-not-allowed">
              <Lock className="w-4 h-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects by name, ID, or chain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <Button variant="outline" size="default">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>

        <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FolderKanban className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
          </h3>
          <p className="text-gray-600 mb-6">
            {projects.length === 0 
              ? 'Create your first project to get started'
              : 'Try adjusting your search or filters'}
          </p>
          {canCreate && projects.length === 0 && (
            <Button onClick={handleCreateProject}>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        /* Projects List/Grid */
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 relative"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.projectId}</p>
                </div>
                
                {/* Actions Menu */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === project.id ? null : project.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {openMenuId === project.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      {canEdit ? (
                        <button
                          onClick={() => handleEditProject(project)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full px-4 py-2 text-left text-gray-400 flex items-center gap-2 cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4" />
                          Edit (No Permission)
                        </button>
                      )}
                      {canDelete ? (
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full px-4 py-2 text-left text-gray-400 flex items-center gap-2 cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4" />
                          Delete (No Permission)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
              )}

              {/* Badges */}
              <div className="flex gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                  {project.projectType.replace('_', ' ')}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{project.completionPercentage || 0}%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{project.teamMembers?.length || 0}</div>
                  <div className="text-xs text-gray-500">Team</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{project.totalStores || 0}</div>
                  <div className="text-xs text-gray-500">Stores</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{project.completedStores || 0} / {project.totalStores || 0} stores</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${project.completionPercentage || 0}%` }}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Start: {project.startDate?.toDate ? project.startDate.toDate().toLocaleDateString() : 'N/A'}</span>
                  <span>Target: {project.targetEndDate?.toDate ? project.targetEndDate.toDate().toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        project={selectedProject}
        mode={modalMode}
      />
    </div>
  );
}

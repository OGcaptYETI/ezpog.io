import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { getProjectsByOrganization, deleteProject } from '@/services/firestore/projects';
import type { Project } from '@/types';
import { FolderKanban, Plus, Search, Grid3x3, List, Filter, Lock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { AssignTeamToProjectModal } from '@/components/projects/AssignTeamToProjectModal';

type ViewMode = 'grid' | 'list';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState({
    status: '' as '' | 'draft' | 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled',
    projectType: '' as '' | 'reset' | 'refresh' | 'new_store' | 'seasonal' | 'remodel' | 'compliance_check' | 'emergency',
    priority: '' as '' | 'low' | 'medium' | 'high' | 'urgent',
  });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [showAssignTeamsModal, setShowAssignTeamsModal] = useState(false);
  const [projectToAssign, setProjectToAssign] = useState<Project | null>(null);

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
      showToast('Project deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('Failed to delete project. Check your permissions.', 'error');
    }
  };

  const handleModalSave = async () => {
    await loadProjects();
  };

  // Helper to safely format dates from Firestore Timestamps
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
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={handleEditProject}
              onDelete={handleDelete}
              onAssignTeams={(project) => {
                setProjectToAssign(project);
                setShowAssignTeamsModal(true);
              }}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />
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

      {/* Assign Teams Modal */}
      {projectToAssign && (
        <AssignTeamToProjectModal
          isOpen={showAssignTeamsModal}
          onClose={() => {
            setShowAssignTeamsModal(false);
            setProjectToAssign(null);
          }}
          projectId={projectToAssign.id}
          projectName={projectToAssign.name}
          onSuccess={() => {
            loadProjects();
            setShowAssignTeamsModal(false);
            setProjectToAssign(null);
          }}
        />
      )}
    </div>
  );
}

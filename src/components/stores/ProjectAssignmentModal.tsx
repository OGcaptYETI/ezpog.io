import { useState, useEffect } from 'react';
import { getActiveProjects, addStoreToProject, removeStoreFromProject } from '@/services/firestore/projects';
import type { Project, ProjectStore } from '@/types';
import { X, Briefcase, Search, Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { useAuth } from '@/features/auth';
import { type Store } from '@/services/firestore/stores';

interface ProjectAssignmentModalProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProjectAssignmentModal({ store, isOpen, onClose, onSuccess }: ProjectAssignmentModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [assignedProjects, setAssignedProjects] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user?.organizationId) {
      loadProjects();
    }
  }, [isOpen, user?.organizationId]);

  const loadProjects = async () => {
    if (!user?.organizationId) return;
    
    setLoading(true);
    try {
      const projectsList = await getActiveProjects(user.organizationId);
      setProjects(projectsList);

      // Check which projects this store is already assigned to
      const assigned = new Set<string>();
      projectsList.forEach(project => {
        if (project.stores?.some(s => s.storeId === store.storeId)) {
          assigned.add(project.id);
        }
      });
      setAssignedProjects(assigned);
      setSelectedProjects(new Set(assigned));
    } catch (error) {
      console.error('Error loading projects:', error);
      showToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toAdd = Array.from(selectedProjects).filter(id => !assignedProjects.has(id));
      const toRemove = Array.from(assignedProjects).filter(id => !selectedProjects.has(id));

      // Add store to new projects
      for (const projectId of toAdd) {
        const projectStore: ProjectStore = {
          storeId: store.storeId,
          storeName: store.storeName,
          storeNumber: store.storeNumber,
          address: store.address,
          city: store.city,
          state: store.state,
          zipCode: store.zipCode,
          country: store.country || 'USA',
          chainName: user?.organizationId || '',
          chainType: 'corporate',
          region: store.region,
          district: store.district,
          marketArea: store.marketArea,
          storeFormat: store.storeFormat,
          squareFootage: store.squareFootage,
          fixtureCount: store.fixtureCount,
          storeManager: store.storeManagerName,
          phoneNumber: store.storePhone,
          email: store.storeManagerEmail,
          resetRequired: false,
          status: 'pending',
          verifiedProducts: false,
        };
        await addStoreToProject(projectId, projectStore);
      }

      // Remove store from unselected projects
      for (const projectId of toRemove) {
        await removeStoreFromProject(projectId, store.storeId);
      }

      const addedCount = toAdd.length;
      const removedCount = toRemove.length;
      
      if (addedCount > 0 && removedCount > 0) {
        showToast(`Added to ${addedCount} project(s), removed from ${removedCount} project(s)`, 'success');
      } else if (addedCount > 0) {
        showToast(`Added to ${addedCount} project(s)`, 'success');
      } else if (removedCount > 0) {
        showToast(`Removed from ${removedCount} project(s)`, 'success');
      } else {
        showToast('No changes made', 'info');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating project assignments:', error);
      showToast('Failed to update project assignments', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assign to Projects</h2>
            <p className="text-sm text-gray-600 mt-1">{store.storeName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading || saving}
            />
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No projects found matching your search' : 'No active projects available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map(project => {
                const isSelected = selectedProjects.has(project.id);
                const wasAssigned = assignedProjects.has(project.id);
                const isChanged = isSelected !== wasAssigned;

                return (
                  <button
                    key={project.id}
                    onClick={() => toggleProject(project.id)}
                    disabled={saving}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-600">Project ID: {project.projectId}</p>
                          </div>
                        </div>
                        <div className="mt-2 ml-8 flex items-center gap-4 text-xs">
                          <span className={`px-2 py-1 rounded-full ${
                            project.status === 'active' ? 'bg-green-100 text-green-700' :
                            project.status === 'planning' ? 'bg-blue-100 text-blue-700' :
                            project.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {project.status}
                          </span>
                          <span className="text-gray-500">
                            {project.stores?.length || 0} store{(project.stores?.length || 0) !== 1 ? 's' : ''}
                          </span>
                          {project.startDate && (
                            <span className="text-gray-500">
                              Start: {project.startDate.toDate().toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {isChanged && (
                        <div className="ml-4">
                          {isSelected && !wasAssigned ? (
                            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                              <Plus className="w-4 h-4" />
                              Adding
                            </div>
                          ) : !isSelected && wasAssigned ? (
                            <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                              <Trash2 className="w-4 h-4" />
                              Removing
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary & Actions */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{selectedProjects.size}</span> project
              {selectedProjects.size !== 1 ? 's' : ''} selected
            </div>
            {selectedProjects.size !== assignedProjects.size && (
              <div className="text-sm text-indigo-600 font-medium">
                Unsaved changes
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={saving || selectedProjects.size === assignedProjects.size}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Save Assignments
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

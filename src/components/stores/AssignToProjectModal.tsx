import { useState, useEffect } from 'react';
import { X, Briefcase, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { useAuth } from '@/features/auth';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/services/firebase/config';

interface AssignToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStoreIds: string[];
  onSuccess: () => void;
}

interface Project {
  id: string;
  name: string;
  status: string;
  storeCount?: number;
  assignedStores?: string[];
}

export function AssignToProjectModal({
  isOpen,
  onClose,
  selectedStoreIds,
  onSuccess
}: AssignToProjectModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    if (!user?.organizationId) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'projects'),
        where('organizationId', '==', user.organizationId)
      );

      const snapshot = await getDocs(q);
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));

      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
      showToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProject = (projectId: string) => {
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

  const handleSelectAll = () => {
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map(p => p.id)));
    }
  };

  const handleAssign = async () => {
    if (selectedProjects.size === 0) {
      showToast('Please select at least one project', 'error');
      return;
    }

    setSaving(true);
    try {
      console.log('🔄 Assigning stores to projects...');
      console.log('Store IDs:', selectedStoreIds);
      console.log('Project IDs:', Array.from(selectedProjects));
      
      // Update each project with the assigned stores
      const projectIds = Array.from(selectedProjects);
      await Promise.all(
        projectIds.map(async (projectId) => {
          console.log(`Updating project ${projectId} with ${selectedStoreIds.length} stores`);
          await updateDoc(doc(db, 'projects', projectId), {
            assignedStores: arrayUnion(...selectedStoreIds)
          });
          console.log(`✅ Successfully updated project ${projectId}`);
        })
      );

      console.log('✅ All projects updated successfully');
      showToast(
        `Successfully assigned ${selectedStoreIds.length} store(s) to ${selectedProjects.size} project(s)!`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error assigning stores to projects:', error);
      showToast('Failed to assign stores to projects', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assign to Project</h2>
              <p className="text-sm text-gray-600">
                Assigning {selectedStoreIds.length} store{selectedStoreIds.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">No Projects Found</p>
              <p className="text-sm text-gray-500">Create a project first to assign stores</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedProjects.size === projects.length}
                  onChange={handleSelectAll}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <span className="font-medium text-gray-900">Select All Projects ({projects.length})</span>
              </label>

              {/* Project List */}
              {projects.map((project) => (
                <label
                  key={project.id}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedProjects.has(project.id)}
                    onChange={() => handleToggleProject(project.id)}
                    className="w-5 h-5 text-indigo-600 rounded mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status}
                      </span>
                      {project.assignedStores && project.assignedStores.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {project.assignedStores.length} stores already assigned
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedProjects.has(project.id) && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            {selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={saving || selectedProjects.size === 0}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                `Assign to ${selectedProjects.size} Project${selectedProjects.size !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

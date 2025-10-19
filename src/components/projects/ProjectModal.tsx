import { useState, useEffect } from 'react';
import { X, FileText, Calendar, MapPin, Users } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { createProject, updateProject } from '@/services/firestore/projects';
import type { ProjectFormData } from '@/services/firestore/projects';
import type { Project } from '@/types';
import { useToast } from '@/shared/components/ui/toast-context';
import { BasicInfoTab } from './tabs/BasicInfoTab';
import { TimelineTab } from './tabs/TimelineTab';
import { ScopeTab } from './tabs/ScopeTab';
import { TeamTab } from './tabs/TeamTab';

type TabId = 'basic' | 'timeline' | 'scope' | 'team';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  project?: Project;
  mode: 'create' | 'edit';
}

const tabs: Tab[] = [
  { id: 'basic', label: 'Basic Info', icon: FileText },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'scope', label: 'Scope & Budget', icon: MapPin },
  { id: 'team', label: 'Team', icon: Users },
];

const getInitialFormData = (): ProjectFormData => ({
  projectId: '',
  name: '',
  description: '',
  projectType: 'reset',
  status: 'draft',
  priority: 'medium',
  startDate: new Date(),
  targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  currency: 'USD',
  stores: [],
  teamMembers: [],
  tags: [],
});

export function ProjectModal({ isOpen, onClose, onSave, project, mode }: ProjectModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [formData, setFormData] = useState<ProjectFormData>(getInitialFormData());
  const [saving, setSaving] = useState(false);

  // Update formData when project prop changes (for edit mode)
  useEffect(() => {
    if (project && mode === 'edit') {
      setFormData({
        projectId: project.projectId,
        name: project.name,
        description: project.description,
        projectType: project.projectType,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate.toDate(),
        targetEndDate: project.targetEndDate.toDate(),
        actualEndDate: project.actualEndDate?.toDate(),
        milestones: project.milestones?.map(m => ({
          ...m,
          targetDate: m.targetDate.toDate(),
          completedDate: m.completedDate?.toDate(),
        })),
        estimatedBudget: project.estimatedBudget,
        actualBudget: project.actualBudget,
        estimatedLaborHours: project.estimatedLaborHours,
        actualLaborHours: project.actualLaborHours,
        currency: project.currency,
        chainName: project.chainName,
        chainType: project.chainType,
        region: project.region,
        district: project.district,
        stores: project.stores,
        teamMembers: project.teamMembers,
        tags: project.tags,
        notes: project.notes,
      });
    } else {
      setFormData(getInitialFormData());
    }
    setActiveTab('basic');
  }, [project, mode, isOpen]);

  const updateFormData = (data: Partial<ProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateForm = (): boolean => {
    if (!formData.projectId.trim()) {
      showToast('Project ID is required', 'error');
      setActiveTab('basic');
      return false;
    }
    if (!formData.name.trim()) {
      showToast('Project name is required', 'error');
      setActiveTab('basic');
      return false;
    }
    if (!formData.projectType) {
      showToast('Project type is required', 'error');
      setActiveTab('basic');
      return false;
    }
    if (!formData.startDate) {
      showToast('Start date is required', 'error');
      setActiveTab('timeline');
      return false;
    }
    if (!formData.targetEndDate) {
      showToast('Target end date is required', 'error');
      setActiveTab('timeline');
      return false;
    }
    if (formData.startDate >= formData.targetEndDate) {
      showToast('Target end date must be after start date', 'error');
      setActiveTab('timeline');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!user?.organizationId) {
      showToast('User organization not found', 'error');
      return;
    }

    if (!validateForm()) return;

    setSaving(true);
    try {
      if (mode === 'create') {
        await createProject(
          formData,
          user.organizationId,
          user.uid,
          user.displayName || user.email || 'Unknown User'
        );
        showToast('Project created successfully!', 'success');
      } else if (project) {
        await updateProject(project.id, formData);
        showToast('Project updated successfully!', 'success');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      showToast('Failed to save project. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <BasicInfoTab formData={formData} updateFormData={updateFormData} />
          )}
          {activeTab === 'timeline' && (
            <TimelineTab formData={formData} updateFormData={updateFormData} />
          )}
          {activeTab === 'scope' && (
            <ScopeTab formData={formData} updateFormData={updateFormData} />
          )}
          {activeTab === 'team' && (
            <TeamTab formData={formData} updateFormData={updateFormData} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

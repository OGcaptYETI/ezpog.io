import { FileText } from 'lucide-react';
import type { ProjectFormData } from '@/services/firestore/projects';
import type { ProjectType, ProjectStatus, ProjectPriority } from '@/types';

interface BasicInfoTabProps {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
}

export function BasicInfoTab({ formData, updateFormData }: BasicInfoTabProps) {
  const projectTypes: { value: ProjectType; label: string }[] = [
    { value: 'reset', label: 'Full Store Reset' },
    { value: 'refresh', label: 'Refresh/Update' },
    { value: 'new_store', label: 'New Store Setup' },
    { value: 'seasonal', label: 'Seasonal Changeover' },
    { value: 'remodel', label: 'Store Remodel' },
    { value: 'compliance_check', label: 'Compliance Check' },
    { value: 'emergency', label: 'Emergency Fix' },
  ];

  const statuses: { value: ProjectStatus; label: string }[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const priorities: { value: ProjectPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
      </div>

      {/* Project ID */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Project ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.projectId}
          onChange={(e) => updateFormData({ projectId: e.target.value })}
          placeholder="e.g., Q1-2026-RESET"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Unique identifier for this project</p>
      </div>

      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="e.g., Spring 2026 Reset - 7-Eleven"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Brief description of the project objectives..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Row 1: Project Type and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Project Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.projectType}
            onChange={(e) => updateFormData({ projectType: e.target.value as ProjectType })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            <option value="">Select Type</option>
            {projectTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) => updateFormData({ status: e.target.value as ProjectStatus })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Priority <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.priority}
          onChange={(e) => updateFormData({ priority: e.target.value as ProjectPriority })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        >
          {priorities.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Tags
        </label>
        <input
          type="text"
          value={formData.tags?.join(', ') || ''}
          onChange={(e) => updateFormData({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
          placeholder="e.g., Q1, Spring, National"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Comma-separated tags</p>
      </div>
    </div>
  );
}

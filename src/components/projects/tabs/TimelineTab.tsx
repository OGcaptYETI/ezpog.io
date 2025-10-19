import { Calendar, Plus, X, CheckCircle } from 'lucide-react';
import type { ProjectFormData } from '@/services/firestore/projects';

interface TimelineTabProps {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
}

export function TimelineTab({ formData, updateFormData }: TimelineTabProps) {
  const addMilestone = () => {
    const newMilestone = {
      id: `milestone-${Date.now()}`,
      name: '',
      targetDate: new Date(),
      completed: false,
    };
    updateFormData({
      milestones: [...(formData.milestones || []), newMilestone],
    });
  };

  const updateMilestone = (index: number, updates: Partial<{ id: string; name: string; targetDate: Date; completed: boolean; completedDate?: Date }>) => {
    const updatedMilestones = [...(formData.milestones || [])];
    updatedMilestones[index] = { ...updatedMilestones[index], ...updates };
    updateFormData({ milestones: updatedMilestones });
  };

  const removeMilestone = (index: number) => {
    const updatedMilestones = formData.milestones?.filter((_, i) => i !== index);
    updateFormData({ milestones: updatedMilestones });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Start Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.startDate.toISOString().split('T')[0]}
          onChange={(e) => updateFormData({ startDate: new Date(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      {/* Target End Date */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Target End Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.targetEndDate.toISOString().split('T')[0]}
          onChange={(e) => updateFormData({ targetEndDate: new Date(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      {/* Actual End Date (for completed projects) */}
      {formData.status === 'completed' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Actual End Date
          </label>
          <input
            type="date"
            value={formData.actualEndDate?.toISOString().split('T')[0] || ''}
            onChange={(e) => updateFormData({ actualEndDate: new Date(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Milestones Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900">Milestones</h4>
          <button
            type="button"
            onClick={addMilestone}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </button>
        </div>

        {formData.milestones && formData.milestones.length > 0 ? (
          <div className="space-y-3">
            {formData.milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                {/* Completed Checkbox */}
                <button
                  type="button"
                  onClick={() => updateMilestone(index, { completed: !milestone.completed })}
                  className="mt-2"
                >
                  {milestone.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                  )}
                </button>

                {/* Milestone Details */}
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={milestone.name}
                    onChange={(e) => updateMilestone(index, { name: e.target.value })}
                    placeholder="Milestone name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={milestone.targetDate.toISOString().split('T')[0]}
                    onChange={(e) => updateMilestone(index, { targetDate: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {milestone.completed && milestone.completedDate && (
                    <div className="text-sm text-green-600">
                      Completed: {milestone.completedDate.toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeMilestone(index)}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No milestones yet. Add milestones to track progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { Users, Plus, X, User } from 'lucide-react';
import type { ProjectFormData } from '@/services/firestore/projects';
import type { ProjectMember } from '@/types';

interface TeamTabProps {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
}

export function TeamTab({ formData, updateFormData }: TeamTabProps) {
  const addTeamMember = () => {
    const newMember: ProjectMember = {
      userId: '',
      displayName: '',
      email: '',
      role: 'field_team',
      assignedStores: [],
    };
    updateFormData({
      teamMembers: [...(formData.teamMembers || []), newMember],
    });
  };

  const updateTeamMember = (index: number, updates: Partial<ProjectMember>) => {
    const updatedMembers = [...(formData.teamMembers || [])];
    updatedMembers[index] = { ...updatedMembers[index], ...updates };
    updateFormData({ teamMembers: updatedMembers });
  };

  const removeTeamMember = (index: number) => {
    const updatedMembers = formData.teamMembers?.filter((_, i) => i !== index);
    updateFormData({ teamMembers: updatedMembers });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This section is for adding individual project coordinators or managers. To assign entire field teams with all their members, use the "Assign Teams" button from the project card menu or project detail page.
        </p>
      </div>

      {/* Add Team Member Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Assign team members to this project
        </p>
        <button
          type="button"
          onClick={addTeamMember}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Team Members List */}
      {formData.teamMembers && formData.teamMembers.length > 0 ? (
        <div className="space-y-4">
          {formData.teamMembers.map((member, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Team Member #{index + 1}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeTeamMember(index)}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={member.displayName}
                    onChange={(e) => updateTeamMember(index, { displayName: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateTeamMember(index, { email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* User ID (for future integration) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={member.userId}
                    onChange={(e) => updateTeamMember(index, { userId: e.target.value })}
                    placeholder="Auto-generated"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-100"
                    disabled
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Role on Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={member.role}
                    onChange={(e) => updateTeamMember(index, { role: e.target.value as ProjectMember['role'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="manager">Manager</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="field_team">Field Team</option>
                  </select>
                </div>
              </div>

              {/* Assigned Stores Count (Phase 2) */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Assigned Stores: <span className="font-medium">{member.assignedStores?.length || 0}</span>
                  <span className="ml-2 text-xs text-gray-400">(Set in Phase 2 - Store Management)</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-600 mb-4">No team members added yet</p>
          <button
            type="button"
            onClick={addTeamMember}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Team Member
          </button>
        </div>
      )}

      {/* Team Summary */}
      {formData.teamMembers && formData.teamMembers.length > 0 && (
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h4 className="font-semibold text-indigo-900 mb-2">Team Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-indigo-700">Total Members</p>
              <p className="text-2xl font-bold text-indigo-900">{formData.teamMembers.length}</p>
            </div>
            <div>
              <p className="text-indigo-700">Managers</p>
              <p className="text-2xl font-bold text-indigo-900">
                {formData.teamMembers.filter(m => m.role === 'manager').length}
              </p>
            </div>
            <div>
              <p className="text-indigo-700">Field Team</p>
              <p className="text-2xl font-bold text-indigo-900">
                {formData.teamMembers.filter(m => m.role === 'field_team').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

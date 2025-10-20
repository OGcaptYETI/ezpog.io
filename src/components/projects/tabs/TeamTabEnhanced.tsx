import { useState, useEffect } from 'react';
import { Users, Plus, X, User, Building2, ExternalLink } from 'lucide-react';
import type { ProjectFormData } from '@/services/firestore/projects';
import type { ProjectMember } from '@/types';
import type { FieldTeam } from '@/types/fieldTeams';
import { Button } from '@/shared/components/ui/button';
import { AssignTeamToProjectModal } from '../AssignTeamToProjectModal';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { Link } from 'react-router-dom';

interface TeamTabProps {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
  projectId?: string;
  projectName?: string;
}

export function TeamTab({ formData, updateFormData, projectId, projectName }: TeamTabProps) {
  const [assignedTeams, setAssignedTeams] = useState<FieldTeam[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [showAssignTeamsModal, setShowAssignTeamsModal] = useState(false);

  // Load assigned field teams when formData changes
  useEffect(() => {
    if (formData.assignedTeams && formData.assignedTeams.length > 0) {
      loadAssignedTeams();
    } else {
      setAssignedTeams([]);
    }
  }, [formData.assignedTeams]);

  const loadAssignedTeams = async () => {
    if (!formData.assignedTeams || formData.assignedTeams.length === 0) return;

    setLoadingTeams(true);
    try {
      const teamIds = formData.assignedTeams.slice(0, 10); // Firestore 'in' limit
      const teamsQuery = query(
        collection(db, 'fieldTeams'),
        where(documentId(), 'in', teamIds)
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

  const handleTeamsAssigned = () => {
    setShowAssignTeamsModal(false);
    // Modal will update Firestore, parent will reload
  };

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
    <div className="space-y-8">
      {/* ASSIGNED FIELD TEAMS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Assigned Field Teams</h3>
            {assignedTeams.length > 0 && (
              <span className="text-sm text-gray-500">({assignedTeams.length})</span>
            )}
          </div>
          {projectId && projectName && (
            <Button onClick={() => setShowAssignTeamsModal(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {assignedTeams.length > 0 ? 'Manage Field Teams' : 'Assign Field Teams'}
            </Button>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Field Teams:</strong> Full teams with multiple members and assigned stores. 
            Changes to team membership are managed in the Field Teams section.
          </p>
        </div>

        {loadingTeams ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : assignedTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedTeams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-lg p-4 border-2 border-blue-200 hover:border-blue-400 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    team.type === 'internal' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{team.name}</h4>
                      <Link
                        to={`/dashboard/field-teams/${team.id}`}
                        className="text-blue-600 hover:text-blue-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {team.type === 'internal' ? 'Internal Team' : '1099 Contractor Team'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {team.members?.length || 0} members
                      </span>
                      {team.assignedStores && team.assignedStores.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {team.assignedStores.length} stores
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-600 mb-4">No field teams assigned yet</p>
            {projectId && projectName && (
              <Button onClick={() => setShowAssignTeamsModal(true)} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Assign Field Teams
              </Button>
            )}
          </div>
        )}
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-200" />

      {/* INDIVIDUAL TEAM MEMBERS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Individual Team Members</h3>
            {formData.teamMembers && formData.teamMembers.length > 0 && (
              <span className="text-sm text-gray-500">({formData.teamMembers.length})</span>
            )}
          </div>
          <Button onClick={addTeamMember} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Individual Members:</strong> Project coordinators, managers, or 1099 contractors. 
            For internal employees, select from your organization. For contractors, enter their details manually.
          </p>
        </div>

        {/* Team Members List */}
        {formData.teamMembers && formData.teamMembers.length > 0 ? (
          <div className="space-y-4">
            {formData.teamMembers.map((member, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg border-2 border-gray-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      {member.displayName || `Team Member #${index + 1}`}
                    </span>
                    {member.userId && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                        Internal
                      </span>
                    )}
                    {!member.userId && member.email && (
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                        1099
                      </span>
                    )}
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
                  {/* User ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      User ID {!member.userId && <span className="text-xs text-gray-500">(Optional for 1099)</span>}
                    </label>
                    <input
                      type="text"
                      value={member.userId}
                      onChange={(e) => updateTeamMember(index, { userId: e.target.value })}
                      placeholder={member.userId ? member.userId : "Leave empty for 1099"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {member.userId ? 'Internal employee ID' : 'External contractor - no user ID'}
                    </p>
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

                {/* Assigned Stores Count */}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Assigned Stores: <span className="font-medium">{member.assignedStores?.length || 0}</span>
                    <span className="ml-2 text-xs text-gray-400">(Managed in Store Assignment)</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Users className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-600 mb-4">No individual members added yet</p>
            <Button onClick={addTeamMember} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add First Team Member
            </Button>
          </div>
        )}

        {/* Team Summary */}
        {formData.teamMembers && formData.teamMembers.length > 0 && (
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-2">Individual Members Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-indigo-700">Total</p>
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

      {/* Assign Team Modal */}
      {projectId && projectName && (
        <AssignTeamToProjectModal
          isOpen={showAssignTeamsModal}
          onClose={() => setShowAssignTeamsModal(false)}
          projectId={projectId}
          projectName={projectName}
          onSuccess={handleTeamsAssigned}
        />
      )}
    </div>
  );
}

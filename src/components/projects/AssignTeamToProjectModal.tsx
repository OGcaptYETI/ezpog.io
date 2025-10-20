import { useState, useEffect } from 'react';
import { X, Users, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { useAuth } from '@/features/auth';
import { getFieldTeamsByOrganization } from '@/services/firestore/fieldTeams';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { FieldTeam } from '@/types/fieldTeams';

interface AssignTeamToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onSuccess: () => void;
}

export function AssignTeamToProjectModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  onSuccess
}: AssignTeamToProjectModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState<FieldTeam[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadTeams();
    }
  }, [isOpen]);

  const loadTeams = async () => {
    if (!user?.organizationId) return;

    setLoading(true);
    try {
      const teamsData = await getFieldTeamsByOrganization(user.organizationId);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading teams:', error);
      showToast('Failed to load teams', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTeam = (teamId: string) => {
    setSelectedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTeams.size === teams.length) {
      setSelectedTeams(new Set());
    } else {
      setSelectedTeams(new Set(teams.map(t => t.id)));
    }
  };

  const handleAssign = async () => {
    if (selectedTeams.size === 0) {
      showToast('Please select at least one team', 'error');
      return;
    }

    setSaving(true);
    try {
      // Update project with assigned teams
      await updateDoc(doc(db, 'projects', projectId), {
        assignedTeams: arrayUnion(...Array.from(selectedTeams))
      });

      showToast(
        `Successfully assigned ${selectedTeams.size} team(s) to ${projectName}!`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning teams:', error);
      showToast('Failed to assign teams', 'error');
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
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assign Teams to Project</h2>
              <p className="text-sm text-gray-600">Project: {projectName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Team List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">No Field Teams Found</p>
              <p className="text-sm text-gray-500">Create a field team first to assign to projects</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedTeams.size === teams.length}
                  onChange={handleSelectAll}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="font-medium text-gray-900">Select All Teams ({teams.length})</span>
              </label>

              {/* Team List */}
              {teams.map((team) => (
                <label
                  key={team.id}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTeams.has(team.id)}
                    onChange={() => handleToggleTeam(team.id)}
                    className="w-5 h-5 text-blue-600 rounded mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{team.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        team.type === 'internal' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {team.type === 'internal' ? 'Internal' : '1099 Contractor'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                      </span>
                      {team.assignedStores && team.assignedStores.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {team.assignedStores.length} store{team.assignedStores.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {team.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{team.description}</p>
                    )}
                  </div>
                  {selectedTeams.has(team.id) && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            {selectedTeams.size} team{selectedTeams.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={saving || selectedTeams.size === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                `Assign ${selectedTeams.size} Team${selectedTeams.size !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

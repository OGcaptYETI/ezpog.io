import { useState, useEffect } from 'react';
import { X, Users, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { useAuth } from '@/features/auth';

interface AssignToFieldTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStoreIds: string[];
  onSuccess: () => void;
}

interface FieldTeam {
  id: string;
  name: string;
  type: 'internal' | 'contractor';
  leaderId: string;
  leaderName?: string;
  members: string[];
  assignedStores: string[];
}

export function AssignToFieldTeamModal({
  isOpen,
  onClose,
  selectedStoreIds,
  onSuccess
}: AssignToFieldTeamModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState<FieldTeam[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadFieldTeams();
    }
  }, [isOpen]);

  const loadFieldTeams = async () => {
    if (!user?.organizationId) return;
    
    setLoading(true);
    try {
      const { getFieldTeamsByOrganization } = await import('@/services/firestore/fieldTeams');
      const teamsData = await getFieldTeamsByOrganization(user.organizationId);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading field teams:', error);
      showToast('Failed to load field teams', 'error');
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
      const { assignStoresToTeam } = await import('@/services/firestore/fieldTeams');
      
      // Assign stores to each selected team
      const teamIds = Array.from(selectedTeams);
      await Promise.all(
        teamIds.map(teamId => assignStoresToTeam(teamId, selectedStoreIds))
      );
      
      showToast(
        `Successfully assigned ${selectedStoreIds.length} store(s) to ${selectedTeams.size} team(s)!`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning stores to teams:', error);
      showToast('Failed to assign stores to teams', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assign to Field Teams</h2>
              <p className="text-sm text-gray-600">
                Assign {selectedStoreIds.length} selected store{selectedStoreIds.length !== 1 ? 's' : ''} to field teams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Field Teams Yet</h3>
              <p className="text-gray-600 mb-4">
                Field teams haven't been created yet. This feature will be available in Phase 3.
              </p>
              <p className="text-sm text-gray-500">
                Field teams allow you to organize users into clusters for store assignments.
              </p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teams.length > 0 && selectedTeams.size === teams.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({teams.length} teams)
                  </span>
                </label>
                <span className="text-sm text-gray-600">
                  {selectedTeams.size} selected
                </span>
              </div>

              {/* Team List */}
              <div className="space-y-3">
                {teams.map((team) => (
                  <label
                    key={team.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeams.has(team.id)}
                      onChange={() => handleToggleTeam(team.id)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{team.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          team.type === 'internal' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {team.type === 'internal' ? 'Internal' : '1099 Contractor'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{team.members.length} members</span>
                        <span>•</span>
                        <span>{team.assignedStores.length} stores assigned</span>
                        {team.leaderName && (
                          <>
                            <span>•</span>
                            <span>Leader: {team.leaderName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {selectedTeams.has(team.id) && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span>Stores will be added to selected teams' portfolios</span>
          </div>
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
                `Assign to ${selectedTeams.size} Team${selectedTeams.size !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

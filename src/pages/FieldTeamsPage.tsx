import { useState, useEffect } from 'react';
import { Users, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { useAuth } from '@/features/auth';
import { getFieldTeamsByOrganization, deleteFieldTeam } from '@/services/firestore/fieldTeams';
import { FieldTeamCard } from '@/features/admin/field-teams/components/FieldTeamCard';
import { CreateFieldTeamModal } from '@/features/admin/field-teams/components/CreateFieldTeamModal';
import type { FieldTeam } from '@/types/fieldTeams';

export default function FieldTeamsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [teams, setTeams] = useState<FieldTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<FieldTeam | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Permissions
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    loadTeams();
  }, [user?.organizationId]);

  const loadTeams = async () => {
    if (!user?.organizationId) return;

    setLoading(true);
    try {
      const teamsData = await getFieldTeamsByOrganization(user.organizationId);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading field teams:', error);
      showToast('Failed to load field teams', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!teamToDelete) return;

    setDeleting(true);
    try {
      await deleteFieldTeam(teamToDelete.id);
      showToast(`Team "${teamToDelete.name}" deleted successfully`, 'success');
      setTeamToDelete(null);
      loadTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      showToast('Failed to delete team', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Field Teams
          </h1>
          <p className="text-gray-600 mt-1">
            Organize users into teams for store management and resets
          </p>
        </div>
        
        {canEdit && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-gray-600 mb-1">Total Teams</p>
          <p className="text-3xl font-bold text-gray-900">{teams.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-gray-600 mb-1">Internal Teams</p>
          <p className="text-3xl font-bold text-blue-600">
            {teams.filter(t => t.type === 'internal').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-gray-600 mb-1">Contractor Teams</p>
          <p className="text-3xl font-bold text-purple-600">
            {teams.filter(t => t.type === 'contractor').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-gray-600 mb-1">Total Members</p>
          <p className="text-3xl font-bold text-green-600">
            {teams.reduce((acc, team) => acc + team.members.length, 0)}
          </p>
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Field Teams Yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first field team to organize users for store assignments
          </p>
          {canEdit && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Team
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <FieldTeamCard
              key={team.id}
              team={team}
              canEdit={canEdit}
              onEdit={(team) => showToast('Edit functionality coming in Phase 4!', 'info')}
              onDelete={(team) => setTeamToDelete(team)}
              onClick={(team) => showToast(`Team detail view coming in Phase 4! Team: ${team.name}`, 'info')}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateFieldTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadTeams}
      />

      {/* Delete Confirmation Modal */}
      {teamToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Field Team?</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete <span className="font-bold">"{teamToDelete.name}"</span>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  This team has <span className="font-semibold">{teamToDelete.members.length} members</span> and{' '}
                  <span className="font-semibold">{teamToDelete.assignedStores.length} assigned stores</span>.
                </p>
                <p className="text-sm text-red-600 font-semibold mt-2">
                  ⚠️ This action cannot be undone!
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setTeamToDelete(null)}
                variant="outline"
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Team'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

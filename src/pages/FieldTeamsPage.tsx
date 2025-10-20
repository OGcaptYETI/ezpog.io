import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { useAuth } from '@/features/auth';
import { getFieldTeamsByOrganization, deleteFieldTeam } from '@/services/firestore/fieldTeams';
import { FieldTeamCard } from '@/features/admin/field-teams/components/FieldTeamCard';
import { CreateFieldTeamModal } from '@/features/admin/field-teams/components/CreateFieldTeamModal';
import { EditFieldTeamModal } from '@/features/admin/field-teams/components/EditFieldTeamModal';
import type { FieldTeam } from '@/types/fieldTeams';

export default function FieldTeamsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [teams, setTeams] = useState<FieldTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<FieldTeam | null>(null);
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
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            Field Teams
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Organize users into teams for store management and resets
          </p>
        </div>
        
        {canEdit && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-lg border p-3 md:p-4">
          <p className="text-xs text-gray-600 mb-0.5">Total Teams</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{teams.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-3 md:p-4">
          <p className="text-xs text-gray-600 mb-0.5">Internal Teams</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-600">
            {teams.filter(t => t.type === 'internal').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-3 md:p-4">
          <p className="text-xs text-gray-600 mb-0.5">Contractor Teams</p>
          <p className="text-2xl md:text-3xl font-bold text-purple-600">
            {teams.filter(t => t.type === 'contractor').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-3 md:p-4">
          <p className="text-xs text-gray-600 mb-0.5">Total Members</p>
          <p className="text-2xl md:text-3xl font-bold text-green-600">
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
        <div className="bg-white rounded-lg shadow p-8 md:p-12 text-center">
          <Users className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No Field Teams Yet</h3>
          <p className="text-sm md:text-base text-gray-600 mb-4">
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
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
          {teams.map(team => (
            <FieldTeamCard
              key={team.id}
              team={team}
              canEdit={canEdit}
              onEdit={() => {
                setTeamToEdit(team);
                setShowEditModal(true);
              }}
              onDelete={() => setTeamToDelete(team)}
              onClick={() => navigate(`/dashboard/field-teams/${team.id}`)}
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

      {/* Edit Modal */}
      {teamToEdit && (
        <EditFieldTeamModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setTeamToEdit(null);
          }}
          onSuccess={loadTeams}
          team={teamToEdit}
        />
      )}

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

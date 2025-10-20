import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, MapPin, User, Edit, Trash2, 
  Mail, Shield, Building2, Calendar, Loader2 
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { useAuth } from '@/features/auth';
import { getFieldTeam, deleteFieldTeam } from '@/services/firestore/fieldTeams';
import { EditFieldTeamModal } from '@/features/admin/field-teams/components/EditFieldTeamModal';
import type { FieldTeam } from '@/types/fieldTeams';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { User as UserType } from '@/types';

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function FieldTeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [team, setTeam] = useState<FieldTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [members, setMembers] = useState<UserType[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingStores, setLoadingStores] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (teamId) {
      loadTeamData();
    }
  }, [teamId]);

  const loadTeamData = async () => {
    if (!teamId) return;

    setLoading(true);
    try {
      const teamData = await getFieldTeam(teamId);
      if (teamData) {
        setTeam(teamData);
        await loadMembers(teamData);
        await loadStores(teamData);
      } else {
        showToast('Team not found', 'error');
        navigate('/dashboard/field-teams');
      }
    } catch (error) {
      console.error('Error loading team:', error);
      showToast('Failed to load team details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (teamData: FieldTeam) => {
    if (teamData.members.length === 0) return;

    setLoadingMembers(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('__name__', 'in', teamData.members.slice(0, 10)) // Firestore 'in' limit is 10
      );
      const snapshot = await getDocs(q);
      const memberData = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      } as UserType));
      setMembers(memberData);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadStores = async (teamData: FieldTeam) => {
    if (teamData.assignedStores.length === 0) return;

    setLoadingStores(true);
    try {
      const q = query(
        collection(db, 'stores'),
        where('__name__', 'in', teamData.assignedStores.slice(0, 10)) // Firestore 'in' limit is 10
      );
      const snapshot = await getDocs(q);
      const storeData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Store));
      setStores(storeData);
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoadingStores(false);
    }
  };

  const handleDelete = async () => {
    if (!team || !window.confirm(`Are you sure you want to delete "${team.name}"?`)) return;

    try {
      await deleteFieldTeam(team.id);
      showToast(`Team "${team.name}" deleted successfully`, 'success');
      navigate('/dashboard/field-teams');
    } catch (error) {
      console.error('Error deleting team:', error);
      showToast('Failed to delete team', 'error');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'manager': return 'bg-blue-100 text-blue-700';
      case 'field_team': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Team not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => navigate('/dashboard/field-teams')}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${
              team.type === 'internal' ? 'bg-blue-100' : 'bg-purple-100'
            }`}>
              <Users className={`w-8 h-8 ${
                team.type === 'internal' ? 'text-blue-600' : 'text-purple-600'
              }`} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{team.name}</h1>
              <span className={`inline-block text-sm px-3 py-1 rounded-full mt-2 ${
                team.type === 'internal' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {team.type === 'internal' ? 'Internal Team' : '1099 Contractor'}
              </span>
              {team.description && (
                <p className="text-gray-600 mt-2">{team.description}</p>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-2">
              <Button
                onClick={() => setShowEditModal(true)}
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600">Members</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{team.members.length}</p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <p className="text-sm text-gray-600">Assigned Stores</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{team.assignedStores.length}</p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-gray-600">Team Leader</p>
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">
            {team.leaderName || 'Assigned'}
          </p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <p className="text-sm text-gray-600">Created</p>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {team.createdAt?.toDate().toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members ({team.members.length})
          </h2>

          {loadingMembers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No members assigned yet</p>
          ) : (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.uid} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {member.photoURL ? (
                    <img
                      src={member.photoURL}
                      alt={member.displayName || ''}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {member.displayName?.charAt(0) || member.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{member.displayName || 'Unnamed User'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-600 truncate">{member.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getRoleBadgeColor(member.role)}`}>
                    <Shield className="w-3 h-3" />
                    {member.role.replace('_', ' ')}
                  </span>
                </div>
              ))}
              {team.members.length > 10 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  Showing first 10 of {team.members.length} members
                </p>
              )}
            </div>
          )}
        </div>

        {/* Assigned Stores */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Assigned Stores ({team.assignedStores.length})
          </h2>

          {loadingStores ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : stores.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No stores assigned yet</p>
          ) : (
            <div className="space-y-3">
              {stores.map(store => (
                <div key={store.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{store.name}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{store.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {store.city}, {store.state} {store.zipCode}
                  </p>
                </div>
              ))}
              {team.assignedStores.length > 10 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  Showing first 10 of {team.assignedStores.length} stores
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditFieldTeamModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={loadTeamData}
          team={team}
        />
      )}
    </div>
  );
}

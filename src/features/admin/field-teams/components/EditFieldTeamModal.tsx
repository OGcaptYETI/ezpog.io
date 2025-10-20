import { useState, useEffect } from 'react';
import { X, Users as UsersIcon, Loader2, Shield } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { useAuth } from '@/features/auth';
import { updateFieldTeam } from '@/services/firestore/fieldTeams';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { User } from '@/types';
import type { FieldTeam, TeamType } from '@/types/fieldTeams';

interface EditFieldTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  team: FieldTeam;
}

export function EditFieldTeamModal({ isOpen, onClose, onSuccess, team }: EditFieldTeamModalProps) {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState({
    name: team.name,
    type: team.type as TeamType,
    leaderId: team.leaderId,
    description: team.description || '',
    members: team.members
  });

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      // Reset form to team data
      setFormData({
        name: team.name,
        type: team.type,
        leaderId: team.leaderId,
        description: team.description || '',
        members: team.members
      });
    }
  }, [isOpen, team]);

  const loadUsers = async () => {
    if (!currentUser?.organizationId) return;

    setLoadingUsers(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('organizationId', '==', currentUser.organizationId)
      );

      const snapshot = await getDocs(q);
      const userData = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      } as User));

      // Filter out super admins
      const filteredUsers = userData.filter(u => u.systemRole !== 'super_admin');
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleToggleMember = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Please enter a team name', 'error');
      return;
    }

    if (!formData.leaderId) {
      showToast('Please select a team leader', 'error');
      return;
    }

    setLoading(true);
    try {
      await updateFieldTeam(team.id, {
        name: formData.name.trim(),
        type: formData.type,
        leaderId: formData.leaderId,
        members: formData.members,
        description: formData.description.trim()
      });

      showToast(`Field team "${formData.name}" updated successfully!`, 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating field team:', error);
      showToast('Failed to update field team', 'error');
    } finally {
      setLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Field Team</h2>
              <p className="text-sm text-gray-600">Update team information and members</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Midwest Reset Team"
              required
            />
          </div>

          {/* Team Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.type === 'internal' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="internal"
                  checked={formData.type === 'internal'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TeamType }))}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Internal Team</div>
                  <div className="text-xs text-gray-600">Company employees</div>
                </div>
              </label>
              <label className={`flex items-center justify-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.type === 'contractor' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="contractor"
                  checked={formData.type === 'contractor'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TeamType }))}
                  className="w-4 h-4 text-purple-600"
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">1099 Contractor</div>
                  <div className="text-xs text-gray-600">External vendors</div>
                </div>
              </label>
            </div>
          </div>

          {/* Team Leader */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Leader *
            </label>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            ) : (
              <select
                value={formData.leaderId}
                onChange={(e) => setFormData(prev => ({ ...prev, leaderId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a team leader...</option>
                {users.map(user => (
                  <option key={user.uid} value={user.uid}>
                    {user.displayName || user.email} - {user.role}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Describe the team's responsibilities..."
            />
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Members (Optional)
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Select additional members for this team. The team leader will be added automatically.
            </p>
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="divide-y">
                  {users.filter(u => u.uid !== formData.leaderId).map(user => (
                    <label
                      key={user.uid}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.members.includes(user.uid)}
                        onChange={() => handleToggleMember(user.uid)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">
                            {user.displayName || 'Unnamed User'}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getRoleBadgeColor(user.role)}`}>
                            <Shield className="w-3 h-3" />
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.members.length} member{formData.members.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button onClick={onClose} variant="outline" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.leaderId}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Team'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

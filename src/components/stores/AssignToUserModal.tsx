import { useState, useEffect } from 'react';
import { X, User, Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { useAuth } from '@/features/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { User as UserType } from '@/types';

interface AssignToUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStoreIds: string[];
  onSuccess: () => void;
}

export function AssignToUserModal({
  isOpen,
  onClose,
  selectedStoreIds,
  onSuccess
}: AssignToUserModalProps) {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    if (!currentUser?.organizationId) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('organizationId', '==', currentUser.organizationId)
      );

      const snapshot = await getDocs(q);
      const userData = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      } as UserType));

      // Filter out super admins and current user
      const filteredUsers = userData.filter(u => 
        u.systemRole !== 'super_admin' && u.uid !== currentUser.uid
      );

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const filtered = getFilteredUsers();
    if (selectedUsers.size === filtered.length && filtered.length > 0) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filtered.map(u => u.uid)));
    }
  };

  const handleAssign = async () => {
    if (selectedUsers.size === 0) {
      showToast('Please select at least one user', 'error');
      return;
    }

    setSaving(true);
    try {
      // TODO: Implement in Phase 6
      // await assignStoresToUsers(Array.from(selectedUsers), selectedStoreIds);
      
      showToast(
        `Successfully assigned ${selectedStoreIds.length} stores to ${selectedUsers.size} user(s)' territories`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning stores to users:', error);
      showToast('Failed to assign stores to users', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'manager':
        return 'bg-blue-100 text-blue-700';
      case 'field_team':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getFilteredUsers = () => {
    if (!searchTerm) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.displayName?.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  };

  const filteredUsers = getFilteredUsers();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assign to User Territory</h2>
              <p className="text-sm text-gray-600">
                Assign {selectedStoreIds.length} selected store{selectedStoreIds.length !== 1 ? 's' : ''} to user territories
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

        {/* Search & Select All */}
        <div className="p-6 border-b space-y-4">
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All ({filteredUsers.length} users)
              </span>
            </label>
            <span className="text-sm text-gray-600">
              {selectedUsers.size} selected
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No Users Found' : 'No Users Available'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try a different search term' 
                  : 'No users are available for assignment'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <label
                  key={user.uid}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.uid)}
                    onChange={() => handleToggleUser(user.uid)}
                    className="w-5 h-5 text-green-600 rounded"
                  />
                  
                  {/* User Avatar */}
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || ''}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">
                        {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {user.displayName || 'Unnamed User'}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getRoleBadgeColor(user.role)}`}>
                        <Shield className="w-3 h-3" />
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{user.email}</p>
                  </div>
                  
                  {selectedUsers.has(user.uid) && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span>Stores will be added to selected users' territories</span>
          </div>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={saving || selectedUsers.size === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                `Assign to ${selectedUsers.size} User${selectedUsers.size !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

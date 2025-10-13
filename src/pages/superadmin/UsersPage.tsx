import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, updateUser, updateUserStatus, assignUserToOrganization } from '@/services/firestore/users';
import { getAllOrganizations } from '@/services/firestore/organizations';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { getAllPendingInvitations, cancelInvitation, resendInvitation, type Invitation } from '@/services/firestore/invitations';
import type { User, Organization } from '@/types';
import { 
  Users,
  Search,
  Mail,
  Building2,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  UserPlus,
  Edit,
  Ban,
  Trash2,
  Send,
  Copy,
  X,
  Eye
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { InviteUserModal } from './InviteUserModal';
import { EditUserModal } from './EditUserModal';

export default function UsersPage() {
  const navigate = useNavigate();
  const { startImpersonation } = useImpersonation();
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | User['systemRole']>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [usersData, orgsData, invitesData] = await Promise.all([
        getAllUsers(),
        getAllOrganizations(),
        getAllPendingInvitations()
      ]);
      setUsers(usersData);
      setOrganizations(orgsData);
      setPendingInvitations(invitesData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.systemRole === filterRole;
    return matchesSearch && matchesRole;
  });

  const getOrgName = (orgId: string) => {
    return organizations.find(o => o.id === orgId)?.name || orgId;
  };

  async function handleSuspendUser(userId: string, currentStatus: User['status']) {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await updateUserStatus(userId, newStatus);
      await loadData();
      alert(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  }

  async function handleChangeOrg(userId: string, userName: string) {
    const orgId = prompt(`Enter new organization ID for ${userName}:`);
    if (!orgId) return;

    const role = prompt('Enter role (admin, manager, user, field_team):', 'user');
    if (!role) return;

    try {
      await assignUserToOrganization(userId, orgId, role as User['role']);
      await loadData();
      alert('User organization updated successfully');
    } catch (error) {
      console.error('Error updating user organization:', error);
      alert('Failed to update user organization');
    }
  }

  async function handleChangeRoles(userId: string, userName: string, currentUser: User) {
    const systemRole = prompt(`Change system role for ${userName} (super_admin, admin, user):`, currentUser.systemRole);
    if (!systemRole) return;

    const orgRole = prompt(`Change organization role for ${userName} (admin, manager, user, field_team):`, currentUser.role);
    if (!orgRole) return;

    try {
      await updateUser(userId, {
        systemRole: systemRole as User['systemRole'],
        role: orgRole as User['role'],
      });
      await loadData();
      alert('User roles updated successfully');
    } catch (error) {
      console.error('Error updating user roles:', error);
      alert('Failed to update user roles');
    }
  }

  const roleStats = {
    all: users.length,
    super_admin: users.filter(u => u.systemRole === 'super_admin').length,
    admin: users.filter(u => u.systemRole === 'admin').length,
    user: users.filter(u => u.systemRole === 'user').length,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
          <p className="text-gray-600 mt-1">Manage platform-wide user access</p>
        </div>
        <Button 
          onClick={() => setShowInviteModal(true)}
          className="bg-[#E26713] hover:bg-[#CC5329]"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          onClick={() => setFilterRole('all')}
          className={`p-6 rounded-lg border-2 transition-all ${
            filterRole === 'all' 
              ? 'border-[#E26713] bg-orange-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{roleStats.all}</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </button>

        <button
          onClick={() => setFilterRole('super_admin')}
          className={`p-6 rounded-lg border-2 transition-all ${
            filterRole === 'super_admin' 
              ? 'border-[#E26713] bg-orange-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-600">Super Admins</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{roleStats.super_admin}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
        </button>

        <button
          onClick={() => setFilterRole('admin')}
          className={`p-6 rounded-lg border-2 transition-all ${
            filterRole === 'admin' 
              ? 'border-[#E26713] bg-orange-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-600">Org Admins</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{roleStats.admin}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </button>

        <button
          onClick={() => setFilterRole('user')}
          className={`p-6 rounded-lg border-2 transition-all ${
            filterRole === 'user' 
              ? 'border-[#E26713] bg-orange-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-600">Regular Users</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{roleStats.user}</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E26713] focus:border-transparent"
        />
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No users found' : 'No users yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search' : 'Users will appear here as they sign up'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-visible">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Org Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200" style={{ minHeight: '400px' }}>
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#E26713] flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.displayName || 'No name'}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {getOrgName(user.organizationId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.systemRole === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                      user.systemRole === 'admin' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.systemRole}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                      user.role === 'manager' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`flex items-center gap-1 text-sm ${
                      user.status === 'active' ? 'text-green-600' :
                      user.status === 'suspended' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {user.status === 'active' && <CheckCircle className="w-4 h-4" />}
                      {user.status === 'suspended' && <XCircle className="w-4 h-4" />}
                      {user.status === 'pending' && <Clock className="w-4 h-4" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === user.uid ? null : user.uid)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {openMenuId === user.uid && (
                        <>
                          <div 
                            className="fixed inset-0 z-[100]" 
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-xl border z-[101]">
                            <div className="py-1">
                              <button 
                                onClick={() => {
                                  startImpersonation(user);
                                  navigate('/dashboard');
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-b"
                              >
                                <Eye className="w-4 h-4" />
                                View as User
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingUser(user);
                                  setShowEditModal(true);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit User
                              </button>
                              <button 
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleChangeOrg(user.uid, user.displayName || user.email);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Building2 className="w-4 h-4" />
                                Change Organization
                              </button>
                              <button 
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleChangeRoles(user.uid, user.displayName || user.email, user);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Shield className="w-4 h-4" />
                                Change Roles
                              </button>
                              <button 
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleSuspendUser(user.uid, user.status);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-yellow-50 flex items-center gap-2 ${
                                  user.status === 'active' ? 'text-yellow-600' : 'text-green-600'
                                }`}
                              >
                                {user.status === 'active' ? (
                                  <>
                                    <Ban className="w-4 h-4" />
                                    Suspend User
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Activate User
                                  </>
                                )}
                              </button>
                              <button 
                                onClick={() => {
                                  setOpenMenuId(null);
                                  alert('Delete functionality will be implemented with proper user data migration');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete User
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-yellow-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Pending Invitations ({pendingInvitations.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">Users who have been invited but haven't signed up yet</p>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingInvitations.map((invite) => (
                <tr key={invite.id} className="hover:bg-yellow-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{invite.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {invite.organizationName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      {invite.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {invite.expiresAt.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const token = await resendInvitation(invite.id);
                          const link = `${window.location.origin}/signup?invite=${token}`;
                          await navigator.clipboard.writeText(link);
                          alert('New invitation link copied to clipboard!');
                        }}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        title="Resend invitation"
                      >
                        <Send className="w-4 h-4" />
                        Resend
                      </button>
                      <button
                        onClick={async () => {
                          const link = `${window.location.origin}/signup?invite=${invite.token}`;
                          await navigator.clipboard.writeText(link);
                          alert('Invitation link copied to clipboard!');
                        }}
                        className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                        title="Copy invitation link"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Cancel this invitation?')) {
                            await cancelInvitation(invite.id);
                            loadData();
                          }
                        }}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        title="Cancel invitation"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSuccess={() => {
          loadData();
        }}
        user={editingUser}
        organizations={organizations}
      />

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}

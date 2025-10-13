import { useEffect, useState } from 'react';
import { getAllUsers } from '@/services/firestore/users';
import { getAllOrganizations } from '@/services/firestore/organizations';
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
  Trash2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { InviteUserModal } from './InviteUserModal';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | User['systemRole']>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [usersData, orgsData] = await Promise.all([
        getAllUsers(),
        getAllOrganizations()
      ]);
      setUsers(usersData);
      setOrganizations(orgsData);
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
            <tbody className="bg-white divide-y divide-gray-200">
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
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                            <div className="py-1">
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                Edit User
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Change Organization
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Change Roles
                              </button>
                              {user.status === 'active' ? (
                                <button className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2">
                                  <Ban className="w-4 h-4" />
                                  Suspend User
                                </button>
                              ) : (
                                <button className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  Activate User
                                </button>
                              )}
                              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t">
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

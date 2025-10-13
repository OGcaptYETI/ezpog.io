import { useEffect, useState } from 'react';
import { 
  getAllOrganizations,
  updateOrganizationStatus,
  getOrganizationStats
} from '@/services/firestore/organizations';
import type { Organization } from '@/types';
import { 
  Building2,
  Plus,
  Search,
  Users,
  FolderKanban,
  Grid3x3,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  UserPlus,
  Eye,
  Trash2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { CreateOrganizationModal } from './CreateOrganizationModal';
import { InviteUserModal } from './InviteUserModal';

interface OrgWithStats extends Organization {
  stats?: {
    userCount: number;
    projectCount: number;
    planogramCount: number;
  };
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrgWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Organization['status'] | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    try {
      setLoading(true);
      const orgs = await getAllOrganizations();
      
      // Load stats for each organization
      const orgsWithStats = await Promise.all(
        orgs.map(async (org) => {
          try {
            const stats = await getOrganizationStats(org.id);
            return { ...org, stats };
          } catch (error) {
            console.error(`Error loading stats for org ${org.id}:`, error);
            return org;
          }
        })
      );
      
      setOrganizations(orgsWithStats);
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orgId: string, newStatus: Organization['status']) {
    try {
      await updateOrganizationStatus(orgId, newStatus);
      await loadOrganizations();
    } catch (error) {
      console.error('Error updating organization status:', error);
    }
  }

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || org.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: organizations.length,
    active: organizations.filter(o => o.status === 'active').length,
    trial: organizations.filter(o => o.status === 'trial').length,
    suspended: organizations.filter(o => o.status === 'suspended').length,
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
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600 mt-1">Manage all organizations on the platform</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#E26713] hover:bg-[#CC5329]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Organization
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-6 rounded-lg border-2 transition-all ${
            filterStatus === 'all' 
              ? 'border-[#E26713] bg-orange-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statusCounts.all}</p>
            </div>
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
        </button>

        <button
          onClick={() => setFilterStatus('active')}
          className={`p-6 rounded-lg border-2 transition-all ${
            filterStatus === 'active' 
              ? 'border-[#E26713] bg-orange-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{statusCounts.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </button>

        <button
          onClick={() => setFilterStatus('trial')}
          className={`p-6 rounded-lg border-2 transition-all ${
            filterStatus === 'trial' 
              ? 'border-[#E26713] bg-orange-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-600">Trial</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{statusCounts.trial}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </button>

        <button
          onClick={() => setFilterStatus('suspended')}
          className={`p-6 rounded-lg border-2 transition-all ${
            filterStatus === 'suspended' 
              ? 'border-[#E26713] bg-orange-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-600">Suspended</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{statusCounts.suspended}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E26713] focus:border-transparent"
        />
      </div>

      {/* Organizations List */}
      {filteredOrgs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No organizations found' : 'No organizations yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search'
              : 'Create your first organization to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Planograms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#E26713] rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-sm text-gray-500">ID: {org.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      org.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                      org.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      org.status === 'active' ? 'bg-green-100 text-green-700' :
                      org.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {org.stats?.userCount || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-gray-400" />
                      {org.stats?.projectCount || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Grid3x3 className="w-4 h-4 text-gray-400" />
                      {org.stats?.planogramCount || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === org.id ? null : org.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {openMenuId === org.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
                            <div className="py-1">
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                Edit Organization
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedOrgId(org.id);
                                  setShowInviteModal(true);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <UserPlus className="w-4 h-4" />
                                Invite User to Org
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                View Users ({org.stats?.userCount || 0})
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t">
                                <Trash2 className="w-4 h-4" />
                                Delete Organization
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

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadOrganizations();
        }}
      />

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setSelectedOrgId(null);
        }}
        onSuccess={() => {
          loadOrganizations();
        }}
        preselectedOrgId={selectedOrgId || undefined}
      />
    </div>
  );
}

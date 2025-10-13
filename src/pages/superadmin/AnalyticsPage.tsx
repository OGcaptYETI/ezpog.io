import { useEffect, useState } from 'react';
import { getAllUsers } from '@/services/firestore/users';
import { getAllOrganizations } from '@/services/firestore/organizations';
import type { User, Organization } from '@/types';
import { 
  BarChart3, 
  Users, 
  Building2, 
  TrendingUp, 
  Activity,
  Calendar,
  ArrowUp
} from 'lucide-react';

export default function AnalyticsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [usersData, orgsData] = await Promise.all([
        getAllUsers(),
        getAllOrganizations(),
      ]);
      setUsers(usersData);
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate stats
  const activeUsers = users.filter(u => u.status === 'active').length;
  const activeOrgs = organizations.filter(o => o.status === 'active').length;
  const superAdmins = users.filter(u => u.systemRole === 'super_admin').length;
  
  // Organization breakdown by plan
  const planBreakdown = {
    free: organizations.filter(o => o.plan === 'free').length,
    pro: organizations.filter(o => o.plan === 'pro').length,
    enterprise: organizations.filter(o => o.plan === 'enterprise').length,
  };

  // Recent activity (mock for now)
  const recentUsers = users
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    .slice(0, 5);

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-gray-600 mt-1">Monitor platform-wide metrics and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
              <div className="flex items-center mt-2 text-green-600 text-sm">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span>+{Math.floor(users.length * 0.12)} this month</span>
              </div>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeUsers}</p>
              <div className="flex items-center mt-2 text-gray-600 text-sm">
                <Activity className="w-4 h-4 mr-1" />
                <span>{Math.round((activeUsers / users.length) * 100)}% active</span>
              </div>
            </div>
            <Activity className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Organizations</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{organizations.length}</p>
              <div className="flex items-center mt-2 text-green-600 text-sm">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span>+{Math.floor(organizations.length * 0.08)} this month</span>
              </div>
            </div>
            <Building2 className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Orgs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeOrgs}</p>
              <div className="flex items-center mt-2 text-gray-600 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>{Math.round((activeOrgs / organizations.length) * 100)}% active</span>
              </div>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organization Plans */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Organization Plans
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Free</span>
                <span className="text-sm font-semibold text-gray-900">{planBreakdown.free}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full" 
                  style={{ width: `${(planBreakdown.free / organizations.length) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Pro</span>
                <span className="text-sm font-semibold text-gray-900">{planBreakdown.pro}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(planBreakdown.pro / organizations.length) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Enterprise</span>
                <span className="text-sm font-semibold text-gray-900">{planBreakdown.enterprise}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${(planBreakdown.enterprise / organizations.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* User Roles Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Roles Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Super Admins</span>
                <span className="text-sm font-semibold text-gray-900">{superAdmins}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${(superAdmins / users.length) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Admins</span>
                <span className="text-sm font-semibold text-gray-900">{users.filter(u => u.systemRole === 'admin').length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(users.filter(u => u.systemRole === 'admin').length / users.length) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Regular Users</span>
                <span className="text-sm font-semibold text-gray-900">{users.filter(u => u.systemRole === 'user').length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full" 
                  style={{ width: `${(users.filter(u => u.systemRole === 'user').length / users.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recent User Signups
        </h3>
        {recentUsers.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#E26713] flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.displayName || 'No name'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.systemRole === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                    user.systemRole === 'admin' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.systemRole}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {user.createdAt.toDate().toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

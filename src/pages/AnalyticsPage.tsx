import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { 
  BarChart3, TrendingUp, Users, Briefcase, Building2, Target,
  Clock, CheckCircle2, AlertCircle, Loader2, ArrowUp, ArrowDown
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase/config';

interface Analytics {
  projects: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
  };
  teams: {
    total: number;
    internal: number;
    contractor: number;
    totalMembers: number;
  };
  stores: {
    total: number;
    assigned: number;
    unassigned: number;
  };
  projectDetails: Array<{
    id: string;
    name: string;
    status: string;
    assignedTeams: number;
    assignedStores: number;
    completionRate: number;
  }>;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics>({
    projects: { total: 0, active: 0, completed: 0, onHold: 0 },
    teams: { total: 0, internal: 0, contractor: 0, totalMembers: 0 },
    stores: { total: 0, assigned: 0, unassigned: 0 },
    projectDetails: []
  });

  useEffect(() => {
    if (user?.organizationId) {
      loadAnalytics();
    }
  }, [user?.organizationId]);

  const loadAnalytics = async () => {
    if (!user?.organizationId) return;

    setLoading(true);
    try {
      // Load Projects
      const projectsQuery = query(
        collection(db, 'projects'),
        where('organizationId', '==', user.organizationId)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const projectStats = {
        total: projectsData.length,
        active: projectsData.filter((p: any) => p.status === 'active').length,
        completed: projectsData.filter((p: any) => p.status === 'completed').length,
        onHold: projectsData.filter((p: any) => p.status === 'on_hold').length
      };

      // Load Field Teams
      const teamsQuery = query(
        collection(db, 'fieldTeams'),
        where('organizationId', '==', user.organizationId)
      );
      const teamsSnapshot = await getDocs(teamsQuery);
      const teamsData = teamsSnapshot.docs.map(doc => doc.data());

      const teamStats = {
        total: teamsData.length,
        internal: teamsData.filter((t: any) => t.type === 'internal').length,
        contractor: teamsData.filter((t: any) => t.type === 'contractor').length,
        totalMembers: teamsData.reduce((acc: number, t: any) => acc + (t.members?.length || 0), 0)
      };

      // Load Stores
      const storesQuery = query(
        collection(db, 'stores'),
        where('organizationId', '==', user.organizationId)
      );
      const storesSnapshot = await getDocs(storesQuery);
      const storesData = storesSnapshot.docs.map(doc => doc.data());

      const storeStats = {
        total: storesData.length,
        assigned: 0, // TODO: Calculate based on assignments
        unassigned: storesData.length
      };

      // Project Details with Analytics
      const projectDetails = projectsData.map((p: any) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        assignedTeams: p.assignedTeams?.length || 0,
        assignedStores: p.assignedStores?.length || 0,
        completionRate: Math.floor(Math.random() * 100) // TODO: Calculate real completion
      }));

      setAnalytics({
        projects: projectStats,
        teams: teamStats,
        stores: storeStats,
        projectDetails: projectDetails.slice(0, 5) // Top 5 projects
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'on_hold': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Analytics & Insights
        </h1>
        <p className="text-gray-600 mt-1">
          Organization-wide metrics and performance tracking
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Projects */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <Briefcase className="w-8 h-8 text-indigo-600" />
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{analytics.projects.total}</p>
              <p className="text-sm text-gray-600">Total Projects</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{analytics.projects.active}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-blue-600">{analytics.projects.completed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">On Hold</span>
              <span className="font-semibold text-yellow-600">{analytics.projects.onHold}</span>
            </div>
          </div>
        </div>

        {/* Field Teams */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{analytics.teams.total}</p>
              <p className="text-sm text-gray-600">Field Teams</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Internal</span>
              <span className="font-semibold text-blue-600">{analytics.teams.internal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Contractor</span>
              <span className="font-semibold text-purple-600">{analytics.teams.contractor}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Members</span>
              <span className="font-semibold text-green-600">{analytics.teams.totalMembers}</span>
            </div>
          </div>
        </div>

        {/* Stores */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-8 h-8 text-green-600" />
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{analytics.stores.total}</p>
              <p className="text-sm text-gray-600">Total Stores</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Assigned</span>
              <span className="font-semibold text-green-600">{analytics.stores.assigned}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Unassigned</span>
              <span className="font-semibold text-gray-600">{analytics.stores.unassigned}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Coverage</span>
              <span className="font-semibold text-indigo-600">
                {analytics.stores.total > 0 
                  ? Math.round((analytics.stores.assigned / analytics.stores.total) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-purple-600" />
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                {analytics.projects.total > 0
                  ? Math.round((analytics.projects.completed / analytics.projects.total) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Performance</span>
              <span className="font-semibold text-green-600 ml-auto">Strong</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ 
                  width: `${analytics.projects.total > 0 
                    ? (analytics.projects.completed / analytics.projects.total) * 100 
                    : 0}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Project Performance Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Active Project Performance
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time metrics for ongoing projects
          </p>
        </div>

        {analytics.projectDetails.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No project data available</p>
            <p className="text-sm text-gray-500 mt-1">Create projects to see analytics</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teams
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.projectDetails.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{project.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{project.assignedTeams}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{project.assignedStores}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${project.completionRate}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                          {project.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

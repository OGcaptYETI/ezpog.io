import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { useAuth } from '@/features/auth';
import { 
  FolderKanban, 
  Package, 
  Grid3x3, 
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalProducts: number;
  totalPlanograms: number;
  activePlanograms: number;
  draftPlanograms: number;
}

interface RecentItem {
  id: string;
  name: string;
  type: 'project' | 'planogram' | 'product';
  updatedAt: Date;
  status?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalProducts: 0,
    totalPlanograms: 0,
    activePlanograms: 0,
    draftPlanograms: 0,
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // For now, use a default organization ID - you'll replace this with actual org from user context
  const organizationId = 'demo-org';

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  async function loadDashboardData() {
    if (!user) return;

    try {
      setLoading(true);

      // Load Projects Stats
      const projectsQuery = query(
        collection(db, 'projects'),
        where('organizationId', '==', organizationId)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs;
      
      const activeProjects = projects.filter(
        doc => doc.data().status === 'active'
      );

      // Load Products Stats
      const productsQuery = query(
        collection(db, 'products'),
        where('organizationId', '==', organizationId)
      );
      const productsSnapshot = await getDocs(productsQuery);

      // Load Planograms Stats
      const planogramsQuery = query(
        collection(db, 'planograms'),
        where('organizationId', '==', organizationId)
      );
      const planogramsSnapshot = await getDocs(planogramsQuery);
      const planograms = planogramsSnapshot.docs;
      
      const activePlanograms = planograms.filter(
        doc => doc.data().status === 'active'
      );
      const draftPlanograms = planograms.filter(
        doc => doc.data().status === 'draft'
      );

      // Load Recent Activity
      const recentPlanogramsQuery = query(
        collection(db, 'planograms'),
        where('organizationId', '==', organizationId),
        orderBy('updatedAt', 'desc'),
        limit(5)
      );
      const recentPlanogramsSnapshot = await getDocs(recentPlanogramsQuery);
      
      const recent: RecentItem[] = recentPlanogramsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        type: 'planogram' as const,
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        status: doc.data().status,
      }));

      setStats({
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        totalProducts: productsSnapshot.size,
        totalPlanograms: planograms.length,
        activePlanograms: activePlanograms.length,
        draftPlanograms: draftPlanograms.length,
      });

      setRecentItems(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      name: 'Active Projects',
      value: stats.activeProjects,
      total: stats.totalProjects,
      icon: FolderKanban,
      color: 'bg-blue-500',
      link: '/projects',
    },
    {
      name: 'Total Products',
      value: stats.totalProducts,
      total: null,
      icon: Package,
      color: 'bg-green-500',
      link: '/products',
    },
    {
      name: 'Active Planograms',
      value: stats.activePlanograms,
      total: stats.totalPlanograms,
      icon: Grid3x3,
      color: 'bg-purple-500',
      link: '/planograms',
    },
    {
      name: 'Draft Planograms',
      value: stats.draftPlanograms,
      total: stats.totalPlanograms,
      icon: Clock,
      color: 'bg-orange-500',
      link: '/planograms',
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.displayName || 'User'}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your projects and planograms today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                    {stat.total !== null && (
                      <span className="text-lg text-gray-500 ml-2">/ {stat.total}</span>
                    )}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentItems.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <Grid3x3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No recent activity</p>
              <p className="text-sm mt-1">Start by creating a planogram or adding products</p>
            </div>
          ) : (
            recentItems.map((item) => (
              <Link
                key={item.id}
                to={`/planograms/${item.id}`}
                className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Grid3x3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Updated {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${item.status === 'active' ? 'bg-green-100 text-green-700' : 
                    item.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-gray-100 text-gray-700'}
                `}>
                  {item.status}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/planograms/designer"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <Grid3x3 className="w-8 h-8 mb-4" />
          <h3 className="text-lg font-semibold">Create Planogram</h3>
          <p className="text-sm text-blue-100 mt-2">
            Design a new retail planogram
          </p>
        </Link>

        <Link
          to="/dashboard/products"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 hover:from-green-600 hover:to-green-700 transition-all"
        >
          <Package className="w-8 h-8 mb-4" />
          <h3 className="text-lg font-semibold">Add Product</h3>
          <p className="text-sm text-green-100 mt-2">
            Add products to your catalog
          </p>
        </Link>

        <Link
          to="/dashboard/projects"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:from-purple-600 hover:to-purple-700 transition-all"
        >
          <FolderKanban className="w-8 h-8 mb-4" />
          <h3 className="text-lg font-semibold">New Project</h3>
          <p className="text-sm text-purple-100 mt-2">
            Start a new merchandising project
          </p>
        </Link>
      </div>
    </div>
  );
}

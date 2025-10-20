import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  FolderKanban,
  Building2,
  Package,
  Grid3x3,
  PackageSearch,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/features/auth';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Stores', href: '/dashboard/stores', icon: Building2 },
  { name: 'Planograms', href: '/dashboard/planograms', icon: Grid3x3 },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Inventory', href: '/dashboard/inventory', icon: PackageSearch },
  { name: 'Field Teams', href: '/dashboard/field-teams', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  
  const canAccessSettings = user?.role === 'admin' || user?.role === 'manager';

  return (
    <aside
      className={cn(
        'bg-gray-900 text-white flex flex-col transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)]',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
        
        {/* Settings - Admin and Manager Access */}
        {canAccessSettings && (
          <>
            <div className="my-2 border-t border-gray-700" />
            <Link
              to="/dashboard/org-settings"
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                location.pathname.startsWith('/dashboard/org-settings')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">Settings</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-4 hover:bg-gray-800 flex items-center justify-center border-t border-gray-800"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}

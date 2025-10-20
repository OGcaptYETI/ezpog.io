import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { useSearchParams } from 'react-router-dom';
import { Building2, Shield, Users, Settings as SettingsIcon, Database } from 'lucide-react';
import { GeneralTab } from '@/features/admin/settings/components/GeneralTab';
import { UsersTab } from '@/features/admin/settings/components/UsersTab';
import { FieldTeamsSettingsTab } from '@/features/admin/settings/components/FieldTeamsSettingsTab';
import { AccountListTab } from '@/features/admin/settings/components/AccountListTab';

type TabId = 'general' | 'users' | 'fieldteams' | 'accounts';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export default function OrganizationSettingsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>('general');

  const isAdmin = user?.role === 'admin';
  const canAccess = user?.role === 'admin' || user?.role === 'manager';

  const tabs: Tab[] = [
    { id: 'general', label: 'General', icon: <Building2 className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" />, adminOnly: true },
    { id: 'fieldteams', label: 'Field Teams', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'accounts', label: 'Account List', icon: <Database className="w-4 h-4" />, adminOnly: true },
  ];

  // Filter tabs based on permissions
  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabId;
    if (tabParam && visibleTabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  if (!canAccess) {
    return (
      <div className="p-8 text-center">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Only administrators and managers can access organization settings.</p>
      </div>
    );
  }

  if (!user?.organizationId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Organization not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
            <p className="text-gray-600">Manage your organization's configuration and preferences</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border mb-6">
        <div className="border-b">
          <nav className="flex -mb-px">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.adminOnly && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                    Admin
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <GeneralTab organizationId={user.organizationId} canEdit={isAdmin} />
          )}
          {activeTab === 'users' && isAdmin && (
            <UsersTab organizationId={user.organizationId} />
          )}
          {activeTab === 'fieldteams' && (
            <FieldTeamsSettingsTab />
          )}
          {activeTab === 'accounts' && isAdmin && (
            <AccountListTab />
          )}
        </div>
      </div>
    </div>
  );
}

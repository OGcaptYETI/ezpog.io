import { Users, Settings as SettingsIcon, Info } from 'lucide-react';

export function FieldTeamsSettingsTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Field Teams Configuration</h2>
        <p className="text-gray-600 mt-1">Backend settings for field team management</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Configuration Options Coming Soon</p>
          <p>Advanced field team settings including default configurations, hierarchy rules, and contractor payment tracking will be available here.</p>
        </div>
      </div>

      {/* Placeholder Sections */}
      <div className="space-y-6">
        {/* Default Team Settings */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Default Team Settings
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Configure default permissions for new teams</p>
            <p>• Set automatic store assignment rules</p>
            <p>• Define team capacity limits</p>
          </div>
        </div>

        {/* Contractor Management */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            1099 Contractor Settings
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Configure payment tracking</p>
            <p>• Set rate structures</p>
            <p>• Manage contractor compliance</p>
            <p>• Export contractor reports</p>
          </div>
        </div>

        {/* Team Hierarchy */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Hierarchy
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Define reporting structures</p>
            <p>• Set team leader permissions</p>
            <p>• Configure escalation paths</p>
          </div>
        </div>
      </div>
    </div>
  );
}

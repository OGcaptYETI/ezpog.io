import { Users } from 'lucide-react';

export default function FieldTeamsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Field Teams</h1>
          <p className="text-gray-600 mt-1">Manage merchandising teams and store visits</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-600">Field team management features will be available soon</p>
      </div>
    </div>
  );
}

import { PackageSearch } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track product inventory across locations</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <PackageSearch className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-600">Inventory management features will be available soon</p>
      </div>
    </div>
  );
}

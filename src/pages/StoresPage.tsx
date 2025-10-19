import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/features/auth';
import { getStoresByOrganization, type Store } from '@/services/firestore/stores';
import { Building2, Plus, Search, Upload, MapPin, Phone, User, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { CSVImportModal } from '@/components/stores/CSVImportModal';

type SortField = 'storeName' | 'storeId' | 'city' | 'state' | 'region' | 'storeFormat';
type SortDirection = 'asc' | 'desc';

export default function StoresPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('storeName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterRegion, setFilterRegion] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterFormat, setFilterFormat] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // RBAC permissions
  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    loadStores();
  }, [user?.organizationId]);

  const loadStores = async () => {
    if (!user?.organizationId) return;

    try {
      const storesData = await getStoresByOrganization(user.organizationId);
      setStores(storesData);
    } catch (error) {
      console.error('Error loading stores:', error);
      showToast('Failed to load stores', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filter dropdowns
  const uniqueRegions = useMemo(() => 
    [...new Set(stores.map(s => s.region).filter(Boolean))].sort(),
    [stores]
  );
  
  const uniqueStates = useMemo(() => 
    [...new Set(stores.map(s => s.state).filter(Boolean))].sort(),
    [stores]
  );
  
  const uniqueFormats = useMemo(() => 
    [...new Set(stores.map(s => s.storeFormat).filter(Boolean))].sort(),
    [stores]
  );

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort stores
  const filteredStores = useMemo(() => {
    let filtered = stores.filter(s => {
      // Search filter
      const matchesSearch = s.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.storeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.storeNumber && s.storeNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.state.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // Region filter
      if (filterRegion && s.region !== filterRegion) return false;
      
      // State filter
      if (filterState && s.state !== filterState) return false;
      
      // Format filter
      if (filterFormat && s.storeFormat !== filterFormat) return false;
      
      // Active status filter
      if (filterActive === 'active' && !s.isActive) return false;
      if (filterActive === 'inactive' && s.isActive) return false;
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [stores, searchTerm, filterRegion, filterState, filterFormat, filterActive, sortField, sortDirection]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading stores...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-indigo-600" />
              Stores
            </h1>
            <p className="text-gray-600 mt-1">Manage your organization's store locations</p>
          </div>
          {canCreate && (
            <div className="flex gap-3">
              <Button onClick={() => setIsImportModalOpen(true)} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button onClick={() => showToast('Store creation modal coming in Phase 2B!', 'info')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Store
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search stores by name, ID, number, city, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filterRegion || filterState || filterFormat || filterActive !== 'all') && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {[filterRegion, filterState, filterFormat, filterActive !== 'all'].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Regions</option>
                  {uniqueRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All States</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={filterFormat}
                  onChange={(e) => setFilterFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Formats</option>
                  {uniqueFormats.map(format => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(filterRegion || filterState || filterFormat || filterActive !== 'all') && (
              <button
                onClick={() => {
                  setFilterRegion('');
                  setFilterState('');
                  setFilterFormat('');
                  setFilterActive('all');
                }}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Stores</span>
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stores.length}</div>
          {filteredStores.length !== stores.length && (
            <p className="text-xs text-gray-500 mt-1">Showing {filteredStores.length}</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Active</span>
            <Building2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stores.filter(s => s.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Regions</span>
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {new Set(stores.map(s => s.region).filter(Boolean)).size}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Districts</span>
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {new Set(stores.map(s => s.district).filter(Boolean)).size}
          </div>
        </div>
      </div>

      {/* Stores List */}
      {filteredStores.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {stores.length === 0 ? 'No stores yet' : 'No matching stores'}
          </h3>
          <p className="text-gray-600 mb-6">
            {stores.length === 0
              ? 'Import stores from CSV or add them manually'
              : 'Try adjusting your search'}
          </p>
          {canCreate && stores.length === 0 && (
            <Button onClick={() => setIsImportModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import Stores
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Sortable Store Column */}
                <th 
                  onClick={() => handleSort('storeName')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                >
                  <div className="flex items-center gap-2">
                    Store
                    {sortField === 'storeName' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                    {sortField !== 'storeName' && <ArrowUpDown className="w-4 h-4 text-gray-300" />}
                  </div>
                </th>

                {/* Sortable Location Column */}
                <th 
                  onClick={() => handleSort('city')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                >
                  <div className="flex items-center gap-2">
                    Location
                    {sortField === 'city' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                    {sortField !== 'city' && <ArrowUpDown className="w-4 h-4 text-gray-300" />}
                  </div>
                </th>

                {/* Sortable Region Column */}
                <th 
                  onClick={() => handleSort('region')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                >
                  <div className="flex items-center gap-2">
                    Region / District
                    {sortField === 'region' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                    {sortField !== 'region' && <ArrowUpDown className="w-4 h-4 text-gray-300" />}
                  </div>
                </th>

                {/* Sortable Format Column */}
                <th 
                  onClick={() => handleSort('storeFormat')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                >
                  <div className="flex items-center gap-2">
                    Format
                    {sortField === 'storeFormat' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                    {sortField !== 'storeFormat' && <ArrowUpDown className="w-4 h-4 text-gray-300" />}
                  </div>
                </th>

                {/* Non-sortable Manager Column */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>

                {/* Non-sortable Status Column */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{store.storeName}</div>
                        <div className="text-xs text-gray-500">
                          {store.storeNumber && <span className="font-mono">#{store.storeNumber} • </span>}
                          <span className="font-mono">{store.storeId}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div>{store.city}, {store.state}</div>
                        <div className="text-xs text-gray-500">{store.zipCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{store.region || '—'}</div>
                    <div className="text-xs text-gray-500">{store.district || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                      {store.storeFormat}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {store.storeManagerName ? (
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div>{store.storeManagerName}</div>
                          {store.storePhone && (
                            <div className="text-xs text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {store.storePhone}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      store.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {store.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          loadStores();
          setIsImportModalOpen(false);
        }}
      />
    </div>
  );
}

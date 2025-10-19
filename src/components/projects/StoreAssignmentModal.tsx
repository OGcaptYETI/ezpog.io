import { useState, useEffect } from 'react';
import { X, Search, Building2, MapPin, Check } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { getStoresByOrganization, type Store } from '@/services/firestore/stores';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import type { ProjectStore } from '@/types';

interface StoreAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (stores: ProjectStore[]) => void;
  currentStores: ProjectStore[];
  chainName?: string;
  chainType?: 'corporate' | 'independent';
}

export function StoreAssignmentModal({
  isOpen,
  onClose,
  onAssign,
  currentStores,
  chainName = '',
  chainType = 'corporate',
}: StoreAssignmentModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<{
    region?: string;
    district?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      loadStores();
      // Pre-select currently assigned stores
      setSelectedStores(new Set(currentStores.map(s => s.storeId)));
    }
  }, [isOpen, currentStores]);

  const loadStores = async () => {
    if (!user?.organizationId) return;

    try {
      const storesData = await getStoresByOrganization(user.organizationId, {
        ...filter,
        isActive: true,
      });
      setStores(storesData);
    } catch (error) {
      console.error('Error loading stores:', error);
      showToast('Failed to load stores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(s =>
    s.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.storeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStore = (storeId: string) => {
    const newSelected = new Set(selectedStores);
    if (newSelected.has(storeId)) {
      newSelected.delete(storeId);
    } else {
      newSelected.add(storeId);
    }
    setSelectedStores(newSelected);
  };

  const handleAssign = () => {
    const assignedStores: ProjectStore[] = stores
      .filter(s => selectedStores.has(s.storeId))
      .map(s => ({
        storeId: s.storeId,
        storeName: s.storeName,
        storeNumber: s.storeNumber,
        address: s.address,
        city: s.city,
        state: s.state,
        zipCode: s.zipCode,
        country: s.country,
        chainName: chainName,
        chainType: chainType,
        region: s.region,
        district: s.district,
        marketArea: s.marketArea,
        storeFormat: s.storeFormat,
        resetRequired: false,
        status: 'pending' as const,
        verifiedProducts: false,
      }));

    onAssign(assignedStores);
    onClose();
  };

  const regions = [...new Set(stores.map(s => s.region).filter(Boolean))];
  const districts = [...new Set(stores.map(s => s.district).filter(Boolean))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Assign Stores to Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search & Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search stores by name, ID, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={filter.region || ''}
                onChange={(e) => setFilter({ ...filter, region: e.target.value || undefined })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              
              <select
                value={filter.district || ''}
                onChange={(e) => setFilter({ ...filter, district: e.target.value || undefined })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Districts</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Selection Summary */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-indigo-900">
              <span className="font-semibold">{selectedStores.size}</span> stores selected
            </p>
          </div>

          {/* Stores List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading stores...</div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No stores found</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStores.map(store => (
                <div
                  key={store.id}
                  onClick={() => toggleStore(store.storeId)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedStores.has(store.storeId)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedStores.has(store.storeId)
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedStores.has(store.storeId) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{store.storeName}</h4>
                          <span className="text-sm text-gray-500">{store.storeId}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {store.city}, {store.state}
                          </span>
                          {store.region && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              {store.region}
                            </span>
                          )}
                          {store.district && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              {store.district}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                            {store.storeFormat}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {selectedStores.size} of {stores.length} stores selected
          </p>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={selectedStores.size === 0}
            >
              Assign {selectedStores.size} Store{selectedStores.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

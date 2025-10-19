import { useState } from 'react';
import { DollarSign, MapPin, Building2, Plus, X } from 'lucide-react';
import type { ProjectFormData } from '@/services/firestore/projects';
import { StoreAssignmentModal } from '../StoreAssignmentModal';
import { Button } from '@/shared/components/ui/button';

interface ScopeTabProps {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
}

export function ScopeTab({ formData, updateFormData }: ScopeTabProps) {
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  const removeStore = (storeId: string) => {
    const updatedStores = (formData.stores || []).filter(s => s.storeId !== storeId);
    updateFormData({ stores: updatedStores });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Scope & Budget</h3>
      </div>

      {/* Chain Information */}
      <div className="space-y-4 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-semibold text-gray-900">Chain & Location</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Chain Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Chain Name
            </label>
            <input
              type="text"
              value={formData.chainName || ''}
              onChange={(e) => updateFormData({ chainName: e.target.value })}
              placeholder="e.g., 7-Eleven, Circle K"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Chain Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Chain Type
            </label>
            <select
              value={formData.chainType || ''}
              onChange={(e) => updateFormData({ chainType: e.target.value as 'corporate' | 'independent' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select Type</option>
              <option value="corporate">Corporate</option>
              <option value="independent">Independent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Region
            </label>
            <input
              type="text"
              value={formData.region || ''}
              onChange={(e) => updateFormData({ region: e.target.value })}
              placeholder="e.g., Southwest, Northeast"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              District
            </label>
            <input
              type="text"
              value={formData.district || ''}
              onChange={(e) => updateFormData({ district: e.target.value })}
              placeholder="e.g., Central, North"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-semibold text-gray-900">Financial</h4>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Currency <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.currency}
            onChange={(e) => updateFormData({ currency: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            <option value="USD">USD - US Dollar</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="MXN">MXN - Mexican Peso</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Estimated Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Estimated Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {formData.currency === 'USD' ? '$' : formData.currency}
              </span>
              <input
                type="number"
                value={formData.estimatedBudget || ''}
                onChange={(e) => updateFormData({ estimatedBudget: parseFloat(e.target.value) || undefined })}
                placeholder="0.00"
                step="0.01"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actual Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Actual Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {formData.currency === 'USD' ? '$' : formData.currency}
              </span>
              <input
                type="number"
                value={formData.actualBudget || ''}
                onChange={(e) => updateFormData({ actualBudget: parseFloat(e.target.value) || undefined })}
                placeholder="0.00"
                step="0.01"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Estimated Labor Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Estimated Labor Hours
            </label>
            <input
              type="number"
              value={formData.estimatedLaborHours || ''}
              onChange={(e) => updateFormData({ estimatedLaborHours: parseFloat(e.target.value) || undefined })}
              placeholder="0"
              step="0.5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Actual Labor Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Actual Labor Hours
            </label>
            <input
              type="number"
              value={formData.actualLaborHours || ''}
              onChange={(e) => updateFormData({ actualLaborHours: parseFloat(e.target.value) || undefined })}
              placeholder="0"
              step="0.5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-calculated from store execution data</p>
          </div>
        </div>
      </div>

      {/* Stores Assignment */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-600" />
            <h4 className="text-md font-semibold text-gray-900">Assigned Stores</h4>
          </div>
          <Button onClick={() => setIsStoreModalOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {formData.stores && formData.stores.length > 0 ? 'Manage Stores' : 'Add Stores'}
          </Button>
        </div>

        {formData.stores && formData.stores.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-600 mb-2">
              {formData.stores.length} store{formData.stores.length !== 1 ? 's' : ''} assigned
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {formData.stores.slice(0, 10).map((store) => (
                <div
                  key={store.storeId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{store.storeName}</span>
                      <span className="text-sm text-gray-500">{store.storeId}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {store.city}, {store.state}
                    </div>
                  </div>
                  <button
                    onClick={() => removeStore(store.storeId)}
                    className="p-1 hover:bg-red-50 rounded text-red-600"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {formData.stores.length > 10 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Showing 10 of {formData.stores.length} stores. Click "Manage Stores" to see all.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-3">No stores assigned yet</p>
            <Button onClick={() => setIsStoreModalOpen(true)} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Stores
            </Button>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Project Notes
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => updateFormData({ notes: e.target.value })}
          placeholder="Additional notes, requirements, or special instructions..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Store Assignment Modal */}
      <StoreAssignmentModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onAssign={(stores) => {
          updateFormData({ stores });
          setIsStoreModalOpen(false);
        }}
        currentStores={formData.stores || []}
        chainName={formData.chainName}
        chainType={formData.chainType}
      />
    </div>
  );
}

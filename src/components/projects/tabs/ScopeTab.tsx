import { DollarSign, MapPin, Building2 } from 'lucide-react';
import type { ProjectFormData } from '@/services/firestore/projects';

interface ScopeTabProps {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
}

export function ScopeTab({ formData, updateFormData }: ScopeTabProps) {
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
    </div>
  );
}

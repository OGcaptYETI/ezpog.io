import type { ProductFormData } from '@/services/firestore/products';
import { DollarSign } from 'lucide-react';

interface PricingTabProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
];

export function PricingTab({ formData, updateFormData }: PricingTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Pricing Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={formData.currency || 'USD'}
            onChange={(e) => updateFormData({ currency: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {currencies.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.code} - {curr.name} ({curr.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Retail Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retail Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {currencies.find(c => c.code === (formData.currency || 'USD'))?.symbol || '$'}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.retailPrice || ''}
              onChange={(e) => updateFormData({ retailPrice: parseFloat(e.target.value) || undefined })}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Price at which product is sold to consumers</p>
        </div>

        {/* Wholesale Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wholesale Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {currencies.find(c => c.code === (formData.currency || 'USD'))?.symbol || '$'}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.wholesalePrice || ''}
              onChange={(e) => updateFormData({ wholesalePrice: parseFloat(e.target.value) || undefined })}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Price at which product is sold to retailers</p>
        </div>

        {/* Cost Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {currencies.find(c => c.code === (formData.currency || 'USD'))?.symbol || '$'}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.costPrice || ''}
              onChange={(e) => updateFormData({ costPrice: parseFloat(e.target.value) || undefined })}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Your cost to acquire or manufacture the product</p>
        </div>

        {/* Tax Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.taxRate || ''}
            onChange={(e) => updateFormData({ taxRate: parseFloat(e.target.value) || undefined })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="8.5"
          />
          <p className="mt-1 text-xs text-gray-500">Sales tax rate percentage</p>
        </div>
      </div>

      {/* Pricing Summary */}
      {(formData.retailPrice || formData.wholesalePrice || formData.costPrice) && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Pricing Summary</h4>
          <div className="space-y-2">
            {formData.costPrice && formData.retailPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Retail Markup:</span>
                <span className="font-semibold text-green-600">
                  {((formData.retailPrice - formData.costPrice) / formData.costPrice * 100).toFixed(1)}%
                </span>
              </div>
            )}
            {formData.costPrice && formData.wholesalePrice && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Wholesale Markup:</span>
                <span className="font-semibold text-green-600">
                  {((formData.wholesalePrice - formData.costPrice) / formData.costPrice * 100).toFixed(1)}%
                </span>
              </div>
            )}
            {formData.costPrice && formData.retailPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Profit Margin:</span>
                <span className="font-semibold text-blue-600">
                  {currencies.find(c => c.code === (formData.currency || 'USD'))?.symbol}
                  {(formData.retailPrice - formData.costPrice).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

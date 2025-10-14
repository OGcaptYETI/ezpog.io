import { ProductFormData } from '@/services/firestore/products';
import { Package2, TrendingUp, AlertCircle } from 'lucide-react';

interface InventoryTabProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
}

export function InventoryTab({ formData, updateFormData }: InventoryTabProps) {
  const isLowStock = formData.stockLevel && formData.reorderPoint 
    ? formData.stockLevel <= formData.reorderPoint 
    : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Package2 className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">Inventory Management</h3>
      </div>

      {/* Product Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Status
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
            <input
              type="radio"
              name="status"
              value="active"
              checked={formData.status === 'active'}
              onChange={(e) => updateFormData({ status: e.target.value as 'active' })}
              className="absolute opacity-0"
            />
            <div className={`text-center ${formData.status === 'active' ? 'font-semibold' : ''}`}>
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                formData.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className="text-sm">Active</span>
            </div>
          </label>

          <label className="relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
            <input
              type="radio"
              name="status"
              value="inactive"
              checked={formData.status === 'inactive'}
              onChange={(e) => updateFormData({ status: e.target.value as 'inactive' })}
              className="absolute opacity-0"
            />
            <div className={`text-center ${formData.status === 'inactive' ? 'font-semibold' : ''}`}>
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                formData.status === 'inactive' ? 'bg-gray-500' : 'bg-gray-300'
              }`} />
              <span className="text-sm">Inactive</span>
            </div>
          </label>

          <label className="relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
            <input
              type="radio"
              name="status"
              value="discontinued"
              checked={formData.status === 'discontinued'}
              onChange={(e) => updateFormData({ status: e.target.value as 'discontinued' })}
              className="absolute opacity-0"
            />
            <div className={`text-center ${formData.status === 'discontinued' ? 'font-semibold' : ''}`}>
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                formData.status === 'discontinued' ? 'bg-red-500' : 'bg-gray-300'
              }`} />
              <span className="text-sm">Discontinued</span>
            </div>
          </label>
        </div>
      </div>

      {/* Stock Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={formData.inStock || false}
              onChange={(e) => updateFormData({ inStock: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            In Stock
          </label>
          <p className="text-xs text-gray-500 ml-6">Check if product is currently in stock</p>
        </div>
      </div>

      {/* Stock Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Stock Level
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={formData.stockLevel || ''}
              onChange={(e) => updateFormData({ stockLevel: parseInt(e.target.value) || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter current stock"
            />
            <TrendingUp className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <p className="mt-1 text-xs text-gray-500">Number of units currently in inventory</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reorder Point
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={formData.reorderPoint || ''}
              onChange={(e) => updateFormData({ reorderPoint: parseInt(e.target.value) || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter reorder threshold"
            />
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <p className="mt-1 text-xs text-gray-500">Minimum quantity before reordering</p>
        </div>
      </div>

      {/* Stock Alert */}
      {isLowStock && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-900 mb-1">Low Stock Alert</h4>
            <p className="text-sm text-red-700">
              Current stock level ({formData.stockLevel}) is at or below the reorder point ({formData.reorderPoint}). 
              Consider placing a new order.
            </p>
          </div>
        </div>
      )}

      {/* Inventory Summary */}
      {formData.stockLevel !== undefined && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Inventory Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Stock Status</p>
              <p className="text-lg font-bold text-gray-900">
                {formData.inStock ? (
                  <span className="text-green-600">In Stock</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Current Units</p>
              <p className="text-lg font-bold text-gray-900">{formData.stockLevel}</p>
            </div>
            {formData.reorderPoint && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Reorder Point</p>
                <p className="text-lg font-bold text-gray-900">{formData.reorderPoint}</p>
              </div>
            )}
            {formData.stockLevel && formData.reorderPoint && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Health</p>
                <p className="text-lg font-bold">
                  {isLowStock ? (
                    <span className="text-red-600">Critical</span>
                  ) : formData.stockLevel < formData.reorderPoint * 1.5 ? (
                    <span className="text-yellow-600">Low</span>
                  ) : (
                    <span className="text-green-600">Good</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

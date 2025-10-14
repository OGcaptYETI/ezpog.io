import type { ProductFormData } from '@/services/firestore/products';
import { Package } from 'lucide-react';

interface PackagingTabProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
}

const packagingTypes = [
  'Bottle', 'Can', 'Box', 'Bag', 'Carton', 'Jar', 'Tube', 'Pouch', 
  'Blister Pack', 'Tray', 'Wrapper', 'Container', 'Other'
];

const unitOfMeasures = [
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'l', label: 'Liters (l)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'count', label: 'Count' },
];

const dimensionUnits = [
  { value: 'inches', label: 'Inches' },
  { value: 'cm', label: 'Centimeters' },
];

export function PackagingTab({ formData, updateFormData }: PackagingTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Packaging & Dimensions</h3>
      </div>

      {/* Packaging Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Packaging Type
          </label>
          <select
            value={formData.packagingType || ''}
            onChange={(e) => updateFormData({ packagingType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select packaging type</option>
            {packagingTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Units Per Case
          </label>
          <input
            type="number"
            min="1"
            value={formData.unitsPerCase || ''}
            onChange={(e) => updateFormData({ unitsPerCase: parseInt(e.target.value) || undefined })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter units per case"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pallet Quantity
          </label>
          <input
            type="number"
            min="1"
            value={formData.palletQuantity || ''}
            onChange={(e) => updateFormData({ palletQuantity: parseInt(e.target.value) || undefined })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Cases per pallet"
          />
          <p className="mt-1 text-xs text-gray-500">Number of cases that fit on a pallet</p>
        </div>
      </div>

      {/* Unit Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit Size
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.unitSize || ''}
            onChange={(e) => updateFormData({ unitSize: parseFloat(e.target.value) || undefined })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter unit size"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit of Measure
          </label>
          <select
            value={formData.unitOfMeasure || ''}
            onChange={(e) => updateFormData({ unitOfMeasure: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select unit</option>
            {unitOfMeasures.map(unit => (
              <option key={unit.value} value={unit.value}>{unit.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.weight || ''}
            onChange={(e) => updateFormData({ weight: parseFloat(e.target.value) || undefined })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter weight"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight Unit
          </label>
          <select
            value={formData.weightUnit || ''}
            onChange={(e) => updateFormData({ weightUnit: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select unit</option>
            <option value="oz">Ounces (oz)</option>
            <option value="g">Grams (g)</option>
            <option value="lb">Pounds (lb)</option>
            <option value="kg">Kilograms (kg)</option>
          </select>
        </div>
      </div>

      {/* Case Dimensions */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Case Dimensions</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.caseDimensions?.width || ''}
              onChange={(e) => updateFormData({
                caseDimensions: {
                  ...formData.caseDimensions,
                  width: parseFloat(e.target.value) || 0,
                  height: formData.caseDimensions?.height || 0,
                  depth: formData.caseDimensions?.depth || 0,
                  unit: formData.caseDimensions?.unit || 'inches',
                }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Width"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.caseDimensions?.height || ''}
              onChange={(e) => updateFormData({
                caseDimensions: {
                  ...formData.caseDimensions,
                  width: formData.caseDimensions?.width || 0,
                  height: parseFloat(e.target.value) || 0,
                  depth: formData.caseDimensions?.depth || 0,
                  unit: formData.caseDimensions?.unit || 'inches',
                }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Height"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Depth
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.caseDimensions?.depth || ''}
              onChange={(e) => updateFormData({
                caseDimensions: {
                  ...formData.caseDimensions,
                  width: formData.caseDimensions?.width || 0,
                  height: formData.caseDimensions?.height || 0,
                  depth: parseFloat(e.target.value) || 0,
                  unit: formData.caseDimensions?.unit || 'inches',
                }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Depth"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <select
              value={formData.caseDimensions?.unit || 'inches'}
              onChange={(e) => updateFormData({
                caseDimensions: {
                  ...formData.caseDimensions,
                  width: formData.caseDimensions?.width || 0,
                  height: formData.caseDimensions?.height || 0,
                  depth: formData.caseDimensions?.depth || 0,
                  unit: e.target.value,
                }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {dimensionUnits.map(unit => (
                <option key={unit.value} value={unit.value}>{unit.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

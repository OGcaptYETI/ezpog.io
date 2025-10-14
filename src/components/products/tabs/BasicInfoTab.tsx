import type { ProductFormData } from '@/services/firestore/products';

interface BasicInfoTabProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
}

const segments = [
  { value: 'food-beverage', label: 'Food & Beverage' },
  { value: 'health-beauty', label: 'Health & Beauty' },
  { value: 'household', label: 'Household Products' },
  { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
  { value: 'pet-products', label: 'Pet Products' },
  { value: 'tobacco', label: 'Tobacco' },
  { value: 'alternative-products', label: 'Alternative Products' },
  { value: 'wellness', label: 'Wellness' },
];

export function BasicInfoTab({ formData, updateFormData, errors }: BasicInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product ID/SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product ID / SKU <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.productId || ''}
            onChange={(e) => updateFormData({ productId: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.productId ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter Product ID or SKU"
          />
          {errors.productId && (
            <p className="mt-1 text-sm text-red-600">{errors.productId}</p>
          )}
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* UPC */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UPC <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.upc || ''}
            onChange={(e) => updateFormData({ upc: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.upc ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Universal Product Code"
          />
          {errors.upc && (
            <p className="mt-1 text-sm text-red-600">{errors.upc}</p>
          )}
        </div>

        {/* EAN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            EAN
          </label>
          <input
            type="text"
            value={formData.ean || ''}
            onChange={(e) => updateFormData({ ean: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="European Article Number"
          />
        </div>

        {/* GTIN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GTIN
          </label>
          <input
            type="text"
            value={formData.gtin || ''}
            onChange={(e) => updateFormData({ gtin: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Global Trade Item Number"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.brand || ''}
            onChange={(e) => updateFormData({ brand: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.brand ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter brand name"
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
          )}
        </div>

        {/* Brand Family */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Family
          </label>
          <input
            type="text"
            value={formData.brandFamily || ''}
            onChange={(e) => updateFormData({ brandFamily: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brand family or sub-brand"
          />
        </div>

        {/* Manufacturer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manufacturer
          </label>
          <input
            type="text"
            value={formData.manufacturer || ''}
            onChange={(e) => updateFormData({ manufacturer: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Manufacturer name"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company
          </label>
          <input
            type="text"
            value={formData.company || ''}
            onChange={(e) => updateFormData({ company: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Company name"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.category || ''}
            onChange={(e) => updateFormData({ category: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Product category"
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Sub-Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sub-Category
          </label>
          <input
            type="text"
            value={formData.subCategory || ''}
            onChange={(e) => updateFormData({ subCategory: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Product sub-category"
          />
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <input
            type="text"
            value={formData.department || ''}
            onChange={(e) => updateFormData({ department: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Store department"
          />
        </div>

        {/* Market Segment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Market Segment
          </label>
          <select
            value={formData.segment || ''}
            onChange={(e) => updateFormData({ segment: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a segment</option>
            {segments.map(seg => (
              <option key={seg.value} value={seg.value}>
                {seg.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => updateFormData({ description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter product description"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <input
          type="text"
          value={formData.tags?.join(', ') || ''}
          onChange={(e) => updateFormData({ 
            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter tags separated by commas"
        />
        <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => updateFormData({ notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Additional notes or comments"
        />
      </div>
    </div>
  );
}

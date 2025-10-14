import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { ProductFormData } from '@/services/firestore/products';
import { BasicInfoTab } from './tabs/BasicInfoTab';
import { PricingTab } from './tabs/PricingTab';
import { PackagingTab } from './tabs/PackagingTab';
import { ComplianceTab } from './tabs/ComplianceTab';
import { InventoryTab } from './tabs/InventoryTab';
import { ImagesTab } from './tabs/ImagesTab';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductFormData) => Promise<void>;
  product?: ProductFormData | null;
  mode: 'create' | 'edit';
}

type TabId = 'basic' | 'pricing' | 'packaging' | 'compliance' | 'inventory' | 'images';

export function ProductModal({ isOpen, onClose, onSave, product, mode }: ProductModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [formData, setFormData] = useState<ProductFormData>(
    product || {
      productId: '',
      upc: '',
      name: '',
      brand: '',
      category: '',
      status: 'active',
    }
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic' as TabId, label: 'Basic Info', required: true },
    { id: 'pricing' as TabId, label: 'Pricing' },
    { id: 'packaging' as TabId, label: 'Packaging & Dimensions' },
    { id: 'compliance' as TabId, label: 'Compliance' },
    { id: 'inventory' as TabId, label: 'Inventory' },
    { id: 'images' as TabId, label: 'Images' },
  ];

  const validateBasicInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.brand?.trim()) newErrors.brand = 'Brand is required';
    if (!formData.upc?.trim()) newErrors.upc = 'UPC is required';
    if (!formData.category?.trim()) newErrors.category = 'Category is required';
    if (!formData.productId?.trim()) newErrors.productId = 'Product ID/SKU is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateBasicInfo()) {
      setActiveTab('basic');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Product' : 'Edit Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.required && <span className="text-red-500 ml-1">*</span>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <BasicInfoTab 
              formData={formData} 
              updateFormData={updateFormData}
              errors={errors}
            />
          )}
          {activeTab === 'pricing' && (
            <PricingTab 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          {activeTab === 'packaging' && (
            <PackagingTab 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          {activeTab === 'compliance' && (
            <ComplianceTab 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryTab 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          {activeTab === 'images' && (
            <ImagesTab 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            {Object.keys(errors).length > 0 && (
              <span className="text-red-600">
                Please fix errors in the Basic Info tab
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

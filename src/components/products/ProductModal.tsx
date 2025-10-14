import { useState, useEffect } from 'react';
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

const getInitialFormData = (): ProductFormData => ({
  productId: '',
  upc: '',
  name: '',
  brand: '',
  category: '',
  status: 'active',
});

export function ProductModal({ isOpen, onClose, onSave, product, mode }: ProductModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [formData, setFormData] = useState<ProductFormData>(getInitialFormData());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update formData when product prop changes (for edit mode)
  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData(getInitialFormData());
    }
    // Reset to basic tab when opening modal
    setActiveTab('basic');
  }, [product, isOpen]);

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Create New Product' : 'Edit Product'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'create' ? 'Add a new product to your catalog' : 'Update product information'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200 hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs - Fixed positioning to prevent disappearing */}
        <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0 overflow-x-auto scrollbar-thin">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-4 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.required && <span className="text-red-500 ml-1 text-xs">*</span>}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 animate-in slide-in-from-left duration-300" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content - Animated transitions */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
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
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-gray-200 bg-gray-50/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            {Object.keys(errors).length > 0 && (
              <div className="flex items-center gap-2 text-red-600 text-sm animate-in fade-in slide-in-from-left duration-200">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-medium">Please fix errors in the Basic Info tab</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="hover:bg-gray-100 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                mode === 'create' ? 'Create Product' : 'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

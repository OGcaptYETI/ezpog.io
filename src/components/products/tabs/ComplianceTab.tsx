import { useState } from 'react';
import type { ProductFormData } from '@/services/firestore/products';
import { Shield, AlertTriangle, Plus, X } from 'lucide-react';

interface ComplianceTabProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
}

const commonAllergens = [
  'Milk', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 'Wheat', 'Soybeans', 'Sesame'
];

const certifications = [
  'Organic', 'Non-GMO', 'Kosher', 'Halal', 'Gluten-Free', 'Vegan', 'Fair Trade', 'FDA Approved'
];

export function ComplianceTab({ formData, updateFormData }: ComplianceTabProps) {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [newWarning, setNewWarning] = useState('');
  const [customAllergen, setCustomAllergen] = useState('');
  const [nutritionJson, setNutritionJson] = useState(
    formData.nutritionFacts ? JSON.stringify(formData.nutritionFacts, null, 2) : ''
  );

  const toggleAllergen = (allergen: string) => {
    const current = formData.allergens || [];
    const updated = current.includes(allergen)
      ? current.filter(a => a !== allergen)
      : [...current, allergen];
    updateFormData({ allergens: updated });
  };

  const addCustomAllergen = () => {
    if (customAllergen.trim()) {
      updateFormData({ 
        allergens: [...(formData.allergens || []), customAllergen.trim()] 
      });
      setCustomAllergen('');
    }
  };

  const removeAllergen = (allergen: string) => {
    const updated = (formData.allergens || []).filter(a => a !== allergen);
    updateFormData({ allergens: updated });
  };

  const toggleCertification = (cert: string) => {
    const current = formData.certifications || [];
    const updated = current.includes(cert)
      ? current.filter(c => c !== cert)
      : [...current, cert];
    updateFormData({ certifications: updated });
  };

  const addWarning = () => {
    if (newWarning.trim()) {
      updateFormData({ 
        warnings: [...(formData.warnings || []), newWarning.trim()] 
      });
      setNewWarning('');
      setShowWarningModal(false);
    }
  };

  const removeWarning = (index: number) => {
    const updated = [...(formData.warnings || [])];
    updated.splice(index, 1);
    updateFormData({ warnings: updated });
  };

  const handleNutritionChange = (value: string) => {
    setNutritionJson(value);
    if (!value.trim()) {
      updateFormData({ nutritionFacts: undefined });
      return;
    }
    try {
      const parsed = JSON.parse(value);
      updateFormData({ nutritionFacts: parsed });
    } catch {
      // Invalid JSON - don't update, but keep the text for editing
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Compliance & Regulatory</h3>
      </div>

      {/* Ingredients */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingredients
        </label>
        <textarea
          value={formData.ingredients || ''}
          onChange={(e) => updateFormData({ ingredients: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="List all ingredients in order of predominance"
        />
        <p className="mt-1 text-xs text-gray-500">Required for food & beverage products</p>
      </div>

      {/* Allergens */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allergen Information
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          {commonAllergens.map(allergen => (
            <label
              key={allergen}
              className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={(formData.allergens || []).includes(allergen)}
                onChange={() => toggleAllergen(allergen)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{allergen}</span>
            </label>
          ))}
        </div>

        {/* Custom Allergens */}
        {(formData.allergens || []).some(a => !commonAllergens.includes(a)) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {(formData.allergens || []).filter(a => !commonAllergens.includes(a)).map(allergen => (
              <span
                key={allergen}
                className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {allergen}
                <button
                  type="button"
                  onClick={() => removeAllergen(allergen)}
                  className="hover:text-red-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={customAllergen}
            onChange={(e) => setCustomAllergen(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAllergen())}
            placeholder="Add custom allergen (e.g., Phenylalanine)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            type="button"
            onClick={addCustomAllergen}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Certifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {certifications.map(cert => (
            <label
              key={cert}
              className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={(formData.certifications || []).includes(cert)}
                onChange={() => toggleCertification(cert)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{cert}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Warnings */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Warnings & Disclaimers
          </label>
          <button
            type="button"
            onClick={() => setShowWarningModal(true)}
            className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Warning
          </button>
        </div>
        
        {(formData.warnings || []).length > 0 ? (
          <div className="space-y-2">
            {formData.warnings?.map((warning, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span className="flex-1 text-sm text-gray-700">{warning}</span>
                <button
                  type="button"
                  onClick={() => removeWarning(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 p-4 border border-gray-200 rounded-lg bg-gray-50">
            No warnings added. Required for tobacco, pharmaceuticals, and age-restricted products.
          </p>
        )}
      </div>

      {/* Nutrition Facts */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nutrition Facts (JSON)
        </label>
        <textarea
          value={nutritionJson}
          onChange={(e) => handleNutritionChange(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-gray-50"
          placeholder={`{\n  "servingSize": "1 cup (240ml)",\n  "servingsPerContainer": 2,\n  "calories": 150,\n  "totalFat": "5g",\n  "sodium": "200mg",\n  "totalCarbohydrate": "25g",\n  "sugars": "15g",\n  "protein": "8g"\n}`}
        />
        <p className="mt-1 text-xs text-gray-500">Enter nutrition information as valid JSON format</p>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Add Warning</h3>
              </div>
              
              <textarea
                value={newWarning}
                onChange={(e) => setNewWarning(e.target.value)}
                rows={4}
                autoFocus
                placeholder="Enter warning or disclaimer text...\n\nExample: Contains nicotine. Nicotine is an addictive chemical."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-4 text-sm"
              />
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowWarningModal(false);
                    setNewWarning('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addWarning}
                  disabled={!newWarning.trim()}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Warning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

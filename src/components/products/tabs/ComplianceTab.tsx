import type { ProductFormData } from '@/services/firestore/products';
import { Shield, AlertTriangle } from 'lucide-react';

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
  const toggleAllergen = (allergen: string) => {
    const current = formData.allergens || [];
    const updated = current.includes(allergen)
      ? current.filter(a => a !== allergen)
      : [...current, allergen];
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
    const warning = prompt('Enter warning text:');
    if (warning) {
      updateFormData({ 
        warnings: [...(formData.warnings || []), warning] 
      });
    }
  };

  const removeWarning = (index: number) => {
    const updated = [...(formData.warnings || [])];
    updated.splice(index, 1);
    updateFormData({ warnings: updated });
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
            onClick={addWarning}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Warning
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
          value={formData.nutritionFacts ? JSON.stringify(formData.nutritionFacts, null, 2) : ''}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              updateFormData({ nutritionFacts: parsed });
            } catch {
              // Invalid JSON - don't update
            }
          }}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder={`{\n  "servingSize": "1 cup",\n  "calories": 150,\n  "totalFat": "5g",\n  "protein": "8g"\n}`}
        />
        <p className="mt-1 text-xs text-gray-500">Enter nutrition information as JSON format</p>
      </div>
    </div>
  );
}

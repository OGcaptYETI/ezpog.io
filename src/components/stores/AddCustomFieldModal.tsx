import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { CustomFieldDefinition } from '@/types';

interface AddCustomFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (field: CustomFieldDefinition) => void;
  existingFields: CustomFieldDefinition[];
}

export function AddCustomFieldModal({ isOpen, onClose, onAdd, existingFields }: AddCustomFieldModalProps) {
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'boolean' | 'select'>('text');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate ID and name from label
    const name = fieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const id = `custom_${name}_${Date.now()}`;

    const newField: CustomFieldDefinition = {
      id,
      name,
      label: fieldLabel,
      type: fieldType,
      required: false,
    };

    onAdd(newField);
    
    // Reset form
    setFieldLabel('');
    setFieldType('text');
    onClose();
  };

  const handleClose = () => {
    setFieldLabel('');
    setFieldType('text');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add Custom Field</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Field Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
              placeholder="e.g., Customer Priority"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This will appear as a label in your system
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Field Type <span className="text-red-500">*</span>
            </label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Yes/No</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>Note:</strong> This custom field will be saved to your organization and can be reused for future imports.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" onClick={handleClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

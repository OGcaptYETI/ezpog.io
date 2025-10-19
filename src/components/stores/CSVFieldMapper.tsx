import { useState } from 'react';
import { ArrowRight, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import type { CustomFieldDefinition } from '@/types';
import { AddCustomFieldModal } from './AddCustomFieldModal';

export interface FieldMapping {
  [csvColumn: string]: string; // Maps CSV column name to system field name (or custom field ID)
}

export interface CustomFieldMapping {
  csvColumn: string;
  customField: CustomFieldDefinition;
}

export interface SystemField {
  systemName: string;
  label: string;
  required: boolean;
  example?: string;
}

export const SYSTEM_FIELDS: SystemField[] = [
  { systemName: 'storeId', label: 'Store ID', required: true, example: '7-11-1001' },
  { systemName: 'storeName', label: 'Store Name', required: true, example: 'Downtown Location' },
  { systemName: 'storeNumber', label: 'Store Number', required: false, example: '1001' },
  { systemName: 'address', label: 'Address', required: true, example: '123 Main St' },
  { systemName: 'address2', label: 'Address Line 2', required: false, example: 'Suite 100' },
  { systemName: 'city', label: 'City', required: true, example: 'New York' },
  { systemName: 'state', label: 'State/Province', required: true, example: 'NY' },
  { systemName: 'zipCode', label: 'ZIP/Postal Code', required: false, example: '10001' },
  { systemName: 'country', label: 'Country', required: false, example: 'USA' },
  { systemName: 'region', label: 'Region', required: false, example: 'Northeast' },
  { systemName: 'district', label: 'District', required: false, example: 'Manhattan' },
  { systemName: 'marketArea', label: 'Market Area', required: false, example: 'Urban' },
  { systemName: 'storeFormat', label: 'Store Format', required: false, example: 'Standard' },
  { systemName: 'squareFootage', label: 'Square Footage', required: false, example: '2500' },
  { systemName: 'fixtureCount', label: 'Fixture Count', required: false, example: '12' },
  { systemName: 'latitude', label: 'Latitude', required: false, example: '40.7128' },
  { systemName: 'longitude', label: 'Longitude', required: false, example: '-74.0060' },
  { systemName: 'storeManagerName', label: 'Store Manager Name', required: false, example: 'John Doe' },
  { systemName: 'storeManagerEmail', label: 'Store Manager Email', required: false, example: 'john@example.com' },
  { systemName: 'storePhone', label: 'Store Phone', required: false, example: '555-0101' },
];

interface CSVFieldMapperProps {
  csvHeaders: string[];
  onMappingComplete: (mapping: FieldMapping, customFields?: CustomFieldMapping[]) => void;
  sampleData?: Record<string, string>; // First row of data for preview
  existingCustomFields?: CustomFieldDefinition[];
}

export function CSVFieldMapper({ csvHeaders, onMappingComplete, sampleData, existingCustomFields = [] }: CSVFieldMapperProps) {
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(existingCustomFields);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [mapping, setMapping] = useState<FieldMapping>(() => {
    // Auto-detect common mappings
    const autoMapping: FieldMapping = {};
    
    csvHeaders.forEach(csvCol => {
      const normalized = csvCol.toLowerCase().replace(/[_\s-]/g, '');
      
      // Try exact match first
      const exactMatch = SYSTEM_FIELDS.find(
        f => f.systemName.toLowerCase() === normalized
      );
      
      if (exactMatch) {
        autoMapping[csvCol] = exactMatch.systemName;
        return;
      }
      
      // Try common aliases
      const aliases: Record<string, string[]> = {
        storeId: ['id', 'storeid', 'store_id', 'locationid', 'location_id', 'siteid'],
        storeName: ['name', 'storename', 'store_name', 'locationname', 'location_name', 'sitename'],
        storeNumber: ['number', 'storenumber', 'store_number', 'storenum', 'store_num', '#'],
        address: ['address', 'addr', 'street', 'address1'],
        address2: ['address2', 'addr2', 'addressline2'],
        city: ['city', 'town'],
        state: ['state', 'province', 'st'],
        zipCode: ['zip', 'zipcode', 'zip_code', 'postalcode', 'postal_code', 'postal'],
        country: ['country', 'nation'],
        region: ['region', 'area', 'territory'],
        district: ['district', 'zone'],
        marketArea: ['market', 'marketarea', 'market_area', 'dma'],
        storeFormat: ['format', 'storeformat', 'store_format', 'type', 'storetype'],
        squareFootage: ['sqft', 'squarefeet', 'square_footage', 'squarefootage', 'size'],
        fixtureCount: ['fixtures', 'fixturecount', 'fixture_count', 'numfixtures'],
        latitude: ['lat', 'latitude'],
        longitude: ['lon', 'lng', 'long', 'longitude'],
        storeManagerName: ['manager', 'managername', 'manager_name', 'storemanager'],
        storeManagerEmail: ['manageremail', 'manager_email', 'email'],
        storePhone: ['phone', 'telephone', 'storephone', 'store_phone', 'tel'],
      };
      
      for (const [systemField, csvAliases] of Object.entries(aliases)) {
        if (csvAliases.includes(normalized)) {
          autoMapping[csvCol] = systemField;
          break;
        }
      }
    });
    
    return autoMapping;
  });

  const handleMappingChange = (csvColumn: string, systemField: string) => {
    setMapping(prev => ({
      ...prev,
      [csvColumn]: systemField,
    }));
  };

  const getMappedFields = () => {
    return Object.values(mapping).filter(Boolean);
  };

  const getRequiredFieldsStatus = () => {
    const requiredFields = SYSTEM_FIELDS.filter(f => f.required);
    const mappedRequired = requiredFields.filter(f => 
      getMappedFields().includes(f.systemName)
    );
    return {
      total: requiredFields.length,
      mapped: mappedRequired.length,
      isComplete: mappedRequired.length === requiredFields.length,
    };
  };

  const handleAddCustomField = (field: CustomFieldDefinition) => {
    setCustomFields(prev => [...prev, field]);
  };

  const handleContinue = () => {
    // Collect custom field mappings
    const customFieldMappings: CustomFieldMapping[] = [];
    
    Object.entries(mapping).forEach(([csvCol, fieldId]) => {
      const customField = customFields.find(f => f.id === fieldId);
      if (customField) {
        customFieldMappings.push({ csvColumn: csvCol, customField });
      }
    });
    
    onMappingComplete(mapping, customFieldMappings.length > 0 ? customFieldMappings : undefined);
  };

  const requiredStatus = getRequiredFieldsStatus();

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`rounded-lg p-4 ${
        requiredStatus.isComplete 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-start gap-3">
          {requiredStatus.isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          )}
          <div className={`text-sm ${requiredStatus.isComplete ? 'text-green-900' : 'text-yellow-900'}`}>
            {requiredStatus.isComplete ? (
              <>
                <p className="font-semibold">All required fields mapped!</p>
                <p className="mt-1">You're ready to import. Review the mappings below and click Continue.</p>
              </>
            ) : (
              <>
                <p className="font-semibold">
                  {requiredStatus.mapped} of {requiredStatus.total} required fields mapped
                </p>
                <p className="mt-1">Please map the remaining required fields to continue.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Field Mappings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Map Your CSV Columns to System Fields</h3>
          <button
            onClick={() => setIsAddFieldModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Custom Field
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {csvHeaders.map((csvCol, index) => {
            const currentMapping = mapping[csvCol];
            const systemField = SYSTEM_FIELDS.find(f => f.systemName === currentMapping);
            const sampleValue = sampleData?.[csvCol];
            
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-3">
                  {/* CSV Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{csvCol}</span>
                      {sampleValue && (
                        <span className="text-xs text-gray-500 italic truncate">
                          (e.g., "{sampleValue}")
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

                  {/* System Field Dropdown */}
                  <div className="flex-1 min-w-0">
                    <select
                      value={currentMapping || ''}
                      onChange={(e) => handleMappingChange(csvCol, e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        systemField?.required && !currentMapping
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <option value="">-- Skip this column --</option>
                      
                      <optgroup label="System Fields">
                        {SYSTEM_FIELDS.map(field => (
                          <option key={field.systemName} value={field.systemName}>
                            {field.label} {field.required ? '(Required)' : ''}
                          </option>
                        ))}
                      </optgroup>
                      
                      {customFields.length > 0 && (
                        <optgroup label="Custom Fields">
                          {customFields.map(field => (
                            <option key={field.id} value={field.id}>
                              {field.label} (Custom)
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Field Mapping Guide:</h4>
        <div className="space-y-1 text-sm text-gray-700">
          <p><strong>Required Fields:</strong> storeId, storeName, address, city, state</p>
          <p><strong>Optional Fields:</strong> All others can be skipped if not available</p>
          <p><strong>Auto-Detection:</strong> Common column names are automatically mapped</p>
          {customFields.length > 0 && (
            <p><strong>Custom Fields:</strong> {customFields.length} custom field(s) created for this import</p>
          )}
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleContinue}
          disabled={!requiredStatus.isComplete}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            requiredStatus.isComplete
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Preview
        </button>
      </div>

      {/* Add Custom Field Modal */}
      <AddCustomFieldModal
        isOpen={isAddFieldModalOpen}
        onClose={() => setIsAddFieldModalOpen(false)}
        onAdd={handleAddCustomField}
        existingFields={customFields}
      />
    </div>
  );
}

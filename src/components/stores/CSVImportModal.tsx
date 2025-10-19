import { useState } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { bulkImportStores, type CSVStoreData } from '@/services/firestore/stores';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { CSVFieldMapper, type FieldMapping, type CustomFieldMapping } from './CSVFieldMapper';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ImportStep = 'upload' | 'mapping' | 'preview' | 'complete';

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [customFieldMappings, setCustomFieldMappings] = useState<CustomFieldMapping[]>([]);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<CSVStoreData[]>([]);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      showToast('Please select a valid CSV file', 'error');
      return;
    }

    setFile(selectedFile);
    await parseCSVHeaders(selectedFile);
    setStep('mapping');
  };

  const parseCSVHeaders = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      showToast('CSV file is empty', 'error');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    setCsvHeaders(headers);

    // Parse all data for mapping and preview
    const allData: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      allData.push(row);
    }
    setCsvData(allData);
  };

  const handleMappingComplete = (mapping: FieldMapping, customMappings?: CustomFieldMapping[]) => {
    setFieldMapping(mapping);
    setCustomFieldMappings(customMappings || []);
    generatePreview(mapping, customMappings || []);
    setStep('preview');
  };

  const generatePreview = (mapping: FieldMapping, customMappings: CustomFieldMapping[]) => {
    const previewData: CSVStoreData[] = csvData.slice(0, 5).map(row => {
      const mapped: any = {};
      const customFields: Record<string, string> = {};
      
      for (const [csvCol, systemField] of Object.entries(mapping)) {
        if (systemField && row[csvCol]) {
          // Check if this is a custom field
          const customMapping = customMappings.find(cm => cm.customField.id === systemField);
          if (customMapping) {
            customFields[customMapping.customField.name] = row[csvCol];
          } else {
            mapped[systemField] = row[csvCol];
          }
        }
      }
      
      if (Object.keys(customFields).length > 0) {
        mapped.customFields = customFields;
      }
      
      return mapped as CSVStoreData;
    });
    
    setPreview(previewData);
  };

  const handleImport = async () => {
    if (!file || !user?.organizationId) return;

    setImporting(true);
    setImportResult(null);

    try {
      const stores: CSVStoreData[] = csvData.map(row => {
        const mapped: any = {};
        const customFields: Record<string, string> = {};
        
        for (const [csvCol, systemField] of Object.entries(fieldMapping)) {
          if (systemField && row[csvCol]) {
            // Check if this is a custom field
            const customMapping = customFieldMappings.find(cm => cm.customField.id === systemField);
            if (customMapping) {
              customFields[customMapping.customField.name] = row[csvCol];
            } else {
              mapped[systemField] = row[csvCol];
            }
          }
        }
        
        if (Object.keys(customFields).length > 0) {
          mapped.customFields = customFields;
        }
        
        return mapped as CSVStoreData;
      });

      const result = await bulkImportStores(
        stores,
        user.organizationId,
        user.uid,
        user.displayName || user.email || 'Unknown'
      );
      
      setImportResult(result);
      setStep('complete');
      
      if (result.success > 0) {
        showToast(`Successfully imported ${result.success} stores`, 'success');
        onSuccess();
      }
      
      if (result.failed > 0) {
        showToast(`${result.failed} stores failed to import`, 'error');
      }
    } catch (error) {
      console.error('Error importing stores:', error);
      showToast('Failed to import stores', 'error');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `storeId,storeName,storeNumber,address,city,state,zipCode,country,region,district,marketArea,storeFormat,squareFootage,fixtureCount,latitude,longitude,storeManagerName,storeManagerEmail,storePhone
7-11-1001,Downtown Location,1001,123 Main St,New York,NY,10001,USA,Northeast,Manhattan,Urban,Standard,2500,12,40.7128,-74.0060,John Doe,john@example.com,555-0101
7-11-1002,Uptown Store,1002,456 Park Ave,New York,NY,10065,USA,Northeast,Manhattan,Urban,Large,3500,18,40.7614,-73.9776,Jane Smith,jane@example.com,555-0102
7-11-1003,Brooklyn Branch,1003,789 Atlantic Ave,Brooklyn,NY,11217,USA,Northeast,Brooklyn,Suburban,Standard,2200,10,40.6782,-73.9442,Bob Johnson,bob@example.com,555-0103`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stores_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetModal = () => {
    setStep('upload');
    setFile(null);
    setCsvHeaders([]);
    setCsvData([]);
    setFieldMapping({});
    setPreview([]);
    setImportResult(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import Stores from CSV</h2>
              <p className="text-sm text-gray-600 mt-1">
                Step {step === 'upload' ? '1' : step === 'mapping' ? '2' : step === 'preview' ? '3' : '4'} of 4
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">CSV Format Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Required fields:</strong> storeId, storeName, address, city, state</li>
                      <li>First row must contain column headers</li>
                      <li>You'll be able to map your columns to our system fields in the next step</li>
                      <li><strong>Recommendation:</strong> For testing, upload 500-2000 stores max</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Download Template */}
              <div className="flex items-center justify-center">
                <Button onClick={downloadTemplate} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Choose a CSV file to upload</p>
                <p className="text-sm text-gray-600 mb-4">
                  or drag and drop your file here
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <button
                  onClick={() => document.getElementById('csv-upload')?.click()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                  Select File
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Field Mapping */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('upload')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Map CSV Fields</h3>
                  <p className="text-sm text-gray-600">
                    File: {file?.name} ({csvData.length} rows)
                  </p>
                </div>
              </div>

              <CSVFieldMapper
                csvHeaders={csvHeaders}
                onMappingComplete={handleMappingComplete}
                sampleData={csvData[0]}
                initialMapping={fieldMapping}
                initialCustomFieldMappings={customFieldMappings}
              />
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('mapping')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Preview Import</h3>
                  <p className="text-sm text-gray-600">
                    Review the first 5 rows before importing {csvData.length} total stores
                  </p>
                </div>
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Store ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Store Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Address</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">City</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">State</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((store, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{store.storeId}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{store.storeName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{store.address}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{store.city}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{store.state}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base font-semibold text-green-900 mb-1">
                      ✓ Ready to Import {csvData.length} Stores
                    </p>
                    <p className="text-sm text-green-800">
                      Data looks good! Click the green button below to start the import.
                      <br />
                      <span className="text-xs">This may take 1-2 minutes. Please don't close this window.</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setStep('mapping')}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={importing}
                >
                  Back to Mapping
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                >
                  {importing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing {csvData.length} Stores...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Import {csvData.length} Stores
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && importResult && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Import Complete!</h3>
                <p className="text-gray-600">
                  Successfully imported {importResult.success} stores
                </p>
                {importResult.failed > 0 && (
                  <p className="text-red-600 mt-2">
                    {importResult.failed} stores failed to import
                  </p>
                )}
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importResult.errors.length > 10 && (
                      <li>...and {importResult.errors.length - 10} more errors</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex justify-center gap-3">
                <Button onClick={resetModal} variant="outline">
                  Import More Stores
                </Button>
                <Button onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

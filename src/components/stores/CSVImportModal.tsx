import { useState } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { bulkImportStores, type CSVStoreData } from '@/services/firestore/stores';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<CSVStoreData[]>([]);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      showToast('Please select a valid CSV file', 'error');
    }
  };

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const data: CSVStoreData[] = [];
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });
      
      data.push({
        storeId: row.storeid || row['store id'] || row.id || '',
        storeName: row.storename || row['store name'] || row.name || '',
        storeNumber: row.storenumber || row['store number'] || row.number,
        address: row.address || '',
        city: row.city || '',
        state: row.state || '',
        zipCode: row.zipcode || row['zip code'] || row.zip || '',
        country: row.country,
        region: row.region,
        district: row.district,
        marketArea: row.marketarea || row['market area'],
        storeFormat: row.storeformat || row['store format'] || row.format,
        squareFootage: row.squarefootage || row['square footage'] || row.sqft,
        fixtureCount: row.fixturecount || row['fixture count'] || row.fixtures,
        latitude: row.latitude || row.lat,
        longitude: row.longitude || row.lng || row.lon,
        storeManagerName: row.storemanagername || row['store manager name'] || row.manager,
        storeManagerEmail: row.storemanageremail || row['store manager email'],
        storePhone: row.storephone || row['store phone'] || row.phone,
      });
    }
    
    setPreview(data);
  };

  const handleImport = async () => {
    if (!file || !user?.organizationId) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const stores: CSVStoreData[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        
        stores.push({
          storeId: row.storeid || row['store id'] || row.id || '',
          storeName: row.storename || row['store name'] || row.name || '',
          storeNumber: row.storenumber || row['store number'] || row.number,
          address: row.address || '',
          city: row.city || '',
          state: row.state || '',
          zipCode: row.zipcode || row['zip code'] || row.zip || '',
          country: row.country,
          region: row.region,
          district: row.district,
          marketArea: row.marketarea || row['market area'],
          storeFormat: row.storeformat || row['store format'] || row.format,
          squareFootage: row.squarefootage || row['square footage'] || row.sqft,
          fixtureCount: row.fixturecount || row['fixture count'] || row.fixtures,
          latitude: row.latitude || row.lat,
          longitude: row.longitude || row.lng || row.lon,
          storeManagerName: row.storemanagername || row['store manager name'] || row.manager,
          storeManagerEmail: row.storemanageremail || row['store manager email'],
          storePhone: row.storephone || row['store phone'] || row.phone,
        });
      }

      const result = await bulkImportStores(
        stores,
        user.organizationId,
        user.uid,
        user.displayName || user.email
      );

      setImportResult(result);
      
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Import Stores from CSV</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">CSV Format Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Required fields:</strong> storeId, storeName, address, city, state</li>
                  <li><strong>Optional fields:</strong> storeNumber, zipCode, country, region, district, marketArea, storeFormat, squareFootage, fixtureCount, latitude, longitude, storeManagerName, storeManagerEmail, storePhone</li>
                  <li>First row must be headers (field names)</li>
                  <li>Use comma (,) as delimiter</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Template */}
          <div className="mb-6">
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {file ? file.name : 'Choose a CSV file'}
              </p>
              <p className="text-sm text-gray-500">Click to browse or drag and drop</p>
            </label>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Preview (first 5 rows)</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Store ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((store, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{store.storeId}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{store.storeName}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{store.address}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{store.city}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{store.state}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className={`border rounded-lg p-4 ${
              importResult.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start gap-3">
                {importResult.failed === 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-2">
                    Import Summary:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className="text-green-700">✓ Successfully imported: {importResult.success} stores</li>
                    {importResult.failed > 0 && (
                      <li className="text-red-700">✗ Failed: {importResult.failed} stores</li>
                    )}
                  </ul>
                  {importResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="font-semibold text-sm mb-1">Errors:</p>
                      <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                        {importResult.errors.map((error, index) => (
                          <li key={index} className="text-red-700">• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button onClick={onClose} variant="outline">
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult && (
            <Button
              onClick={handleImport}
              disabled={!file || importing}
            >
              {importing ? 'Importing...' : 'Import Stores'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

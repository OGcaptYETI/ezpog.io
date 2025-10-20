import { useState } from 'react';
import { Trash2, Upload, AlertTriangle, Database } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { CSVImportModal } from '@/components/stores/CSVImportModal';

export function AccountListTab() {
  const { showToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE ALL STORES') {
      showToast('Please type the confirmation text exactly', 'error');
      return;
    }

    setDeleting(true);
    try {
      // TODO: Implement actual deletion in Phase 6
      showToast('Delete functionality will be implemented in Phase 6', 'info');
      setShowDeleteModal(false);
      setConfirmText('');
    } catch (error) {
      console.error('Error deleting stores:', error);
      showToast('Failed to delete stores', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Account List Management</h2>
        <p className="text-gray-600 mt-1">Dangerous operations - handle with care</p>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-800">
          <p className="font-semibold mb-1">⚠️ Administrative Functions Only</p>
          <p>These operations can permanently affect your store database. Ensure you have proper backups before proceeding.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* CSV Mass Upload */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">CSV Mass Upload</h3>
                <p className="text-sm text-gray-600">Import multiple stores from CSV file</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Supported Operations:</strong>
            </p>
            <ul className="text-sm text-blue-700 space-y-1 ml-4">
              <li>• Bulk store creation</li>
              <li>• Update existing stores</li>
              <li>• Map custom fields</li>
              <li>• Preview before import</li>
            </ul>
          </div>

          <Button
            onClick={() => setShowCSVModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV File
          </Button>
        </div>

        {/* Delete All Stores */}
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete All Stores</h3>
                <p className="text-sm text-gray-600">Permanently remove all stores from database</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800 font-semibold mb-2">
              ⚠️ EXTREME CAUTION REQUIRED
            </p>
            <p className="text-sm text-red-700">
              This action will permanently delete ALL stores in your organization. This operation cannot be undone and may result in data loss.
            </p>
          </div>

          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All Stores
          </Button>
        </div>

        {/* Database Stats */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Database className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Database Statistics</h3>
              <p className="text-sm text-gray-600">Current account list metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Stores</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-600">-</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onSuccess={() => {
          setShowCSVModal(false);
          showToast('Stores imported successfully!', 'success');
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete ALL Stores?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  This will permanently delete <strong>ALL stores</strong> in your organization.
                </p>
                <p className="text-sm text-red-600 font-semibold mb-4">
                  ⚠️ This action cannot be undone!
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-red-800 mb-2">
                    To confirm, type <strong>DELETE ALL STORES</strong> below:
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    placeholder="DELETE ALL STORES"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText('');
                }}
                variant="outline"
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting || confirmText !== 'DELETE ALL STORES'}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All Stores
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

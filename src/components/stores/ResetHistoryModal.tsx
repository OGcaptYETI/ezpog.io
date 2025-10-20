import { useState } from 'react';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { X, History, Calendar, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { useAuth } from '@/features/auth';

interface ResetHistoryModalProps {
  storeId: string;
  storeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export type ResetType = 'full' | 'partial' | 'refresh' | 'remodel' | 'fixture' | 'category';
export type ResetStatus = 'scheduled' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';

export interface ResetRecord {
  id: string;
  type: ResetType;
  status: ResetStatus;
  scheduledDate: Timestamp;
  startDate?: Timestamp;
  completedDate?: Timestamp;
  title: string;
  description: string;
  beforePhotos: string[];
  afterPhotos: string[];
  notes: string;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
}

export function ResetHistoryModal({ storeId, storeName, isOpen, onClose, onSuccess }: ResetHistoryModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    type: 'full' as ResetType,
    status: 'scheduled' as ResetStatus,
    scheduledDate: '',
    title: '',
    description: '',
    notes: '',
  });

  const resetTypes: { value: ResetType; label: string; description: string }[] = [
    { value: 'full', label: 'Full Store Reset', description: 'Complete store remodel and planogram execution' },
    { value: 'partial', label: 'Partial Reset', description: 'Selected categories or sections' },
    { value: 'refresh', label: 'Refresh', description: 'Minor updates and adjustments' },
    { value: 'remodel', label: 'Remodel', description: 'Major store renovation and layout changes' },
    { value: 'fixture', label: 'Fixture Update', description: 'New fixtures or fixture modifications' },
    { value: 'category', label: 'Category Reset', description: 'Specific category or department reset' },
  ];

  const resetStatuses: { value: ResetStatus; label: string; color: string }[] = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
    { value: 'delayed', label: 'Delayed', color: 'bg-orange-100 text-orange-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }

    setSaving(true);
    try {
      const resetRecord: Omit<ResetRecord, 'id'> = {
        type: formData.type,
        status: formData.status,
        scheduledDate: Timestamp.fromDate(new Date(formData.scheduledDate)),
        title: formData.title.trim(),
        description: formData.description.trim(),
        notes: formData.notes.trim(),
        beforePhotos: [],
        afterPhotos: [],
        createdBy: user?.uid || '',
        createdByName: user?.displayName || user?.email || 'Unknown',
        createdAt: Timestamp.now(),
      };

      // Add status-specific timestamps
      if (formData.status === 'in_progress') {
        (resetRecord as any).startDate = Timestamp.now();
      } else if (formData.status === 'completed') {
        (resetRecord as any).startDate = Timestamp.now();
        (resetRecord as any).completedDate = Timestamp.now();
      }

      const storeRef = doc(db, 'stores', storeId);
      await updateDoc(storeRef, {
        resetHistory: arrayUnion({
          ...resetRecord,
          id: `reset_${Date.now()}`,
        }),
        updatedAt: Timestamp.now(),
      });

      showToast('Reset record added successfully', 'success');
      onSuccess();
      onClose();

      // Reset form
      setFormData({
        type: 'full',
        status: 'scheduled',
        scheduledDate: '',
        title: '',
        description: '',
        notes: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error adding reset record:', error);
      showToast('Failed to add reset record', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Reset Record</h2>
            <p className="text-sm text-gray-600 mt-1">{storeName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <History className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Reset History Tracking</p>
                <p>Track store resets, remodels, and planogram executions. Add before/after photos later from the detail view.</p>
              </div>
            </div>
          </div>

          {/* Reset Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Reset Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resetTypes.map((type) => (
                <label
                  key={type.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    formData.type === type.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ResetType })}
                    className="sr-only"
                    disabled={saving}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`block text-sm font-medium ${
                        formData.type === type.value ? 'text-indigo-900' : 'text-gray-900'
                      }`}>
                        {type.label}
                      </span>
                      {formData.type === type.value && (
                        <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <span className={`mt-1 block text-xs ${
                      formData.type === type.value ? 'text-indigo-700' : 'text-gray-500'
                    }`}>
                      {type.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Status & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ResetStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={saving}
              >
                {resetStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={saving}
              />
              {errors.scheduledDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.scheduledDate}
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Q1 2024 Full Store Reset"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={saving}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the reset scope, planograms involved, and expected outcomes..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={saving}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information, special instructions, or observations..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              disabled={saving}
            />
          </div>

          {/* Photo Upload Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ImageIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Before & After Photos</p>
                <p>Photos can be uploaded after creating the reset record from the main reset history view.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <History className="w-4 h-4 mr-2" />
                  Add Reset Record
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

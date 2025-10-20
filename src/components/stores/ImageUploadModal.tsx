import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { storage, db } from '@/services/firebase/config';
import { X, Upload, Image as ImageIcon, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast-context';
import { useAuth } from '@/features/auth';

interface ImageUploadModalProps {
  storeId: string;
  storeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImageUploadModal({ storeId, storeName, isOpen, onClose, onSuccess }: ImageUploadModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError('');

    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only JPG, PNG, and WebP are allowed.`);
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large. Max size is 5MB.`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    // Simulate file input change
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: fileInputRef.current } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        // Create unique filename
        const timestamp = Date.now();
        const filename = `stores/${storeId}/${timestamp}-${index}-${file.name}`;
        const storageRef = ref(storage, filename);

        // Upload file
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        await uploadBytes(storageRef, file);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);

        return {
          url: downloadURL,
          filename: file.name,
          uploadedAt: Timestamp.now(),
          uploadedBy: user?.uid,
          uploadedByName: user?.displayName || user?.email || 'Unknown',
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      // Update store document with new images
      const storeRef = doc(db, 'stores', storeId);
      await updateDoc(storeRef, {
        images: arrayUnion(...uploadedImages),
        updatedAt: Timestamp.now(),
      });

      showToast(`Successfully uploaded ${uploadedImages.length} image(s)`, 'success');
      onSuccess();
      onClose();
      setSelectedFiles([]);
      setUploadProgress({});
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images. Please try again.');
      showToast('Failed to upload images', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Store Images</h2>
            <p className="text-sm text-gray-600 mt-1">{storeName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={uploading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Image Guidelines</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Recommended size: 1920x1080px</li>
              <li>• Supported formats: JPG, PNG, WebP</li>
              <li>• Max file size: 5MB per image</li>
              <li>• Include store exterior and interior shots</li>
            </ul>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-1">
              Drop images here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              JPG, PNG, or WebP (max 5MB each)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 whitespace-pre-line">{error}</div>
            </div>
          )}

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Selected Images ({selectedFiles.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-600 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    {uploadProgress[file.name] !== undefined && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {!uploading && (
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={uploadImages}
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {selectedFiles.length} Image{selectedFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

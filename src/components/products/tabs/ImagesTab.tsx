import { useState } from 'react';
import type { ProductFormData } from '@/services/firestore/products';
import { uploadProductImage, uploadThumbnail } from '@/services/firebase/storage';
import { useAuth } from '@/features/auth';
import { Image as ImageIcon, Upload, X, Loader } from 'lucide-react';

interface ImagesTabProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
}

export function ImagesTab({ formData, updateFormData }: ImagesTabProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState<string | null>(null);

  const handleImageUpload = async (
    file: File,
    type: 'product' | 'sku' | 'thumbnail'
  ) => {
    if (!user?.organizationId) return;

    setUploading(type);
    try {
      let url: string;
      
      if (type === 'thumbnail') {
        url = await uploadThumbnail(file, user.organizationId, undefined);
        updateFormData({ thumbnailUrl: url });
      } else if (type === 'sku') {
        url = await uploadProductImage(file, user.organizationId, undefined, 'sku');
        updateFormData({ skuImageUrl: url });
      } else {
        url = await uploadProductImage(file, user.organizationId, undefined, 'product');
        updateFormData({ imageUrl: url });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleAdditionalImageUpload = async (file: File) => {
    if (!user?.organizationId) return;

    setUploading('additional');
    try {
      const url = await uploadProductImage(file, user.organizationId, undefined, 'product');
      updateFormData({
        additionalImages: [...(formData.additionalImages || []), url]
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const removeAdditionalImage = (index: number) => {
    const updated = [...(formData.additionalImages || [])];
    updated.splice(index, 1);
    updateFormData({ additionalImages: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
      </div>

      {/* Product Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Image
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Main product image displayed in tiles and directory
        </p>
        
        {formData.imageUrl ? (
          <div className="relative inline-block">
            <img
              src={formData.imageUrl}
              alt="Product"
              className="w-48 h-48 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => updateFormData({ imageUrl: undefined })}
              className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'product');
              }}
              className="hidden"
              disabled={uploading === 'product'}
            />
            {uploading === 'product' ? (
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload Image</span>
              </>
            )}
          </label>
        )}
      </div>

      {/* SKU Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SKU Image (For Fixtures)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Product image used on planogram fixtures
        </p>
        
        {formData.skuImageUrl ? (
          <div className="relative inline-block">
            <img
              src={formData.skuImageUrl}
              alt="SKU"
              className="w-48 h-48 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => updateFormData({ skuImageUrl: undefined })}
              className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'sku');
              }}
              className="hidden"
              disabled={uploading === 'sku'}
            />
            {uploading === 'sku' ? (
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload SKU Image</span>
              </>
            )}
          </label>
        )}
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thumbnail
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Small preview image (automatically compressed)
        </p>
        
        {formData.thumbnailUrl ? (
          <div className="relative inline-block">
            <img
              src={formData.thumbnailUrl}
              alt="Thumbnail"
              className="w-24 h-24 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => updateFormData({ thumbnailUrl: undefined })}
              className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'thumbnail');
              }}
              className="hidden"
              disabled={uploading === 'thumbnail'}
            />
            {uploading === 'thumbnail' ? (
              <Loader className="w-4 h-4 text-blue-600 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-gray-400" />
            )}
          </label>
        )}
      </div>

      {/* Additional Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Images
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Add multiple product images
        </p>

        <div className="grid grid-cols-4 gap-4">
          {formData.additionalImages?.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Additional ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => removeAdditionalImage(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add More Button */}
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAdditionalImageUpload(file);
              }}
              className="hidden"
              disabled={uploading === 'additional'}
            />
            {uploading === 'additional' ? (
              <Loader className="w-6 h-6 text-blue-600 animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add Image</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Image Guidelines */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Image Guidelines</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Images are automatically compressed and optimized</li>
          <li>• Recommended size: 1200x1200 pixels or higher</li>
          <li>• Accepted formats: JPG, PNG</li>
          <li>• Maximum file size: 10MB per image</li>
          <li>• Use high-quality images with good lighting</li>
        </ul>
      </div>
    </div>
  );
}

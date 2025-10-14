import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Compress and resize image before upload
 */
export async function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

/**
 * Upload product image to Firebase Storage
 * @param file - Image file to upload
 * @param organizationId - Organization ID
 * @param productId - Product ID (optional for new products)
 * @param imageType - 'product' or 'sku' 
 * @returns Download URL of uploaded image
 */
export async function uploadProductImage(
  file: File,
  organizationId: string,
  productId: string | undefined,
  imageType: 'product' | 'sku' = 'product'
): Promise<string> {
  try {
    // Compress image before upload
    const compressedBlob = await compressImage(file);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;

    // Create storage path
    const path = productId
      ? `organizations/${organizationId}/products/${productId}/${imageType}/${fileName}`
      : `organizations/${organizationId}/products/temp/${imageType}/${fileName}`;

    const storageRef = ref(storage, path);

    // Upload file
    await uploadBytes(storageRef, compressedBlob, {
      contentType: 'image/jpeg',
      customMetadata: {
        organizationId,
        productId: productId || 'temp',
        imageType,
        originalName: file.name,
      },
    });

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(file: File): Promise<Blob> {
  return compressImage(file, 300, 0.7);
}

/**
 * Upload thumbnail image
 */
export async function uploadThumbnail(
  file: File,
  organizationId: string,
  productId: string | undefined
): Promise<string> {
  try {
    const thumbnailBlob = await createThumbnail(file);
    const timestamp = Date.now();
    const fileName = `${timestamp}_thumb.jpg`;

    const path = productId
      ? `organizations/${organizationId}/products/${productId}/thumbnails/${fileName}`
      : `organizations/${organizationId}/products/temp/thumbnails/${fileName}`;

    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, thumbnailBlob, {
      contentType: 'image/jpeg',
    });

    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    throw new Error('Failed to upload thumbnail');
  }
}

/**
 * Delete image from Firebase Storage
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - image might already be deleted
  }
}

/**
 * Upload multiple additional images
 */
export async function uploadAdditionalImages(
  files: File[],
  organizationId: string,
  productId: string | undefined
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadProductImage(file, organizationId, productId, 'product')
  );

  return await Promise.all(uploadPromises);
}

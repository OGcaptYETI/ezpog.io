import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Product } from '@/types';

/**
 * Product Firestore Service
 * Handles all product CRUD operations with comprehensive CPG industry support
 */

// For backward compatibility and easier form handling
export interface ProductFormData {
  // Core Identification
  productId: string;
  upc: string;
  ean?: string;
  gtin?: string;
  
  // Basic Information
  name: string;
  description?: string;
  brand: string;
  brandFamily?: string;
  manufacturer?: string;
  company?: string;
  
  // Categorization
  category: string;
  subCategory?: string;
  department?: string;
  segment?: string;
  
  // Packaging & Dimensions
  packagingTypeId?: string;
  packagingType?: string;
  unitSize?: number;
  unitOfMeasure?: string;
  unitsPerCase?: number;
  caseDimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  weight?: number;
  weightUnit?: string;
  
  // Pricing
  retailPrice?: number;
  wholesalePrice?: number;
  costPrice?: number;
  currency?: string;
  
  // Images
  imageUrl?: string;
  skuImageUrl?: string;
  thumbnailUrl?: string;
  additionalImages?: string[];
  
  // Compliance
  ingredients?: string;
  allergens?: string[];
  nutritionFacts?: Record<string, unknown>;
  certifications?: string[];
  warnings?: string[];
  
  // Inventory
  inStock?: boolean;
  stockLevel?: number;
  reorderPoint?: number;
  status?: 'active' | 'inactive' | 'discontinued';
  
  // Metadata
  tags?: string[];
  notes?: string;
  projects?: string[];
}

const COLLECTION_NAME = 'products';

/**
 * Create a new product
 */
export async function createProduct(
  data: ProductFormData,
  organizationId: string,
  userId: string,
  createdBy: string
): Promise<string> {
  const productData = {
    ...data,
    organizationId,
    userId,
    createdBy,
    status: data.status || 'active',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), productData);
  return docRef.id;
}

/**
 * Get a product by ID
 */
export async function getProduct(id: string): Promise<Product | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Product;
  }
  
  return null;
}

/**
 * Get product by UPC
 */
export async function getProductByUPC(upc: string, organizationId: string): Promise<Product | null> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    where('upc', '==', upc),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  
  const docSnap = querySnapshot.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Product;
}

/**
 * Get all products for an organization
 */
export async function getProductsByOrganization(
  organizationId: string,
  filters?: {
    category?: string;
    brand?: string;
    segment?: string;
    status?: 'active' | 'inactive' | 'discontinued';
  }
): Promise<Product[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    orderBy('name', 'asc')
  );
  
  // Note: Firestore only allows one inequality per query
  // For complex filtering, fetch all and filter client-side
  const querySnapshot = await getDocs(q);
  let products = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Product));
  
  // Client-side filtering
  if (filters) {
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    if (filters.brand) {
      products = products.filter(p => p.brand === filters.brand);
    }
    if (filters.segment) {
      products = products.filter(p => p.segment === filters.segment);
    }
    if (filters.status) {
      products = products.filter(p => p.status === filters.status);
    }
  }
  
  return products;
}

/**
 * Get products by brand
 */
export async function getProductsByBrand(
  organizationId: string,
  brand: string
): Promise<Product[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    where('brand', '==', brand),
    orderBy('name', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Product));
}

/**
 * Search products by name, brand, UPC, or SKU
 */
export async function searchProducts(
  organizationId: string,
  searchTerm: string
): Promise<Product[]> {
  // Note: Firestore doesn't support full-text search natively
  // This is a basic implementation - consider using Algolia or similar for production
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    orderBy('name', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  const products = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Product));
  
  // Client-side filtering
  const lowerSearch = searchTerm.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerSearch) ||
    p.brand.toLowerCase().includes(lowerSearch) ||
    p.upc.includes(searchTerm) ||
    (p.productId && p.productId.toLowerCase().includes(lowerSearch)) ||
    (p.ean && p.ean.includes(searchTerm)) ||
    (p.gtin && p.gtin.includes(searchTerm))
  );
}

/**
 * Update a product
 */
export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Bulk create products (for CSV import)
 */
export async function bulkCreateProducts(
  products: ProductFormData[],
  organizationId: string,
  userId: string,
  createdBy: string
): Promise<string[]> {
  const ids: string[] = [];
  
  for (const product of products) {
    const id = await createProduct(product, organizationId, userId, createdBy);
    ids.push(id);
  }
  
  return ids;
}

/**
 * Get product categories for an organization
 */
export async function getProductCategories(organizationId: string): Promise<string[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId)
  );
  
  const querySnapshot = await getDocs(q);
  const categories = new Set<string>();
  
  querySnapshot.docs.forEach(doc => {
    const category = doc.data().category;
    if (category) {
      categories.add(category);
    }
  });
  
  return Array.from(categories).sort();
}

/**
 * Get product brands for an organization
 */
export async function getProductBrands(organizationId: string): Promise<string[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId)
  );
  
  const querySnapshot = await getDocs(q);
  const brands = new Set<string>();
  
  querySnapshot.docs.forEach(doc => {
    const brand = doc.data().brand;
    if (brand) {
      brands.add(brand);
    }
  });
  
  return Array.from(brands).sort();
}

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

/**
 * Product Firestore Service
 * Handles all product CRUD operations
 */

export interface ProductData {
  id?: string;
  productId?: string;           // Custom product ID (optional)
  
  // Basic Info
  name: string;
  brand: string;
  brandFamily: string | null;
  upc: string;
  
  // Classification
  category: string;
  packagingTypeId: string | null;
  
  // Dimensions
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: 'inches' | 'cm';
    weight: number | null;
    weightUnit: 'oz' | 'g' | null;
  } | null;
  
  // Visual
  imageUrl: string | null;
  images: string[];
  
  // Ownership
  organizationId: string;
  userId: string;               // Creator (for backward compatibility)
  
  // Metadata
  sku: string | null;
  description: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'products';

/**
 * Create a new product
 */
export async function createProduct(data: Omit<ProductData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const productData = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), productData);
  return docRef.id;
}

/**
 * Get a product by ID
 */
export async function getProduct(id: string): Promise<ProductData | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as ProductData;
  }
  
  return null;
}

/**
 * Get product by UPC
 */
export async function getProductByUPC(upc: string): Promise<ProductData | null> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('upc', '==', upc),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  } as ProductData;
}

/**
 * Get all products for an organization
 */
export async function getProductsByOrganization(
  organizationId: string,
  category?: string
): Promise<ProductData[]> {
  let q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    orderBy('name', 'asc')
  );
  
  if (category) {
    q = query(
      collection(db, COLLECTION_NAME),
      where('organizationId', '==', organizationId),
      where('category', '==', category),
      orderBy('name', 'asc')
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  } as ProductData));
}

/**
 * Get products by brand
 */
export async function getProductsByBrand(
  organizationId: string,
  brand: string
): Promise<ProductData[]> {
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
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  } as ProductData));
}

/**
 * Search products by name
 */
export async function searchProducts(
  organizationId: string,
  searchTerm: string
): Promise<ProductData[]> {
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
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  } as ProductData));
  
  // Client-side filtering (temporary solution)
  const lowerSearch = searchTerm.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerSearch) ||
    p.brand.toLowerCase().includes(lowerSearch) ||
    p.upc.includes(searchTerm) ||
    (p.sku && p.sku.toLowerCase().includes(lowerSearch))
  );
}

/**
 * Update a product
 */
export async function updateProduct(id: string, data: Partial<ProductData>): Promise<void> {
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
 * Bulk create products
 */
export async function bulkCreateProducts(products: Array<Omit<ProductData, 'id' | 'createdAt' | 'updatedAt'>>): Promise<string[]> {
  const ids: string[] = [];
  
  for (const product of products) {
    const id = await createProduct(product);
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

/**
 * Firestore service for Store management
 * Handles CRUD operations for organization stores
 */

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
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Store interface for master store list
 */
export interface Store {
  id: string;
  organizationId: string;
  
  // Basic Info
  storeId: string;           // Unique store identifier (e.g., "7-11-1234")
  storeName: string;
  storeNumber?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Location
  latitude?: number;
  longitude?: number;
  region?: string;
  district?: string;
  marketArea?: string;
  
  // Store Details
  storeFormat: string;       // Small, Standard, Large, etc.
  squareFootage?: number;
  fixtureCount?: number;
  
  // Contact
  storeManagerName?: string;
  storeManagerEmail?: string;
  storePhone?: string;
  
  // Custom Fields (Organization-specific)
  customFields?: Record<string, string | number | boolean>;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  createdByName: string;
  
  // Status
  isActive: boolean;
}

export interface StoreFormData {
  storeId: string;
  storeName: string;
  storeNumber?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  district?: string;
  marketArea?: string;
  storeFormat: string;
  squareFootage?: number;
  fixtureCount?: number;
  storeManagerName?: string;
  storeManagerEmail?: string;
  storePhone?: string;
  isActive?: boolean;
}

export interface CSVStoreData {
  storeId: string;
  storeName: string;
  storeNumber?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  region?: string;
  district?: string;
  marketArea?: string;
  storeFormat?: string;
  squareFootage?: string;
  fixtureCount?: string;
  storeManagerName?: string;
  storeManagerEmail?: string;
  storePhone?: string;
}

const COLLECTION_NAME = 'stores';

/**
 * Create a new store
 */
export async function createStore(
  data: StoreFormData,
  organizationId: string,
  userId: string,
  createdByName: string
): Promise<string> {
  const storeData: any = {
    organizationId,
    storeId: data.storeId,
    storeName: data.storeName,
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    country: data.country || 'USA',
    storeFormat: data.storeFormat || 'Standard',
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdBy: userId,
    createdByName,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Add optional fields
  if (data.storeNumber) storeData.storeNumber = data.storeNumber;
  if (data.latitude) storeData.latitude = data.latitude;
  if (data.longitude) storeData.longitude = data.longitude;
  if (data.region) storeData.region = data.region;
  if (data.district) storeData.district = data.district;
  if (data.marketArea) storeData.marketArea = data.marketArea;
  if (data.squareFootage) storeData.squareFootage = data.squareFootage;
  if (data.fixtureCount) storeData.fixtureCount = data.fixtureCount;
  if (data.storeManagerName) storeData.storeManagerName = data.storeManagerName;
  if (data.storeManagerEmail) storeData.storeManagerEmail = data.storeManagerEmail;
  if (data.storePhone) storeData.storePhone = data.storePhone;

  const docRef = await addDoc(collection(db, COLLECTION_NAME), storeData);
  return docRef.id;
}

/**
 * Get a store by ID
 */
export async function getStore(id: string): Promise<Store | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Store;
  }
  
  return null;
}

/**
 * Get all stores for an organization
 */
export async function getStoresByOrganization(
  organizationId: string,
  filters?: {
    region?: string;
    district?: string;
    storeFormat?: string;
    isActive?: boolean;
  }
): Promise<Store[]> {
  let q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    orderBy('storeName', 'asc')
  );

  // Apply filters
  if (filters?.region) {
    q = query(q, where('region', '==', filters.region));
  }
  if (filters?.district) {
    q = query(q, where('district', '==', filters.district));
  }
  if (filters?.storeFormat) {
    q = query(q, where('storeFormat', '==', filters.storeFormat));
  }
  if (filters?.isActive !== undefined) {
    q = query(q, where('isActive', '==', filters.isActive));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Store));
}

/**
 * Update a store
 */
export async function updateStore(id: string, data: Partial<StoreFormData>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  
  const updateData: any = {
    updatedAt: Timestamp.now(),
  };

  // Only include fields that are being updated
  if (data.storeId !== undefined) updateData.storeId = data.storeId;
  if (data.storeName !== undefined) updateData.storeName = data.storeName;
  if (data.storeNumber !== undefined) updateData.storeNumber = data.storeNumber;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.zipCode !== undefined) updateData.zipCode = data.zipCode;
  if (data.country !== undefined) updateData.country = data.country;
  if (data.latitude !== undefined) updateData.latitude = data.latitude;
  if (data.longitude !== undefined) updateData.longitude = data.longitude;
  if (data.region !== undefined) updateData.region = data.region;
  if (data.district !== undefined) updateData.district = data.district;
  if (data.marketArea !== undefined) updateData.marketArea = data.marketArea;
  if (data.storeFormat !== undefined) updateData.storeFormat = data.storeFormat;
  if (data.squareFootage !== undefined) updateData.squareFootage = data.squareFootage;
  if (data.fixtureCount !== undefined) updateData.fixtureCount = data.fixtureCount;
  if (data.storeManagerName !== undefined) updateData.storeManagerName = data.storeManagerName;
  if (data.storeManagerEmail !== undefined) updateData.storeManagerEmail = data.storeManagerEmail;
  if (data.storePhone !== undefined) updateData.storePhone = data.storePhone;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  await updateDoc(docRef, updateData);
}

/**
 * Delete a store
 */
export async function deleteStore(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Bulk import stores from CSV
 */
export async function bulkImportStores(
  stores: CSVStoreData[],
  organizationId: string,
  userId: string,
  createdByName: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const batch = writeBatch(db);
  const errors: string[] = [];
  let success = 0;
  let failed = 0;

  for (const store of stores) {
    try {
      // Validate required fields
      if (!store.storeId || !store.storeName || !store.address || !store.city || !store.state) {
        errors.push(`Row skipped: Missing required fields for store ${store.storeId || 'unknown'}`);
        failed++;
        continue;
      }

      const storeData: any = {
        organizationId,
        storeId: store.storeId.trim(),
        storeName: store.storeName.trim(),
        address: store.address.trim(),
        city: store.city.trim(),
        state: store.state.trim(),
        zipCode: store.zipCode?.trim() || '',
        country: store.country?.trim() || 'USA',
        storeFormat: store.storeFormat?.trim() || 'Standard',
        isActive: true,
        createdBy: userId,
        createdByName,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Add optional fields
      if (store.storeNumber) storeData.storeNumber = store.storeNumber.trim();
      if (store.region) storeData.region = store.region.trim();
      if (store.district) storeData.district = store.district.trim();
      if (store.marketArea) storeData.marketArea = store.marketArea.trim();
      if (store.storeManagerName) storeData.storeManagerName = store.storeManagerName.trim();
      if (store.storeManagerEmail) storeData.storeManagerEmail = store.storeManagerEmail.trim();
      if (store.storePhone) storeData.storePhone = store.storePhone.trim();
      
      // Parse numbers
      if (store.latitude) {
        const lat = parseFloat(store.latitude);
        if (!isNaN(lat)) storeData.latitude = lat;
      }
      if (store.longitude) {
        const lng = parseFloat(store.longitude);
        if (!isNaN(lng)) storeData.longitude = lng;
      }
      if (store.squareFootage) {
        const sqft = parseInt(store.squareFootage);
        if (!isNaN(sqft)) storeData.squareFootage = sqft;
      }
      if (store.fixtureCount) {
        const fixtures = parseInt(store.fixtureCount);
        if (!isNaN(fixtures)) storeData.fixtureCount = fixtures;
      }

      const newDocRef = doc(collection(db, COLLECTION_NAME));
      batch.set(newDocRef, storeData);
      success++;
    } catch (error) {
      errors.push(`Error importing store ${store.storeId}: ${error}`);
      failed++;
    }
  }

  // Commit batch (max 500 per batch, but we'll handle that with chunking if needed)
  if (success > 0) {
    await batch.commit();
  }

  return { success, failed, errors };
}

/**
 * Get stores by IDs (for project assignment)
 */
export async function getStoresByIds(storeIds: string[]): Promise<Store[]> {
  if (storeIds.length === 0) return [];

  const stores: Store[] = [];
  
  // Firestore 'in' queries are limited to 10 items, so we chunk
  const chunks = [];
  for (let i = 0; i < storeIds.length; i += 10) {
    chunks.push(storeIds.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('__name__', 'in', chunk)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach(doc => {
      stores.push({
        id: doc.id,
        ...doc.data(),
      } as Store);
    });
  }

  return stores;
}

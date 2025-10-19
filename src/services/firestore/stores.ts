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
  storeNumber?: string;  // Optional but built-in field
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
  isActive?: boolean;  // Active/Inactive status
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
  isActive?: boolean;
  customFields?: Record<string, string | number | boolean>;
}

export type ImportMode = 'skip' | 'update' | 'create-new';

export interface AutoGenerateConfig {
  enabled: boolean;
  format: 'simple' | 'prefix' | 'suffix';
  prefix?: string;
  suffix?: string;
  padding: number; // Number of digits (e.g., 4 = 0001, 0002)
  startNumber?: number;
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
 * Check for existing stores by storeId
 */
export async function checkExistingStores(
  storeIds: string[],
  organizationId: string
): Promise<Map<string, string>> {
  const existingStores = new Map<string, string>(); // storeId -> documentId
  
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    where('storeId', 'in', storeIds.slice(0, 10)) // Firestore limit is 10
  );
  
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    const data = doc.data();
    existingStores.set(data.storeId, doc.id);
  });
  
  return existingStores;
}

/**
 * Generate Store ID based on configuration
 */
export function generateStoreId(
  index: number,
  config: AutoGenerateConfig
): string {
  const num = (config.startNumber || 1) + index;
  const paddedNum = String(num).padStart(config.padding, '0');
  
  switch (config.format) {
    case 'prefix':
      return `${config.prefix}-${paddedNum}`;
    case 'suffix':
      return `${paddedNum}-${config.suffix}`;
    case 'simple':
    default:
      return paddedNum;
  }
}

/**
 * Bulk import stores from CSV
 */
export async function bulkImportStores(
  stores: CSVStoreData[],
  organizationId: string,
  userId: string,
  createdByName: string,
  mode: ImportMode = 'create-new',
  autoGenerateConfig?: AutoGenerateConfig
): Promise<{ success: number; failed: number; errors: string[]; skipped: number; updated: number }> {
  const batch = writeBatch(db);
  const errors: string[] = [];
  let success = 0;
  let failed = 0;
  let skipped = 0;
  let updated = 0;

  // Auto-generate Store IDs if configured
  const processedStores = stores.map((store, index) => {
    if (autoGenerateConfig?.enabled && (!store.storeId || store.storeId.trim() === '')) {
      return {
        ...store,
        storeId: generateStoreId(index, autoGenerateConfig)
      };
    }
    return store;
  });

  // Check for existing stores if mode is skip or update
  const existingStoresMap = new Map<string, string>();
  if (mode === 'skip' || mode === 'update') {
    const storeIds = processedStores.map(s => s.storeId).filter(Boolean);
    // Query existing stores in chunks due to Firestore limit
    for (let i = 0; i < storeIds.length; i += 10) {
      const chunk = storeIds.slice(i, i + 10);
      const existing = await checkExistingStores(chunk, organizationId);
      existing.forEach((docId, storeId) => existingStoresMap.set(storeId, docId));
    }
  }

  for (const store of processedStores) {
    try {
      // Validate required fields
      if (!store.storeId || !store.storeName || !store.address || !store.city || !store.state) {
        errors.push(`Row skipped: Missing required fields for store ${store.storeId || 'unknown'}`);
        failed++;
        continue;
      }

      const storeId = store.storeId.trim();
      const existingDocId = existingStoresMap.get(storeId);

      // Handle based on mode
      if (existingDocId) {
        if (mode === 'skip') {
          skipped++;
          continue;
        } else if (mode === 'update') {
          // Update existing store
          const docRef = doc(db, COLLECTION_NAME, existingDocId);
          const updateData: Record<string, unknown> = {
            storeName: store.storeName.trim(),
            address: store.address.trim(),
            city: store.city.trim(),
            state: store.state.trim(),
            zipCode: store.zipCode?.trim() || '',
            updatedAt: Timestamp.now(),
          };

          if (store.storeNumber) updateData.storeNumber = store.storeNumber.trim();
          if (store.country) updateData.country = store.country.trim();
          if (store.region) updateData.region = store.region.trim();
          if (store.district) updateData.district = store.district.trim();
          if (store.marketArea) updateData.marketArea = store.marketArea.trim();
          if (store.storeFormat) updateData.storeFormat = store.storeFormat.trim();
          if (store.storeManagerName) updateData.storeManagerName = store.storeManagerName.trim();
          if (store.storeManagerEmail) updateData.storeManagerEmail = store.storeManagerEmail.trim();
          if (store.storePhone) updateData.storePhone = store.storePhone.trim();
          if (store.isActive !== undefined) updateData.isActive = store.isActive;

          // Parse numbers
          if (store.latitude) {
            const lat = parseFloat(store.latitude);
            if (!isNaN(lat)) updateData.latitude = lat;
          }
          if (store.longitude) {
            const lng = parseFloat(store.longitude);
            if (!isNaN(lng)) updateData.longitude = lng;
          }
          if (store.squareFootage) {
            const sqft = parseInt(store.squareFootage);
            if (!isNaN(sqft)) updateData.squareFootage = sqft;
          }
          if (store.fixtureCount) {
            const fixtures = parseInt(store.fixtureCount);
            if (!isNaN(fixtures)) updateData.fixtureCount = fixtures;
          }

          // Merge custom fields
          if (store.customFields && Object.keys(store.customFields).length > 0) {
            updateData.customFields = store.customFields;
          }

          batch.update(docRef, updateData as any);
          updated++;
          continue;
        }
        // mode === 'create-new' falls through to create
      }

      // Create new store
      const storeData: Record<string, unknown> = {
        organizationId,
        storeId,
        storeName: store.storeName.trim(),
        address: store.address.trim(),
        city: store.city.trim(),
        state: store.state.trim(),
        zipCode: store.zipCode?.trim() || '',
        country: store.country?.trim() || 'USA',
        storeFormat: store.storeFormat?.trim() || 'Standard',
        isActive: store.isActive !== undefined ? store.isActive : true,
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
      
      // Add custom fields if present
      if (store.customFields && Object.keys(store.customFields).length > 0) {
        storeData.customFields = store.customFields;
      }

      const newDocRef = doc(collection(db, COLLECTION_NAME));
      batch.set(newDocRef, storeData);
      success++;
    } catch (error) {
      errors.push(`Error importing store ${store.storeId}: ${error}`);
      failed++;
    }
  }

  // Commit batch (max 500 per batch)
  if (success > 0 || updated > 0) {
    await batch.commit();
  }

  return { success, failed, errors, skipped, updated };
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

/**
 * Bulk delete stores by their document IDs
 * @param storeDocIds - Array of Firestore document IDs to delete
 * @returns Promise that resolves when deletion is complete
 */
export async function bulkDeleteStores(storeDocIds: string[]): Promise<void> {
  // Process in batches of 500 (Firestore batch limit)
  const batchSize = 500;
  
  for (let i = 0; i < storeDocIds.length; i += batchSize) {
    const batch = writeBatch(db);
    const batchIds = storeDocIds.slice(i, i + batchSize);
    
    batchIds.forEach(docId => {
      const docRef = doc(db, COLLECTION_NAME, docId);
      batch.delete(docRef);
    });
    
    await batch.commit();
  }
}

/**
 * Delete ALL stores for an organization
 * ⚠️ DANGEROUS OPERATION - Use with extreme caution
 * @param organizationId - Organization ID
 * @returns Number of stores deleted
 */
export async function deleteAllStoresForOrganization(organizationId: string): Promise<number> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId)
  );
  
  const querySnapshot = await getDocs(q);
  const storeIds = querySnapshot.docs.map(doc => doc.id);
  
  if (storeIds.length === 0) return 0;
  
  await bulkDeleteStores(storeIds);
  
  return storeIds.length;
}

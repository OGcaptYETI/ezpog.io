import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Organization } from '@/types';

const COLLECTION_NAME = 'organizations';

/**
 * Create a new organization with custom ID
 */
export async function createOrganization(
  data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>,
  customId?: string
): Promise<string> {
  const orgData = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  if (customId) {
    // Use custom ID (e.g., "demo-org")
    const docRef = doc(db, COLLECTION_NAME, customId);
    await setDoc(docRef, orgData);
    return customId;
  } else {
    // Auto-generate ID
    const docRef = await addDoc(collection(db, COLLECTION_NAME), orgData);
    return docRef.id;
  }
}

/**
 * Get organization by ID
 */
export async function getOrganization(id: string): Promise<Organization | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt,
      updatedAt: docSnap.data().updatedAt,
    } as Organization;
  }

  return null;
}

/**
 * Get all organizations (Super Admin only)
 */
export async function getAllOrganizations(): Promise<Organization[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt,
    updatedAt: doc.data().updatedAt,
  } as Organization));
}

/**
 * Get organizations by status
 */
export async function getOrganizationsByStatus(
  status: Organization['status']
): Promise<Organization[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', status),
    orderBy('name', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt,
    updatedAt: doc.data().updatedAt,
  } as Organization));
}

/**
 * Update organization
 */
export async function updateOrganization(
  id: string,
  data: Partial<Organization>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete organization
 */
export async function deleteOrganization(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Update organization status
 */
export async function updateOrganizationStatus(
  id: string,
  status: Organization['status']
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    status,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get organization stats
 */
export async function getOrganizationStats(id: string) {
  // Get user count
  const usersQuery = query(
    collection(db, 'users'),
    where('organizationId', '==', id)
  );
  const usersSnapshot = await getDocs(usersQuery);

  // Get project count
  const projectsQuery = query(
    collection(db, 'projects'),
    where('organizationId', '==', id)
  );
  const projectsSnapshot = await getDocs(projectsQuery);

  // Get planogram count
  const planogramsQuery = query(
    collection(db, 'planograms'),
    where('organizationId', '==', id)
  );
  const planogramsSnapshot = await getDocs(planogramsQuery);

  return {
    userCount: usersSnapshot.size,
    projectCount: projectsSnapshot.size,
    planogramCount: planogramsSnapshot.size,
  };
}

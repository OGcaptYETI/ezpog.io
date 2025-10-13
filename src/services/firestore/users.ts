import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { User } from '@/types';

const COLLECTION_NAME = 'users';

/**
 * Get all users (Super Admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data(),
  } as User));
}

/**
 * Get users by organization
 */
export async function getUsersByOrganization(orgId: string): Promise<User[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', orgId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data(),
  } as User));
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      uid: docSnap.id,
      ...docSnap.data(),
    } as User;
  }
  
  return null;
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, userId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update user organization
 */
export async function assignUserToOrganization(
  userId: string,
  organizationId: string,
  role: User['role']
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, userId);
  await updateDoc(docRef, {
    organizationId,
    role,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update user status
 */
export async function updateUserStatus(
  userId: string,
  status: User['status']
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, userId);
  await updateDoc(docRef, {
    status,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get user stats by organization
 */
export async function getUserStatsByOrg(orgId: string) {
  const users = await getUsersByOrganization(orgId);
  
  return {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    users: users.filter(u => u.role === 'user').length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
  };
}

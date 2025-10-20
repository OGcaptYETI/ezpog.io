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
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { FieldTeam, CreateFieldTeamData, UpdateFieldTeamData } from '@/types/fieldTeams';

const COLLECTION_NAME = 'fieldTeams';

/**
 * Create a new field team
 */
export async function createFieldTeam(data: CreateFieldTeamData): Promise<string> {
  const teamData = {
    ...data,
    assignedStores: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), teamData);
  return docRef.id;
}

/**
 * Get a single field team by ID
 */
export async function getFieldTeam(teamId: string): Promise<FieldTeam | null> {
  const docRef = doc(db, COLLECTION_NAME, teamId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data()
  } as FieldTeam;
}

/**
 * Get all field teams for an organization
 */
export async function getFieldTeamsByOrganization(organizationId: string): Promise<FieldTeam[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FieldTeam));
}

/**
 * Update a field team
 */
export async function updateFieldTeam(
  teamId: string,
  data: UpdateFieldTeamData
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, teamId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now()
  });
}

/**
 * Delete a field team
 */
export async function deleteFieldTeam(teamId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, teamId);
  await deleteDoc(docRef);
}

/**
 * Add a member to a field team
 */
export async function addMemberToTeam(teamId: string, userId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, teamId);
  await updateDoc(docRef, {
    members: arrayUnion(userId),
    updatedAt: Timestamp.now()
  });
}

/**
 * Remove a member from a field team
 */
export async function removeMemberFromTeam(teamId: string, userId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, teamId);
  await updateDoc(docRef, {
    members: arrayRemove(userId),
    updatedAt: Timestamp.now()
  });
}

/**
 * Assign stores to a field team
 */
export async function assignStoresToTeam(teamId: string, storeIds: string[]): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, teamId);
  await updateDoc(docRef, {
    assignedStores: arrayUnion(...storeIds),
    updatedAt: Timestamp.now()
  });
}

/**
 * Remove stores from a field team
 */
export async function removeStoresFromTeam(teamId: string, storeIds: string[]): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, teamId);
  await updateDoc(docRef, {
    assignedStores: arrayRemove(...storeIds),
    updatedAt: Timestamp.now()
  });
}

/**
 * Get teams assigned to a specific user
 */
export async function getTeamsByMember(userId: string, organizationId: string): Promise<FieldTeam[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    where('members', 'array-contains', userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FieldTeam));
}

/**
 * Get teams that have a specific store assigned
 */
export async function getTeamsByStore(storeId: string, organizationId: string): Promise<FieldTeam[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    where('assignedStores', 'array-contains', storeId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FieldTeam));
}

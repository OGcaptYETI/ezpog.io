import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  organizationName: string;
  role: 'admin' | 'manager' | 'user' | 'field_team';
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

const COLLECTION_NAME = 'invitations';

/**
 * Generate secure random token
 */
function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create invitation
 */
export async function createInvitation(data: {
  email: string;
  organizationId: string;
  organizationName: string;
  role: Invitation['role'];
  invitedBy: string;
}): Promise<{ invitationId: string; token: string }> {
  const token = generateToken();
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  );

  const invitation = {
    ...data,
    token,
    status: 'pending' as const,
    expiresAt,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), invitation);
  
  return {
    invitationId: docRef.id,
    token,
  };
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('token', '==', token),
    where('status', '==', 'pending')
  );

  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data();
  
  // Check if expired
  if (data.expiresAt.toDate() < new Date()) {
    await updateDoc(doc.ref, { status: 'expired' });
    return null;
  }

  return {
    id: doc.id,
    ...data,
  } as Invitation;
}

/**
 * Get invitations by organization
 */
export async function getInvitationsByOrganization(orgId: string): Promise<Invitation[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', orgId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Invitation));
}

/**
 * Get all pending invitations (Super Admin)
 */
export async function getAllPendingInvitations(): Promise<Invitation[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Invitation));
}

/**
 * Accept invitation (called during signup)
 */
export async function acceptInvitation(invitationId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, invitationId);
  await updateDoc(docRef, {
    status: 'accepted',
  });
}

/**
 * Cancel/revoke invitation
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, invitationId);
  await updateDoc(docRef, {
    status: 'expired',
  });
}

/**
 * Resend invitation (generate new token)
 */
export async function resendInvitation(invitationId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const docRef = doc(db, COLLECTION_NAME, invitationId);
  await updateDoc(docRef, {
    token,
    expiresAt,
    status: 'pending',
  });

  return token;
}

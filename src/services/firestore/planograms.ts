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
  type DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Planogram Firestore Service
 * Handles all planogram CRUD operations
 */

export interface PlanogramData {
  id?: string;
  name: string;
  description: string | null;
  status: 'draft' | 'in_review' | 'approved' | 'active' | 'archived';
  version: number;
  
  // Canvas Data (React Flow)
  canvasData: {
    width: number;
    height: number;
    scale: number;
    backgroundColor: string | null;
    nodes: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      data: Record<string, any>;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      type: string | null;
    }>;
  };
  
  // Fixtures on canvas
  fixtures: Array<{
    id: string;
    fixtureId: string;        // Reference to fixtures collection
    position: { x: number; y: number };
    rotation: number | null;
    scale: number | null;
    data: Record<string, any>;
  }>;
  
  // Products placed on fixtures
  products: Array<{
    id: string;
    productId: string;        // Reference to products collection
    fixtureId: string;        // Which fixture it's on
    sectionId: string;        // Which section
    position: { x: number; y: number };
    facings: number;
    shelfLevel: number | null;
    rotation: number | null;
    data: Record<string, any>;
  }>;
  
  // Store assignments
  storeAssignments: string[];
  
  // Ownership
  organizationId: string;
  createdBy: string;
  
  // Approval
  approvedBy: string | null;
  approvedAt: Date | null;
  
  // Metadata
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'planograms';

/**
 * Create a new planogram
 */
export async function createPlanogram(data: Omit<PlanogramData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const planogramData = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), planogramData);
  return docRef.id;
}

/**
 * Get a planogram by ID
 */
export async function getPlanogram(id: string): Promise<PlanogramData | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
      approvedAt: docSnap.data().approvedAt?.toDate() || null,
    } as PlanogramData;
  }
  
  return null;
}

/**
 * Get all planograms for an organization
 */
export async function getPlanogramsByOrganization(
  organizationId: string,
  status?: PlanogramData['status']
): Promise<PlanogramData[]> {
  let q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    orderBy('updatedAt', 'desc')
  );
  
  if (status) {
    q = query(
      collection(db, COLLECTION_NAME),
      where('organizationId', '==', organizationId),
      where('status', '==', status),
      orderBy('updatedAt', 'desc')
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    approvedAt: doc.data().approvedAt?.toDate() || null,
  } as PlanogramData));
}

/**
 * Update a planogram
 */
export async function updatePlanogram(id: string, data: Partial<PlanogramData>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a planogram (soft delete by archiving)
 */
export async function deletePlanogram(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    status: 'archived',
    updatedAt: Timestamp.now(),
  });
}

/**
 * Hard delete a planogram (permanent)
 */
export async function hardDeletePlanogram(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Update planogram canvas data (React Flow state)
 */
export async function updatePlanogramCanvas(
  id: string,
  canvasData: PlanogramData['canvasData'],
  fixtures: PlanogramData['fixtures'],
  products: PlanogramData['products']
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    canvasData,
    fixtures,
    products,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Approve a planogram
 */
export async function approvePlanogram(id: string, approvedBy: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    status: 'approved',
    approvedBy,
    approvedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Assign planogram to stores
 */
export async function assignPlanogramToStores(id: string, storeIds: string[]): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    storeAssignments: storeIds,
    updatedAt: Timestamp.now(),
  });
}

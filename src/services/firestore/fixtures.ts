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
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Fixture Firestore Service
 * Handles all fixture CRUD operations
 */

export interface FixtureData {
  id?: string;
  name: string;
  type: 'shelf' | 'endcap' | 'cooler' | 'peg' | 'basket' | 'custom';
  
  // Dimensions
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: 'inches' | 'cm';
  };
  
  // Components (shelves/rows)
  components: Array<{
    id: string;
    type: 'shelf' | 'peg' | 'basket' | 'divider';
    position: {
      x: number;
      y: number;
      z: number | null;
    };
    dimensions: {
      width: number;
      height: number | null;
      depth: number | null;
    };
    capacity: number | null;
    angle: number | null;
  }>;
  
  // Configuration
  shelves: number | null;
  shelfSpacing: number | null;
  
  // Ownership
  organizationId: string;
  createdBy: string;
  isTemplate: boolean;
  isPublic: boolean;
  
  // Visual
  imageUrl: string | null;
  thumbnailUrl: string | null;
  
  // Metadata
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'fixtures';

/**
 * Create a new fixture
 */
export async function createFixture(data: Omit<FixtureData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const fixtureData = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), fixtureData);
  return docRef.id;
}

/**
 * Get a fixture by ID
 */
export async function getFixture(id: string): Promise<FixtureData | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as FixtureData;
  }
  
  return null;
}

/**
 * Get all fixtures for an organization
 */
export async function getFixturesByOrganization(
  organizationId: string,
  type?: FixtureData['type']
): Promise<FixtureData[]> {
  let q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    orderBy('name', 'asc')
  );
  
  if (type) {
    q = query(
      collection(db, COLLECTION_NAME),
      where('organizationId', '==', organizationId),
      where('type', '==', type),
      orderBy('name', 'asc')
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  } as FixtureData));
}

/**
 * Get fixture templates (public templates)
 */
export async function getFixtureTemplates(organizationId: string): Promise<FixtureData[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    where('isTemplate', '==', true),
    orderBy('name', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  } as FixtureData));
}

/**
 * Update a fixture
 */
export async function updateFixture(id: string, data: Partial<FixtureData>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a fixture
 */
export async function deleteFixture(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Duplicate a fixture (create copy)
 */
export async function duplicateFixture(id: string, newName: string, organizationId: string, createdBy: string): Promise<string> {
  const originalFixture = await getFixture(id);
  
  if (!originalFixture) {
    throw new Error('Fixture not found');
  }
  
  // Destructure to omit id, createdAt, updatedAt
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _fixtureId, createdAt, updatedAt, ...fixtureData } = originalFixture;
  
  const newFixture = {
    ...fixtureData,
    name: newName,
    organizationId,
    createdBy,
    isTemplate: false,
    isPublic: false,
  };
  
  return await createFixture(newFixture);
}

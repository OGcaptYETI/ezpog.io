/**
 * Firestore service for Projects
 * Handles CRUD operations for POG execution and reset management projects
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
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Project, ProjectStore, ProjectMember, ProjectType, ProjectStatus, ProjectPriority } from '@/types';

/**
 * Form data interface for creating/updating projects
 */
export interface ProjectFormData {
  // Basic Information
  projectId: string;
  name: string;
  description?: string;
  projectType: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  
  // Timeline
  startDate: Date;
  targetEndDate: Date;
  actualEndDate?: Date;
  milestones?: Array<{
    id: string;
    name: string;
    targetDate: Date;
    completed: boolean;
    completedDate?: Date;
  }>;
  
  // Financial
  estimatedBudget?: number;
  actualBudget?: number;
  estimatedLaborHours?: number;
  actualLaborHours?: number;
  currency: string;
  
  // Scope
  chainName?: string;
  chainType?: 'corporate' | 'independent';
  region?: string;
  district?: string;
  
  // Store Management (Phase 2)
  stores?: ProjectStore[];
  assignedStores?: string[]; // Store IDs for quick lookup
  
  // Team
  teamMembers?: ProjectMember[];
  
  // Metadata
  tags?: string[];
  notes?: string;
  attachments?: string[];
}

const COLLECTION_NAME = 'projects';

/**
 * Create a new project
 */
// Helper function to remove undefined values recursively
function removeUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = removeUndefined(value);
      }
      return acc;
    }, {} as any);
  }
  return obj;
}

export async function createProject(
  data: ProjectFormData,
  organizationId: string,
  userId: string,
  createdByName: string
): Promise<string> {
  // Build project data with proper Timestamp conversions
  const projectData: any = {
    projectId: data.projectId,
    name: data.name,
    description: data.description || '',
    projectType: data.projectType,
    status: data.status || 'draft',
    priority: data.priority,
    startDate: Timestamp.fromDate(data.startDate),
    targetEndDate: Timestamp.fromDate(data.targetEndDate),
    organizationId,
    createdBy: userId,
    createdByName,
    currency: data.currency,
    stores: data.stores || [],
    teamMembers: data.teamMembers || [],
    totalStores: data.stores?.length || 0,
    completedStores: 0,
    inProgressStores: 0,
    completionPercentage: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Add optional fields only if they have values
  if (data.actualEndDate) {
    projectData.actualEndDate = Timestamp.fromDate(data.actualEndDate);
  }
  
  if (data.milestones && data.milestones.length > 0) {
    projectData.milestones = data.milestones.map(m => {
      const milestone: any = {
        id: m.id,
        name: m.name,
        targetDate: Timestamp.fromDate(m.targetDate),
        completed: m.completed,
      };
      if (m.completedDate) {
        milestone.completedDate = Timestamp.fromDate(m.completedDate);
      }
      return milestone;
    });
  }

  if (data.estimatedBudget !== undefined && data.estimatedBudget !== null) {
    projectData.estimatedBudget = data.estimatedBudget;
  }
  
  if (data.actualBudget !== undefined && data.actualBudget !== null) {
    projectData.actualBudget = data.actualBudget;
  }
  
  if (data.estimatedLaborHours !== undefined && data.estimatedLaborHours !== null) {
    projectData.estimatedLaborHours = data.estimatedLaborHours;
  }
  
  if (data.actualLaborHours !== undefined && data.actualLaborHours !== null) {
    projectData.actualLaborHours = data.actualLaborHours;
  }
  
  if (data.chainName) {
    projectData.chainName = data.chainName;
  }
  
  if (data.chainType) {
    projectData.chainType = data.chainType;
  }
  
  if (data.region) {
    projectData.region = data.region;
  }
  
  if (data.district) {
    projectData.district = data.district;
  }
  
  if (data.tags && data.tags.length > 0) {
    projectData.tags = data.tags;
  }
  
  if (data.notes) {
    projectData.notes = data.notes;
  }
  
  if (data.assignedStores && data.assignedStores.length > 0) {
    projectData.assignedStores = data.assignedStores;
  }

  // Final cleanup to ensure no undefined values
  const cleanedData = removeUndefined(projectData);
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanedData);
  return docRef.id;
}

/**
 * Get a project by ID
 */
export async function getProject(id: string): Promise<Project | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Project;
  }
  
  return null;
}

/**
 * Get all projects for an organization
 */
export async function getProjectsByOrganization(
  organizationId: string,
  filters?: {
    status?: ProjectStatus;
    projectType?: ProjectType;
    priority?: ProjectPriority;
  }
): Promise<Project[]> {
  let q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc')
  );
  
  // Apply filters if provided
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters?.projectType) {
    q = query(q, where('projectType', '==', filters.projectType));
  }
  if (filters?.priority) {
    q = query(q, where('priority', '==', filters.priority));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Project));
}

/**
 * Update a project
 */
export async function updateProject(id: string, data: Partial<ProjectFormData>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  
  // Build update data with proper Timestamp conversions
  const updateData: any = {
    updatedAt: Timestamp.now(),
  };

  // Only include fields that are actually being updated
  if (data.projectId !== undefined) updateData.projectId = data.projectId;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.projectType !== undefined) updateData.projectType = data.projectType;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.currency !== undefined) updateData.currency = data.currency;
  
  if (data.startDate) {
    updateData.startDate = Timestamp.fromDate(data.startDate);
  }
  if (data.targetEndDate) {
    updateData.targetEndDate = Timestamp.fromDate(data.targetEndDate);
  }
  if (data.actualEndDate) {
    updateData.actualEndDate = Timestamp.fromDate(data.actualEndDate);
  }
  
  if (data.milestones) {
    updateData.milestones = data.milestones.map(m => {
      const milestone: any = {
        id: m.id,
        name: m.name,
        targetDate: Timestamp.fromDate(m.targetDate),
        completed: m.completed,
      };
      if (m.completedDate) {
        milestone.completedDate = Timestamp.fromDate(m.completedDate);
      }
      return milestone;
    });
  }

  if (data.estimatedBudget !== undefined && data.estimatedBudget !== null) {
    updateData.estimatedBudget = data.estimatedBudget;
  }
  if (data.actualBudget !== undefined && data.actualBudget !== null) {
    updateData.actualBudget = data.actualBudget;
  }
  if (data.estimatedLaborHours !== undefined && data.estimatedLaborHours !== null) {
    updateData.estimatedLaborHours = data.estimatedLaborHours;
  }
  if (data.actualLaborHours !== undefined && data.actualLaborHours !== null) {
    updateData.actualLaborHours = data.actualLaborHours;
  }

  if (data.chainName !== undefined) updateData.chainName = data.chainName;
  if (data.chainType !== undefined) updateData.chainType = data.chainType;
  if (data.region !== undefined) updateData.region = data.region;
  if (data.district !== undefined) updateData.district = data.district;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.notes !== undefined) updateData.notes = data.notes;
  
  if (data.stores !== undefined) {
    updateData.stores = data.stores;
    updateData.totalStores = data.stores.length;
    updateData.completedStores = data.stores.filter(s => s.status === 'completed').length;
    updateData.inProgressStores = data.stores.filter(s => s.status === 'in_progress').length;
    updateData.completionPercentage = data.stores.length > 0 
      ? Math.round((updateData.completedStores / data.stores.length) * 100)
      : 0;
  }

  if (data.teamMembers !== undefined) {
    updateData.teamMembers = data.teamMembers;
  }

  // Final cleanup to ensure no undefined values
  const cleanedData = removeUndefined(updateData);
  
  await updateDoc(docRef, cleanedData);
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Search projects by name or project ID
 */
export async function searchProjects(
  organizationId: string,
  searchTerm: string
): Promise<Project[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    orderBy('name', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  const projects = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Project));
  
  // Client-side filtering
  const lowerSearch = searchTerm.toLowerCase();
  return projects.filter(p => 
    p.name.toLowerCase().includes(lowerSearch) ||
    p.projectId.toLowerCase().includes(lowerSearch) ||
    (p.chainName && p.chainName.toLowerCase().includes(lowerSearch))
  );
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(
  organizationId: string,
  status: ProjectStatus
): Promise<Project[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Project));
}

/**
 * Get active projects (draft, planning, active, on_hold)
 */
export async function getActiveProjects(organizationId: string): Promise<Project[]> {
  const allProjects = await getProjectsByOrganization(organizationId);
  return allProjects.filter(p => 
    p.status === 'draft' || 
    p.status === 'planning' || 
    p.status === 'active' || 
    p.status === 'on_hold'
  );
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  id: string,
  status: ProjectStatus
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const updateData: any = {
    status,
    updatedAt: Timestamp.now(),
  };
  
  // If completing, set actual end date
  if (status === 'completed') {
    updateData.actualEndDate = Timestamp.now();
  }
  
  await updateDoc(docRef, updateData);
}

/**
 * Add team member to project
 */
export async function addTeamMember(
  projectId: string,
  member: ProjectMember
): Promise<void> {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found');
  
  const updatedMembers = [...(project.teamMembers || []), member];
  await updateProject(projectId, { teamMembers: updatedMembers });
}

/**
 * Remove team member from project
 */
export async function removeTeamMember(
  projectId: string,
  userId: string
): Promise<void> {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found');
  
  const updatedMembers = project.teamMembers.filter(m => m.userId !== userId);
  await updateProject(projectId, { teamMembers: updatedMembers });
}

/**
 * Add store to project
 */
export async function addStoreToProject(
  projectId: string,
  store: ProjectStore
): Promise<void> {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found');
  
  const updatedStores = [...project.stores, store];
  await updateProject(projectId, { stores: updatedStores });
}

/**
 * Update store in project
 */
export async function updateStoreInProject(
  projectId: string,
  storeId: string,
  storeData: Partial<ProjectStore>
): Promise<void> {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found');
  
  const updatedStores = project.stores.map(s => 
    s.storeId === storeId ? { ...s, ...storeData } : s
  );
  
  await updateProject(projectId, { stores: updatedStores });
}

/**
 * Remove store from project
 */
export async function removeStoreFromProject(
  projectId: string,
  storeId: string
): Promise<void> {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found');
  
  const updatedStores = project.stores.filter(s => s.storeId !== storeId);
  await updateProject(projectId, { stores: updatedStores });
}

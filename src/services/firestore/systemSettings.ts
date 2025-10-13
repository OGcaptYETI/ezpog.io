import {
  doc,
  getDoc,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'system_settings';
const SETTINGS_DOC_ID = 'platform'; // Single document for platform settings

export interface SystemSettings {
  // General
  siteName: string;
  siteUrl: string;
  maintenanceMode: boolean;
  
  // Security
  allowSignups: boolean;
  requireEmailVerification: boolean;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  passwordMinLength: number;
  
  // Email
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string; // Should be encrypted in production
  
  // Notifications
  enableNotifications: boolean;
  
  // Metadata
  updatedAt: Timestamp;
  updatedBy: string;
}

/**
 * Get system settings
 */
export async function getSystemSettings(): Promise<SystemSettings | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SystemSettings;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting system settings:', error);
    throw error;
  }
}

/**
 * Update system settings
 */
export async function updateSystemSettings(
  settings: Omit<SystemSettings, 'updatedAt' | 'updatedBy'>,
  userId: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    
    await setDoc(docRef, {
      ...settings,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw error;
  }
}

/**
 * Get default settings
 */
export function getDefaultSettings(): Omit<SystemSettings, 'updatedAt' | 'updatedBy'> {
  return {
    siteName: 'EZPOG.io',
    siteUrl: window.location.origin,
    maintenanceMode: false,
    allowSignups: true,
    requireEmailVerification: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 6,
    enableNotifications: true,
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
  };
}

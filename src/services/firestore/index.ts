/**
 * Firestore Services Index
 * Central export for all Firestore service modules
 */

// Planogram services
export * from './planograms';

// Fixture services
export * from './fixtures';

// Product services
export * from './products';

// Re-export Firebase instances for convenience
export { db } from '../firebase/config';

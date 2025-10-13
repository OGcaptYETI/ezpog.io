import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
  type UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { User } from '@/types';

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string,
  organizationId: string = 'default'
): Promise<User> {
  try {
    // Create auth user
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update profile with display name
    await updateProfile(userCredential.user, { displayName });

    // Create user document in Firestore
    const userData: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      displayName,
      photoURL: null,
      organizationId,
      systemRole: 'user', // Default system role
      role: 'user',
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      preferences: {
        theme: 'system',
        notifications: true,
        emailUpdates: true,
      },
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userData);

    return userData;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;

    // Check if user document exists
    let userData = await getUserData(firebaseUser.uid);

    // If user doesn't exist in Firestore, create their document
    if (!userData) {
      userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL,
        organizationId: 'demo-org', // TODO: Create org on first sign-up
        systemRole: 'user', // Default system role
        role: 'user',
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        preferences: {
          theme: 'system',
          notifications: true,
          emailUpdates: true,
        },
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    }

    return userData;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Get user data from Firestore
 */
export async function getUserData(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<User>
): Promise<void> {
  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        ...data,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

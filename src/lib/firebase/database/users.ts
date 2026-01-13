import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../client';

export interface User {
  uid: string;
  email: string;
  full_name: string;
  display_name?: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin' | 'super_admin';
  language?: string;
  accept_cookies?: boolean;
  is_restricted?: boolean;
  restriction_reason?: string;
  created_at?: Date;
  updated_at?: Date;
  // Additional Firebase-compatible fields
  photoURL?: string;
  profile_image?: string;
  name?: string; // Alias for full_name
}

const USERS_COLLECTION = 'users';

// Get user by UID
export async function getUserByUid(uid: string): Promise<User | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by UID:', error);
    throw error;
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { uid: doc.id, ...doc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

// Create or update user
export async function upsertUser(userData: Partial<User> & { uid: string }): Promise<User> {
  try {
    const { uid, ...data } = userData;
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    const now = new Date();
    const userDoc = await getDoc(userRef);
    
    const userData_final = {
      ...data,
      updated_at: now,
      ...(!userDoc.exists() && { created_at: now }),
    };
    
    await setDoc(userRef, userData_final, { merge: true });
    
    const updatedDoc = await getDoc(userRef);
    return { uid: updatedDoc.id, ...updatedDoc.data() } as User;
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}

// Update user
export async function updateUser(uid: string, updates: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      ...updates,
      updated_at: new Date(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Delete user
export async function deleteUser(uid: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Check if email exists
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const user = await getUserByEmail(email);
    return user !== null;
  } catch (error) {
    console.error('Error checking email exists:', error);
    return false;
  }
}

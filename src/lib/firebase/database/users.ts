import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, deleteDoc, deleteField } from 'firebase/firestore';
import { db } from '../client';

export interface User {
  uid: string;
  email: string;
  displayName?: string; // ACTUAL Firestore field (camelCase)
  phone?: string;
  address?: string;
  role: 'user' | 'admin' | 'super_admin';
  language?: string;
  acceptCookies?: boolean; // ACTUAL Firestore field (camelCase)
  profileImage?: string; // ACTUAL Firestore field (camelCase)
  createdAt?: Date; // ACTUAL Firestore field (camelCase)
  updatedAt?: Date; // ACTUAL Firestore field (camelCase)
  
  // Purchase limits (max vouchers/coupons this user can buy in total; undefined = no limit)
  voucherPurchaseLimit?: number;
  couponPurchaseLimit?: number;

  // Legacy fields for backward compatibility (snake_case - OLD)
  full_name?: string;
  display_name?: string;
  accept_cookies?: boolean;
  is_restricted?: boolean;
  restriction_reason?: string;
  created_at?: Date;
  updated_at?: Date;
  photoURL?: string;
  profile_image?: string;
  name?: string;
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

// Get all users (admin function)
export async function getAllUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const querySnapshot = await getDocs(usersRef);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        ...data,
        // Convert Firestore Timestamps to Date objects (camelCase - ACTUAL Firestore fields)
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : undefined),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : undefined),
        // Legacy snake_case fields for backward compatibility
        created_at: data.createdAt?.toDate ? data.createdAt.toDate() : (data.created_at?.toDate ? data.created_at.toDate() : undefined),
        updated_at: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updated_at?.toDate ? data.updated_at.toDate() : undefined)
      } as User;
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
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

// Compatibility wrapper - getUserFromFirestore
export async function getUserFromFirestore(uid: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = await getUserByUid(uid);
    if (user) {
      return { success: true, user };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Compatibility wrapper - updateUserByUid
export async function updateUserByUid(uid: string, updates: {
  displayName?: string;
  phone?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  placeId?: string;
  profileImage?: string;
  language?: string;
  voucherPurchaseLimit?: number | null;
  couponPurchaseLimit?: number | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: Partial<User> = {};
    
    if (updates.displayName !== undefined) {
      updateData.display_name = updates.displayName;
      updateData.full_name = updates.displayName;
    }
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.profileImage !== undefined) {
      updateData.profile_image = updates.profileImage;
      updateData.photoURL = updates.profileImage;
    }
    if (updates.language !== undefined) updateData.language = updates.language;
    // Use deleteField() to remove limits; Firestore does not accept undefined
    if (updates.voucherPurchaseLimit !== undefined) {
      updateData.voucherPurchaseLimit = updates.voucherPurchaseLimit == null ? deleteField() : updates.voucherPurchaseLimit;
    }
    if (updates.couponPurchaseLimit !== undefined) {
      updateData.couponPurchaseLimit = updates.couponPurchaseLimit == null ? deleteField() : updates.couponPurchaseLimit;
    }
    
    await updateUser(uid, updateData);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

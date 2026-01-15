'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut as firebaseSignOut,
  resetPassword as firebaseResetPassword,
} from '@/lib/firebase/auth';
import { getUserByUid, getUserByEmail, upsertUser, User as DBUser } from '@/lib/firebase/database/users';

// Function to determine user role
const getUserRole = (email: string): 'user' | 'admin' | 'super_admin' => {
  console.log('🔍 Role assignment: All users get default "user" role');
  return 'user';
};

interface AuthContextType {
  user: FirebaseUser | null;
  dbUser: DBUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string, address?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  // Optional methods (not implemented yet, placeholders for compatibility)
  sendVerificationCode?: (email: string, userName?: string) => Promise<{ success: boolean; message?: string }>;
  sendDeletionVerificationCode?: (email: string, userName?: string) => Promise<{ success: boolean; message?: string }>;
  verifyCodeAndCreateAccount?: (email: string, password: string, fullName: string, code: string, address?: string, phone?: string) => Promise<{ success: boolean; user: FirebaseUser | null }>;
  getStoredOTPCode?: () => string | null;
  getStoredDeletionOTPCode?: () => string | null;
  clearDeletionOTPCode?: () => void;
  needsGoogleProfileCompletion?: boolean;
  completeGoogleProfile?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    let authTimeout: NodeJS.Timeout;

    // Safety timeout: if Firebase doesn't respond in 5 seconds, stop loading anyway
    // This prevents white screen on iOS when Firebase is slow or blocked
    authTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Firebase auth timeout - continuing without auth');
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(authTimeout); // Cancel timeout since we got a response
      console.log('🔍 Firebase auth state changed:', firebaseUser?.email || 'No user');

      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user data from Firestore
        try {
          const userData = await getUserByUid(firebaseUser.uid);
          if (userData) {
            setDbUser(userData);
          } else {
            // Create user in Firestore if doesn't exist (for Google sign-in)
            const userRole = getUserRole(firebaseUser.email || '');
            const newUser = await upsertUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              full_name: firebaseUser.displayName || '',
              display_name: firebaseUser.displayName || '',
              role: userRole,
              language: 'en',
              accept_cookies: false,
            });
            setDbUser(newUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setDbUser(null);
      }

      setLoading(false);
    });

    return () => {
      clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔍 Starting Firebase sign in:', { email });
      await signInWithEmail(email, password);
      console.log('✅ Sign in successful');
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string, address?: string) => {
    try {
      console.log('🔍 Starting Firebase signup:', { email, fullName });
      
      // Create Firebase auth user
      const firebaseUser = await signUpWithEmail(email, password);
      
      // Create user in Firestore
      const userRole = getUserRole(email);
      const cookiePreference = typeof window !== 'undefined' ? localStorage.getItem('acceptCookies') === 'true' : false;

      await upsertUser({
        uid: firebaseUser.uid,
        email: email.trim().toLowerCase(),
        full_name: fullName,
        display_name: fullName,
        phone: phone || '',
        address: address || '',
        role: userRole,
        language: 'en',
        accept_cookies: cookiePreference,
      });

      console.log('✅ Signup successful');
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  };

  const signInWithGoogleHandler = async () => {
    try {
      console.log('🔍 Starting Google sign-in');
      const firebaseUser = await signInWithGoogle();
      
      // Check if user exists in Firestore, create if not
      let userData = await getUserByUid(firebaseUser.uid);
      if (!userData) {
        const userRole = getUserRole(firebaseUser.email || '');
        userData = await upsertUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          full_name: firebaseUser.displayName || '',
          display_name: firebaseUser.displayName || '',
          role: userRole,
          language: 'en',
          accept_cookies: false,
        });
      }
      
      console.log('✅ Google sign-in successful');
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      throw error;
    }
  };

  const signOutHandler = async () => {
    try {
      await firebaseSignOut();
      setUser(null);
      setDbUser(null);
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  const resetPasswordHandler = async (email: string) => {
    try {
      await firebaseResetPassword(email);
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  };

  const checkEmailExistsHandler = async (email: string): Promise<boolean> => {
    try {
      const userData = await getUserByEmail(email);
      return userData !== null;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const value = {
    user,
    dbUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle: signInWithGoogleHandler,
    signOut: signOutHandler,
    resetPassword: resetPasswordHandler,
    checkEmailExists: checkEmailExistsHandler,
    needsGoogleProfileCompletion: false,
    completeGoogleProfile: () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

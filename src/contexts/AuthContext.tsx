'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { getUserByEmail, upsertUser, User as DBUser } from '@/lib/supabase/database/users';
import { generateOTPCode } from '@/lib/otp-generator';

// Function to determine user role - all users get 'user' role by default
const getUserRole = (email: string): 'user' | 'admin' | 'super_admin' => {
  console.log('🔍 Role assignment: All users get default "user" role');
  return 'user';
};

interface VerificationResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  dbUser: DBUser | null;
  loading: boolean;
  needsGoogleProfileCompletion: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string, address?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  sendVerificationCode: (email: string, userName?: string) => Promise<VerificationResult>;
  verifyCodeAndCreateAccount: (email: string, password: string, fullName: string, code: string, address?: string, phone?: string) => Promise<{ success: boolean; user: SupabaseUser | null }>;
  completeGoogleProfile: () => void;
  getStoredOTPCode: () => string | null;
  sendDeletionVerificationCode: (email: string, userName?: string) => Promise<VerificationResult>;
  getStoredDeletionOTPCode: () => string | null;
  clearDeletionOTPCode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsGoogleProfileCompletion, setNeedsGoogleProfileCompletion] = useState(false);
  const [storedOTPCode, setStoredOTPCode] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('storedOTPCode');
    }
    return null;
  });
  const [storedDeletionOTPCode, setStoredDeletionOTPCode] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('storedDeletionOTPCode');
    }
    return null;
  });

  // Helper functions for OTP storage
  const storeOTPCode = (code: string) => {
    setStoredOTPCode(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('storedOTPCode', code);
      console.log('🔐 OTP code stored in localStorage:', code);
    }
  };

  const clearOTPCode = () => {
    setStoredOTPCode(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('storedOTPCode');
      console.log('🗑️ OTP code cleared from localStorage');
    }
  };

  const storeDeletionOTPCode = (code: string) => {
    setStoredDeletionOTPCode(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('storedDeletionOTPCode', code);
      console.log('🔐 Deletion OTP code stored in localStorage:', code);
    }
  };

  const clearDeletionOTPCode = () => {
    setStoredDeletionOTPCode(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('storedDeletionOTPCode');
      console.log('🗑️ Deletion OTP code cleared from localStorage');
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        try {
          const dbUserData = await getUserByEmail(session.user.email);

          // If user doesn't exist in database but is authenticated (OAuth user), create them
          if (!dbUserData && session.user) {
            console.log('🔍 OAuth user not found in database, creating record...');
            const fullName = session.dbUser?.full_name ||
              session.dbUser?.name ||
              session.user.email?.split('@')[0] ||
              'User';
            const avatarUrl = session.dbUser?.photoURL ||
              session.dbUser?.photoURL ||
              null;

            try {
              await upsertUser({
                uid: session.user.uid,
                email: session.user.email,
                full_name: fullName,
                display_name: fullName,
                phone: '',
                address: '',
                role: getUserRole(session.user.email),
                language: 'en',
                accept_cookies: false,
                profile_image: avatarUrl,
              });

              // Fetch the newly created user
              const newDbUser = await getUserByEmail(session.user.email);
              setDbUser(newDbUser);
              console.log('✅ OAuth user created in database');
            } catch (error) {
              console.error('Error creating OAuth user in database:', error);
            }
          } else {
            setDbUser(dbUserData);
          }
        } catch (error) {
          console.error('Error fetching user from database:', error);
        }
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Error in getSession:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Supabase Auth state changed:', session?.user);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        const dbUserData = await getUserByEmail(session.user.email);

        // If user doesn't exist in database but is authenticated (OAuth user), create them
        if (!dbUserData && session.user) {
          console.log('🔍 OAuth user not found in database, creating record...');
          const fullName = session.dbUser?.full_name ||
            session.dbUser?.name ||
            session.user.email?.split('@')[0] ||
            'User';
          const avatarUrl = session.dbUser?.photoURL ||
            session.dbUser?.photoURL ||
            null;

          try {
            await upsertUser({
              uid: session.user.uid,
              email: session.user.email,
              full_name: fullName,
              display_name: fullName,
              phone: '',
              address: '',
              role: getUserRole(session.user.email),
              language: 'en',
              accept_cookies: false,
              profile_image: avatarUrl,
            });

            // Fetch the newly created user
            const newDbUser = await getUserByEmail(session.user.email);
            setDbUser(newDbUser);
            console.log('✅ OAuth user created in database');
          } catch (error) {
            console.error('Error creating OAuth user in database:', error);
          }
        } else {
          setDbUser(dbUserData);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔍 Starting Supabase sign in:', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log('🔍 Supabase sign in response:', { 
        hasUser: !!data.user, 
        hasSession: !!data.session,
        error: error?.message,
        errorStatus: error?.status,
        errorCode: (error as any)?.code,
        userEmail: data.user?.email,
        userConfirmed: data.user?.email_confirmed_at
      });

      if (error) {
        console.error('❌ Supabase sign in error:', {
          message: error.message,
          status: error.status,
          code: (error as any)?.code,
          name: error.name
        });
        
        // Provide more specific error messages
        if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials.');
        } else if (error.message?.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before signing in. Check your inbox for the confirmation link.');
        } else if (error.message?.includes('User not found')) {
          throw new Error('No account found with this email. Please sign up first.');
        }
        
        throw error;
      }

      if (!data.user) {
        throw new Error('Sign in failed: No user returned');
      }

      // Check if user is restricted
      if (data.user?.email) {
        try {
          const dbUserData = await getUserByEmail(data.user.email);
          if (dbUserData?.is_restricted) {
            await supabase.auth.signOut();
            throw new Error(`Your account has been restricted by an administrator. Reason: ${dbUserData.restriction_reason || 'No reason provided'}`);
          }
        } catch (dbError) {
          console.warn('⚠️ Could not check user restriction status:', dbError);
          // Continue anyway - might be a new user without DB record yet
        }
      }
      
      console.log('✅ Sign in successful');
    } catch (error: any) {
      console.error('❌ Sign in error:', {
        message: error.message,
        code: error.code,
        status: error.status,
        error
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string, address?: string) => {
    try {
      console.log('🔍 Starting Supabase signup:', { email, hasPassword: !!password, fullName });
      
      // Create Supabase auth user
      const currentOrigin = window.location.origin;
      console.log('🔗 Using redirect URL:', currentOrigin);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
            display_name: fullName,
          },
          // Use current origin for email verification redirect
          emailRedirectTo: `${currentOrigin}/login?verified=true`,
        },
      });

      console.log('🔍 Supabase signup response:', { 
        hasUser: !!data.user, 
        hasSession: !!data.session,
        error: error?.message,
        userEmail: data.user?.email,
        userConfirmed: data.user?.email_confirmed_at
      });

      if (error) {
        console.error('❌ Supabase signup error:', error);
        throw error;
      }
      
      if (!data.user) {
        console.error('❌ No user returned from signup');
        throw new Error('Failed to create user account');
      }

      // Check if email confirmation is required
      if (!data.session && !data.user.email_confirmed_at) {
        console.warn('⚠️ Email confirmation may be required. User created but not confirmed.');
        // Continue anyway - user can confirm later
      }

      // Create user in database
      const userRole = getUserRole(email);
      const cookiePreference = typeof window !== 'undefined' ? localStorage.getItem('acceptCookies') === 'true' : false;

      console.log('🔍 Creating user in database:', { 
        email, 
        userRole, 
        cookiePreference, 
        uid: data.user.uid 
      });

      try {
        const dbUser = await upsertUser({
          uid: data.user.uid,
          email: email.trim().toLowerCase(),
          full_name: fullName,
          display_name: fullName,
          phone: phone || '',
          address: address || '',
          role: userRole,
          language: 'en',
          accept_cookies: cookiePreference,
        });

        console.log('✅ User created in database:', dbUser);
      } catch (dbError: any) {
        console.error('❌ Database user creation failed:', dbError);
        // Don't throw here - auth user is created, we can retry database creation later
        console.warn('⚠️ Auth user created but database user creation failed. This can be fixed later.');
      }

      // Return session if available
      return data.session;

    } catch (error: any) {
      console.error('❌ Sign up error:', {
        message: error.message,
        code: error.code,
        status: error.status,
        error
      });
      
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      
      if (error.message?.includes('Password')) {
        throw new Error(error.message);
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Supabase sign out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('Supabase sign out completed');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Use environment variable for redirect URL, fallback to current origin
      const redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectUrl}`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const sendVerificationCode = async (email: string, userName?: string): Promise<VerificationResult> => {
    try {
      // Check if email already exists
      const exists = await checkEmailExists(email);
      if (exists) {
        return { success: false, message: 'This email is already registered. Please sign in instead.' };
      }

      // Generate OTP code
      const otpCode = generateOTPCode();
      console.log('Generated OTP code:', otpCode);

      // Store the OTP code
      storeOTPCode(otpCode);
      console.log('✅ OTP code generated and stored:', otpCode);
      console.log('🔑 DEBUG: Your verification code is:', otpCode);

      // Email verification disabled - just return success
      console.log('⚠️ Email sending disabled (email verification removed)');
      return { success: true, message: 'Verification code generated. Check console for code.' };
    } catch (error) {
      console.error('Send verification code error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Failed to send verification code' };
    }
  };

  const sendDeletionVerificationCode = async (email: string, userName?: string): Promise<VerificationResult> => {
    try {
      const otpCode = generateOTPCode();
      console.log('Generated deletion OTP code:', otpCode);

      storeDeletionOTPCode(otpCode);
      console.log('✅ Deletion OTP code generated and stored:', otpCode);
      console.log('🔑 DEBUG: Your deletion verification code is:', otpCode);

      // Email verification disabled - just return success
      console.log('⚠️ Email sending disabled (email verification removed)');
      return { success: true, message: 'Deletion verification code generated. Check console for code.' };
    } catch (error) {
      console.error('Send deletion verification code error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Failed to send deletion verification code' };
    }
  };

  const verifyCodeAndCreateAccount = async (
    email: string,
    password: string,
    fullName: string,
    code: string,
    address?: string,
    phone?: string
  ) => {
    try {
      console.log('🔍 Verifying code:', {
        providedCode: code,
        storedCode: storedOTPCode,
        codesMatch: storedOTPCode === code
      });

      // Validate the OTP code
      if (!storedOTPCode || storedOTPCode !== code) {
        console.error('❌ Code validation failed');
        throw new Error('Invalid verification code');
      }

      console.log('✅ Code validation successful, creating account...');

      // Clear the stored OTP code
      clearOTPCode();

      // Create account
      await signUp(email, password, fullName, phone, address);

      // Get the created user
      const { data } = await supabase.auth.getUser();

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Verify code and create account error:', error);
      throw error;
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const dbUserData = await getUserByEmail(email);
      return dbUserData !== null;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  };

  const completeGoogleProfile = () => {
    setNeedsGoogleProfileCompletion(false);
  };

  const value = {
    user,
    dbUser,
    loading,
    needsGoogleProfileCompletion,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    checkEmailExists,
    sendVerificationCode,
    verifyCodeAndCreateAccount,
    completeGoogleProfile,
    getStoredOTPCode: () => storedOTPCode,
    sendDeletionVerificationCode,
    getStoredDeletionOTPCode: () => storedDeletionOTPCode,
    clearDeletionOTPCode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

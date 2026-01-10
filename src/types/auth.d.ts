interface AuthCredentials {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

type UserRole = 'user' | 'admin' | 'super_admin';

// Extend Supabase User type with additional properties
declare module '@supabase/supabase-js' {
  interface User {
    uid?: string;
    displayName?: string;
    id?: string;
    email?: string;
    user_metadata?: {
      name?: string;
      phone?: string;
      full_name?: string;
      picture?: string;
      [key: string]: any;
    };
  }
}

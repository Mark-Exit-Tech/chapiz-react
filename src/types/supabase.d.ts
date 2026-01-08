// Type declarations for Supabase
declare module '@supabase/supabase-js' {
  export interface Session {
    user: User;
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    expires_at?: number;
    token_type: string;
    [key: string]: any;
  }

  export interface User {
    id: string;
    aud: string;
    role?: string;
    email?: string;
    email_confirmed_at?: string;
    phone?: string;
    confirmed_at?: string;
    last_sign_in_at?: string;
    app_metadata?: { [key: string]: any };
    user_metadata?: { [key: string]: any };
    identities?: any[];
    created_at?: string;
    updated_at?: string;
    is_super_admin?: boolean;
    [key: string]: any;
  }

  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;
}

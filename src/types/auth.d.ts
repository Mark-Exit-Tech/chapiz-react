interface AuthCredentials {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

type UserRole = 'user' | 'admin' | 'super_admin';

// Extend Firebase User type with custom properties
declare module 'firebase/auth' {
  interface User {
    uid?: string;
    displayName?: string;
  }
}

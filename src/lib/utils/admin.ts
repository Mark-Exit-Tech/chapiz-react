// Firebase admin utilities

export type UserRole = 'user' | 'admin' | 'super_admin';

export async function getAdminUsers() {
  return [];
}

export async function isUserAdmin(email: string) {
  return false;
}

export async function getUserRole(email: string) {
  return 'user';
}

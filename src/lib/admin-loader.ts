/**
 * Admin Component Lazy Loader
 * Dynamically imports admin components to reduce initial bundle size
 * Admin pages are typically only used by a small percentage of users
 */

import { lazy } from 'react';

// Loading component
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">Loading...</div>
);

// Lazy load admin components with loading fallback
export const AdminPetsPage = lazy(() => import('../components/admin/AdminPetsPage'));

export const AdminUsersPage = lazy(() => import('../components/admin/AdminUsersPage'));

export const AdminBusinessesPage = lazy(() => import('../components/admin/AdminBusinessesPage'));

export const AdsPageWithTabs = lazy(() => import('../components/admin/AdsPageWithTabs'));

export const AdminCouponsPage = lazy(() => import('../components/admin/AdminCouponsPage'));

export const ContactSubmissionsPage = lazy(() => import('../components/admin/ContactSubmissionsPage'));

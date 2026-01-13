/**
 * Admin Component Lazy Loader
 * Dynamically imports admin components to reduce initial bundle size
 * Admin pages are typically only used by a small percentage of users
 */

import { lazy } from 'react';

// Lazy load admin components
export const AdminPetsPage = lazy(() => import('@/components/admin/AdminPetsPage'));

export const AdminUsersPage = lazy(() => import('@/components/admin/AdminUsersPage'));


export const AdsPageWithTabs = lazy(() => import('@/components/admin/AdsPageWithTabs'));

export const AdminCouponsPage = lazy(() => import('@/components/admin/AdminCouponsPage'));

export const ContactSubmissionsPage = lazy(() => import('@/components/admin/ContactSubmissionsPage'));
'use client';

import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Button } from '@/components/ui/button';
import { AppWindow, LayoutDashboard, Users, Loader2, ShieldX, MessageSquare, Settings, Mail, Ticket, Megaphone, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUserRole, type UserRole } from '@/lib/utils/admin';
import AdminTopNav from './AdminTopNav';
import AdminBottomNav from './AdminBottomNav';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const { t } = useTranslation('Admin');

  // Get locale from URL or default to 'en'
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT - NO TRANSLATION KEYS!
  const text = {
    loading: isHebrew ? 'טוען...' : 'Loading...',
    unauthorized: isHebrew ? 'אין הרשאה' : 'Unauthorized',
    unauthorizedMessage: isHebrew ? 'אין לך הרשאה לגשת לדף זה' : 'You do not have permission to access this page',
    goBack: isHebrew ? 'חזור' : 'Go Back',
    signIn: isHebrew ? 'התחבר' : 'Sign In',
    navigation: {
      dashboard: isHebrew ? 'לוח בקרה' : 'Dashboard',
      manageAds: isHebrew ? 'ניהול מודעות' : 'Manage Ads',
      managePromos: isHebrew ? 'ניהול מבצעים' : 'Manage Promos',
      manageCoupons: isHebrew ? 'ניהול שוברים' : 'Manage Coupons',
      manageBusinesses: isHebrew ? 'ניהול עסקים' : 'Manage Businesses',
      manageComments: isHebrew ? 'ניהול תגובות' : 'Manage Comments',
      contactSubmissions: isHebrew ? 'פניות יצירת קשר' : 'Contact Submissions',
      settings: isHebrew ? 'הגדרות' : 'Settings',
      manageUsers: isHebrew ? 'ניהול משתמשים' : 'Manage Users',
    },
    roles: {
      user: isHebrew ? 'משתמש' : 'User',
      admin: isHebrew ? 'מנהל' : 'Admin',
      super_admin: isHebrew ? 'מנהל על' : 'Super Admin',
    }
  };
  
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        console.log('🔍 AdminLayout: No user, skipping role check');
        setRoleLoading(false);
        return;
      }

      console.log('🔍 AdminLayout: Checking role for user:', user.email);
      try {
        const role = await getUserRole(user.uid || '');
        console.log('✅ AdminLayout: Role retrieved:', role);
        setUserRole(role as 'user' | 'admin' | 'super_admin');
      } catch (error) {
        console.error('❌ AdminLayout: Error fetching user role:', error);
        console.error('Error details:', error);
        setUserRole('user'); // Default to 'user' instead of null
      } finally {
        setRoleLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{text.loading}</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
          <ShieldX className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{text.unauthorized}</h1>
          <p className="text-gray-600 mb-6">
            {text.unauthorizedMessage}
          </p>
          <div className="space-y-3">
            <Link to={`/${locale}`}>
              <Button className="w-full">
                {text.goBack}
              </Button>
            </Link>
            <Link to={`/${locale}/signin`}>
              <Button variant="outline" className="w-full">
                {text.signIn}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <AdminTopNav
          userEmail={user.email || ''}
          userRole={userRole ? text.roles[userRole] : text.loading}
          locale={locale}
        />

      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block bg-secondary-background text-primary sticky top-0 h-screen w-64 p-4">
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                to={`/${locale}/admin`}
                className="flex gap-3 rounded p-2 transition hover:bg-white hover:shadow-xs"
              >
                <LayoutDashboard className="h-6 w-6" />
                {text.navigation.dashboard}
              </Link>
            </li>
            <li>
              <Link
                to={`/${locale}/admin/ads`}
                className="flex gap-3 rounded p-2 transition hover:bg-white hover:shadow-xs"
              >
                <AppWindow className="h-6 w-6" />
                {text.navigation.manageAds}
              </Link>
            </li>
            <li>
              <Link
                to={`/${locale}/admin/coupons`}
                className="flex gap-3 rounded p-2 transition hover:bg-white hover:shadow-xs"
              >
                <Megaphone className="h-6 w-6" />
                {text.navigation.managePromos}
              </Link>
            </li>
            <li>
              <Link
                to={`/${locale}/admin/vouchers`}
                className="flex gap-3 rounded p-2 transition hover:bg-white hover:shadow-xs"
              >
                <Ticket className="h-6 w-6" />
                {text.navigation.manageCoupons}
              </Link>
            </li>
            <li>
              <Link
                to={`/${locale}/admin/businesses`}
                className="flex gap-3 rounded p-2 transition hover:bg-white hover:shadow-xs"
              >
                <Building2 className="h-6 w-6" />
                {text.navigation.manageBusinesses}
              </Link>
            </li>
            <li>
              <Link
                to={`/${locale}/admin/comments`}
                className="flex gap-3 rounded p-2 transition hover:bg-white hover:shadow-xs"
              >
                <MessageSquare className="h-6 w-6" />
                {text.navigation.manageComments}
              </Link>
            </li>
            <li>
              <Link
                to={`/${locale}/admin/contact-submissions`}
                className="flex gap-3 rounded p-2 transition hover:bg-white hover:shadow-xs"
              >
                <Mail className="h-6 w-6" />
                {text.navigation.contactSubmissions}
              </Link>
            </li>
            <li>
              <Link
                to={`/${locale}/admin/settings`}
                className="flex gap-3 rounded p-2 transition hover:bg-white hover:shadow-xs"
              >
                <Settings className="h-6 w-6" />
                {text.navigation.settings}
              </Link>
            </li>
            <li>
              <Link
                to={`/${locale}/admin/users`}
                className="flex gap-3 rounded p-2 transition hover:bg-white hover:shadow-xs"
              >
                <Users className="h-6 w-6" />
                {text.navigation.manageUsers}
              </Link>
            </li>
          </ul>
        </nav>

        {/* User info */}
        <div className="mt-8 p-2 bg-white/10 rounded">
          <p className="font-medium truncate">{user.email}</p>
          <p className="text-xs text-gray-500 capitalize">{userRole ? text.roles[userRole] : text.loading}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-background flex-1 w-full">
        {/* Content */}
        <div className='flex-1'>
          {children}
        </div>
      </div>
    </div>
  );
}

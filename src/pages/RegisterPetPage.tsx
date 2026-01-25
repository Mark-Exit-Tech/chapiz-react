import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getUserFromFirestore } from '@/lib/firebase/database/users';
import ClientRegisterPetPage from '@/components/get-started/ClientRegisterPetPage';
import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';

export default function RegisterPetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { user, dbUser, loading: authLoading } = useAuth();
  const [userDetails, setUserDetails] = useState<{ fullName: string; phone: string; email: string }>({
    fullName: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);

  // Get locale from URL - check if first path segment is a valid locale
  const getLocaleFromUrl = () => {
    if (typeof window === 'undefined') return 'en';
    const pathParts = window.location.pathname.split('/');
    const firstSegment = pathParts[1];
    if (firstSegment === 'he' || firstSegment === 'en') {
      return firstSegment;
    }
    const browserLang = navigator.language?.split('-')[0];
    return browserLang === 'he' ? 'he' : 'en';
  };
  const locale = getLocaleFromUrl();
  // Check both URL locale and i18n language for RTL
  const isHebrew = locale === 'he' || i18n.language === 'he';

  // Sync i18n language with URL locale and set document direction
  useEffect(() => {
    // Sync i18n language with URL
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
    // Set document direction for RTL support
    document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    return () => {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    };
  }, [locale, i18n]);

  const text = {
    loading: isHebrew ? 'טוען...' : 'Loading...',
    loginRequired: isHebrew ? 'יש להתחבר כדי לרשום חיית מחמד' : 'Please log in to register a pet',
    login: isHebrew ? 'התחברות' : 'Log In',
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      // Store the current URL to redirect back after login
      const currentPath = window.location.pathname;
      navigate(`/${locale}/auth?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [authLoading, user, navigate, locale]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);

        if (user?.uid) {
          const result = await getUserFromFirestore(user.uid);
          if (result.success && result.user) {
            setUserDetails({
              fullName: result.user.displayName || result.user.display_name || result.user.full_name || '',
              phone: result.user.phone || '',
              email: result.user.email || user.email || ''
            });
          } else {
            setUserDetails({
              fullName: user.displayName || '',
              phone: '',
              email: user.email || ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Show loading while checking auth or loading user data
  if (authLoading || loading || !user) {
    return (
      <div dir={isHebrew ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">{text.loading}</p>
            </div>
          </div>
        </div>
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </div>
    );
  }

  return (
    <div dir={isHebrew ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col">
      <Navbar />
      <ClientRegisterPetPage
        genders={[]}
        breeds={[]}
        userDetails={userDetails}
        locale={locale}
      />
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}

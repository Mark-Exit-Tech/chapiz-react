import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getUserFromFirestore } from '@/lib/firebase/database/users';
import ClientRegisterPetPage from '@/components/get-started/ClientRegisterPetPage';
import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';

export default function RegisterPetPage() {
  const { id } = useParams<{ id: string }>();
  const { user, dbUser } = useAuth();
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
  const isHebrew = locale === 'he';

  const text = {
    loading: isHebrew ? 'טוען...' : 'Loading...',
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);

        if (user?.email) {
          const userData = await getUserFromFirestore(user.email);
          if (userData) {
            setUserDetails({
              fullName: userData.fullName || userData.displayName || '',
              phone: userData.phoneNumber || userData.phone || '',
              email: userData.email || user.email || ''
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
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
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ClientRegisterPetPage
        genders={[]}
        breeds={[]}
        userDetails={userDetails}
      />
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
}

import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import MyPetClient from '@/components/MyPetClient';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Pet {
  id: string;
  name: string;
  breed: string;
  image: string;
}

export default function MyPetsPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const location = useLocation();
  
  // Detect if this is the /pages/my-pets route (without locale prefix)
  const isDirectRoute = location.pathname === '/pages/my-pets' || location.pathname.startsWith('/pages/my-pets');

  useEffect(() => {
    const fetchPets = async () => {
      if (user?.email && !loading) {
        setPetsLoading(true);
        try {
          // TODO: Fetch pets from Firebase based on user email
          // Use getPetsByUserEmail from @/lib/firebase/database/pets
          //   .from('pets')
          //   .select('*')
          //   .eq('user_email', user.email);
          // setPets(petsData || []);
          setPets([]); // Placeholder
        } catch (error) {
          console.error('Error fetching pets:', error);
        } finally {
          setPetsLoading(false);
        }
      }
    };

    fetchPets();
  }, [user, loading]);

  if (loading || petsLoading) {
    return (
      <>
        {/* Only show navbar on md and above */}
        <div className="hidden md:block">
          <Navbar />
        </div>
        <div className="flex grow flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] pb-16 md:pb-0">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">{t('common.loading')}</p>
            </div>
          </div>
        </div>
        {/* Only show bottom nav on mobile */}
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Navbar - only visible on md and above */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      {/* Main content with proper padding based on screen size */}
      <div className="flex grow flex-col pt-8 md:pt-8 h-[calc(100vh-60px)] md:h-[calc(100vh-64px)] pb-16 md:pb-0" style={{ overflow: 'hidden', touchAction: 'none' }}>
        <MyPetClient pets={pets} />
      </div>
      {/* Bottom Navigation - only visible on mobile (below md) */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
}

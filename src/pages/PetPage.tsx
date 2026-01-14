import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getPetById } from '@/lib/firebase/database/pets';
import PetProfilePage from '@/components/PetProfilePage';
import BottomNavigation from '@/components/layout/BottomNavigation';

export default function PetPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [pet, setPet] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get locale from URL - check if first path segment is a valid locale
  const getLocaleFromUrl = () => {
    if (typeof window === 'undefined') return 'en';
    const pathParts = window.location.pathname.split('/');
    const firstSegment = pathParts[1];
    // Check if the first segment is a valid locale (he or en)
    if (firstSegment === 'he' || firstSegment === 'en') {
      return firstSegment;
    }
    // Fallback: check browser language preference
    const browserLang = navigator.language?.split('-')[0];
    return browserLang === 'he' ? 'he' : 'en';
  };
  const locale = getLocaleFromUrl();
  const isHebrew = locale === 'he';

  const text = {
    loading: isHebrew ? 'טוען...' : 'Loading...',
    notFound: isHebrew ? 'חיית מחמד לא נמצאה' : 'Pet not found',
    goBack: isHebrew ? 'חזור' : 'Go Back',
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Load pet data
        const petData = await getPetById(id);

        if (petData) {
          setPet(petData);

          // If pet has owner info, set it
          if (petData.owner) {
            setOwner(petData.owner);
          }
        }
      } catch (error) {
        console.error('Error loading pet:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <>
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

  if (!pet) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{text.notFound}</h1>
            <button
              onClick={() => window.history.back()}
              className="text-primary hover:underline"
            >
              {text.goBack}
            </button>
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
      <PetProfilePage
        pet={pet}
        owner={owner}
      />
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPetById } from '@/lib/firebase/database/pets';
import EditPetForm from '@/components/EditPetForm';
import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';

export default function EditPetPage() {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const [pet, setPet] = useState<any>(null);
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

  // Sync i18n and document direction with URL locale (RTL for Hebrew)
  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
    document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    return () => {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    };
  }, [locale, i18n]);

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
          setPet({
            ...petData,
            breedName: petData.breedName || petData.breed
          });
        }
      } catch (error) {
        console.error('Error loading pet:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const layoutDir = isHebrew ? 'rtl' : 'ltr';

  if (loading) {
    return (
      <div dir={layoutDir} className="min-h-screen flex flex-col">
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

  if (!pet) {
    return (
      <div dir={layoutDir} className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1">
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
      </div>
    );
  }

  return (
    <div dir={layoutDir} className="min-h-screen flex flex-col">
      <Navbar />
      <EditPetForm pet={pet} />
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getPetById } from '@/lib/firebase/database/pets';
import { getUserFromFirestore, getUserByEmail } from '@/lib/firebase/database/users';
import PetProfilePage from '@/components/PetProfilePage';

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

          // Fetch owner data - try by ownerId first, then by userEmail
          let ownerUser = null;
          
          if (petData.ownerId) {
            try {
              const ownerResult = await getUserFromFirestore(petData.ownerId);
              if (ownerResult.success && ownerResult.user) {
                ownerUser = ownerResult.user;
              }
            } catch (error) {
              console.error('Error fetching owner by ownerId:', error);
            }
          }
          
          // If ownerId fetch failed or doesn't exist, try by email
          if (!ownerUser && petData.userEmail) {
            try {
              ownerUser = await getUserByEmail(petData.userEmail);
            } catch (error) {
              console.error('Error fetching owner by email:', error);
            }
          }
          
          // Map the user data to match the expected format
          if (ownerUser) {
            const ownerData = {
              uid: ownerUser.uid,
              fullName: ownerUser.displayName || ownerUser.full_name || ownerUser.display_name || ownerUser.name || '',
              displayName: ownerUser.displayName || ownerUser.full_name || ownerUser.display_name || ownerUser.name || '',
              phone: ownerUser.phone || '',
              phoneNumber: ownerUser.phone || '',
              email: ownerUser.email || '',
              homeAddress: ownerUser.address || '',
              isPhonePrivate: ownerUser.is_phone_private || false,
              isEmailPrivate: ownerUser.is_email_private || false,
              isAddressPrivate: ownerUser.is_address_private || false,
            };
            setOwner(ownerData);
          } else if (petData.ownerId) {
            // If user not found, at least set the uid
            setOwner({ uid: petData.ownerId });
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">{text.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
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
    );
  }

  return (
    <PetProfilePage
      pet={pet}
      owner={owner}
    />
  );
}

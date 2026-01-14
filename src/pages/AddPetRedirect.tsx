import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Generate a unique pet ID for the registration flow
const generatePetId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 9);
  return 'pet' + timestamp + random;
};

export default function AddPetRedirect() {
  const navigate = useNavigate();

  // Get locale from URL
  const getLocaleFromUrl = () => {
    if (typeof window === 'undefined') return 'en';
    const pathParts = window.location.pathname.split('/');
    const firstSegment = pathParts[1];
    if (firstSegment === 'he' || firstSegment === 'en') {
      return firstSegment;
    }
    return 'en';
  };

  useEffect(() => {
    const locale = getLocaleFromUrl();
    const petId = generatePetId();
    navigate(`/${locale}/pet/${petId}/get-started/register`, { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

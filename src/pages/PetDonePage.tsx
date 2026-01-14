import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckCircle, Home, PawPrint, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { getPetById } from '@/lib/firebase/database/pets';
import { useLocale } from '@/hooks/use-locale';

export default function PetDonePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const locale = useLocale();
  const isHebrew = locale === 'he';
  const [petName, setPetName] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const text = {
    title: isHebrew ? 'הרישום הושלם בהצלחה!' : 'Registration Complete!',
    subtitle: isHebrew
      ? 'חיית המחמד שלך נרשמה בהצלחה במערכת'
      : 'Your pet has been successfully registered',
    petRegistered: isHebrew ? 'נרשם/ה בהצלחה' : 'has been registered successfully',
    viewPet: isHebrew ? 'צפה בפרופיל' : 'View Profile',
    goHome: isHebrew ? 'חזרה לדף הבית' : 'Go to Home',
    myPets: isHebrew ? 'החיות שלי' : 'My Pets',
    shareProfile: isHebrew ? 'שתף פרופיל' : 'Share Profile',
    copied: isHebrew ? 'הקישור הועתק!' : 'Link copied!',
  };

  useEffect(() => {
    const loadPet = async () => {
      if (id) {
        const pet = await getPetById(id);
        if (pet) {
          setPetName(pet.name || '');
        }
      }
    };
    loadPet();
  }, [id]);

  const handleShare = async () => {
    const petUrl = `${window.location.origin}/${locale}/pet/${id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: petName ? `${petName} - FacePet` : 'FacePet',
          url: petUrl,
        });
      } catch (err) {
        // User cancelled or error - fallback to copy
        await copyToClipboard(petUrl);
      }
    } else {
      await copyToClipboard(petUrl);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <Card className="max-w-lg mx-auto border-none shadow-lg">
          <CardContent className="pt-8 pb-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {text.title}
            </h1>

            {/* Subtitle with pet name */}
            <p className="text-gray-600 mb-2">
              {text.subtitle}
            </p>
            {petName && (
              <p className="text-lg font-medium text-primary mb-8">
                {petName} {text.petRegistered}
              </p>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/${locale}/pet/${id}`)}
                className="w-full"
                size="lg"
              >
                <PawPrint className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {text.viewPet}
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Share2 className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {copied ? text.copied : text.shareProfile}
              </Button>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => navigate(`/${locale}/my-pets`)}
                  variant="ghost"
                  className="flex-1"
                >
                  <PawPrint className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {text.myPets}
                </Button>

                <Button
                  onClick={() => navigate(`/${locale}`)}
                  variant="ghost"
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {text.goHome}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
}

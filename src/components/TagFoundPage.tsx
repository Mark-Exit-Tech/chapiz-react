'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { usePetId, savePetId } from '@/hooks/use-pet-id';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import AdFullPage from '@/components/get-started/AdFullPage';
import { Ad } from '@/lib/actions/admin';
import { getYouTubeVideoId } from '@/lib/utils/youtube';

interface TagFoundPageProps {
  petId: string;
}

function getLocaleFromUrl(): string {
  if (typeof window === 'undefined') return 'en';
  const pathParts = window.location.pathname.split('/');
  const firstSegment = pathParts[1];
  if (firstSegment === 'he' || firstSegment === 'en') {
    return firstSegment;
  }
  const browserLang = navigator.language?.split('-')[0];
  return browserLang === 'he' ? 'he' : 'en';
}

export default function TagFoundPage({ petId }: TagFoundPageProps) {
  const { t, i18n } = useTranslation();
  const { user, dbUser, loading: authLoading } = useAuth();
  const { petId: savedPetId } = usePetId();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [promo, setPromo] = useState<Ad | null>(null);
  const [isLoadingPromo, setIsLoadingPromo] = useState(false);
  const adShownRef = useRef(false);

  const locale = getLocaleFromUrl();
  const isHebrew = locale === 'he';

  // Load and show ad once when page loads (same as pet profile)
  useEffect(() => {
    if (adShownRef.current || showPromo || isLoadingPromo || promo) return;
    let cancelled = false;
    setIsLoadingPromo(true);
    (async () => {
      try {
        const { fetchRandomAd } = await import('@/lib/actions/ads-server');
        const randomAd = await fetchRandomAd();
        if (cancelled) return;
        if (randomAd && randomAd.content) {
          setPromo(randomAd);
          setShowPromo(true);
        }
      } catch (e) {
        if (!cancelled) console.error('[TagFoundPage] Error loading ad:', e);
      } finally {
        if (!cancelled) {
          adShownRef.current = true;
          setIsLoadingPromo(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Sync i18n with URL locale and set document direction
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

  const handleRegisterPet = async () => {
    setIsProcessing(true);

    if (user) {
      navigate(`/${locale}/pet/${petId}/get-started/register`);
    } else {
      savePetId(petId);
      navigate(`/${locale}/login`);
    }
  };

  const handleSignIn = () => {
    savePetId(petId);
    navigate(`/${locale}/auth`);
  };

  if (authLoading) {
    return (
      <div dir={isHebrew ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-gray-600">{t('pages.TagFound.loading')}</p>
        </div>
        <Footer />
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </div>
    );
  }

  if (showPromo && promo && promo.content) {
    return (
      <AdFullPage
        type={
          promo.content && (promo.content.includes('youtube.com') || promo.content.includes('youtu.be') || getYouTubeVideoId(promo.content) !== null)
            ? 'youtube'
            : (promo.type || 'image')
        }
        time={5}
        content={promo.content}
        youtubeUrl={
          promo.content && (promo.content.includes('youtube.com') || promo.content.includes('youtu.be') || getYouTubeVideoId(promo.content) !== null)
            ? promo.content
            : undefined
        }
        onClose={() => {
          setShowPromo(false);
          setPromo(null);
        }}
      />
    );
  }

  return (
    <div dir={isHebrew ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="text-center max-w-md">
          <h1 className="text-primary text-3xl font-bold">{t('pages.TagFound.title')}</h1>
          <p className="text-base text-gray-500 mt-2">{t('pages.TagFound.subtitle')}</p>

          {user ? (
            <div className="mt-6 space-y-3">
              <p className="text-green-700 font-medium">{t('pages.TagFound.welcomeBack')}</p>
              <Button
                onClick={handleRegisterPet}
                disabled={isProcessing}
                className="bg-primary mt-4 rounded-full font-normal hover:bg-[#ff6243]/90"
              >
                {isProcessing ? t('pages.TagFound.processing') : t('pages.TagFound.registerPet')}
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <p className="text-orange-700 font-medium">{t('pages.TagFound.needAccount')}</p>
              <Button
                onClick={handleRegisterPet}
                disabled={isProcessing}
                className="bg-primary mt-4 rounded-full font-normal hover:bg-[#ff6243]/90"
              >
                {isProcessing ? t('pages.TagFound.processing') : t('pages.TagFound.createAccountAndRegister')}
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}

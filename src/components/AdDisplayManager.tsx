'use client';

import { useState, useEffect } from 'react';
import { useClickTracker } from '../hooks/useClickTracker';
import { fetchRandomAd } from '@/lib/actions/ads-server';
import AdFullPage from './get-started/AdFullPage';
import { useLocation } from 'react-router-dom';
import { getYouTubeVideoId } from '@/lib/utils/youtube';
import { useAuth } from '@/contexts/FirebaseAuthContext';

export default function AdDisplayManager() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { shouldShowAd, resetAdFlag } = useClickTracker();
  const [ad, setAd] = useState<any | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if we're on a pet profile page (don't show click-based ads here)
  const isPetProfilePage = pathname?.match(/\/pet\/[^\/]+$/) !== null;
  // Check if we're on an admin page (don't show ads here)
  const isAdminPage = pathname?.includes('/admin') || false;

  // Debug logging
  useEffect(() => {
    console.log('[AdDisplayManager] State:', { shouldShowAd, showAd, isLoading });
  }, [shouldShowAd, showAd, isLoading]);

  // Fetch promo when we should show an ad
  useEffect(() => {
    const fetchPromo = async () => {
      // Don't show ads for non-authenticated users
      if (!user) return;

      // Don't show click-based ads on pet profile pages (they have their own mandatory ad)
      // Also don't show ads on admin pages
      if (isPetProfilePage || isAdminPage) {
        console.log('[AdDisplayManager] Skipping click-based ad on excluded page');
        return;
      }

      console.log('[AdDisplayManager] Checking conditions:', { shouldShowAd, showAd, isLoading, isPetProfilePage });

      // Show ads for all authenticated users (removed petId requirement)
      if (shouldShowAd && !showAd && !isLoading) {
        console.log('[AdDisplayManager] Fetching ad...');
        setIsLoading(true);
        try {
          const randomAd = await fetchRandomAd();
          console.log('[AdDisplayManager] Fetched ad:', randomAd);

          if (randomAd && randomAd.content) {
            setAd(randomAd);
            setShowAd(true);
            console.log('[AdDisplayManager] Ad will be displayed');
            // Reset click count when ad is successfully shown
            try {
              localStorage.setItem('ad_click_count', '0');
              console.log('[AdDisplayManager] Click count reset after ad shown');
            } catch (error) {
              console.error('[AdDisplayManager] Error resetting click count:', error);
            }
          } else {
            console.log('[AdDisplayManager] No ad available or no content');
            // No ad available, reset the flag but keep the count (user will see ad next time)
            resetAdFlag();
          }
        } catch (error) {
          console.error('[AdDisplayManager] Error fetching ad:', error);
          resetAdFlag();
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPromo();
  }, [shouldShowAd, showAd, isLoading, resetAdFlag, isPetProfilePage, isAdminPage, user]);

  const handleAdClose = () => {
    setShowAd(false);
    setAd(null);
    resetAdFlag();
    // Reset click count after ad is closed
    try {
      localStorage.setItem('ad_click_count', '0');
      console.log('[AdDisplayManager] Click count reset after ad closed');
    } catch (error) {
      console.error('[AdDisplayManager] Error resetting click count:', error);
    }
  };

  // Don't show ads for non-authenticated users
  if (!user) {
    return null;
  }

  // Show ad if we have an ad with content
  if (showAd && ad && ad.content) {
    // Detect if content is a YouTube URL
    const isYouTube = ad.content.includes('youtube.com') || ad.content.includes('youtu.be') || getYouTubeVideoId(ad.content) !== null;
    const adType = isYouTube ? 'youtube' : (ad.type || 'image');

    return (
      <AdFullPage
        type={adType}
        time={ad.duration || 5}
        content={ad.content}
        youtubeUrl={isYouTube ? ad.content : undefined}
        onClose={handleAdClose}
      />
    );
  }

  return null;
}


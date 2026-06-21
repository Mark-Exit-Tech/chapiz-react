'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { getContactInfo } from '@/lib/actions/admin';

function getLocaleFromUrl(): 'en' | 'he' {
  if (typeof window === 'undefined') return 'en';
  const firstSegment = window.location.pathname.split('/')[1];
  if (firstSegment === 'he' || firstSegment === 'en') return firstSegment;
  return navigator.language?.split('-')[0] === 'he' ? 'he' : 'en';
}

export default function RegisteredTagShopPage() {
  const locale = getLocaleFromUrl();
  const isHebrew = locale === 'he';
  const [shopUrl, setShopUrl] = useState('');

  const text = {
    title: isHebrew ? 'התג הזה רשום' : 'This tag is registered',
    description: isHebrew
      ? 'מטעמי פרטיות, פרופיל חיית המחמד יוצג רק כשהבעלים מסמנים אותה כאבודה.'
      : 'For privacy, the pet profile is shown only when the owner marks the pet as lost.',
    button: isHebrew ? 'פתח חנות' : 'Open shop',
  };

  useEffect(() => {
    let cancelled = false;

    const loadShopUrl = async () => {
      try {
        const info = await getContactInfo();
        if (!cancelled && info?.storeUrl) {
          setShopUrl(info.storeUrl);
        }
      } catch (error) {
        console.error('Failed to load store URL:', error);
      }
    };

    loadShopUrl();
    return () => {
      cancelled = true;
    };
  }, []);

  const openShop = () => {
    if (shopUrl) {
      window.location.href = shopUrl;
      return;
    }

    window.location.href = `/${locale}/services`;
  };

  return (
    <div dir={isHebrew ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="text-primary text-3xl font-bold">{text.title}</h1>
          <p className="text-base text-gray-500 mt-3">{text.description}</p>
          <Button
            onClick={openShop}
            className="bg-primary mt-6 rounded-full font-normal hover:bg-[#ff6243]/90"
          >
            {text.button}
          </Button>
        </div>
      </main>
      <Footer />
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}

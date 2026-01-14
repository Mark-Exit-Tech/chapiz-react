'use client';

import AnimatedTabs, { TabName } from '@/components/AnimatedTabs';
import PetCard from '@/components/PetCard';
import TabContent from '@/components/TabContent';
import { Promo } from '@/types/promo';
import { Ad } from '@/lib/actions/admin';
import { motion } from 'framer-motion';
import { useLocale } from '@/hooks/use-locale';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import GiftPopup from './GiftPopup';
import Navbar from './layout/Navbar';
import ShareButton from './ShareButton';
import { getBreedNameById } from '@/lib/firebase/database/pets';
import { getGenders } from '@/lib/hardcoded-data';
import { breedsData } from '@/lib/data/comprehensive-breeds';
import AdFullPage from './get-started/AdFullPage';
import { usePetId, savePetId } from '@/hooks/use-pet-id';
import { getYouTubeVideoId } from '@/lib/utils/youtube';

const computeAge = (birthDate: string) => {
  const birth = new Date(birthDate);
  const now = new Date();
  const diff = now.getTime() - birth.getTime();
  const ageYears = Math.floor(diff / (1000 * 3600 * 24 * 365));
  return String(ageYears);
};

export default function PetProfilePage({
  pet,
  owner,
  vet
}: {
  pet: any;
  owner?: any;
  vet?: any;
}) {
  // Place all hook calls at the top level, unconditionally
  const locale = useLocale();
  const isHebrew = locale === 'he';

  // HARDCODED TEXT
  const text = {
    labels: {
      name: isHebrew ? 'שם' : 'Name',
      breed: isHebrew ? 'גזע' : 'Breed',
      gender: isHebrew ? 'מין' : 'Gender',
      age: isHebrew ? 'גיל' : 'Age',
      ageText: isHebrew ? 'שנים' : 'years',
      notes: isHebrew ? 'הערות' : 'Notes',
      contact: isHebrew ? 'טלפון' : 'Contact',
      email: isHebrew ? 'אימייל' : 'Email',
      address: isHebrew ? 'כתובת' : 'Address',
      private: isHebrew ? 'פרטי' : 'Private',
      notSpecified: isHebrew ? 'לא צוין' : 'Not specified',
    },
    tabs: {
      pet: isHebrew ? 'חיית מחמד' : 'Pet',
      owner: isHebrew ? 'בעלים' : 'Owner',
      vet: isHebrew ? 'וטרינר' : 'Vet',
    },
    popup: {
      title: isHebrew ? 'מתנה!' : 'Gift!',
      text: isHebrew ? 'יש לך מתנה!' : 'You have a gift!',
      buttonLabel: isHebrew ? 'קבל מתנה' : 'Get Gift',
    },
  };
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>('pet');
  const prevTabRef = useRef<TabName>('pet');
  const { petId: localStoragePetId } = usePetId();
  const [showPromo, setShowPromo] = useState(false);
  const [promo, setPromo] = useState<Ad | null>(null);
  const [isLoadingPromo, setIsLoadingPromo] = useState(false);
  const adShownRef = useRef<boolean>(false); // Track if ad has been shown on this page load

  // Get data from URL parameters if available (passed from My Pets page)
  const displayName = searchParams.get('displayName');
  const displayBreed = searchParams.get('displayBreed');
  const displayImage = searchParams.get('displayImage');

  // Save petId to localStorage when pet profile page loads (for ad tracking)
  useEffect(() => {
    if (pet?.id && pet.id !== localStoragePetId) {
      savePetId(pet.id);
      console.log('[PetProfilePage] Saved petId to localStorage:', pet.id);
    }
  }, [pet?.id, localStoragePetId, savePetId]);

  // Load and show ad when pet profile page loads (mandatory ad - only once)
  useEffect(() => {
    const loadAd = async () => {
      // Only show ad if pet exists and we haven't shown an ad yet on this page load
      const hasPet = localStoragePetId || pet?.id;

      if (hasPet && !adShownRef.current && !showPromo && !isLoadingPromo && !promo) {
        setIsLoadingPromo(true);
        try {
          console.log('[PetProfilePage] Loading mandatory ad for pet profile page');
          const { fetchRandomAd } = await import('@/lib/actions/ads-server');
          const randomAd = await fetchRandomAd();
          if (randomAd && randomAd.content) {
            setPromo(randomAd);
            setShowPromo(true);
            adShownRef.current = true; // Mark that ad has been shown
            console.log('[PetProfilePage] Ad loaded and will be displayed');
          } else {
            console.log('[PetProfilePage] No ad available');
            adShownRef.current = true; // Mark as shown even if no ad (prevent retry)
          }
        } catch (error) {
          console.error('[PetProfilePage] Error loading ad:', error);
          adShownRef.current = true; // Mark as shown even on error (prevent retry)
        } finally {
          setIsLoadingPromo(false);
        }
      }
    };

    loadAd();
  }, [localStoragePetId, pet?.id]); // Removed showPromo, isLoadingPromo, promo from dependencies

  const handlePromoClose = () => {
    setShowPromo(false);
    setPromo(null);
    // Don't reset adShownRef - we want to show ad only once per page load
  };


  // Determine available tabs (exclude Vet if no vet data)
  const availableTabs: TabName[] = ['pet', 'owner'];
  if (
    vet?.name ||
    vet?.phoneNumber ||
    vet?.email ||
    vet?.address
  ) {
    availableTabs.push('vet');
  }

  // Memoized values
  const petCardData = useMemo(
    () => ({
      name: displayName || pet.name,
      imageUrl: displayImage || pet.imageUrl
    }),
    [displayName, pet.name, displayImage, pet.imageUrl]
  );

  const lockedDirection = useMemo(() => {
    const prevIndex = availableTabs.indexOf(prevTabRef.current);
    const newIndex = availableTabs.indexOf(activeTab);
    return newIndex > prevIndex ? 1 : -1;
  }, [activeTab, availableTabs]);

  // Helper function to translate gender
  const getGenderLabel = (genderValue: string | undefined): string => {
    if (!genderValue) return text.labels.notSpecified;
    const genders = getGenders(locale as 'en' | 'he');
    const normalizedValue = genderValue.toLowerCase().trim();
    // Try to find by value first (male/female)
    let gender = genders.find(g => g.value.toLowerCase() === normalizedValue);
    // If not found, try to find by label (Male/Female)
    if (!gender) {
      gender = genders.find(g => g.label.toLowerCase() === normalizedValue);
    }
    // If still not found, check English labels for Hebrew locale
    if (!gender && locale === 'he') {
      const englishGenders = getGenders('en');
      const englishGender = englishGenders.find(g =>
        g.value.toLowerCase() === normalizedValue ||
        g.label.toLowerCase() === normalizedValue
      );
      if (englishGender) {
        const hebrewGenders = getGenders('he');
        gender = hebrewGenders.find(g => g.value === englishGender.value);
      }
    }
    return gender ? gender.label : genderValue;
  };

  // Helper function to get breed display name
  const getBreedDisplayName = (): string => {
    // If breed was passed from My Pets via URL, use it directly (already translated)
    if (displayBreed) {
      console.log('PetProfilePage - using breed from URL:', displayBreed);
      return displayBreed;
    }

    console.log('PetProfilePage - pet data:', {
      breedId: pet.breedId,
      breedName: pet.breedName,
      breed: pet.breed,
      locale
    });

    // Get breed name with proper translation
    const unknownBreed = locale === 'he' ? 'גזע לא ידוע' : 'Unknown Breed';
    let breedDisplay = pet.breedName || pet.breed || unknownBreed;
    console.log('PetProfilePage - initial breedDisplay:', breedDisplay);

    const breedId = pet.breedId;

    if (breedId) {
      // Check if breedId is a string like "dog-3" or "cat-5"
      if (typeof breedId === 'string' && (breedId.startsWith('dog-') || breedId.startsWith('cat-'))) {
        // Use local breed data for string IDs
        try {
          // Import synchronously since we're in a sync function - use dynamic require pattern
          const { getLocalizedBreedsForType } = require('@/lib/data/breeds');
          const petType = breedId.startsWith('dog-') ? 'dog' : 'cat';
          const breeds = getLocalizedBreedsForType(petType, locale);
          const matchingBreed = breeds.find((b: any) => b.id === breedId);
          if (matchingBreed) {
            breedDisplay = matchingBreed.name;
          }
        } catch (e) {
          console.error('Error getting breed from local data:', e);
        }
      } else {
        // Numeric ID - look up in breedsData
        const numericId = typeof breedId === 'number' ? breedId : Number(breedId);
        if (!isNaN(numericId)) {
          const breed = breedsData.find(b => b.id === numericId);
          if (breed) {
            breedDisplay = locale === 'he' ? breed.he : breed.en;
          }
        }
      }
      console.log('PetProfilePage - breed from ID:', breedDisplay);
    } else if (breedDisplay && breedDisplay !== unknownBreed && breedDisplay !== 'Unknown Breed' && breedDisplay !== 'גזע לא ידוע') {
      // Check if breedDisplay itself is an ID (e.g., "dog-3", "cat-5")
      if (breedDisplay.startsWith('dog-') || breedDisplay.startsWith('cat-')) {
        try {
          const { getLocalizedBreedsForType } = require('@/lib/data/breeds');
          const petType = breedDisplay.startsWith('dog-') ? 'dog' : 'cat';
          const breeds = getLocalizedBreedsForType(petType, locale);
          const matchingBreed = breeds.find((b: any) => b.id === breedDisplay);
          if (matchingBreed) {
            breedDisplay = matchingBreed.name;
          }
        } catch (e) {
          console.error('Error getting breed from local data:', e);
        }
      } else {
        // Try to find the breed in comprehensive data and translate it
        const breed = breedsData.find(b =>
          b.en.toLowerCase() === breedDisplay.toLowerCase() ||
          b.he === breedDisplay
        );
        console.log('PetProfilePage - breed found in data:', breed);
        if (breed) {
          breedDisplay = locale === 'he' ? breed.he : breed.en;
        }
      }
    }

    console.log('PetProfilePage - final breedDisplay:', breedDisplay);
    return breedDisplay;
  };

  // Build data arrays with privacy checks
  // Pet name, breed, gender, and age are always public
  const petInfo = [
    {
      label: text.labels.name,
      value: displayName || pet.name
    },
    {
      label: text.labels.breed,
      value: getBreedDisplayName()
    },
    {
      label: text.labels.gender,
      value: getGenderLabel(pet.gender)
    },
    {
      label: text.labels.age,
      value: pet.birthDate
        ? computeAge(pet.birthDate) + ' ' + text.labels.ageText
        : pet.age || ''
    },
    {
      label: text.labels.notes,
      value: pet.notes || ''
    }
  ];

  const ownerInfo = owner
    ? [
      {
        // Owner name is always public
        label: text.labels.name,
        value: owner.fullName || owner.displayName || ''
      },
      {
        label: text.labels.contact,
        value: owner.isPhonePrivate
          ? text.labels.private
          : owner.phoneNumber || owner.phone || '',
        link: owner.isPhonePrivate
          ? undefined
          : owner.phoneNumber || owner.phone
            ? `https://wa.me/${(owner.phoneNumber || owner.phone || '').replace(/[^0-9]/g, '')}`
            : undefined
      },
      {
        label: text.labels.email,
        value: owner.isEmailPrivate
          ? text.labels.private
          : owner.email || '',
        link: owner.isEmailPrivate
          ? undefined
          : owner.email
            ? `mailto:${owner.email}`
            : undefined
      },
      {
        label: text.labels.address,
        value: owner.isAddressPrivate
          ? text.labels.private
          : owner.homeAddress || ''
      }
    ]
    : [];

  const vetInfo = vet
    ? [
      {
        label: text.labels.name,
        value: vet.isNamePrivate ? text.labels.private : vet.name
      },
      {
        label: text.labels.contact,
        value: vet.isPhonePrivate
          ? text.labels.private
          : vet.phoneNumber
      },
      {
        label: text.labels.email,
        value: vet.isEmailPrivate ? text.labels.private : vet.email
      },
      {
        label: text.labels.address,
        value: vet.isAddressPrivate
          ? text.labels.private
          : vet.address
      }
    ]
    : [];

  // Effect hooks
  useEffect(() => {
    prevTabRef.current = activeTab;
  }, [activeTab]);

  // Gift popup disabled temporarily
  // useEffect(() => {
  //   const hasSeenGift = localStorage.getItem(`giftShown_${pet.id}`);

  //   if (!hasSeenGift) {
  //     const timer = setTimeout(() => {
  //       setShowPopup(true);
  //       localStorage.setItem(`giftShown_${pet.id}`, 'true');
  //     }, 1000 * 5); // 5 seconds delay

  //     return () => clearTimeout(timer);
  //   }
  // }, [pet.id]);

  // Event handlers
  const handleTabChange = (tab: TabName) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  // Show ad if ad is loaded (mandatory ad on pet profile page)
  if (showPromo && promo && promo.content) {
    return (
      <AdFullPage
        type={
          (promo.content && (promo.content.includes('youtube.com') || promo.content.includes('youtu.be') || getYouTubeVideoId(promo.content) !== null))
            ? 'youtube'
            : (promo.type || 'image')
        }
        time={5} // Default to 5 seconds as Ad type doesn't have duration
        content={promo.content}
        youtubeUrl={
          (promo.content && (promo.content.includes('youtube.com') || promo.content.includes('youtu.be') || getYouTubeVideoId(promo.content) !== null))
            ? promo.content
            : undefined
        }
        onClose={handlePromoClose}
      />
    );
  }

  // Main component render
  return (
    <>
      <Navbar />

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="relative overflow-hidden">
          {/* Back Button */}
          <div className="absolute top-[36px] left-[36px] right-[36px] z-10 flex justify-start rtl:justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="bg-white/90 hover:bg-white shadow-md"
            >
              {locale === 'he' ? (
                <ArrowLeft className="h-5 w-5" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </Button>
          </div>
          <PetCard pet={petCardData} />
        </div>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          transition={{
            type: 'spring',
            bounce: 0.3,
            duration: 0.7
          }}
          className="flex flex-grow flex-col"
        >
          <div className="mt-6 mb-2 flex justify-center">
            <AnimatedTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              showVetTab={availableTabs.includes('vet')}
            />
          </div>
          <div className="to-background flex h-full w-full grow rounded-t-3xl bg-linear-to-b from-white px-6 flex items-center justify-center">
            <TabContent
              activeTab={activeTab}
              lockedDirection={lockedDirection}
              petInfo={petInfo}
              ownerInfo={ownerInfo}
              vetInfo={vetInfo}
            />
          </div>
        </motion.div>
        <ShareButton />
        <div className="pb-8"></div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl w-full px-6 py-8">
          {/* Back Button */}
          <div className="mb-6 flex justify-start rtl:justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              {locale === 'he' ? (
                <ArrowLeft className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Main Content: Image Left, Cards Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Pet Image */}
            <div className="flex flex-col">
              <div className="sticky top-24">
                <div className="relative w-full" style={{ height: '600px' }}>
                  <div className="absolute inset-0 [&>div]:!mt-0 [&>div]:!px-0 [&>div>div]:!h-full [&>div>div>div]:!h-full">
                    <PetCard pet={petCardData} />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <ShareButton />
              </div>
            </div>

            {/* Right Side - Tabs and Content */}
            <div className="flex flex-col">
              <div className="bg-white rounded-2xl shadow-lg flex flex-col" style={{ height: '600px' }}>
                <div className="p-6 pb-0 flex-shrink-0">
                  <AnimatedTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    showVetTab={availableTabs.includes('vet')}
                  />
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 p-6 pt-6">
                  <TabContent
                    activeTab={activeTab}
                    lockedDirection={lockedDirection}
                    petInfo={petInfo}
                    ownerInfo={ownerInfo}
                    vetInfo={vetInfo}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pb-8"></div>
      </div>

      {/* Gift popup disabled temporarily */}
      {/* {showPopup && (
        <GiftPopup
          onClose={() => setShowPopup(false)}
          title={t('popup.title')}
          text={t('popup.text')}
          buttonText={t('popup.buttonLabel')}
        />
      )} */}
    </>
  );
}

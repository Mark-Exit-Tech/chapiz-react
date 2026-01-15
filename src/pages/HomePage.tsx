import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useState, useEffect, lazy, Suspense } from 'react';
import Footer from '@/components/layout/Footer';
import OptimizedImage from '@/components/OptimizedImage';

// Lazy load CountUp - used only in whileInView section (below the fold)
const CountUp = lazy(() => import('react-countup').then(m => ({ default: m.default })));

// Lazy load CookieConsent - not critical for initial render
const CookieConsent = lazy(() => import('@/components/CookieConsent'));

// Pet images - base paths without extension (for optimized image delivery)
const petImages = {
  bear: '/pets/bear',
  bunny: '/pets/bunny',
  dino: '/pets/dino',
  duck: '/pets/duck',
  penguin: '/pets/penguin',
  pig: '/pets/pig'
};

const petCharacters = [
  {
    id: 1,
    isTop: false,
    isRight: true,
    isMiddle: true,
    src: petImages.pig,
    alt: 'pig',
    size: 160,
    top: 120,
    right: -20,
    degrees: -13.722
  },
  {
    id: 2,
    isTop: true,
    isRight: false,
    isMiddle: false,
    src: petImages.bunny,
    alt: 'bunny',
    size: 160,
    top: 1,
    right: -61,
    degrees: -11.96
  },
  {
    id: 3,
    isTop: true,
    isRight: true,
    isMiddle: false,
    src: petImages.dino,
    alt: 'dino',
    size: 160,
    top: 10,
    right: 50,
    degrees: 2.283
  },
  {
    id: 4,
    isTop: false,
    isRight: false,
    isMiddle: false,
    src: petImages.duck,
    alt: 'duck',
    size: 160,
    top: 150,
    right: -60,
    degrees: 8.077
  },
  {
    id: 5,
    isTop: false,
    isRight: true,
    isMiddle: false,
    src: petImages.penguin,
    alt: 'penguin',
    size: 160,
    top: 180,
    right: 80,
    degrees: 22.271
  },
  {
    id: 6,
    isTop: false,
    isRight: false,
    isMiddle: true,
    src: petImages.bear,
    alt: 'bear',
    size: 160,
    top: 100,
    right: 0,
    degrees: 5.941
  }
];

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex grow flex-col">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">{t('pages.HomePage.loading')}</p>
          </div>
        </div>
        {/* Bottom Navigation - only visible on mobile */}
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </div>
    );
  }

  const handleCookieAccept = () => {
    console.log('Cookies accepted');
  };

  const handleCookieReject = () => {
    console.log('Cookies rejected');
  };

  return (
    <div className="flex grow flex-col pb-16 md:pb-0">
      {/* Navbar */}
      <Navbar />

      {/* Always show the public landing page */}
      <PublicLandingPage t={t} navigate={navigate} />

      {/* Cookie Consent - Lazy loaded, not blocking initial render */}
      <Suspense fallback={null}>
        <CookieConsent
          onAccept={handleCookieAccept}
          onReject={handleCookieReject}
        />
      </Suspense>

      {/* Bottom Navigation - only visible on mobile */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}

// Public Landing Page Component
const PublicLandingPage = ({ t, navigate }: { t: any; navigate: any }) => {
  return (
    <>
      {/* Main Welcome Content */}
      <section className="relative px-4 sm:px-7 pb-0 min-h-[600px] overflow-visible w-full">
        <div className="relative max-w-7xl mx-auto">
          {/* Desktop: Container with text in center and pets around */}
          <div className="hidden sm:flex relative items-center justify-center h-[calc(100vh-4rem)]">
            {/* Desktop: Pet Icons Around Text - all 6 pets in horizontal oval */}
            <div className="absolute inset-0 flex items-center justify-center">
              {petCharacters.map((pet, index) => (
                <AnimatedPetAroundText key={pet.id} pet={pet} index={index} />
              ))}
            </div>

            {/* Text and Button in the center */}
            <div className="relative z-10 text-center mt-[90px]">
              <div className="text-3xl lg:text-4xl">
                <p className="text-gray-500">{t('pages.HomePage.upperTitle')}</p>
                <p className="text-black">{t('pages.HomePage.lowerTitle')}</p>
              </div>

              {/* Desktop Get Started Button */}
              <div className="mt-8 flex w-full items-center justify-center">
                <Button
                  onClick={() => navigate('/signup')}
                  className="bg-primary hover:bg-primary h-16 w-52 rounded-full text-lg font-normal shadow-lg hover:opacity-70"
                >
                  {t('pages.HomePage.buttonLabel')}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden relative z-10 mt-16">
            {/* Mobile: 3 Top Pets Before Text */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <AnimatedPetSimple pet={petCharacters[2]} size={80} /> {/* dino */}
              <div className="relative -mt-[50px]">
                <AnimatedPetSimple pet={petCharacters[1]} size={80} /> {/* bunny */}
              </div>
              <AnimatedPetSimple pet={petCharacters[5]} size={80} /> {/* bear */}
            </div>

            <div className="text-center text-3xl lg:text-4xl pt-4 mt-[30px]">
              <p className="text-gray-500">{t('pages.HomePage.upperTitle')}</p>
              <p className="text-black">{t('pages.HomePage.lowerTitle')}</p>
            </div>

            {/* Mobile Get Started Button */}
            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => navigate('/login')}
                className="h-[48px] w-auto px-8 bg-primary hover:bg-primary hover:opacity-70 rounded-full text-lg font-normal shadow-lg flex items-center justify-center"
              >
                {t('pages.HomePage.buttonLabel')}
              </Button>
            </div>

            {/* Mobile: Pet Icons After Button - 3 pets in line (pig, duck, penguin) */}
            <div className="flex justify-center items-center gap-4 mt-16">
              <AnimatedPetSimple pet={petCharacters[0]} size={80} /> {/* pig */}
              <div className="relative mt-[50px]">
                <AnimatedPetSimple pet={petCharacters[3]} size={80} /> {/* duck */}
              </div>
              <AnimatedPetSimple pet={petCharacters[4]} size={80} /> {/* penguin */}
            </div>
          </div>

        </div>
      </section>

      {/* Product Highlights Section */}
      <div className="relative w-full">
        <ProductHighlights />
      </div>
      <Footer />
    </>
  );
};

type Pet = {
  id: number;
  isTop: boolean;
  isMiddle: boolean;
  isRight: boolean;
  src: string;
  alt: string;
  size: number;
  top: number;
  right: number;
  degrees: number;
};

type AnimatedPetProps = {
  pet: Pet;
  index: number;
};

// Component for pets around text section - arranged in horizontal oval (static, no animations)
const AnimatedPetAroundText = ({ pet, index }: AnimatedPetProps) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 640);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Only show on desktop
  if (!isDesktop) {
    return null;
  }

  // Desktop: Oval positioning
  const ovalWidth = 500;
  const ovalHeight = 250;
  const centerX = -40;
  const centerY = 0;

  const angleStep = (2 * Math.PI) / 6;
  const startAngle = 0;
  const angle = startAngle + (index * angleStep);

  const baseX = centerX + ovalWidth * Math.cos(angle);
  const baseY = centerY + ovalHeight * Math.sin(angle);

  const responsiveSize = pet.size;

  return (
    <div
      style={{
        position: 'absolute',
        top: `calc(50% + ${baseY}px)`,
        left: `calc(50% + ${baseX}px)`,
        transform: 'translate(-50%, -50%)',
        zIndex: 1
      }}
    >
      <OptimizedImage
        src={pet.src}
        alt={pet.alt}
        width={responsiveSize}
        height={responsiveSize}
        className="object-cover"
      />
    </div>
  );
};

// Simple animated pet component for mobile
const AnimatedPetSimple = ({ pet, size }: { pet: Pet; size: number }) => {
  return (
    <OptimizedImage
      src={pet.src}
      alt={pet.alt}
      width={size}
      height={size}
      className="object-contain"
    />
  );
};

const ProductHighlights = () => {
  const { t } = useTranslation();

  return (
    <section className="mt-0 mb-0">
      <div className="mx-auto max-w-4xl px-4 text-center pt-0">
        {/* Headline */}
        <h2 className="text-primary mb-4 text-4xl font-bold">
          {t('components.ProductHighlights.headline')}
        </h2>

        {/* Subheading */}
        <p className="mb-4 text-lg text-gray-700">
          {t('components.ProductHighlights.subheading')}
        </p>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Suspense fallback={<div className="text-4xl font-extrabold text-primary">0</div>}>
            <StatItem end={2651} label={t('components.ProductHighlights.recoveredPets')} duration={2.5} />
          </Suspense>
          <Suspense fallback={<div className="text-4xl font-extrabold text-primary">0</div>}>
            <StatItem end={122} label={t('components.ProductHighlights.activeUsers')} duration={2.5} />
          </Suspense>
          <Suspense fallback={<div className="text-4xl font-extrabold text-primary">0</div>}>
            <StatItem end={24981} label={t('components.ProductHighlights.chipsDeployed')} duration={2.5} />
          </Suspense>
        </div>
      </div>
    </section>
  );
};

type StatItemProps = {
  end: number;
  label: string;
  duration: number;
};

const StatItem = ({ end, label, duration }: StatItemProps) => (
  <div className="flex flex-col items-center">
    <CountUp
      start={0}
      end={end}
      duration={duration}
      separator=","
      className="text-primary text-4xl font-extrabold"
    />
    <p className="mt-2 text-xl font-semibold">{label}</p>
  </div>
);

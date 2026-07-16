'use client';

import { useLocale } from '@/hooks/use-locale';
import { motion } from 'framer-motion';
import { ArrowRight, Pencil, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

interface MyPetCardProps {
  id: string;
  name: string;
  breed: string;
  image: string;
  isEditMode: boolean;
}

const MyPetCard: React.FC<MyPetCardProps> = ({
  id,
  name,
  breed,
  image,
  isEditMode
}) => {
  const navigate = useNavigate();
  const locale = (useLocale() as string) || 'en';
  const isRTL = locale === 'he';

  // Fixed dimensions for consistent layout.
  const imageWidth = 100; // in pixels
  const cardHeight = 120; // in pixels, increased for better mobile display
  const optionsPanelWidth = 60; // width of the options panel, reduced for small screens

  // State to track image loading
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageRetryCount, setImageRetryCount] = React.useState(0);
  const retryTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setImageRetryCount(0);

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [image]);

  const handleImageLoad = () => {
    console.log('Image loaded successfully for pet:', name);
    setImageError(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.error('Failed to load pet image:', image);
    setImageLoaded(false);

    if (imageRetryCount < 2) {
      retryTimerRef.current = setTimeout(() => {
        setImageRetryCount((count) => count + 1);
      }, 750 * (imageRetryCount + 1));
      return;
    }

    setImageError(true);
  };

  const imageSrc = imageRetryCount > 0
    ? `${image}${image.includes('?') ? '&' : '?'}retry=${imageRetryCount}`
    : image;

  // Validate if image URL is valid
  const isValidImageUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false;
    if (url === '/default-pet.png' || url.includes('default')) return false;
    try {
      // Check if it's a valid URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return true;
      }
      // Check if it's a valid relative path
      if (url.startsWith('/')) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // In edit mode: tap card to go to edit. Otherwise: tap card to go to pet profile.
  const handleCardClick = () => {
    if (isEditMode) {
      navigate(`/${locale}/pet/${id}/edit`);
    } else {
      const params = new URLSearchParams({
        displayName: name,
        displayBreed: breed,
        displayImage: image
      });
      const targetUrl = `/${locale}/pet/${id}?${params.toString()}`;
      navigate(targetUrl);
    }
  };

  // Option button click handlers.
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log('Delete pet', id);
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/${locale}/pet/${id}/edit`);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      className={cn(
        `group bg-white relative h-[120px] w-full cursor-pointer rounded-2xl shadow-md overflow-hidden`
      )}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Options Panel (revealed in edit mode only) */}
      {isEditMode && (
        <div
          className={cn(
            'absolute top-0 bottom-0 z-10 flex items-center justify-evenly gap-1 rounded-s-2xl p-2.5 ltr:left-0 rtl:right-0 overflow-hidden'
          )}
          style={{ width: `${optionsPanelWidth}px` }}
        >
          <Button
            variant="secondary"
            onClick={handleEdit}
            className="h-[70%] min-w-0 w-full font-medium shadow-none flex-shrink-0"
          >
            <Pencil className="h-6 w-6 shrink-0" />
          </Button>
        </div>
      )}

      {/* Animated Text / Info Container */}
      <motion.div
        className="absolute top-0 bottom-0 z-10 rounded-2xl bg-white shadow-xs ltr:left-0 rtl:right-0"
        initial={false}
        animate={{
          width: isEditMode
            ? `calc(100% - ${imageWidth}px - 10px - ${optionsPanelWidth}px)`
            : `calc(100% - ${imageWidth}px - 10px)`,
          x: isEditMode
            ? isRTL
              ? -optionsPanelWidth
              : optionsPanelWidth
            : 0
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      >
        <div className="flex h-full flex-col justify-between p-4 ltr:text-left rtl:text-right">
          <div className="text-lg font-bold">{name}</div>
          <div className="text-sm text-gray-600">{breed}</div>
        </div>

        {/* Call-to-Action Arrow Overlay */}
        <div className="absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-gray-50 shadow-sm transition-colors group-hover:bg-gray-100 ltr:right-3 rtl:left-3">
          <ArrowRight className="h-4 w-4 stroke-gray-700 rtl:rotate-180" />
        </div>
      </motion.div>

      {/* Static Image Container */}
      <div
        className="absolute top-0 bottom-0 z-[5] bg-transparent ltr:right-0 rtl:left-0"
        style={{ width: `${imageWidth}px` }}
      >
        <div className="relative h-full w-full overflow-hidden bg-[#fff5f5] ltr:rounded-e-2xl rtl:rounded-s-2xl">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <img
                src="/assets/upload_figures.webp"
                alt=""
                aria-hidden="true"
                className="h-full w-full object-contain"
              />
            </div>
          )}
          {isValidImageUrl(image) && !imageError ? (
            <img
              key={`${id}-${imageSrc}`}
              alt={name}
              src={imageSrc}
              width={imageWidth}
              height={cardHeight}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ltr:rounded-e-2xl rtl:rounded-s-2xl',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

export default MyPetCard;

'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@radix-ui/react-separator';
import { MapPin, Phone, Star, Send, Heart, Ticket, ArrowLeft } from 'lucide-react';
// Image removed;
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getCommentsForAd, submitComment } from '@/lib/actions/admin';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { addToFavorites, removeFromFavorites, isAdFavorited } from '@/lib/firebase/database/favorites';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/use-locale';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SERVICE_TAGS_TRANSLATIONS } from '@/lib/constants/hebrew-service-tags';

interface Service {
  id: string;
  title: string;
  description?: string;
  content?: string;
  phone?: string;
  location?: string;
  tags?: string[];
  imageUrl?: string;
}

interface ServiceDetailsPageClientProps {
  service: Service | null;
}

const ServiceDetailsPageClient: React.FC<ServiceDetailsPageClientProps> = ({ service }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'pages.ServicesPage' });
  const navigate = useNavigate();
  const locale = useLocale();
  const isHebrew = locale === 'he';
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{
    id: string;
    userName?: string;
    content: string;
    rating?: number;
    createdAt: Date;
  }>>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const { user, dbUser } = useAuth();

  // Function to translate tags for display
  const translateTag = (tag: string): string => {
    if (locale === 'en' && SERVICE_TAGS_TRANSLATIONS[tag as keyof typeof SERVICE_TAGS_TRANSLATIONS]) {
      return SERVICE_TAGS_TRANSLATIONS[tag as keyof typeof SERVICE_TAGS_TRANSLATIONS];
    }
    return tag;
  };

  // Load comments when component mounts
  useEffect(() => {
    if (service?.id) {
      loadComments();
    }
  }, [service?.id]);

  // Check if service is favorited when user changes
  useEffect(() => {
    if (user && service?.id) {
      checkIfFavorited();
    }
  }, [user, service?.id]);

  const checkIfFavorited = async () => {
    if (!user || !service?.id) return;

    try {
      const favorited = await isAdFavorited(user.uid, service.id);
      setIsFavorited(favorited);
    } catch (error) {
      console.error('Error checking if favorited:', error);
    }
  };

  const loadComments = async () => {
    if (!service?.id) return;

    setIsLoadingComments(true);
    try {
      const commentsData = await getCommentsForAd(service.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleStarClick = (rating: number) => {
    setUserRating(rating);
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error(t('loginToReview'));
      return;
    }

    if (userRating > 0 && service?.id) {
      setIsSubmittingComment(true);

      try {
        const result = await submitComment({
          adId: service.id,
          userId: user.uid,
          userName: dbUser?.full_name || user.email?.split('@')[0] || 'User',
          content: commentText.trim() || '',
          rating: userRating
        });

        if (result.success) {
          setUserRating(0);
          setCommentText('');
          setShowCommentForm(false);
          await loadComments();
          toast.success(t('reviewSubmitted'));
        } else {
          toast.error(t('reviewSubmitError'));
        }
      } catch (error) {
        console.error('Error submitting comment:', error);
        toast.error(t('reviewSubmitError'));
      } finally {
        setIsSubmittingComment(false);
      }
    } else {
      toast.error(t('pleaseSelectRating'));
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error(isHebrew ? 'יש להתחבר כדי להוסיף למועדפים' : 'Please log in to add to favorites');
      return;
    }

    if (!service?.id) {
      toast.error(isHebrew ? 'מזהה שירות לא זמין' : 'Service ID not available');
      return;
    }

    setIsTogglingFavorite(true);

    try {
      if (isFavorited) {
        const result = await removeFromFavorites(user.uid, service.id);
        if (result.success) {
          setIsFavorited(false);
          toast.success(isHebrew ? 'הוסר מהמועדפים' : 'Removed from favorites');
        } else {
          toast.error(isHebrew ? 'שגיאה בהסרה מהמועדפים' : 'Failed to remove from favorites');
        }
      } else {
        const result = await addToFavorites(user.uid, service.id, service.title, 'service');
        if (result.success) {
          setIsFavorited(true);
          toast.success(isHebrew ? 'נוסף למועדפים' : 'Added to favorites');
        } else {
          toast.error(isHebrew ? 'שגיאה בהוספה למועדפים' : 'Failed to add to favorites');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(isHebrew ? 'אירעה שגיאה. נסה שוב.' : 'An error occurred. Please try again.');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Show error state if service is not found
  if (!service) {
    return (
      <div className="flex flex-col h-full overflow-y-auto bg-white" dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className={cn("rounded-full", isHebrew && "rotate-180")}
          >
            <ArrowLeft size={20} />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{t('serviceNotFound')}</h2>
            <p className="text-gray-600 mb-4">{t('serviceNotFoundDescription')}</p>
            <Button onClick={() => navigate(`/${locale}/services`)}>
              {t('backToServices')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const serviceImage = service.imageUrl || service.content || 'https://via.placeholder.com/300x200?text=Service+Image';
  const serviceDescription = service.description || '';

  return (
    <div className="flex flex-col flex-1 overflow-y-auto bg-gray-50" dir={isHebrew ? 'rtl' : 'ltr'}>
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:!pr-[80px]">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className={cn("rounded-full", isHebrew ? "ml-[21px] rotate-180" : "mr-[21px]")}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold flex-1">{service.title}</h1>
        </div>
      </div>

      {/* Content - Desktop: Two column layout, Mobile: Single column */}
      <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Image and Contact Info (Desktop) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Service image */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <img
                  src={serviceImage}
                  alt={service.title}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Contact Information Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h4 className="font-semibold text-lg mb-4">{t('contactDetails')}</h4>
                <div className="space-y-4">
                  {service.phone && service.phone.trim() !== '' && service.phone !== 'undefined' && service.phone !== 'null' && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Phone size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('phone')}</p>
                        <a href={`tel:${service.phone}`} className="text-base font-medium text-gray-900 hover:text-primary" dir="ltr">
                          {service.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {service.location && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('address')}</p>
                        <p className="text-base text-gray-900">{service.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Desktop Sidebar (hidden on mobile) */}
                <div className="hidden lg:block mt-6 pt-6 border-t border-gray-200 space-y-2">
                  <Button
                    variant="outline"
                    className={cn("w-full", isHebrew ? 'flex-row-reverse justify-end' : 'justify-start')}
                    onClick={() => {
                      if (service.location) {
                        const address = service.location.trim();
                        // Try Waze app protocol first (mobile), fallback to web
                        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                        if (isMobile) {
                          // Try to open Waze app
                          window.location.href = `waze://?q=${encodeURIComponent(address)}`;
                          // Fallback to web after a short delay
                          setTimeout(() => {
                            window.open(`https://waze.com/ul?q=${encodeURIComponent(address)}`, '_blank');
                          }, 500);
                        } else {
                          window.open(`https://waze.com/ul?q=${encodeURIComponent(address)}`, '_blank');
                        }
                      } else {
                        toast.error(t('addressNotAvailable'));
                      }
                    }}
                  >
                    <img
                      src="/icons/waze.png"
                      alt="Waze"
                      width={18}
                      height={18}
                      className={cn(isHebrew ? 'ml-2' : 'mr-2')}
                    />
                    <span>{t('navigation')}</span>
                  </Button>
                  {service.phone && service.phone.trim() !== '' && service.phone !== 'undefined' && service.phone !== 'null' && (
                    <Button
                      variant="outline"
                      className={cn("w-full", isHebrew ? 'flex-row-reverse justify-end' : 'justify-start')}
                      onClick={() => window.open(`tel:${service.phone}`, '_self')}
                    >
                      <Phone size={18} className={cn(isHebrew ? 'ml-2' : 'mr-2')} />
                      <span>{t('call')}</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className={cn("w-full", isHebrew ? 'flex-row-reverse justify-end' : 'justify-start')}
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                  >
                    {isTogglingFavorite ? (
                      <div className={cn("h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent", isHebrew ? 'ml-2' : 'mr-2')} />
                    ) : isFavorited ? (
                      <Heart size={18} className={cn("fill-current text-orange-500", isHebrew ? 'ml-2' : 'mr-2')} />
                    ) : (
                      <Heart size={18} className={cn(isHebrew ? 'ml-2' : 'mr-2')} />
                    )}
                    <span>{isFavorited ? t('removeFromFavorites') : t('addToFavorites')}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={cn("w-full", isHebrew ? 'flex-row-reverse justify-end' : 'justify-start')}
                    onClick={() => {
                      if (service.id) {
                        navigate(`/${locale}/coupons?businessId=${service.id}`);
                      } else {
                        toast.error(isHebrew ? 'מזהה עסק לא זמין' : 'Business ID not available');
                      }
                    }}
                  >
                    <Ticket size={18} className={cn(isHebrew ? 'ml-2' : 'mr-2')} />
                    <span>{t('coupons')}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tags */}
              {service.tags && service.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-primary rounded-full px-4 py-2 text-sm font-medium text-white"
                    >
                      {translateTag(tag)}
                    </span>
                  ))}
                </div>
              )}

              {/* Service description */}
              {serviceDescription && serviceDescription.trim() !== '' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-lg mb-3">{t('description')}</h3>
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">{serviceDescription}</p>
                </div>
              )}

              {/* Google Reviews */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">{t('googleReviews')}</h3>
                  {user ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCommentForm(!showCommentForm)}
                    >
                      {t('addReview')}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.error(t('loginToReview'))}
                    >
                      {t('addReview')}
                    </Button>
                  )}
                </div>

                {/* Comment Form */}
                {showCommentForm && (
                  <div className="mb-6 rounded-lg border p-6 bg-gray-50">
                    <h4 className="font-semibold mb-3">{t('addNewReview')}</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>{t('rating')}</Label>
                        <div className={cn("flex gap-1 mt-1", isHebrew && "flex-row-reverse justify-end")}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={20}
                              className={cn(
                                'cursor-pointer transition-colors',
                                star <= userRating
                                  ? 'fill-orange-400 text-orange-400'
                                  : 'text-gray-300 hover:text-orange-300'
                              )}
                              onClick={() => handleStarClick(star)}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="comment">{t('comment')}</Label>
                        <Textarea
                          id="comment"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={t('commentPlaceholder')}
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSubmitComment} size="sm" disabled={isSubmittingComment}>
                          <Send size={16} className={cn(isHebrew ? 'ml-2' : 'mr-2')} />
                          {isSubmittingComment ? t('submitting') : t('submit')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCommentForm(false)}
                        >
                          {t('cancel')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {isLoadingComments ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>{t('loadingReviews')}</p>
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {comment.userName?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{comment.userName}</span>
                              <span className={cn("flex items-center gap-1", isHebrew && "flex-row-reverse")}>
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={
                                      i < (comment.rating || 0)
                                        ? 'fill-orange-400 text-orange-400'
                                        : 'fill-gray-300 text-gray-300'
                                    }
                                  />
                                ))}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {comment.createdAt.toLocaleDateString(isHebrew ? 'he-IL' : 'en-US')}
                            </span>
                          </div>
                        </div>
                        {comment.content && (
                          <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">{t('noReviews')}</p>
                    <p className="text-sm">{t('beFirstToReview')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky footer with action buttons */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center px-4 py-3" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}>
          <Button
            variant="ghost"
            size="icon"
            className="focus:bg-primary transition-colors focus:text-white focus:outline-none"
            onClick={() => {
              if (service.location) {
                const address = service.location.trim();
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile) {
                  window.location.href = `waze://?q=${encodeURIComponent(address)}`;
                  setTimeout(() => {
                    window.open(`https://waze.com/ul?q=${encodeURIComponent(address)}`, '_blank');
                  }, 500);
                } else {
                  window.open(`https://waze.com/ul?q=${encodeURIComponent(address)}`, '_blank');
                }
              } else {
                toast.error(t('addressNotAvailable'));
              }
            }}
            title={t('navigation')}
          >
            <img
              src="/icons/waze.png"
              alt="Waze"
              width={20}
              height={20}
            />
          </Button>

          {service.phone && service.phone.trim() !== '' && service.phone !== 'undefined' && service.phone !== 'null' && (
            <>
              <Separator orientation="vertical" className="w-[1px] bg-gray-300" />
              <Button
                variant="ghost"
                size="icon"
                className="focus:bg-primary transition-colors focus:text-white focus:outline-none"
                onClick={() => window.open(`tel:${service.phone}`, '_self')}
                title={t('call')}
              >
                <Phone size={20} />
              </Button>
            </>
          )}

          <Separator orientation="vertical" className="w-[1px] bg-gray-300" />

          <Button
            variant="ghost"
            size="icon"
            className={`transition-colors focus:outline-none ${isFavorited
              ? 'text-orange-500 hover:text-orange-600 focus:text-orange-600'
              : 'hover:text-orange-500 focus:text-orange-500'
              }`}
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            title={isFavorited ? t('removeFromFavorites') : t('addToFavorites')}
          >
            {isTogglingFavorite ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : isFavorited ? (
              <Heart size={20} className="fill-current" />
            ) : (
              <Heart size={20} />
            )}
          </Button>

          <Separator orientation="vertical" className="w-[1px] bg-gray-300" />

          <Button
            variant="ghost"
            size="icon"
            className="focus:bg-primary transition-colors focus:text-white focus:outline-none"
            onClick={() => {
              if (service.id) {
                navigate(`/${locale}/coupons?businessId=${service.id}`);
              } else {
                toast.error('Business ID not available');
              }
            }}
            title={t('coupons')}
          >
            <Ticket size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPageClient;


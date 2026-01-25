'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Share2, Trophy, Info, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Promo, Business } from '@/types/promo';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getUserCouponByIds, markCouponAsUsed } from '@/lib/firebase/database/coupons';
import { motion } from 'framer-motion';
import { getYouTubeEmbedUrl } from '@/lib/utils/youtube';
import QRCodeCard from '@/components/cards/QRCodeCard';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';


interface CouponViewPageClientProps {
  coupon: Promo;
  business: Business | null;
  businesses?: Business[];
}

export default function CouponViewPageClient({ coupon, business, businesses = [] }: CouponViewPageClientProps) {
  const navigate = useNavigate();
  const { user, dbUser } = useAuth();
  
  // Get locale from URL
  const locale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'en'
    : 'en';
  const isHebrew = locale === 'he';
  
  // HARDCODED TEXT
  const text = {
    back: isHebrew ? 'חזור' : 'Back',
    use: isHebrew ? 'השתמש' : 'Use',
    used: isHebrew ? 'משומש' : 'Used',
    using: isHebrew ? 'משתמש...' : 'Using...',
    share: isHebrew ? 'שתף' : 'Share',
    shared: isHebrew ? 'שותף בהצלחה!' : 'Shared successfully!',
    linkCopied: isHebrew ? 'הלינק הועתק!' : 'Link copied!',
    promoUsed: isHebrew ? 'הקופון סומן כמשומש!' : 'Coupon marked as used!',
    gotPrize: isHebrew ? 'קיבלתי פרס!' : 'I got a prize!',
    couponUsedSuccess: isHebrew ? 'הקופון נוצל בהצלחה!' : 'Coupon used successfully!',
    startDate: isHebrew ? 'תחילה' : 'Start',
    endDate: isHebrew ? 'סיום' : 'End',
    importantInfo: isHebrew ? 'מידע חשוב' : 'Important Information',
    couponUsageInfo: isHebrew ? 'ניתן להשתמש בקופון זה רק בעסק שמציע את המבצע' : 'This coupon can only be used at the shop that offers this promo',
    oneTimeUse: isHebrew ? 'קופון זה תקף לשימוש חד פעמי בלבד' : 'This coupon is valid for one-time use only',
    confirmUse: isHebrew ? 'אשר שימוש בקופון' : 'Confirm Use Coupon',
    confirmUseMessage: isHebrew ? 'האם אתה בטוח שברצונך להשתמש בקופון זה? פעולה זו אינה ניתנת לביטול.' : 'Are you sure you want to use this coupon? This action cannot be undone.',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    confirm: isHebrew ? 'אישור' : 'Confirm',
    viewCoupon: isHebrew ? 'צפייה בקופון' : 'View Coupon',
    qrCodeDescription: isHebrew ? 'סרוק את קוד ה-QR כדי לצפות בקופון זה' : 'Scan this QR code to view this coupon',
    showOnMap: isHebrew ? 'הצג במפה' : 'Show on Map',
  };
  const [isUsingCoupon, setIsUsingCoupon] = useState(false);
  const [isUsed, setIsUsed] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [userCouponId, setUserCouponId] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [couponUrl, setCouponUrl] = useState('');

  // Set mounted state and coupon URL only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/${locale}/coupons/${coupon.id}${business ? `?businessId=${business.id}` : ''}`;
      setCouponUrl(url);
    }
  }, [locale, coupon.id, business]);

  // Check if coupon is purchased and used
  useEffect(() => {
    const checkCouponStatus = async () => {
      if (user) {
        const result = await getUserCouponByIds(user.uid, coupon.id);
        setIsPurchased(result.purchased);
        setIsUsed(result.isUsed || false);
        if (result.userCouponId) {
          setUserCouponId(result.userCouponId);
        }
      }
    };
    checkCouponStatus();
  }, [user, coupon.id]);


  const handleUseCouponClick = async () => {
    if (!user) {
      toast.error(isHebrew ? 'יש להתחבר כדי להשתמש בקופון' : 'Please sign in to use coupons');
      navigate(`/${locale}/login`);
      return;
    }

    if (isUsed) {
      toast.error(isHebrew ? 'הקופון כבר נוצל' : 'This coupon has already been used');
      return;
    }

    // For promotional coupons, auto-create userCoupon first if not already claimed
    if (!isPurchased) {
      try {
        const { purchaseCoupon } = await import('@/lib/firebase/database/coupons');
        const result = await purchaseCoupon(user.uid, coupon.id, 0);

        if (result.success) {
          // Refresh coupon status
          const statusResult = await getUserCouponByIds(user.uid, coupon.id);
          setIsPurchased(statusResult.purchased);
          setIsUsed(statusResult.isUsed || false);
          if (statusResult.userCouponId) {
            setUserCouponId(statusResult.userCouponId);
          }
        } else {
          toast.error(result.error || (isHebrew ? 'נכשל בקבלת הקופון' : 'Failed to get coupon'));
          return;
        }
      } catch (error) {
        console.error('Error auto-claiming coupon:', error);
        toast.error(isHebrew ? 'שגיאה בקבלת הקופון' : 'Error getting coupon');
        return;
      }
    }

    setShowConfirmDialog(true);
  };

  const handleUseCoupon = async () => {
    setShowConfirmDialog(false);
    setIsUsingCoupon(true);

    try {
      if (!userCouponId) {
        toast.error(isHebrew ? 'שגיאה: לא נמצא מזהה קופון' : 'Error: Coupon ID not found');
        return;
      }

      const result = await markCouponAsUsed(userCouponId);

      if (result.success) {
        setIsUsed(true);
        setShowSuccessAnimation(true);

        // Trigger confetti animation
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast.success(text.promoUsed);

        // Hide animation and redirect after 2 seconds
        setTimeout(() => {
          setShowSuccessAnimation(false);
          // Redirect back to coupons page
          navigate(`/${locale}/coupons`);
        }, 2000);
      } else {
        toast.error(result.error || (isHebrew ? 'שגיאה בסימון קופון כמשומש' : 'Failed to mark coupon as used'));
      }
    } catch (error) {
      console.error('Error using coupon:', error);
      toast.error(isHebrew ? 'שגיאה בשימוש בקופון' : 'Failed to use coupon');
    } finally {
      setIsUsingCoupon(false);
    }
  };

  const handleShare = async () => {
    if (!isMounted || !couponUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: coupon.name,
          text: coupon.description || coupon.name,
          url: couponUrl,
        });
        toast.success(text.shared);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          // Fallback to clipboard
          navigator.clipboard.writeText(couponUrl);
          toast.success(text.linkCopied);
        }
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(couponUrl);
      toast.success(text.linkCopied);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isHebrew ? 'rtl' : 'ltr'}>
      <Navbar />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className={`h-4 w-4 me-2 ${isHebrew ? 'rotate-180' : ''}`} />
          {text.back}
        </Button>

        <Card className="overflow-hidden">
          <CardContent className="p-8">
            {/* Coupon Image or Video */}
            {coupon.youtubeUrl ? (
              <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden bg-black">
                {getYouTubeEmbedUrl(coupon.youtubeUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(coupon.youtubeUrl) || ''}
                    title={coupon.name}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <span>Video unavailable</span>
                  </div>
                )}
              </div>
            ) : coupon.imageUrl && (
              <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                <img
                  src={coupon.imageUrl}
                  alt={coupon.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Coupon Info */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">{coupon.name}</h1>
              {coupon.description && (
                <p className="text-gray-600 mb-4">{coupon.description}</p>
              )}
              {business && (
                <p className="text-sm text-gray-500 mb-4">{business.name}</p>
              )}
              {(coupon.startDate || coupon.endDate) && (
                <div className="text-sm text-gray-500 mb-4">
                  {coupon.startDate && (() => {
                    const date = coupon.startDate instanceof Date
                      ? coupon.startDate
                      : (coupon.startDate as any)?.toDate?.()
                        ? (coupon.startDate as any).toDate()
                        : new Date(coupon.startDate);
                    return !isNaN(date.getTime()) && (
                      <p>{text.startDate}: {date.toLocaleDateString(isHebrew ? 'he-IL' : 'en-GB')}</p>
                    );
                  })()}
                  {coupon.endDate && (() => {
                    const date = coupon.endDate instanceof Date
                      ? coupon.endDate
                      : (coupon.endDate as any)?.toDate?.()
                        ? (coupon.endDate as any).toDate()
                        : new Date(coupon.endDate);
                    return !isNaN(date.getTime()) && (
                      <p>{text.endDate}: {date.toLocaleDateString(isHebrew ? 'he-IL' : 'en-GB')}</p>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Used Status Message */}
            {isUsed && (
              <div className="mb-8 p-4 bg-gray-100 border border-gray-300 rounded-lg text-center">
                <p className="text-sm text-gray-700 font-semibold">
                  {isHebrew ? 'קופון זה כבר נוצל' : 'This coupon has already been used'}
                </p>
              </div>
            )}

            {/* QR Code Card - Only show if not used */}
            {!isUsed && (
              <div className="mb-8">
                <QRCodeCard url={couponUrl} title={text.viewCoupon} description={text.qrCodeDescription} />
              </div>
            )}

            {/* Important Information - Only show if not used */}
            {!isUsed && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium mb-1">
                      {text.importantInfo}
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>{text.couponUsageInfo}</li>
                      <li>{text.oneTimeUse}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Success Animation - Prize Icon */}
            {showSuccessAnimation && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: [0, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="bg-white rounded-lg p-8 text-center max-w-sm mx-4 shadow-2xl"
                >
                  <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
                  <p className="text-2xl font-bold text-gray-900 mb-2">{text.gotPrize}</p>
                  <p className="text-gray-600">{text.couponUsedSuccess}</p>
                </motion.div>
              </motion.div>
            )}


            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
                <Button
                  variant={isUsed ? "secondary" : "default"}
                  size="lg"
                  onClick={handleUseCouponClick}
                  disabled={isUsed || isUsingCoupon}
                  className="w-full"
                >
                  {isUsingCoupon ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2" />
                      {text.using}
                    </>
                  ) : isUsed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 me-2" />
                      {text.used}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 me-2" />
                      {text.use}
                    </>
                  )}
                </Button>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 me-2" />
                    {text.share}
                  </Button>
                  {businesses.length > 0 && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => {
                        const businessIds = businesses.map(b => b.id).filter(Boolean);
                        if (businessIds.length > 0) {
                          const idsString = businessIds.join(',');
                          navigate(`/${locale}/services?businessId=${idsString}`);
                        } else {
                          navigate(`/${locale}/services`);
                        }
                      }}
                    >
                      <MapPin className="w-4 h-4 me-2" />
                      {text.showOnMap}
                    </Button>
                  )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{text.confirmUse}</DialogTitle>
                  <DialogDescription>
                    {text.confirmUseMessage}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={isUsingCoupon}
                  >
                    {text.cancel}
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleUseCoupon}
                    disabled={isUsingCoupon}
                  >
                    {isUsingCoupon ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2" />
                        {text.using}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 me-2" />
                        {text.confirm}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


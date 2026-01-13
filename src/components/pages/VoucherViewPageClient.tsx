'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ShoppingCart, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/hooks/use-locale';
import { UserCoupon } from '@/lib/firebase/database/coupons';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { useShopRedirect } from '@/hooks/use-shop-redirect';
import QRCodeCard from '@/components/cards/QRCodeCard';


interface VoucherViewPageClientProps {
  userCoupon: UserCoupon;
}

export default function VoucherViewPageClient({ userCoupon }: VoucherViewPageClientProps) {
  const { t } = useTranslation('components.UserCoupons');
  const navigate = useNavigate();
  const locale = useLocale();
  const isHebrew = locale === 'he';
  const coupon = userCoupon.coupon;
  const { redirectToShop } = useShopRedirect();
  const [shopUrl, setShopUrl] = useState<string>('');
  const [voucherUrl, setVoucherUrl] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  
  // HARDCODED TEXT - NO TRANSLATION KEYS!
  const text = {
    codeCopied: isHebrew ? 'קוד השובר הועתק ללוח!' : 'Voucher code copied to clipboard!',
    failedToCopy: isHebrew ? 'נכשל בהעתקת הקוד' : 'Failed to copy code',
    sharedSuccessfully: isHebrew ? 'שותף בהצלחה!' : 'Shared successfully!',
    linkCopied: isHebrew ? 'הלינק הועתק ללוח!' : 'Link copied to clipboard!',
    back: isHebrew ? 'חזור' : 'Back',
    qrCodeDescription: isHebrew ? 'סרקו את קוד ה-QR הזה כדי לצפות בשובר' : 'Scan this QR code to view this voucher',
    useVoucher: isHebrew ? 'השתמש בשובר' : 'Use Voucher',
    share: isHebrew ? 'שתף' : 'Share',
  };

  useEffect(() => {
    setIsMounted(true);
    // Set voucher URL only on client side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      setVoucherUrl(`${window.location.origin}/${locale}/vouchers/${userCoupon.id}`);
    }
  }, [locale, userCoupon.id]);

  useEffect(() => {
    const fetchContactData = async () => {
      const { getContactInfo } = await import('@/lib/actions/admin');
      const info = await getContactInfo();
      if (info?.storeUrl) {
        setShopUrl(info.storeUrl);
      }
    };
    fetchContactData();
  }, []);


  const handleUse = () => {
    const couponCode = coupon.description; // The coupon code is stored in description

    // Copy the code first
    if (couponCode) {
      navigator.clipboard.writeText(couponCode).then(() => {
        toast.success(text.codeCopied);
      }).catch(() => {
        toast.error(text.failedToCopy);
      });
    }

    // Then redirect to shop with the coupon code
    if (!shopUrl) {
      toast.error(isHebrew ? 'כתובת החנות לא הוגדרה. אנא צרו קשר עם התמיכה.' : 'Shop URL is not configured. Please contact support.');
      return;
    }

    redirectToShop(shopUrl, couponCode, undefined, true);
  };

  const handleShare = async () => {
    if (!isMounted || !voucherUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: coupon.name,
          text: coupon.description || coupon.name,
          url: voucherUrl,
        });
        toast.success(text.sharedSuccessfully);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          // Fallback to clipboard
          navigator.clipboard.writeText(voucherUrl);
          toast.success(text.linkCopied);
        }
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(voucherUrl);
      toast.success(text.linkCopied);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          {locale === 'he' ? (
            <ArrowRight className="h-4 w-4 mr-2" />
          ) : (
            <ArrowLeft className="h-4 w-4 mr-2" />
          )}
          {text.back}
        </Button>

        <Card className="overflow-hidden">
          <CardContent className="p-8">
            {/* Voucher Image */}
            {coupon.imageUrl && (
              <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                <img
                  src={coupon.imageUrl}
                  alt={coupon.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Voucher Info */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">{coupon.name}</h1>
              {coupon.description && (
                <p className="text-gray-600 mb-4">{coupon.description}</p>
              )}
            </div>

            {/* QR Code Card */}
            <div className="mb-8">
              <QRCodeCard
                url={voucherUrl}
                description={text.qrCodeDescription}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="default"
                size="lg"
                onClick={handleUse}
                className="flex-1"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t('use') || 'Use'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
                className="flex-1"
                disabled={!isMounted || !voucherUrl}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {t('share') || 'Share'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


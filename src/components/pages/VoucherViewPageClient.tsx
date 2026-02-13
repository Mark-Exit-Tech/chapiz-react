'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ShoppingCart, Share2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/hooks/use-locale';
import { markVoucherAsUsed, type UserVoucher } from '@/lib/firebase/database/vouchers';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';
import QRCodeCard from '@/components/cards/QRCodeCard';
import confetti from 'canvas-confetti';

interface VoucherViewPageClientProps {
  userVoucher: UserVoucher;
}

export default function VoucherViewPageClient({ userVoucher }: VoucherViewPageClientProps) {
  const navigate = useNavigate();
  const locale = useLocale();
  const isHebrew = locale === 'he';
  const voucher = userVoucher.voucher;
  const [voucherUrl, setVoucherUrl] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [isUsingVoucher, setIsUsingVoucher] = useState(false);

  // HARDCODED TEXT - NO TRANSLATION KEYS!
  const text = {
    sharedSuccessfully: isHebrew ? 'שותף בהצלחה!' : 'Shared successfully!',
    linkCopied: isHebrew ? 'הלינק הועתק ללוח!' : 'Link copied to clipboard!',
    back: isHebrew ? 'חזור' : 'Back',
    viewCoupon: isHebrew ? 'צפייה בשובר' : 'View Voucher',
    qrCodeDescription: isHebrew ? 'סרקו את קוד ה-QR הזה כדי לצפות בשובר' : 'Scan this QR code to view this voucher',
    useVoucher: isHebrew ? 'השתמש בשובר' : 'Use Voucher',
    using: isHebrew ? 'משתמש...' : 'Using...',
    share: isHebrew ? 'שתף' : 'Share',
    couponMarkedAsUsed: isHebrew ? 'השובר סומן כמשומש' : 'Voucher marked as used',
    failedToMarkAsUsed: isHebrew ? 'נכשל בסימון השובר כמשומש' : 'Failed to mark voucher as used',
    showOnMap: isHebrew ? 'הצג במפה' : 'Show on Map',
  };

  const businessIds = (voucher.businessIds || (voucher.businessId ? [voucher.businessId] : [])).filter(Boolean);
  const handleShowOnMap = () => {
    const url = businessIds.length > 0
      ? `/${locale}/services?businessId=${businessIds.join(',')}`
      : `/${locale}/services`;
    navigate(url);
  };

  useEffect(() => {
    setIsMounted(true);
    // Set voucher URL only on client side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      setVoucherUrl(`${window.location.origin}/${locale}/vouchers/${userVoucher.id}`);
    }
  }, [locale, userVoucher.id]);

  const handleUse = async () => {
    if (isUsingVoucher) return; // Prevent double submission

    setIsUsingVoucher(true);

    try {
      const result = await markVoucherAsUsed(userVoucher.id);
      if (result.success) {
        // Trigger confetti animation
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast.success(text.couponMarkedAsUsed);
        // Navigate back to vouchers page after a short delay
        setTimeout(() => {
          navigate(`/${locale}/vouchers`);
        }, 1500);
      } else {
        toast.error(text.failedToMarkAsUsed);
        setIsUsingVoucher(false); // Re-enable button on error
      }
    } catch (error) {
      toast.error(text.failedToMarkAsUsed);
      setIsUsingVoucher(false); // Re-enable button on error
    }
  };

  const handleShare = async () => {
    if (!isMounted || !voucherUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: voucher.name,
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
          {locale === 'he' ? (
            <ArrowRight className="h-4 w-4 me-2" />
          ) : (
            <ArrowLeft className="h-4 w-4 me-2" />
          )}
          {text.back}
        </Button>

        <Card className="overflow-hidden">
          <CardContent className="p-8">
            {/* Voucher Image */}
            {voucher.imageUrl && (
              <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                <img
                  src={voucher.imageUrl}
                  alt={voucher.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Voucher Info */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">{voucher.name}</h1>
              {voucher.description && (
                <p className="text-gray-600 mb-4">{voucher.description}</p>
              )}
              {userVoucher.status === 'used' && (
                <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-700 font-semibold">
                    {isHebrew ? 'שובר זה כבר נוצל' : 'This voucher has already been used'}
                  </p>
                  {userVoucher.usedAt && (
                    <p className="text-xs text-gray-600 mt-1">
                      {isHebrew ? 'נוצל בתאריך: ' : 'Used on: '}
                      {new Date(userVoucher.usedAt).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* QR Code Card - Only show if not used */}
            {userVoucher.status !== 'used' && (
              <div className="mb-8">
                <QRCodeCard
                  url={voucherUrl}
                  title={text.viewCoupon}
                  description={text.qrCodeDescription}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {userVoucher.status !== 'used' && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleUse}
                  className="flex-1"
                  disabled={isUsingVoucher}
                >
                  {isUsingVoucher ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2" />
                      {text.using}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 me-2" />
                      {text.useVoucher}
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
                className="w-full sm:flex-1"
                disabled={!isMounted || !voucherUrl}
              >
                <Share2 className="w-4 h-4 me-2" />
                {text.share}
              </Button>
            </div>

            {/* Show on Map - after Use / Share buttons */}
            <div className="mt-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleShowOnMap}
              >
                <MapPin className="w-5 h-5" />
                {text.showOnMap}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


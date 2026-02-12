'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Share, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { generateShareUrl } from '@/lib/utils/shop-url';

interface ShareMenuProps {
  coupon?: string;
}

const ShareMenu = ({ coupon = 'default' }: ShareMenuProps) => {
  const { t } = useTranslation('components.ShareButton');
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // For the "copy link" option.
  const handleCopyLink = async () => {
    // Build share URL with userid and callback if user is logged in
    const shareUrl = user
      ? generateShareUrl(user.uid, coupon, window.location.origin)
      : (typeof window !== 'undefined' ? window.location.href : '');
    const shareData = {
      title: t('title'),
      text: `${t('text')} ${shareUrl}`,
      url: shareUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
        toast.success(t('linkCopied'));
      }
      setMenuOpen(false);
    } catch (err) {
      // User cancelled share dialog or clipboard failed
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="relative">
      {/* Main share button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <Button
          size="lg"
          type="button"
          onClick={handleCopyLink}
          className="bg-primary fixed bottom-20 md:bottom-4 z-70 h-[60px] w-[60px] rounded-full p-0 hover:bg-[#ff6243]/90 ltr:right-4 md:ltr:right-6 rtl:left-4 md:rtl:left-6"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Share className="h-6 w-6" />}
        </Button>
      </motion.div>
    </div>
  );
};

export default ShareMenu;

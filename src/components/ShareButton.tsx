'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Share, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import toast from 'react-hot-toast';

const ShareMenu = () => {
  const { t } = useTranslation('components.ShareButton');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopyLink = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: t('title'), url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(t('linkCopied'));
      }
      setMenuOpen(false);
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="relative">
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

'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { addPointsToCategory } from '@/lib/firebase/database/points';

const POINTS_TO_AWARD = 20;

export default function ShopCallbackPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const called = useRef(false);

  const userid = searchParams.get('userid');

  useEffect(() => {
    if (!userid || called.current) return;
    called.current = true;

    const awardPoints = async () => {
      try {
        const success = await addPointsToCategory(
          { uid: userid },
          'share_visit',
          POINTS_TO_AWARD
        );

        if (success) {
          setStatus('success');
          // Trigger confetti
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
          setTimeout(() => {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.4, x: 0.3 } });
          }, 300);
          setTimeout(() => {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.4, x: 0.7 } });
          }, 600);
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    awardPoints();
  }, [userid]);

  if (!userid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">חסר פרמטר משתמש</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50 to-white">
      {status === 'loading' && (
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-gray-600">מזכים נקודות...</p>
        </div>
      )}

      {status === 'success' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0], y: [0, -10, 0] }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
          >
            <Gift className="h-12 w-12 text-primary" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-900"
          >
            +{POINTS_TO_AWARD} נקודות!
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 text-lg text-gray-600"
          >
            הנקודות זוכו בהצלחה
          </motion.p>
        </motion.div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <p className="text-lg text-red-500">שגיאה בזיכוי נקודות</p>
          <p className="mt-2 text-sm text-gray-500">אנא נסו שוב מאוחר יותר</p>
        </div>
      )}
    </div>
  );
}

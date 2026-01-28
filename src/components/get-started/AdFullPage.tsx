'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { getYouTubeVideoId } from '@/lib/utils/youtube';

const MIN_PLAY_SECONDS = 5;

const AdFullPage = ({
  type,
  time,
  content,
  youtubeUrl,
  onClose
}: {
  type: 'image' | 'video' | 'youtube';
  time: number;
  content: string;
  youtubeUrl?: string;
  onClose: () => void;
}) => {
  const [countdown, setCountdown] = useState(time);
  const [adClosed, setAdClosed] = useState(false);
  const [canDismiss, setCanDismiss] = useState(type === 'image');
  const [videoPlayedSeconds, setVideoPlayedSeconds] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeElapsedRef = useRef(0);

  const closeAd = useCallback(() => {
    document.body.style.overflow = 'visible';
    setAdClosed(true);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Countdown timer – only close when countdown reaches 0 AND user can dismiss
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // When countdown hits 0 and canDismiss, close
  useEffect(() => {
    if (countdown === 0 && canDismiss) {
      closeAd();
    }
  }, [countdown, canDismiss, closeAd]);

  // For video: track played time and allow dismiss after 5 seconds
  useEffect(() => {
    if (type !== 'video' || !videoRef.current) return;
    const video = videoRef.current;

    const onTimeUpdate = () => {
      const played = Math.floor(video.currentTime);
      setVideoPlayedSeconds(played);
      if (played >= MIN_PLAY_SECONDS) {
        setCanDismiss(true);
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [type]);

  // For YouTube: allow dismiss after 5 seconds from mount (autoplay starts in iframe)
  useEffect(() => {
    if (type !== 'youtube') return;
    const t = setInterval(() => {
      youtubeElapsedRef.current += 1;
      if (youtubeElapsedRef.current >= MIN_PLAY_SECONDS) {
        setCanDismiss(true);
        clearInterval(t);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [type]);

  // Autoplay native video (iPhone: muted + playsInline + play() when ready)
  const tryPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || type !== 'video') return;
    video.muted = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {});
    }
  }, [type]);

  useEffect(() => {
    if (type !== 'video' || !videoRef.current) return;
    const video = videoRef.current;

    tryPlay();
    video.addEventListener('loadeddata', tryPlay);
    video.addEventListener('canplay', tryPlay);
    video.addEventListener('playing', tryPlay);

    return () => {
      video.removeEventListener('loadeddata', tryPlay);
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('playing', tryPlay);
    };
  }, [type, content, tryPlay]);

  // Notify parent when ad is closed
  useEffect(() => {
    if (adClosed) {
      onClose();
    }
  }, [adClosed, onClose]);

  const isVideoType = type === 'video' || type === 'youtube';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] h-screen w-screen overflow-hidden bg-black ad-full-page"
        data-no-track
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {canDismiss && (
          <Button
            variant="ghost"
            className="mix-blend-difference absolute top-4 right-4 z-[10000] h-9 w-9 rounded-full hover:bg-white"
            onClick={closeAd}
            data-no-track
          >
            <X className="h-4 w-4 stroke-white mix-blend-difference" />
          </Button>
        )}

        <motion.div
          className="absolute top-4 left-4 z-[10000] flex h-9 w-9 items-center justify-center rounded-full text-center mix-blend-difference"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <p className="h-full w-full content-center text-xl text-white mix-blend-difference">
            {countdown}
          </p>
        </motion.div>

        {type === 'image' ? (
          content ? (
            <img
              className="h-full w-full object-contain"
              src={content}
              alt="advertisement"
            />
          ) : null
        ) : type === 'youtube' ? (
          youtubeUrl ? (
            <div className="absolute inset-0 flex h-full w-full items-center justify-center">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(youtubeUrl)}?autoplay=1&mute=1&controls=1&rel=0&enablejsapi=1&playsinline=1`}
                title="YouTube advertisement"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            </div>
          ) : null
        ) : type === 'video' ? (
          content ? (
            <video
              ref={videoRef}
              src={content}
              className="absolute inset-0 h-full w-full object-contain"
              autoPlay
              muted
              playsInline
              loop
              controls={false}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              // iOS: ensure inline and muted for autoplay
              {...({ webkitPlaysInline: true } as React.HTMLAttributes<HTMLVideoElement>)}
            />
          ) : null
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
};

export default AdFullPage;

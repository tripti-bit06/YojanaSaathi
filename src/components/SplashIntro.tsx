import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Language } from '../types';

const INTRO_SESSION_KEY = 'yojana_saathi_intro_seen_v1';

interface SplashIntroProps {
  lang: Language;
  onComplete: () => void;
}

/**
 * Once-per-session Skippable Curtain Splash (<= 1.4s total, transform & opacity only):
 * 1) Navy screen (#0A1931 -> #1A3D63)
 * 2) "Yojana Saathi" fades & rises gently
 * 3) Pink brush-stroke draws left-to-right under it (scaleX: 0 -> 1)
 * 4) Curtain slides smoothly upward (-100% translateY)
 */
export const SplashIntro: React.FC<SplashIntroProps> = ({ lang, onComplete }) => {
  const prefersReducedMotion = useReducedMotion();
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(INTRO_SESSION_KEY) !== '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (prefersReducedMotion || !showSplash) {
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, '1');
      } catch {
        // ignore storage errors
      }
      setShowSplash(false);
      onComplete();
      return;
    }

    // Trigger curtain lift at 0.92s so exit (0.42s) finishes at ~1.34s (< 1.4s cap)
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, '1');
      } catch {
        // ignore
      }
      setShowSplash(false);
    }, 920);

    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion, showSplash, onComplete]);

  const skipIntro = () => {
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, '1');
    } catch {
      // ignore
    }
    setShowSplash(false);
  };

  useEffect(() => {
    if (!showSplash) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        skipIntro();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showSplash]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {showSplash && (
        <motion.div
          key="yojana-saathi-splash"
          role="presentation"
          onClick={skipIntro}
          initial={{ y: '0%' }}
          exit={{
            y: '-100%',
            transition: { duration: 0.42, ease: [0.76, 0, 0.24, 1] },
          }}
          style={{
            background: 'linear-gradient(155deg, #0A1931 0%, #1A3D63 100%)',
            willChange: 'transform',
          }}
          className="fixed inset-0 z-[75] flex flex-col items-center justify-center px-6 cursor-pointer select-none"
        >
          <div className="relative flex flex-col items-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: 'transform, opacity' }}
              className="font-hero-title text-4xl sm:text-5xl md:text-6xl font-extrabold text-snow tracking-tight"
            >
              {lang === 'hi' ? 'योजना साथी' : 'Yojana Saathi'}
            </motion.p>

            {/* Pink Brush-Stroke Drawing Left-to-Right Under Brand Title */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                delay: 0.22,
                duration: 0.46,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                transformOrigin: 'left center',
                willChange: 'transform, opacity',
              }}
              className="mt-2 w-56 sm:w-72 h-4"
            >
              <svg
                viewBox="0 0 280 22"
                preserveAspectRatio="none"
                className="w-full h-full"
                aria-hidden="true"
              >
                <path
                  d="M4 12 C68 4, 178 4, 276 11 C279 14, 275 19, 268 19 C184 16, 76 17, 7 18 C2 17, 1 14, 4 12 Z"
                  fill="#E27A9B"
                />
                <path
                  d="M14 9 C88 4, 192 5, 266 10 C258 14, 180 14, 18 14 Z"
                  fill="#F9D3DC"
                  opacity="0.6"
                />
              </svg>
            </motion.div>
          </div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            transition={{ delay: 0.18, duration: 0.3 }}
            className="absolute bottom-7 text-xs font-medium text-mist"
          >
            {lang === 'hi' ? 'आगे बढ़ने के लिए कहीं भी क्लिक करें' : 'Click anywhere to skip'}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

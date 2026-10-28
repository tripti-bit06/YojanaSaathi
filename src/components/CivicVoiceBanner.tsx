import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Language } from '../types';
import { BrushHighlight } from './MotionPrimitives';

interface CivicVoiceBannerProps {
  lang: Language;
  onOpenExplainForm: () => void;
}

const HalftoneMegaphoneSVG: React.FC = () => (
  <svg viewBox="0 0 88 88" fill="none" className="w-16 h-16 sm:w-20 sm:h-20">
    <defs>
      <pattern id="halftoneDots1" width="6" height="6" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.2" fill="#4A7FA7" opacity="0.45" />
      </pattern>
    </defs>
    <path d="M68 20 L78 13 M72 34 L84 32 M69 48 L80 54" stroke="#F4C873" strokeWidth="3" strokeLinecap="round" />
    <circle cx="81" cy="22" r="3" fill="#E27A9B" />
    <circle cx="76" cy="60" r="2.5" fill="#E27A9B" />
    <path
      d="M18 36 L58 18 V58 L18 44 Z"
      fill="#F6FAFD"
      stroke="#1A3D63"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M18 36 L58 18 V58 L18 44 Z" fill="url(#halftoneDots1)" />
    <rect x="10" y="34" width="9" height="12" rx="3" fill="#1A3D63" />
    <path d="M24 46 L29 64 H20 L17 45" fill="#E27A9B" stroke="#1A3D63" strokeWidth="2.5" strokeLinejoin="round" />
    <ellipse cx="58" cy="38" rx="4.5" ry="20" fill="#B3CFE5" stroke="#1A3D63" strokeWidth="2.8" />
  </svg>
);

const HalftoneGavelSVG: React.FC = () => (
  <svg viewBox="0 0 88 88" fill="none" className="w-14 h-14 sm:w-16 sm:h-16">
    <defs>
      <pattern id="halftoneDots2" width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.1" fill="#1A3D63" opacity="0.35" />
      </pattern>
    </defs>
    <path d="M16 58 L8 52 M24 54 L20 44 M34 55 L38 46" stroke="#F4C873" strokeWidth="2.8" strokeLinecap="round" />
    <circle cx="13" cy="44" r="2.8" fill="#E27A9B" />
    <rect x="12" y="64" width="38" height="9" rx="4" fill="#4A7FA7" stroke="#F6FAFD" strokeWidth="2" />
    <path d="M42 40 L72 68" stroke="#F6FAFD" strokeWidth="5.5" strokeLinecap="round" />
    <g transform="rotate(-35 38 34)">
      <rect x="20" y="22" width="34" height="18" rx="5" fill="#F6FAFD" stroke="#1A3D63" strokeWidth="2.8" />
      <rect x="20" y="22" width="34" height="18" rx="5" fill="url(#halftoneDots2)" />
    </g>
  </svg>
);

const HalftoneScalesSVG: React.FC = () => (
  <svg viewBox="0 0 88 88" fill="none" className="w-14 h-14 sm:w-16 sm:h-16">
    <path d="M44 8 L44 15 M35 12 L39 17 M53 12 L49 17" stroke="#F4C873" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M44 20 V72 M28 72 H60" stroke="#F6FAFD" strokeWidth="3" strokeLinecap="round" />
    <path d="M16 30 H72" stroke="#B3CFE5" strokeWidth="3" strokeLinecap="round" />
    <path d="M18 30 L11 50 H25 L18 30 Z" stroke="#F6FAFD" strokeWidth="2" strokeLinejoin="round" />
    <path d="M9 50 C9 56, 27 56, 27 50 Z" fill="#E27A9B" />
    <path d="M70 30 L63 50 H77 L70 30 Z" stroke="#F6FAFD" strokeWidth="2" strokeLinejoin="round" />
    <path d="M61 50 C61 56, 79 56, 79 50 Z" fill="#F4C873" />
  </svg>
);

export const CivicVoiceBanner: React.FC<CivicVoiceBannerProps> = ({
  lang,
  onOpenExplainForm,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="civic-voice-poster rounded-[28px] relative overflow-hidden p-6 sm:p-10 shadow-[0_22px_50px_-16px_rgba(10,25,49,0.28)]">
      <div aria-hidden="true" className="civic-halftone-overlay absolute inset-0 pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-4 flex lg:flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-5">
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [-7, 7, -7] }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 7, repeat: Infinity, ease: 'easeInOut' }
              }
              style={{ willChange: 'transform' }}
            >
              <HalftoneMegaphoneSVG />
            </motion.div>

            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [7, -7, 7] }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 7.5, repeat: Infinity, ease: 'easeInOut' }
              }
              style={{ willChange: 'transform' }}
            >
              <HalftoneGavelSVG />
            </motion.div>

            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [-6, 8, -6] }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 6.8, repeat: Infinity, ease: 'easeInOut' }
              }
              style={{ willChange: 'transform' }}
            >
              <HalftoneScalesSVG />
            </motion.div>
          </div>

          <p className="kicker-label hidden lg:block text-xs text-mist/90 text-center">
            {lang === 'hi'
              ? 'नागरिक अधिकार एवं आधिकारिक शिकायत पोर्टल'
              : 'CITIZEN RIGHTS & OFFICIAL GRIEVANCE REDRESSAL'}
          </p>
        </div>

        {/* Clean 24px Snow Card Inside Civic Rights Section */}
        <div className="lg:col-span-8">
          <div className="bg-snow/95 backdrop-blur-md border border-white rounded-[24px] px-6 py-7 sm:px-9 sm:py-8 space-y-4 shadow-[0_14px_32px_rgba(10,25,49,0.2)]">
            <p className="kicker-label text-xs text-steel">
              {lang === 'hi'
                ? 'जन शिकायत एवं पारदर्शिता सहायता'
                : 'PUBLIC ACCOUNTABILITY · ZERO MIDDLEMEN'}
            </p>

            <h2 className="font-card-title text-2xl sm:text-3xl font-bold text-ink leading-tight">
              {lang === 'hi' ? (
                <>
                  अपनी <BrushHighlight color="rose">आवाज़</BrushHighlight> उठाएं — अधिकार जानें
                </>
              ) : (
                <>
                  Raise Your <BrushHighlight color="rose">Voice</BrushHighlight>, Know Your Rights
                </>
              )}
            </h2>

            <p className="text-sm sm:text-base text-ink/80 leading-relaxed max-w-2xl">
              {lang === 'hi'
                ? 'यदि पात्र होने के बावजूद किसी योजना का लाभ रुक गया है या सरकारी नोटिस समझ नहीं आ रहा है, तो भारत सरकार के आधिकारिक CPGRAMS पोर्टल पर निःशुल्क शिकायत दर्ज करें या कठिन फॉर्म को सरल शब्दों में समझें।'
                : 'Facing an unfair delay on an eligible scholarship or welfare claim, or stuck on a confusing rejection notice? File an official grievance directly on CPGRAMS or decode complex government clauses in plain words.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <a
                href="https://pgportal.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-snow bg-navy hover:bg-ink rounded-2xl transition-colors whitespace-nowrap shrink-0"
              >
                <span>
                  {lang === 'hi'
                    ? 'CPGRAMS पोर्टल खोलें (pgportal.gov.in)'
                    : 'Official Grievance Portal (CPGRAMS)'}
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onOpenExplainForm}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-navy bg-mist/45 hover:bg-mist/75 rounded-2xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>
                  {lang === 'hi' ? 'नोटिस या फॉर्म समझें' : 'Decode Official Notice / Form'}
                </span>
                <ArrowRight className="w-4 h-4 text-steel" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

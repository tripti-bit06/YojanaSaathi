import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  ArrowRight,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { EXAMPLE_CHIPS, UI_COPY } from '../lib/i18n';
import { Language } from '../types';
import { BooksStack } from './BooksStack';
import {
  BrushHighlight,
  HeroDriftingPetals,
  MagneticButton,
  TiltCard,
} from './MotionPrimitives';
import { CivicVoiceBanner } from './CivicVoiceBanner';

interface HomeDiscoveryProps {
  lang: Language;
  introReady: boolean;
  descriptionText: string;
  onChangeDescription: (val: string) => void;
  onExtractSubmit: () => void;
  onManualEntry: () => void;
  onOpenExplainForm: () => void;
  isExtracting: boolean;
  extractError: string | null;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export const HomeDiscovery: React.FC<HomeDiscoveryProps> = ({
  lang,
  introReady,
  descriptionText,
  onChangeDescription,
  onExtractSubmit,
  onManualEntry,
  onOpenExplainForm,
  isExtracting,
  extractError,
}) => {
  const copy = UI_COPY[lang];
  const prefersReducedMotion = useReducedMotion();
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseTextRef = useRef<string>('');

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore cleanup stop errors
        }
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    setSpeechError(null);

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setSpeechError(copy.micUnsupported);
      return;
    }

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      baseTextRef.current = descriptionText ? `${descriptionText.trim()} ` : '';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        onChangeDescription(`${baseTextRef.current}${transcript}`);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(
            lang === 'hi'
              ? 'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र में माइक अनुमति दें या टाइप करें।'
              : 'Microphone access was blocked. Please allow microphone permission or type your details.'
          );
        } else if (event.error !== 'aborted') {
          setSpeechError(
            lang === 'hi'
              ? 'आवाज़ सुनने में समस्या आई। कृपया पुनः प्रयास करें या नीचे टाइप करें।'
              : 'Could not capture audio clearly. Please tap Speak again or type your details.'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      setSpeechError(copy.micUnsupported);
      setIsListening(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExtractSubmit();
  };

  // Word-by-word masked stagger (0.06s per word) + left-to-right pink brush draw on highlighted word
  const headlineTokens: Array<{ word: string; highlighted?: boolean }> =
    lang === 'hi'
      ? [
          { word: 'अपने' },
          { word: 'लिए' },
          { word: 'सही', highlighted: true },
          { word: 'सरकारी' },
          { word: 'योजनाएं' },
          { word: 'और' },
          { word: 'छात्रवृत्तियां' },
          { word: 'खोजें।' },
        ]
      : [
          { word: 'Find' },
          { word: 'government' },
          { word: 'schemes' },
          { word: 'you' },
          { word: 'actually' },
          { word: 'qualify', highlighted: true },
          { word: 'for.' },
        ];

  const animateHero = introReady && !prefersReducedMotion;

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section with Falling Pink Petals + Masked Word Stagger + Floating Scholarly Books */}
      <section className="relative pt-1 sm:pt-3">
        <HeroDriftingPetals />

        <div className="relative z-10 max-w-4xl">
          {/* 1. Eyebrow Text Fades In */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={
              prefersReducedMotion
                ? undefined
                : introReady
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 8 }
            }
            transition={{ duration: 0.36, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform, opacity' }}
            className="kicker-label text-xs text-steel"
          >
            {copy.heroKicker}
          </motion.p>

          {/* 2. Headline Words Rise Up One by One Behind a Mask (0.06s Stagger) + Pink Brush Draws Left-to-Right */}
          <h1
            key={`hero-h1-${lang}-${introReady ? 'ready' : 'wait'}`}
            className="font-hero-title mt-3 text-[2.15rem] sm:text-[2.75rem] lg:text-[3.45rem] xl:text-[3.85rem] font-extrabold text-ink leading-[1.12]"
            style={{ textWrap: 'balance' }}
          >
            {headlineTokens.map((token, idx) => {
              const wordDelay = 0.08 + idx * 0.06;
              return (
                <React.Fragment key={`${token.word}-${idx}`}>
                  <span className="inline-block overflow-hidden align-bottom pb-1 -mb-1">
                    <motion.span
                      className="inline-block"
                      initial={prefersReducedMotion ? false : { y: '110%', opacity: 0 }}
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : introReady
                            ? { y: '0%', opacity: 1 }
                            : { y: '110%', opacity: 0 }
                      }
                      transition={{
                        duration: 0.44,
                        delay: wordDelay,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{ willChange: 'transform, opacity' }}
                    >
                      {token.highlighted ? (
                        <BrushHighlight
                          color="rose"
                          animateDraw={animateHero}
                          drawDelay={wordDelay + 0.14}
                        >
                          {token.word}
                        </BrushHighlight>
                      ) : (
                        token.word
                      )}
                    </motion.span>
                  </span>
                  {idx < headlineTokens.length - 1 ? ' ' : ''}
                </React.Fragment>
              );
            })}
          </h1>

          {/* 3. Subtitle Fades In */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={
              prefersReducedMotion
                ? undefined
                : introReady
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 10 }
            }
            transition={{ duration: 0.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform, opacity' }}
            className="mt-4 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl"
          >
            {copy.heroSubtitle}
          </motion.p>
        </div>

        {/* 4. Input Card Slides Up with Slight Scale + 5. Books Spring In From the Right */}
        <div className="relative z-10 mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 22, scale: 0.975 }}
            animate={
              prefersReducedMotion
                ? undefined
                : introReady
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 22, scale: 0.975 }
            }
            transition={{ duration: 0.48, delay: 0.56, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform, opacity' }}
            className="lg:col-span-8 glass-panel rounded-[28px] p-6 sm:p-8 transition-shadow duration-300 focus-within:border-steel/80 focus-within:shadow-[0_0_0_4px_rgba(74,127,167,0.18),0_24px_56px_-16px_rgba(10,25,49,0.14)]"
          >
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label
                  htmlFor="citizen-description"
                  className="font-card-title text-base sm:text-lg font-bold text-navy"
                >
                  {copy.textareaLabel}
                </label>

                {/* Voice Microphone Button (>= 44px touch target) */}
                <motion.button
                  type="button"
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                  onClick={toggleVoiceInput}
                  className={`relative min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-2xl border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isListening
                      ? 'bg-blush text-plum border-rose shadow-[0_0_20px_rgba(226,122,155,0.35)]'
                      : 'bg-white/85 text-navy border-mist hover:bg-mist/40 shadow-2xs'
                  }`}
                >
                  {!prefersReducedMotion && (
                    <motion.span
                      aria-hidden="true"
                      className={`absolute inset-0 rounded-2xl pointer-events-none ${
                        isListening ? 'border-2 border-plum' : 'border border-steel/40'
                      }`}
                      animate={{
                        scale: isListening ? [1, 1.1, 1] : [1, 1.04, 1],
                        opacity: isListening ? [0.8, 0, 0.8] : [0.5, 0.1, 0.5],
                      }}
                      transition={{
                        duration: isListening ? 1.4 : 2.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{ willChange: 'transform, opacity' }}
                    />
                  )}

                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 text-plum" />
                      <span>{copy.micListening}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-steel" />
                      <span>
                        {copy.micStart} ({lang === 'hi' ? 'हिंदी' : 'EN / HI'})
                      </span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Normal sentence-case textarea */}
              <textarea
                id="citizen-description"
                rows={4}
                value={descriptionText}
                onChange={(e) => onChangeDescription(e.target.value)}
                placeholder={copy.textareaPlaceholder}
                style={{ textTransform: 'none' }}
                className="w-full p-4 sm:p-5 text-base normal-case bg-snow/90 border border-mist rounded-[20px] text-ink placeholder:text-steel/70 focus:outline-none focus:bg-white focus:border-steel focus:shadow-[0_0_20px_rgba(74,127,167,0.14)] leading-relaxed resize-y transition-all"
              />

              {/* Human-Readable Error Alert + Retry Action */}
              {(speechError || extractError) && (
                <div className="p-4 bg-blush/65 border border-rose/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-ink font-medium">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-plum shrink-0 mt-0.5" />
                    <span>{extractError || speechError}</span>
                  </div>
                  {extractError && (
                    <button
                      type="button"
                      onClick={onExtractSubmit}
                      className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-snow bg-navy hover:bg-ink rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Obvious Single Primary CTA + Calm Secondary Manual Link */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <MagneticButton
                  type="submit"
                  disabled={isExtracting || descriptionText.trim().length < 3}
                  className="btn-shimmer inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm sm:text-base font-bold text-snow bg-navy hover:bg-ink rounded-2xl shadow-[0_14px_28px_-8px_rgba(26,61,99,0.42)] disabled:opacity-45 disabled:cursor-not-allowed transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isExtracting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>{copy.extractingBtn}</span>
                    </>
                  ) : (
                    <>
                      <span>{copy.extractBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </MagneticButton>

                <button
                  type="button"
                  onClick={onManualEntry}
                  className="min-h-[44px] inline-flex items-center px-3 py-2 text-xs sm:text-sm font-semibold text-steel hover:text-navy underline underline-offset-4 transition-colors cursor-pointer"
                >
                  {copy.manualEntryBtn}
                </button>
              </div>
            </form>

            {/* Quick Example Chips */}
            <div className="mt-7 pt-5 border-t border-mist/55">
              <p className="kicker-label text-xs text-steel mb-3">{copy.examplesHeading}</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => onChangeDescription(chip.text)}
                    className="min-h-[44px] px-4 py-2 text-xs font-semibold text-navy bg-mist/35 border border-white/85 rounded-2xl hover:bg-mist/65 hover:border-steel/45 transition-colors cursor-pointer text-left"
                  >
                    {lang === 'hi' ? chip.label_hi : chip.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 5. Scholarly Books Stack Springing In From the Right + How-It-Works Card */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: 44, scale: 0.95 }}
            animate={
              prefersReducedMotion
                ? undefined
                : introReady
                  ? { opacity: 1, x: 0, scale: 1 }
                  : { opacity: 0, x: 44, scale: 0.95 }
            }
            transition={{
              type: 'spring',
              stiffness: 175,
              damping: 20,
              delay: 0.6,
            }}
            style={{ willChange: 'transform, opacity' }}
            className="lg:col-span-4 flex flex-col items-center justify-center relative"
          >
            <div className="w-60 h-56 sm:w-72 sm:h-64 lg:w-80 lg:h-72 flex items-center justify-center">
              <BooksStack className="w-full h-full" />
            </div>

            <div className="w-full glass-panel rounded-[28px] p-5 sm:p-6 -mt-2 relative z-10 space-y-2.5">
              <h2 className="font-card-title text-base font-bold text-navy">
                {copy.howItWorksTitle}
              </h2>
              <div className="space-y-1.5 text-xs sm:text-sm text-ink/80 leading-relaxed">
                <p>{copy.howStep1}</p>
                <p>{copy.howStep2}</p>
                <p>{copy.howStep3}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Clean 3-Card Trust Highlights (28px unified glass cards) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TiltCard className="glass-panel card-tint-blue rounded-[28px] p-6 sm:p-7" maxTilt={4}>
          <p className="kicker-label text-xs text-steel">
            {lang === 'hi' ? 'केंद्रीय योजनाएं व छात्रवृत्तियां' : 'Curated Central Schemes'}
          </p>
          <p className="font-card-title mt-2 text-3xl font-bold text-navy tabular-nums">12</p>
          <p className="mt-2 text-xs sm:text-sm text-ink/75 leading-relaxed">
            {lang === 'hi'
              ? 'किसान, विद्यार्थी, बालिका, कामगार और दिव्यांगजन कल्याण योजनाएं'
              : 'PM-KISAN, Ayushman Bharat, PMAY, Sukanya Samriddhi & National Scholarships'}
          </p>
        </TiltCard>

        <TiltCard className="glass-panel card-tint-blue rounded-[28px] p-6 sm:p-7" maxTilt={4}>
          <p className="kicker-label text-xs text-steel">
            {lang === 'hi' ? 'पात्रता निर्णय प्रक्रिया' : 'Deterministic Rule Engine'}
          </p>
          <p className="font-card-title mt-2 text-3xl font-bold text-navy tabular-nums">
            100% Rule-Based
          </p>
          <p className="mt-2 text-xs sm:text-sm text-ink/75 leading-relaxed">
            {lang === 'hi'
              ? 'AI कभी पात्रता का फैसला नहीं करता — स्पष्ट नियम कारण सहित दिखते हैं'
              : 'Pure TypeScript checks exact age, income, category & occupation rules'}
          </p>
        </TiltCard>

        <TiltCard className="glass-panel card-tint-education rounded-[28px] p-6 sm:p-7" maxTilt={4}>
          <p className="kicker-label text-xs text-steel">
            {lang === 'hi' ? 'द्विभाषी एवं फॉर्म सहायता' : 'Bilingual & Form Decoder'}
          </p>
          <p className="font-card-title mt-2 text-3xl font-bold text-navy">
            हिंदी · English
          </p>
          <p className="mt-2 text-xs sm:text-sm text-ink/75 leading-relaxed">
            {lang === 'hi'
              ? 'वॉइस इनपुट, सरल योजना सारांश और कठिन सरकारी फॉर्म की व्याख्या'
              : 'Voice dictation, plain-language scheme simplifier & field-by-field form guide'}
          </p>
        </TiltCard>
      </section>

      {/* Civic Rights Banner */}
      <CivicVoiceBanner lang={lang} onOpenExplainForm={onOpenExplainForm} />
    </div>
  );
};

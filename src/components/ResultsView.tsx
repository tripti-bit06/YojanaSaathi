import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Search,
  SlidersHorizontal,
  FileCheck2,
  Sprout,
  HeartPulse,
  Home,
  ShieldCheck,
  Hammer,
  HeartHandshake,
  GraduationCap,
  Landmark,
  RotateCcw,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Language,
  MatchResult,
  SavedApplication,
  Scheme,
  SimplifiedSchemeExplanation,
} from '../types';
import { UI_COPY } from '../lib/i18n';
import { toHumanErrorMessage } from '../lib/friendlyError';
import { FriendlyEmptyState, TiltCard } from './MotionPrimitives';

interface ResultsViewProps {
  mode: 'matched' | 'all';
  lang: Language;
  matches: MatchResult[];
  allSchemes: Scheme[];
  savedApps: SavedApplication[];
  onEditProfile: () => void;
  onSelectScheme: (schemeId: string) => void;
  onToggleSaveScheme: (schemeId: string) => void;
}

export type CardVisualTheme = 'scholarship' | 'civic' | 'blue-glass';

const MOTIVATIONAL_QUOTES: Array<{ en: string; hi: string }> = [
  { en: 'Consistency is the key.', hi: 'निरंतर प्रयास ही सफलता की कुंजी है।' },
  { en: 'Trust the process.', hi: 'अपनी मेहनत और प्रक्रिया पर भरोसा रखें।' },
  { en: 'Small daily effort compounds into freedom.', hi: 'हर दिन का छोटा कदम बड़े सपने पूरे करता है।' },
  { en: 'Your ambition belongs in every classroom.', hi: 'आपकी उड़ान हर बड़े संस्थान की हक़दार है।' },
  { en: 'Discipline turns dreams into degrees.', hi: 'अनुशासन ही सपनों को डिग्री में बदलता है।' },
  { en: 'Keep going — every chapter counts.', hi: 'आगे बढ़ते रहें — हर अध्याय मायने रखता है।' },
  { en: 'One form today, years of support ahead.', hi: 'आज का एक सही आवेदन, वर्षों का संबल।' },
  { en: 'Knowledge is yours to claim.', hi: 'शिक्षा आपका अधिकार और आपकी शक्ति है।' },
];

export function resolveCardTheme(scheme: Scheme): CardVisualTheme {
  const catLower = `${scheme.category} ${scheme.id} ${scheme.name}`.toLowerCase();
  if (
    catLower.includes('scholarship') ||
    catLower.includes('education') ||
    catLower.includes('student')
  ) {
    return 'scholarship';
  }
  if (
    catLower.includes('clean') ||
    catLower.includes('sanitation') ||
    catLower.includes('swachh') ||
    catLower.includes('civic') ||
    catLower.includes('environment') ||
    catLower.includes('urban')
  ) {
    return 'civic';
  }
  return 'blue-glass';
}

export function getCategoryChipMeta(scheme: Scheme, theme: CardVisualTheme) {
  if (theme === 'scholarship') {
    return {
      chipClass: 'bg-[#F9D3DC]/65 text-[#A23B6B] border border-[#E27A9B]/35',
      tintClass: 'card-tint-education',
      icon: <GraduationCap className="w-3.5 h-3.5 text-[#A23B6B] shrink-0" />,
    };
  }
  if (theme === 'civic') {
    return {
      chipClass: 'bg-[#F4C873]/28 text-[#855306] border border-[#F4C873]/60',
      tintClass: 'card-tint-civic',
      icon: <Landmark className="w-3.5 h-3.5 text-[#9A6207] shrink-0" />,
    };
  }

  const catLower = scheme.category.toLowerCase();
  let icon = <ShieldCheck className="w-3.5 h-3.5 text-steel shrink-0" />;
  if (catLower.includes('agriculture') || catLower.includes('rural')) {
    icon = <Sprout className="w-3.5 h-3.5 text-steel shrink-0" />;
  } else if (catLower.includes('health')) {
    icon = <HeartPulse className="w-3.5 h-3.5 text-steel shrink-0" />;
  } else if (catLower.includes('housing')) {
    icon = <Home className="w-3.5 h-3.5 text-steel shrink-0" />;
  } else if (catLower.includes('women') || catLower.includes('child')) {
    icon = <HeartHandshake className="w-3.5 h-3.5 text-steel shrink-0" />;
  } else if (catLower.includes('skill') || catLower.includes('craft')) {
    icon = <Hammer className="w-3.5 h-3.5 text-steel shrink-0" />;
  }

  return {
    chipClass: 'bg-[#B3CFE5]/38 text-[#1A3D63] border border-[#4A7FA7]/28',
    tintClass: 'card-tint-blue',
    icon,
  };
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  mode,
  lang,
  matches,
  allSchemes,
  savedApps,
  onEditProfile,
  onSelectScheme,
  onToggleSaveScheme,
}) => {
  const copy = UI_COPY[lang];
  const prefersReducedMotion = useReducedMotion();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [tabFilter, setTabFilter] = useState<'eligible' | 'needs_verification' | 'all'>('eligible');

  const [explanations, setExplanations] = useState<
    Record<string, { lang: Language; data: SimplifiedSchemeExplanation }>
  >({});
  const [loadingExplainId, setLoadingExplainId] = useState<string | null>(null);
  const [explainErrorId, setExplainErrorId] = useState<Record<string, string>>({});

  const eligibleMatches = matches.filter((m) => m.matchType === 'eligible');
  const verifyMatches = matches.filter((m) => m.matchType === 'needs_verification');

  const categories = Array.from(new Set(allSchemes.map((s) => s.category)));

  const handleExplainScheme = async (scheme: Scheme, matchReason?: string) => {
    setLoadingExplainId(scheme.id);
    setExplainErrorId((prev) => ({ ...prev, [scheme.id]: '' }));

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'scheme',
          targetLang: lang,
          schemeData: {
            name: lang === 'hi' ? scheme.name_hi : scheme.name,
            description: lang === 'hi' ? scheme.description_hi : scheme.description,
            benefits: lang === 'hi' ? scheme.benefits_hi : scheme.benefits,
            matchReason,
            steps: lang === 'hi' ? scheme.steps_hi : scheme.steps,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.explanation) {
        throw new Error(json.error || 'Could not simplify right now.');
      }
      setExplanations((prev) => ({
        ...prev,
        [scheme.id]: { lang, data: json.explanation },
      }));
    } catch (err) {
      setExplainErrorId((prev) => ({
        ...prev,
        [scheme.id]: toHumanErrorMessage(err, lang),
      }));
    } finally {
      setLoadingExplainId(null);
    }
  };

  const isSaved = (schemeId: string) => savedApps.some((a) => a.schemeId === schemeId);

  const displayedItems: Array<{ scheme: Scheme; match?: MatchResult }> =
    mode === 'matched'
      ? (tabFilter === 'eligible'
          ? eligibleMatches
          : tabFilter === 'needs_verification'
            ? verifyMatches
            : matches
        )
          .filter((m) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
              m.scheme.name.toLowerCase().includes(q) ||
              m.scheme.name_hi.toLowerCase().includes(q) ||
              m.scheme.category.toLowerCase().includes(q) ||
              m.scheme.benefits.toLowerCase().includes(q)
            );
          })
          .map((m) => ({ scheme: m.scheme, match: m }))
      : allSchemes
          .filter((s) => {
            const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
            if (!matchesCat) return false;
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
              s.name.toLowerCase().includes(q) ||
              s.name_hi.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q) ||
              s.category.toLowerCase().includes(q)
            );
          })
          .map((s) => ({
            scheme: s,
            match: matches.find((m) => m.scheme.id === s.id),
          }));

  const isShowingEmptyEligibleWithVerifyAvailable =
    mode === 'matched' && tabFilter === 'eligible' && verifyMatches.length > 0;

  return (
    <div className="space-y-8">
      {/* Unified 28px Glass Header & Filter Controls */}
      <div className="glass-panel rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="kicker-label text-xs text-steel">
              {mode === 'matched'
                ? lang === 'hi'
                  ? 'चरण 3 / 3 · नियम-आधारित पात्रता परिणाम'
                  : 'Step 3 of 3 · Rule-Based Eligibility Matches'
                : lang === 'hi'
                  ? 'केंद्रीय योजना निर्देशिका · 12 योजनाएं'
                  : 'Central Government Scheme Directory · 12 Curated Schemes'}
            </p>
            <h1 className="font-hero-title mt-1.5 text-3xl sm:text-4xl font-extrabold text-ink">
              {mode === 'matched' ? copy.resultsTitle : copy.allSchemesTitle}
            </h1>
          </div>

          <button
            type="button"
            onClick={onEditProfile}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-navy bg-mist/40 border border-white/85 rounded-2xl hover:bg-mist/70 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-steel" />
            <span>{copy.editProfileBtn}</span>
          </button>
        </div>

        {/* Search & Segmented Category / Match Tabs */}
        <div className="mt-6 pt-5 border-t border-mist/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {mode === 'matched' ? (
            <div className="inline-flex flex-wrap items-center gap-1 p-1.5 bg-mist/40 border border-white/80 rounded-2xl self-start">
              <button
                type="button"
                onClick={() => setTabFilter('eligible')}
                className={`min-h-[40px] px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer tabular-nums ${
                  tabFilter === 'eligible'
                    ? 'bg-navy text-snow shadow-xs'
                    : 'text-navy/75 hover:text-ink'
                }`}
              >
                {copy.eligibleCountLabel} ({eligibleMatches.length})
              </button>
              <button
                type="button"
                onClick={() => setTabFilter('needs_verification')}
                className={`min-h-[40px] px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer tabular-nums ${
                  tabFilter === 'needs_verification'
                    ? 'bg-navy text-snow shadow-xs'
                    : 'text-navy/75 hover:text-ink'
                }`}
              >
                {copy.verifyCountLabel} ({verifyMatches.length})
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-2xl transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-navy text-snow shadow-xs'
                    : 'bg-mist/35 text-navy hover:bg-mist/65'
                }`}
              >
                {lang === 'hi' ? 'सभी श्रेणियां (12)' : 'All Categories (12)'}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-2xl transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-navy text-snow shadow-xs'
                      : 'bg-mist/35 text-navy hover:bg-mist/65'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-steel absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'hi' ? 'योजना खोजें...' : 'Search schemes...'}
              className="min-h-[44px] w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-snow/90 border border-mist rounded-2xl text-ink placeholder:text-steel/70 focus:outline-none focus:bg-white focus:border-steel"
            />
          </div>
        </div>
      </div>

      {/* Friendly Illustrated Empty State */}
      {displayedItems.length === 0 ? (
        <FriendlyEmptyState
          title={
            isShowingEmptyEligibleWithVerifyAvailable
              ? lang === 'hi'
                ? 'संभावित योजनाएं दूसरे टैब में उपलब्ध हैं'
                : `${verifyMatches.length} Potential Schemes Need Info Check`
              : lang === 'hi'
                ? 'इस फ़िल्टर के लिए कोई योजना नहीं मिली'
                : 'No Schemes Matched Your Filter'
          }
          description={
            isShowingEmptyEligibleWithVerifyAvailable
              ? lang === 'hi'
                ? 'कुछ जानकारी अधूरी होने के कारण संभावित योजनाएं "अधूरी जानकारी जांचें" टैब में रखी गई हैं।'
                : 'Some profile fields were left blank, so potential matches are waiting in the verification tab.'
              : lang === 'hi'
                ? 'अधिक योजनाएं देखने के लिए अपनी प्रोफ़ाइल अपडेट करें या फ़िल्टर बदलें।'
                : 'Try adjusting your search keywords or updating your citizen profile details.'
          }
          actionLabel={
            isShowingEmptyEligibleWithVerifyAvailable
              ? `${copy.verifyCountLabel} (${verifyMatches.length})`
              : searchQuery
                ? lang === 'hi'
                  ? 'खोज साफ़ करें'
                  : 'Clear Search Filter'
                : copy.editProfileBtn
          }
          onAction={() => {
            if (isShowingEmptyEligibleWithVerifyAvailable) {
              setTabFilter('needs_verification');
            } else if (searchQuery) {
              setSearchQuery('');
            } else {
              onEditProfile();
            }
          }}
        />
      ) : (
        <div className="space-y-6">
          {displayedItems.map(({ scheme, match }, idx) => {
            const saved = isSaved(scheme.id);
            const activeExplain =
              explanations[scheme.id]?.lang === lang ? explanations[scheme.id].data : null;
            const docs = lang === 'hi' ? scheme.documents_hi : scheme.documents;
            const steps = lang === 'hi' ? scheme.steps_hi : scheme.steps;

            const theme = resolveCardTheme(scheme);
            const chipMeta = getCategoryChipMeta(scheme, theme);
            const quoteObj = MOTIVATIONAL_QUOTES[idx % MOTIVATIONAL_QUOTES.length];

            return (
              <motion.div
                key={scheme.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.36,
                  delay: prefersReducedMotion ? 0 : Math.min(idx * 0.06, 0.42),
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <TiltCard
                  className={`glass-panel ${chipMeta.tintClass} rounded-[28px] p-6 sm:p-8`}
                  maxTilt={5}
                  cursorLabel={lang === 'hi' ? 'खोलें' : 'Open'}
                >
                  <article className="relative z-10 space-y-5">
                    <div className="space-y-2.5">
                      {/* Small Colored Category Badge/Icon Chip + Ministry Metadata */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold ${chipMeta.chipClass}`}
                        >
                          {chipMeta.icon}
                          <span>{lang === 'hi' ? scheme.category_hi : scheme.category}</span>
                        </span>
                        <span className="text-steel/80 font-medium">
                          {lang === 'hi' ? scheme.ministry_hi : scheme.ministry}
                        </span>
                      </div>

                      {/* Unified Fraunces Title across ALL Scheme Cards */}
                      <h2 className="font-card-title text-2xl sm:text-3xl font-bold text-navy leading-tight break-words">
                        {lang === 'hi' ? scheme.name_hi : scheme.name}
                      </h2>

                      {/* One Short Motivational Line ONLY on Education Cards */}
                      {theme === 'scholarship' && (
                        <p className="text-xs sm:text-sm font-semibold italic text-plum">
                          “{lang === 'hi' ? quoteObj.hi : quoteObj.en}”
                        </p>
                      )}

                      {/* Unified DM Sans Body Copy */}
                      <p className="text-sm sm:text-base text-ink/80 leading-relaxed max-w-3xl">
                        {lang === 'hi' ? scheme.description_hi : scheme.description}
                      </p>
                    </div>

                    {/* Deterministic Rule Match Reason */}
                    {match && (
                      <div
                        className={`p-4 rounded-2xl border flex items-start gap-3 ${
                          match.matchType === 'eligible'
                            ? 'bg-mist/28 border-steel/25 text-ink'
                            : 'bg-[#FBF0D9]/80 border-[#F4C873] text-[#5C2D0C]'
                        }`}
                      >
                        {match.matchType === 'eligible' ? (
                          <CheckCircle2 className="w-4 h-4 text-navy shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                        )}
                        <div className="text-xs sm:text-sm leading-relaxed">
                          <span className="font-bold">{copy.whyEligibleLabel}: </span>
                          <span className="tabular-nums">
                            {lang === 'hi' ? match.summaryReason_hi : match.summaryReason}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Benefits, Documents & Steps */}
                    <div className="pt-5 border-t border-mist/55 grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <h3 className="kicker-label text-xs text-steel mb-2">
                          {copy.benefitsLabel}
                        </h3>
                        <p className="text-sm font-bold leading-relaxed tabular-nums text-ink">
                          {lang === 'hi' ? scheme.benefits_hi : scheme.benefits}
                        </p>
                        <p className="mt-2.5 text-xs leading-relaxed text-ink/70">
                          {lang === 'hi' ? scheme.verification_note_hi : scheme.verification_note}
                        </p>
                      </div>

                      <div>
                        <h3 className="kicker-label text-xs text-steel mb-2">
                          {copy.documentsLabel} ({docs.length})
                        </h3>
                        <ul className="space-y-1.5 text-xs sm:text-sm leading-relaxed list-disc pl-4 text-ink/85">
                          {docs.map((docItem, dIdx) => (
                            <li key={dIdx}>{docItem}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="kicker-label text-xs text-steel mb-2">
                          {copy.stepsLabel}
                        </h3>
                        <ol className="space-y-1.5 text-xs sm:text-sm leading-relaxed list-decimal pl-4 text-ink/85">
                          {steps.slice(0, 3).map((stepItem, sIdx) => (
                            <li key={sIdx}>{stepItem}</li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    {/* Plain-Language Summary Output */}
                    {activeExplain && (
                      <div className="p-5 bg-white/85 backdrop-blur-md border border-mist/50 rounded-2xl space-y-2 shadow-2xs">
                        <p className="kicker-label text-xs text-navy">
                          {lang === 'hi' ? 'सरल भाषा में सारांश' : 'Plain-Language Summary'}
                        </p>
                        <p className="text-sm text-ink leading-relaxed">
                          {activeExplain.simplified_summary}
                        </p>
                        {activeExplain.key_takeaways?.length > 0 && (
                          <ul className="space-y-1 text-xs sm:text-sm text-ink/85 list-disc pl-4">
                            {activeExplain.key_takeaways.map((pt, i) => (
                              <li key={i}>{pt}</li>
                            ))}
                          </ul>
                        )}
                        <p className="text-xs font-semibold text-steel pt-1">
                          {activeExplain.action_tip}
                        </p>
                      </div>
                    )}

                    {/* Human-Friendly Explain Error + Retry */}
                    {explainErrorId[scheme.id] && (
                      <div className="p-3.5 bg-white/85 border border-rose/45 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-ink">
                        <span>{explainErrorId[scheme.id]}</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleExplainScheme(
                              scheme,
                              match
                                ? lang === 'hi'
                                  ? match.summaryReason_hi
                                  : match.summaryReason
                                : undefined
                            )
                          }
                          className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-snow bg-navy rounded-xl cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{lang === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}</span>
                        </button>
                      </div>
                    )}

                    {/* Unified Action Footer across ALL Scheme Cards */}
                    <div className="pt-4 border-t border-mist/55 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => onSelectScheme(scheme.id)}
                          className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-ink bg-white/85 border border-mist/60 rounded-2xl hover:bg-white transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
                        >
                          <FileCheck2 className="w-4 h-4 text-steel" />
                          <span>{copy.viewDetailsBtn}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleSaveScheme(scheme.id)}
                          className={`min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-2xl border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            saved
                              ? 'bg-mist/60 text-navy border-steel/40'
                              : 'bg-white/85 text-ink border-mist/60 hover:bg-white'
                          }`}
                        >
                          {saved ? (
                            <>
                              <BookmarkCheck className="w-4 h-4 text-navy" />
                              <span>{copy.savedSchemeBtn}</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-4 h-4 text-steel" />
                              <span>{copy.saveSchemeBtn}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={loadingExplainId === scheme.id}
                          onClick={() =>
                            handleExplainScheme(
                              scheme,
                              match
                                ? lang === 'hi'
                                  ? match.summaryReason_hi
                                  : match.summaryReason
                                : undefined
                            )
                          }
                          className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-navy bg-white/80 border border-mist/60 rounded-2xl hover:bg-white disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-steel" />
                          <span>
                            {loadingExplainId === scheme.id
                              ? copy.simplifyingAiBtn
                              : copy.simplifyAiBtn}
                          </span>
                        </button>
                      </div>

                      <a
                        href={scheme.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor-label={lang === 'hi' ? 'आवेदन' : 'Apply'}
                        className="btn-shimmer min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-snow bg-navy hover:bg-ink rounded-2xl transition-colors whitespace-nowrap shrink-0 shadow-sm"
                      >
                        <span>{copy.applyOfficialBtn}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </article>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

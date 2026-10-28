import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  Language,
  MatchResult,
  SavedApplication,
  Scheme,
  SimplifiedSchemeExplanation,
} from '../types';
import { UI_COPY } from '../lib/i18n';
import { formatRupees, formatRupeesHi } from '../lib/matcher';
import { toHumanErrorMessage } from '../lib/friendlyError';
import { getCategoryChipMeta, resolveCardTheme } from './ResultsView';

interface SchemeDetailViewProps {
  scheme: Scheme;
  match?: MatchResult;
  lang: Language;
  savedApp?: SavedApplication;
  localCheckedDocs: string[];
  onBack: () => void;
  onToggleDocument: (schemeId: string, docCanonical: string) => void;
  onToggleSave: (schemeId: string) => void;
}

export const SchemeDetailView: React.FC<SchemeDetailViewProps> = ({
  scheme,
  match,
  lang,
  savedApp,
  localCheckedDocs,
  onBack,
  onToggleDocument,
  onToggleSave,
}) => {
  const copy = UI_COPY[lang];
  const [explanation, setExplanation] = useState<SimplifiedSchemeExplanation | null>(null);
  const [explainLang, setExplainLang] = useState<Language | null>(null);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  const checkedList = savedApp ? savedApp.checkedDocuments : localCheckedDocs;
  const docsDisplay = lang === 'hi' ? scheme.documents_hi : scheme.documents;
  const stepsDisplay = lang === 'hi' ? scheme.steps_hi : scheme.steps;
  const theme = resolveCardTheme(scheme);
  const chipMeta = getCategoryChipMeta(scheme, theme);

  const triggerSimplify = async (targetLanguage: Language) => {
    setIsSimplifying(true);
    setExplainError(null);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'scheme',
          targetLang: targetLanguage,
          schemeData: {
            name: targetLanguage === 'hi' ? scheme.name_hi : scheme.name,
            description: targetLanguage === 'hi' ? scheme.description_hi : scheme.description,
            benefits: targetLanguage === 'hi' ? scheme.benefits_hi : scheme.benefits,
            matchReason: match
              ? targetLanguage === 'hi'
                ? match.summaryReason_hi
                : match.summaryReason
              : undefined,
            steps: targetLanguage === 'hi' ? scheme.steps_hi : scheme.steps,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.explanation) {
        throw new Error(data.error || 'Unable to generate explanation.');
      }
      setExplanation(data.explanation);
      setExplainLang(targetLanguage);
    } catch (err) {
      setExplainError(toHumanErrorMessage(err, targetLanguage));
    } finally {
      setIsSimplifying(false);
    }
  };

  useEffect(() => {
    if (explanation && explainLang && explainLang !== lang) {
      triggerSimplify(lang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const checkedCount = scheme.documents.filter((canonicalDoc) =>
    checkedList.includes(canonicalDoc)
  ).length;
  const progressPct =
    scheme.documents.length > 0 ? checkedCount / scheme.documents.length : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-navy bg-white/85 border border-white rounded-2xl hover:bg-white cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-steel" />
          <span>{lang === 'hi' ? 'परिणामों पर वापस जाएं' : 'Back to Schemes'}</span>
        </button>
      </div>

      <div className={`glass-panel ${chipMeta.tintClass} rounded-[28px] p-6 sm:p-9 space-y-8`}>
        {/* Header */}
        <div className="pb-6 border-b border-mist/60 space-y-3.5">
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

          <h1 className="font-card-title text-3xl sm:text-4xl font-bold text-navy leading-tight">
            {lang === 'hi' ? scheme.name_hi : scheme.name}
          </h1>

          <p className="text-sm sm:text-base text-ink/80 leading-relaxed">
            {lang === 'hi' ? scheme.description_hi : scheme.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={scheme.official_url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-label={lang === 'hi' ? 'आवेदन' : 'Apply'}
              className="btn-shimmer min-h-[44px] inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-snow bg-navy hover:bg-ink rounded-2xl shadow-sm whitespace-nowrap shrink-0 transition-colors"
            >
              <span>{copy.applyOfficialBtn}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={() => onToggleSave(scheme.id)}
              className={`min-h-[44px] inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold rounded-2xl border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                savedApp
                  ? 'bg-mist/60 text-navy border-steel/40'
                  : 'bg-white/85 text-ink border-mist/60 hover:bg-white'
              }`}
            >
              {savedApp ? (
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
              disabled={isSimplifying}
              onClick={() => triggerSimplify(lang)}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-navy bg-white/80 border border-mist/60 rounded-2xl hover:bg-white disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-steel" />
              <span>{isSimplifying ? copy.simplifyingAiBtn : copy.simplifyAiBtn}</span>
            </button>
          </div>
        </div>

        {/* AI Simplified Explanation Error + Retry */}
        {explainError && (
          <div className="p-4 bg-white/85 border border-rose/45 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-ink font-medium">
            <span>{explainError}</span>
            <button
              type="button"
              onClick={() => triggerSimplify(lang)}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-snow bg-navy rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}</span>
            </button>
          </div>
        )}

        {explanation && (
          <div className="p-6 bg-white/85 backdrop-blur-md border border-mist/50 rounded-[24px] space-y-2.5 shadow-2xs">
            <h2 className="kicker-label text-xs text-navy">
              {lang === 'hi'
                ? 'सरल शब्दों में समझें (AI सहायता)'
                : 'Plain-Language Explanation (AI Assisted)'}
            </h2>
            <p className="text-sm sm:text-base text-ink leading-relaxed">
              {explanation.simplified_summary}
            </p>
            {explanation.key_takeaways?.length > 0 && (
              <ul className="space-y-1.5 text-xs sm:text-sm text-ink/85 list-disc pl-5">
                {explanation.key_takeaways.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
            <p className="text-xs font-bold text-steel pt-1">{explanation.action_tip}</p>
          </div>
        )}

        {/* Deterministic Match Banner */}
        {match && (
          <div className="p-4 sm:p-5 rounded-2xl border bg-mist/25 border-steel/25 flex items-start gap-3">
            {match.matchType === 'eligible' ? (
              <CheckCircle2 className="w-4 h-4 text-navy shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
            )}
            <div className="text-sm text-ink">
              <span className="font-bold">{copy.whyEligibleLabel}: </span>
              <span className="tabular-nums">
                {lang === 'hi' ? match.summaryReason_hi : match.summaryReason}
              </span>
            </div>
          </div>
        )}

        {/* Benefits & Eligibility Thresholds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-[22px] bg-white/75 border border-mist/50 space-y-2">
            <h2 className="font-card-title text-base font-bold text-navy">{copy.benefitsLabel}</h2>
            <p className="text-sm sm:text-base text-ink font-medium leading-relaxed tabular-nums">
              {lang === 'hi' ? scheme.benefits_hi : scheme.benefits}
            </p>
          </div>

          <div className="p-5 rounded-[22px] bg-white/75 border border-mist/50 space-y-2">
            <h2 className="font-card-title text-base font-bold text-navy">
              {lang === 'hi' ? 'मुख्य पात्रता मानदंड' : 'Rule Thresholds Checked'}
            </h2>
            <dl className="divide-y divide-mist/60 text-xs sm:text-sm">
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-ink/70">{lang === 'hi' ? 'आयु सीमा' : 'Age Range'}</dt>
                <dd className="font-mono tabular-nums font-bold text-ink">
                  {scheme.eligibility.min_age ?? 0} – {scheme.eligibility.max_age ?? 100}{' '}
                  {lang === 'hi' ? 'वर्ष' : 'yrs'}
                </dd>
              </div>
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-ink/70">
                  {lang === 'hi' ? 'अधिकतम वार्षिक आय' : 'Max Annual Income'}
                </dt>
                <dd className="font-mono tabular-nums font-bold text-ink">
                  {scheme.eligibility.max_income
                    ? lang === 'hi'
                      ? formatRupeesHi(scheme.eligibility.max_income)
                      : formatRupees(scheme.eligibility.max_income)
                    : lang === 'hi'
                      ? 'कोई आय सीमा नहीं'
                      : 'No income cap'}
                </dd>
              </div>
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-ink/70">{lang === 'hi' ? 'सामाजिक वर्ग' : 'Categories'}</dt>
                <dd className="font-bold text-ink">{scheme.eligibility.categories.join(', ')}</dd>
              </div>
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-ink/70">{lang === 'hi' ? 'राज्य' : 'Coverage'}</dt>
                <dd className="font-bold text-ink">
                  {scheme.eligibility.states.includes('ALL')
                    ? lang === 'hi'
                      ? 'संपूर्ण भारत (All India)'
                      : 'All India'
                    : scheme.eligibility.states.join(', ')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Interactive Documents Checklist */}
        <div className="p-6 rounded-[24px] bg-white/80 border border-mist/50 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-card-title text-lg font-bold text-navy">
                {lang === 'hi'
                  ? 'आवश्यक दस्तावेज़ चेकलिस्ट (तैयार होने पर टिक करें)'
                  : 'Interactive Documents Checklist'}
              </h2>
              <p className="text-xs sm:text-sm text-ink/70 mt-0.5">
                {lang === 'hi'
                  ? 'ऑनलाइन पोर्टल या जन सेवा केंद्र (CSC) जाने से पहले इन दस्तावेज़ों को तैयार रखें।'
                  : 'Tick each document as you gather originals/scans before visiting the official portal or CSC.'}
              </p>
            </div>
            <span className="text-xs sm:text-sm font-mono tabular-nums font-extrabold text-navy">
              {checkedCount} / {scheme.documents.length}{' '}
              {lang === 'hi' ? 'दस्तावेज़ तैयार' : 'ready'}
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-mist/45 overflow-hidden">
            <motion.div
              className="h-full w-full bg-gradient-to-r from-navy to-steel origin-left"
              initial={false}
              animate={{ scaleX: progressPct }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ willChange: 'transform' }}
            />
          </div>

          <div className="divide-y divide-mist/50 border border-mist/60 rounded-2xl overflow-hidden bg-snow/85">
            {scheme.documents.map((canonicalDoc, idx) => {
              const isChecked = checkedList.includes(canonicalDoc);
              const label = docsDisplay[idx] || canonicalDoc;
              return (
                <label
                  key={canonicalDoc}
                  className={`min-h-[48px] flex items-center gap-3.5 p-4 cursor-pointer transition-colors ${
                    isChecked ? 'bg-mist/30' : 'hover:bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleDocument(scheme.id, canonicalDoc)}
                    className="w-4 h-4 accent-navy rounded cursor-pointer shrink-0"
                  />
                  <span
                    className={`text-sm leading-snug ${
                      isChecked ? 'line-through text-ink/50' : 'text-ink font-semibold'
                    }`}
                  >
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Application Guide */}
        <div className="p-6 rounded-[24px] bg-white/75 border border-mist/50 space-y-4">
          <h2 className="font-card-title text-lg font-bold text-navy">{copy.stepsLabel}</h2>
          <ol className="space-y-3.5">
            {stepsDisplay.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3.5 text-sm sm:text-base text-ink leading-relaxed"
              >
                <span className="font-mono tabular-nums text-xs font-extrabold text-snow bg-navy px-2.5 py-1 rounded-xl shrink-0">
                  0{index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Conservative Official Verification Note */}
        <div className="p-4 sm:p-5 bg-white/75 border border-mist/50 rounded-2xl text-xs sm:text-sm text-ink/80 leading-relaxed">
          <strong className="text-navy">
            {lang === 'hi' ? 'महत्वपूर्ण सूचना: ' : 'Verify on Official Portal: '}
          </strong>
          {lang === 'hi' ? scheme.verification_note_hi : scheme.verification_note}
        </div>
      </div>
    </div>
  );
};

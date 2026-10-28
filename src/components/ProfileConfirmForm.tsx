import React from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import {
  CitizenProfile,
  EducationLevel,
  Gender,
  INDIAN_STATES,
  Language,
  Occupation,
  SocialCategory,
} from '../types';
import { UI_COPY } from '../lib/i18n';
import { EDUCATION_LABELS, GENDER_LABELS, OCCUPATION_LABELS } from '../lib/matcher';
import { MagneticButton } from './MotionPrimitives';

interface ProfileConfirmFormProps {
  lang: Language;
  profile: CitizenProfile;
  missingFields: (keyof CitizenProfile)[];
  extractedNote?: string;
  usedFallback?: boolean;
  liveEligibleCount: number;
  liveVerifyCount: number;
  onUpdateProfile: (next: CitizenProfile) => void;
  onBack: () => void;
  onConfirm: () => void;
}

const FIELD_LABELS: Record<keyof CitizenProfile, { en: string; hi: string }> = {
  age: { en: 'Age (Years)', hi: 'आयु (वर्षों में)' },
  gender: { en: 'Gender', hi: 'लिंग' },
  category: { en: 'Social Category', hi: 'सामाजिक वर्ग (Category)' },
  annual_income: { en: 'Annual Household Income (₹)', hi: 'वार्षिक पारिवारिक आय (₹)' },
  state: { en: 'State / Union Territory', hi: 'राज्य / केंद्र शासित प्रदेश' },
  occupation: { en: 'Primary Occupation', hi: 'मुख्य पेशा / कार्य' },
  education_level: { en: 'Current / Highest Education', hi: 'शिक्षा स्तर' },
  disability: {
    en: 'Person with Benchmark Disability (PwD ≥ 40%)',
    hi: 'दिव्यांगजन (40% या अधिक बेंचमार्क दिव्यांगता)',
  },
};

export const ProfileConfirmForm: React.FC<ProfileConfirmFormProps> = ({
  lang,
  profile,
  missingFields,
  extractedNote,
  usedFallback = false,
  liveEligibleCount,
  liveVerifyCount,
  onUpdateProfile,
  onBack,
  onConfirm,
}) => {
  const copy = UI_COPY[lang];

  const currentMissing = (
    [
      'age',
      'gender',
      'category',
      'annual_income',
      'state',
      'occupation',
      'education_level',
    ] as (keyof CitizenProfile)[]
  ).filter((k) => profile[k] === null || profile[k] === '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  const isFieldMissing = (key: keyof CitizenProfile) =>
    missingFields.includes(key) && (profile[key] === null || profile[key] === '');

  const inputBaseClass = (missing: boolean) =>
    `min-h-[44px] w-full px-4 py-3 text-sm rounded-2xl border transition-all focus:outline-none focus:bg-white focus:border-steel focus:shadow-[0_0_20px_rgba(74,127,167,0.14)] ${
      missing
        ? 'bg-[#FBF0D9]/75 border-[#F4C873] text-ink'
        : 'bg-snow/90 border-mist text-ink'
    }`;

  const fallbackMessage =
    lang === 'hi'
      ? 'AI अभी व्यस्त है, इसलिए हमने आपके विवरण से उपलब्ध जानकारी भर दी है। कृपया विवरण जांच लें।'
      : 'AI is busy, we filled what we could. Please check the details.';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-panel rounded-[28px] p-6 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-mist/60">
          <div>
            <p className="kicker-label text-xs text-steel">
              {lang === 'hi' ? 'चरण 2 / 3 · प्रोफ़ाइल सत्यापन' : 'Step 2 of 3 · Profile Confirmation'}
            </p>
            <h1 className="font-hero-title mt-1.5 text-3xl sm:text-4xl font-extrabold text-ink">
              {copy.confirmTitle}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-ink/75">{copy.confirmSubtitle}</p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-navy bg-mist/40 border border-white/85 rounded-2xl hover:bg-mist/70 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-steel" />
            <span>{copy.backToDescribeBtn}</span>
          </button>
        </div>

        {/* Friendly Fallback Note or AI Extraction Summary */}
        {usedFallback ? (
          <div className="mt-5 p-4 bg-mist/35 border border-steel/35 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-navy font-medium">
            <Info className="w-4 h-4 text-steel shrink-0 mt-0.5" />
            <span>{fallbackMessage}</span>
          </div>
        ) : (
          extractedNote && (
            <div className="mt-5 p-4 bg-white/80 border border-white rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-ink">
              <CheckCircle2 className="w-4 h-4 text-steel shrink-0 mt-0.5" />
              <span>{extractedNote}</span>
            </div>
          )
        )}

        {currentMissing.length > 0 && (
          <div className="mt-4 p-4 bg-[#FBF0D9]/85 border border-[#F4C873] rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-[#5C2D0C] space-y-1">
              <p className="font-bold">{copy.missingAlertTitle}</p>
              <p className="opacity-90">
                {currentMissing
                  .map((field) => (lang === 'hi' ? FIELD_LABELS[field].hi : FIELD_LABELS[field].en))
                  .join(' · ')}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Age */}
            <div>
              <label
                htmlFor="field-age"
                className="flex items-center justify-between text-xs font-bold text-navy mb-2"
              >
                <span>{lang === 'hi' ? FIELD_LABELS.age.hi : FIELD_LABELS.age.en}</span>
                {isFieldMissing('age') && (
                  <span className="text-[#B45309] font-semibold">
                    {lang === 'hi' ? 'अधूरा' : 'Missing'}
                  </span>
                )}
              </label>
              <input
                id="field-age"
                type="number"
                min={0}
                max={120}
                value={profile.age ?? ''}
                onChange={(e) =>
                  onUpdateProfile({
                    ...profile,
                    age: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                placeholder={lang === 'hi' ? 'जैसे: 20' : 'e.g. 20'}
                className={`${inputBaseClass(isFieldMissing('age'))} font-mono tabular-nums`}
              />
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="field-gender"
                className="flex items-center justify-between text-xs font-bold text-navy mb-2"
              >
                <span>{lang === 'hi' ? FIELD_LABELS.gender.hi : FIELD_LABELS.gender.en}</span>
                {isFieldMissing('gender') && (
                  <span className="text-[#B45309] font-semibold">
                    {lang === 'hi' ? 'अधूरा' : 'Missing'}
                  </span>
                )}
              </label>
              <select
                id="field-gender"
                value={profile.gender ?? ''}
                onChange={(e) =>
                  onUpdateProfile({
                    ...profile,
                    gender: (e.target.value || null) as Gender | null,
                  })
                }
                className={inputBaseClass(isFieldMissing('gender'))}
              >
                <option value="">{lang === 'hi' ? '-- चुनें --' : '-- Select --'}</option>
                {(['female', 'male', 'other'] as Gender[]).map((g) => (
                  <option key={g} value={g}>
                    {lang === 'hi' ? GENDER_LABELS[g].hi : GENDER_LABELS[g].en}
                  </option>
                ))}
              </select>
            </div>

            {/* Social Category */}
            <div>
              <label
                htmlFor="field-category"
                className="flex items-center justify-between text-xs font-bold text-navy mb-2"
              >
                <span>{lang === 'hi' ? FIELD_LABELS.category.hi : FIELD_LABELS.category.en}</span>
                {isFieldMissing('category') && (
                  <span className="text-[#B45309] font-semibold">
                    {lang === 'hi' ? 'अधूरा' : 'Missing'}
                  </span>
                )}
              </label>
              <select
                id="field-category"
                value={profile.category ?? ''}
                onChange={(e) =>
                  onUpdateProfile({
                    ...profile,
                    category: (e.target.value || null) as SocialCategory | null,
                  })
                }
                className={inputBaseClass(isFieldMissing('category'))}
              >
                <option value="">{lang === 'hi' ? '-- चुनें --' : '-- Select --'}</option>
                {(['General', 'OBC', 'SC', 'ST', 'EWS'] as SocialCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Annual Household Income */}
            <div>
              <label
                htmlFor="field-income"
                className="flex items-center justify-between text-xs font-bold text-navy mb-2"
              >
                <span>
                  {lang === 'hi' ? FIELD_LABELS.annual_income.hi : FIELD_LABELS.annual_income.en}
                </span>
                {isFieldMissing('annual_income') && (
                  <span className="text-[#B45309] font-semibold">
                    {lang === 'hi' ? 'अधूरा' : 'Missing'}
                  </span>
                )}
              </label>
              <input
                id="field-income"
                type="number"
                min={0}
                step={5000}
                value={profile.annual_income ?? ''}
                onChange={(e) =>
                  onUpdateProfile({
                    ...profile,
                    annual_income: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                placeholder={lang === 'hi' ? 'जैसे: 180000' : 'e.g. 180000'}
                className={`${inputBaseClass(isFieldMissing('annual_income'))} font-mono tabular-nums`}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[100000, 180000, 250000, 450000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onUpdateProfile({ ...profile, annual_income: preset })}
                    className="min-h-[36px] px-3 py-1.5 text-xs font-mono tabular-nums font-semibold text-navy bg-mist/40 rounded-xl hover:bg-mist/75 transition-colors cursor-pointer"
                  >
                    ₹{(preset / 100000).toFixed(1).replace('.0', '')}L
                  </button>
                ))}
              </div>
            </div>

            {/* State */}
            <div>
              <label
                htmlFor="field-state"
                className="flex items-center justify-between text-xs font-bold text-navy mb-2"
              >
                <span>{lang === 'hi' ? FIELD_LABELS.state.hi : FIELD_LABELS.state.en}</span>
                {isFieldMissing('state') && (
                  <span className="text-[#B45309] font-semibold">
                    {lang === 'hi' ? 'अधूरा' : 'Missing'}
                  </span>
                )}
              </label>
              <select
                id="field-state"
                value={profile.state ?? ''}
                onChange={(e) =>
                  onUpdateProfile({
                    ...profile,
                    state: e.target.value || null,
                  })
                }
                className={inputBaseClass(isFieldMissing('state'))}
              >
                <option value="">
                  {lang === 'hi' ? '-- राज्य चुनें --' : '-- Select State / UT --'}
                </option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label
                htmlFor="field-occupation"
                className="flex items-center justify-between text-xs font-bold text-navy mb-2"
              >
                <span>
                  {lang === 'hi' ? FIELD_LABELS.occupation.hi : FIELD_LABELS.occupation.en}
                </span>
                {isFieldMissing('occupation') && (
                  <span className="text-[#B45309] font-semibold">
                    {lang === 'hi' ? 'अधूरा' : 'Missing'}
                  </span>
                )}
              </label>
              <select
                id="field-occupation"
                value={profile.occupation ?? ''}
                onChange={(e) =>
                  onUpdateProfile({
                    ...profile,
                    occupation: (e.target.value || null) as Occupation | null,
                  })
                }
                className={inputBaseClass(isFieldMissing('occupation'))}
              >
                <option value="">
                  {lang === 'hi' ? '-- पेशा चुनें --' : '-- Select Occupation --'}
                </option>
                {(Object.keys(OCCUPATION_LABELS) as Occupation[]).map((occ) => (
                  <option key={occ} value={occ}>
                    {lang === 'hi' ? OCCUPATION_LABELS[occ].hi : OCCUPATION_LABELS[occ].en}
                  </option>
                ))}
              </select>
            </div>

            {/* Education Level */}
            <div className="sm:col-span-2">
              <label
                htmlFor="field-education"
                className="flex items-center justify-between text-xs font-bold text-navy mb-2"
              >
                <span>
                  {lang === 'hi'
                    ? FIELD_LABELS.education_level.hi
                    : FIELD_LABELS.education_level.en}
                </span>
                {isFieldMissing('education_level') && (
                  <span className="text-[#B45309] font-semibold">
                    {lang === 'hi' ? 'अधूरा' : 'Missing'}
                  </span>
                )}
              </label>
              <select
                id="field-education"
                value={profile.education_level ?? ''}
                onChange={(e) =>
                  onUpdateProfile({
                    ...profile,
                    education_level: (e.target.value || null) as EducationLevel | null,
                  })
                }
                className={inputBaseClass(isFieldMissing('education_level'))}
              >
                <option value="">
                  {lang === 'hi' ? '-- शिक्षा स्तर चुनें --' : '-- Select Education Level --'}
                </option>
                {(Object.keys(EDUCATION_LABELS) as EducationLevel[]).map((edu) => (
                  <option key={edu} value={edu}>
                    {lang === 'hi' ? EDUCATION_LABELS[edu].hi : EDUCATION_LABELS[edu].en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Disability Checkbox */}
          <div className="pt-1">
            <label className="min-h-[44px] inline-flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 border border-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(profile.disability)}
                onChange={(e) =>
                  onUpdateProfile({
                    ...profile,
                    disability: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-navy rounded cursor-pointer"
              />
              <span className="text-sm text-ink font-semibold">
                {lang === 'hi' ? FIELD_LABELS.disability.hi : FIELD_LABELS.disability.en}
              </span>
            </label>
          </div>

          {/* Live Deterministic Match Preview & Single Primary CTA */}
          <div className="pt-6 border-t border-mist/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs sm:text-sm text-ink/80 font-mono tabular-nums">
              <span className="font-extrabold text-navy">{liveEligibleCount}</span>{' '}
              {lang === 'hi' ? 'पूर्ण पात्र योजनाएं' : 'confirmed matches'}{' '}
              <span aria-hidden="true">·</span>{' '}
              <span className="font-extrabold text-steel">{liveVerifyCount}</span>{' '}
              {lang === 'hi' ? 'संभावित (अधूरी जानकारी)' : 'potential (missing info)'}
            </div>

            <MagneticButton
              type="submit"
              className="btn-shimmer inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-bold text-snow bg-navy hover:bg-ink rounded-2xl shadow-[0_14px_28px_-8px_rgba(26,61,99,0.42)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{copy.viewMatchesBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>
        </form>
      </div>
    </div>
  );
};

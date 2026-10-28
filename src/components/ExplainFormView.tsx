import React, { useState } from 'react';
import { Sparkles, AlertCircle, ShieldAlert, RotateCcw } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { FormExplanationResult, Language } from '../types';
import { toHumanErrorMessage } from '../lib/friendlyError';
import { MagneticButton, TiltCard } from './MotionPrimitives';

interface ExplainFormViewProps {
  lang: Language;
}

const SAMPLE_FORMS = [
  {
    id: 'nsp-form',
    label: 'Scholarship OTR & DBT Clause',
    label_hi: 'छात्रवृत्ति OTR व आधार सीडिंग खंड',
    text: `Applicant OTR ID (One Time Registration):
AISHE / UDISE Institution Code:
Annual Family Income from All Sources (as per Tehsildar/Competent Authority Certificate):
Whether Hosteller or Day Scholar:
NPCI Mapper / Aadhaar Seeded Bank Account Status (Mandatory for Direct Benefit Transfer - PFMS):`,
  },
  {
    id: 'pmkisan-land',
    label: 'PM-KISAN Land Record Fields',
    label_hi: 'पीएम-किसान खतौनी / भूमि फॉर्म',
    text: `Khata Number / Khatauni Account No:
Khasra / Survey / Plot Number:
Total Cultivable Area (in Hectares):
Land Vesting Date (Prior to 01.02.2019 or Inheritance Mutation Reason):
Declaration: Neither I nor any member of my family (spouse/minor children) paid Income Tax in the last assessment year.`,
  },
  {
    id: 'pmay-affidavit',
    label: 'PMAY Self-Declaration Clause',
    label_hi: 'पीएम आवास स्व-घोषणा खंड',
    text: `Beneficiary Vertical (BLC - Beneficiary Led Construction / ISS - Interest Subsidy Scheme):
Carpet Area of Proposed Dwelling Unit (up to 30 sq.m. for EWS / 60 sq.m. for LIG):
Affidavit: I/We certify that neither I nor my unmarried children/spouse own an all-weather pucca house in any part of India.`,
  },
];

export const ExplainFormView: React.FC<ExplainFormViewProps> = ({ lang }) => {
  const prefersReducedMotion = useReducedMotion();
  const [formText, setFormText] = useState(SAMPLE_FORMS[0].text);
  const [result, setResult] = useState<FormExplanationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runExplanation = async () => {
    if (formText.trim().length < 5) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'form',
          targetLang: lang,
          formText,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.explanation) {
        throw new Error(data.error || 'Unable to explain form fields right now.');
      }
      setResult(data.explanation as FormExplanationResult);
    } catch (err) {
      setError(toHumanErrorMessage(err, lang));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplain = (e: React.FormEvent) => {
    e.preventDefault();
    runExplanation();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="glass-panel rounded-[28px] p-6 sm:p-9 space-y-6">
        <div>
          <p className="kicker-label text-xs text-steel">
            {lang === 'hi'
              ? 'नागरिक फॉर्म सहायक · कठिन सरकारी शब्दावली को सरल भाषा में समझें'
              : 'Civic Form Helper · Decode Bureaucratic Jargon Field-by-Field'}
          </p>
          <h1 className="font-hero-title mt-1.5 text-3xl sm:text-4xl font-extrabold text-ink">
            {lang === 'hi' ? 'इस सरकारी फॉर्म को सरल भाषा में समझें' : 'Explain This Government Form'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-ink/75 max-w-2xl leading-relaxed">
            {lang === 'hi'
              ? 'किसी भी सरकारी आवेदन पत्र, छात्रवृत्ति निर्देश या शपथ-पत्र की पंक्तियां नीचे पेस्ट करें। हम प्रत्येक कॉलम का आसान अर्थ, क्या भरना है और सामान्य गलतियों से बचने का तरीका बताएंगे।'
              : 'Paste confusing fields, instructions, or declarations from any government portal or paper form. Get a plain-language guide for each field in Hindi or English.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-navy mr-1">
            {lang === 'hi' ? 'उदाहरण चुनें:' : 'Load sample snippet:'}
          </span>
          {SAMPLE_FORMS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => {
                setFormText(sample.text);
                setResult(null);
              }}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-navy bg-mist/40 border border-white/85 rounded-2xl hover:bg-mist/70 transition-colors cursor-pointer"
            >
              {lang === 'hi' ? sample.label_hi : sample.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleExplain} className="space-y-4">
          <textarea
            rows={5}
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            placeholder={
              lang === 'hi'
                ? 'सरकारी फॉर्म की पंक्तियां या शर्तें यहाँ पेस्ट करें (अपना निजी आधार नंबर या ओटीपी कभी न लिखें)...'
                : 'Paste government form labels or clauses here (never paste personal Aadhaar numbers or OTPs)...'
            }
            style={{ textTransform: 'none' }}
            className="w-full p-4 sm:p-5 text-sm sm:text-base normal-case bg-snow/90 border border-mist rounded-[20px] text-ink focus:outline-none focus:bg-white focus:border-steel focus:shadow-[0_0_20px_rgba(74,127,167,0.14)] leading-relaxed transition-all"
          />

          {error && (
            <div className="p-4 bg-blush/65 border border-rose/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-ink font-medium">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-plum shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={runExplanation}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-snow bg-navy hover:bg-ink rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}</span>
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <p className="text-xs text-ink/70 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-steel shrink-0" />
              <span>
                {lang === 'hi'
                  ? 'केवल खाली फॉर्म की शब्दावली पेस्ट करें — अपना आधार/बैंक खाता नंबर न डालें।'
                  : 'Paste blank form field names only — never enter personal Aadhaar or bank numbers.'}
              </span>
            </p>

            <MagneticButton
              type="submit"
              disabled={isLoading || formText.trim().length < 5}
              className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-snow bg-navy hover:bg-ink rounded-2xl shadow-sm disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>
                {isLoading
                  ? lang === 'hi'
                    ? 'समझाया जा रहा है...'
                    : 'Explaining fields...'
                  : lang === 'hi'
                    ? 'हिंदी में प्रत्येक कॉलम समझें'
                    : 'Explain Field-by-Field'}
              </span>
            </MagneticButton>
          </div>
        </form>
      </div>

      {/* Text-free Skeleton Shimmer Cards while Loading */}
      {isLoading && (
        <div className="space-y-4" aria-busy="true">
          {[0, 1].map((idx) => (
            <div key={idx} className="glass-panel rounded-[28px] p-6 space-y-3">
              <div className="shimmer-bar h-6 w-64 rounded-xl bg-mist/60" />
              <div className="shimmer-bar h-4 w-full rounded-lg bg-mist/45" />
              <div className="shimmer-bar h-4 w-3/4 rounded-lg bg-mist/45" />
            </div>
          ))}
        </div>
      )}

      {/* Field-by-Field Explanation Output */}
      {result && !isLoading && (
        <div className="space-y-6">
          <div className="glass-panel rounded-[28px] p-6 sm:p-8">
            <h2 className="font-card-title text-2xl font-bold text-navy">{result.form_title}</h2>
            <p className="mt-2 text-sm sm:text-base text-ink/80 leading-relaxed">
              {result.overall_purpose}
            </p>
          </div>

          <div className="space-y-4">
            {result.fields.map((field, index) => (
              <motion.div
                key={index}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.34,
                  delay: prefersReducedMotion ? 0 : Math.min(index * 0.06, 0.4),
                }}
              >
                <TiltCard maxTilt={4} className="glass-panel rounded-[28px] p-6 sm:p-7">
                  <div className="space-y-4">
                    <h3 className="font-card-title text-lg sm:text-xl font-bold text-navy">
                      <span className="font-mono tabular-nums text-xs text-steel mr-2.5">
                        0{index + 1}.
                      </span>
                      {field.field_name}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                      <div className="p-4 rounded-2xl bg-white/75 border border-white space-y-1">
                        <p className="kicker-label text-xs text-steel">
                          {lang === 'hi' ? 'सरल अर्थ' : 'What It Means'}
                        </p>
                        <p className="text-ink leading-relaxed">{field.plain_meaning}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/75 border border-white space-y-1">
                        <p className="kicker-label text-xs text-steel">
                          {lang === 'hi' ? 'कैसे भरें' : 'How to Fill'}
                        </p>
                        <p className="text-ink leading-relaxed">{field.how_to_fill}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/75 border border-white space-y-1.5">
                        <p className="kicker-label text-xs text-steel">
                          {lang === 'hi' ? 'उदाहरण' : 'Sample Format'}
                        </p>
                        <p className="font-mono text-xs text-navy bg-snow px-3 py-1.5 rounded-xl border border-mist/70 inline-block">
                          {field.example_value}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FBF0D9]/80 border border-[#F4C873]/75 space-y-1">
                        <p className="kicker-label text-xs text-[#92400E]">
                          {lang === 'hi' ? 'इस गलती से बचें' : 'Common Mistake to Avoid'}
                        </p>
                        <p className="text-[#4A2006] leading-relaxed">{field.common_mistake}</p>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          <div className="glass-panel rounded-[24px] p-5 text-xs sm:text-sm text-ink/80">
            <strong className="text-navy">
              {lang === 'hi' ? 'सुरक्षा सलाह: ' : 'Safety Reminder: '}
            </strong>
            {result.safety_note}
          </div>
        </div>
      )}
    </div>
  );
};

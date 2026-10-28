import React, { useState } from 'react';
import { ExternalLink, Trash2, FileCheck2, Lock, Info, Check } from 'lucide-react';
import { motion } from 'motion/react';
import {
  ApplicationStatus,
  CitizenSessionUser,
  Language,
  SavedApplication,
  Scheme,
} from '../types';
import {
  ConfettiBurst,
  FriendlyEmptyState,
  MagneticButton,
  TiltCard,
} from './MotionPrimitives';
import { CivicVoiceBanner } from './CivicVoiceBanner';

interface MyApplicationsViewProps {
  lang: Language;
  user: CitizenSessionUser | null;
  applications: SavedApplication[];
  schemes: Scheme[];
  onOpenAuth: () => void;
  onUpdateStatus: (schemeId: string, status: ApplicationStatus) => void;
  onRemoveApplication: (schemeId: string) => void;
  onOpenSchemeDetail: (schemeId: string) => void;
  onBrowseSchemes: () => void;
  onOpenExplainForm: () => void;
}

const STATUS_OPTIONS: { value: ApplicationStatus; en: string; hi: string }[] = [
  { value: 'saved', en: 'Saved', hi: 'सेव किया' },
  { value: 'docs_ready', en: 'Docs Ready', hi: 'दस्तावेज़ तैयार' },
  { value: 'applied', en: 'Applied', hi: 'आवेदन किया' },
  { value: 'approved', en: 'Approved', hi: 'स्वीकृत' },
];

export const MyApplicationsView: React.FC<MyApplicationsViewProps> = ({
  lang,
  user,
  applications,
  schemes,
  onOpenAuth,
  onUpdateStatus,
  onRemoveApplication,
  onOpenSchemeDetail,
  onBrowseSchemes,
  onOpenExplainForm,
}) => {
  const [celebratingSchemeId, setCelebratingSchemeId] = useState<string | null>(null);

  const handleStatusClick = (schemeId: string, nextStatus: ApplicationStatus) => {
    onUpdateStatus(schemeId, nextStatus);
    if (nextStatus === 'approved') {
      setCelebratingSchemeId(schemeId);
      window.setTimeout(() => {
        setCelebratingSchemeId((curr) => (curr === schemeId ? null : curr));
      }, 1000);
    }
  };

  if (!user) {
    return (
      <div className="space-y-10">
        <div className="max-w-xl mx-auto glass-panel rounded-[28px] p-8 sm:p-10 text-center space-y-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-mist/55 border border-white flex items-center justify-center text-navy">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-hero-title text-3xl font-extrabold text-ink">
            {lang === 'hi' ? 'मेरे आवेदन ट्रैकर' : 'My Applications Tracker'}
          </h1>
          <p className="text-sm sm:text-base text-ink/75 leading-relaxed">
            {lang === 'hi'
              ? 'अपनी शॉर्टलिस्ट की गई सरकारी योजनाओं, तैयार दस्तावेज़ों और आवेदन की स्थिति को ट्रैक करने के लिए साइन इन करें।'
              : 'Sign in with your citizen account to save schemes, keep your ticked document checklists synced, and manually track your official portal applications.'}
          </p>
          <div className="pt-2">
            <MagneticButton
              type="button"
              onClick={onOpenAuth}
              className="btn-shimmer px-7 py-3 text-sm font-bold text-snow bg-navy hover:bg-ink rounded-2xl shadow-sm cursor-pointer transition-colors"
            >
              {lang === 'hi' ? 'साइन इन करें' : 'Sign In to View Applications'}
            </MagneticButton>
          </div>
        </div>

        <CivicVoiceBanner lang={lang} onOpenExplainForm={onOpenExplainForm} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glass-panel rounded-[28px] p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="kicker-label text-xs text-steel">
              {user.name} · {user.email}
            </p>
            <h1 className="font-hero-title mt-1.5 text-3xl sm:text-4xl font-extrabold text-ink">
              {lang === 'hi' ? 'मेरे सेव किए गए आवेदन' : 'My Saved Schemes & Status Tracker'}
            </h1>
          </div>
          <span className="px-4 py-2 rounded-2xl bg-mist/45 border border-white text-xs font-mono tabular-nums font-bold text-navy">
            {applications.length} {lang === 'hi' ? 'योजनाएं ट्रैक में' : 'tracked schemes'}
          </span>
        </div>

        {/* Non-enrollment Honest Notice */}
        <div className="p-4 bg-white/75 border border-white rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-ink/80 leading-relaxed">
          <Info className="w-4 h-4 text-steel shrink-0 mt-0.5" />
          <p>
            {lang === 'hi'
              ? 'स्पष्टीकरण: योजना साथी केवल आपकी व्यक्तिगत तैयारी और स्थिति ट्रैक करने का साधन है। हम आपकी ओर से सरकारी फॉर्म जमा नहीं करते — वास्तविक आवेदन हमेशा आधिकारिक .gov.in वेबसाइट या जन सेवा केंद्र (CSC) पर करें।'
              : 'Important: This tracker is for your personal preparation and record-keeping. Yojana Saathi does not submit forms or enroll you automatically—actual applications happen strictly on official .gov.in portals.'}
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <FriendlyEmptyState
          title={
            lang === 'hi'
              ? 'आपने अभी तक कोई योजना सेव नहीं की है'
              : 'No Saved Schemes Yet'
          }
          description={
            lang === 'hi'
              ? 'पात्रता जांचें या सभी 12 केंद्रीय योजनाओं की सूची से योजना सेव करके यहाँ ट्रैक करें।'
              : 'Check your eligibility or browse the 12 central government schemes to shortlist applications here.'
          }
          actionLabel={lang === 'hi' ? 'योजनाएं खोजें' : 'Discover Eligible Schemes'}
          onAction={onBrowseSchemes}
        />
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const scheme = schemes.find((s) => s.id === app.schemeId);
            if (!scheme) return null;

            const totalDocs = scheme.documents.length;
            const readyDocs = scheme.documents.filter((d) =>
              app.checkedDocuments.includes(d)
            ).length;

            const stageIdx = STATUS_OPTIONS.findIndex((s) => s.value === app.status);
            const progressRatio = stageIdx <= 0 ? 0 : stageIdx / (STATUS_OPTIONS.length - 1);

            return (
              <TiltCard
                key={app.schemeId}
                maxTilt={4}
                cursorLabel={lang === 'hi' ? 'खोलें' : 'Open'}
                className="glass-panel rounded-[28px] p-6 sm:p-8"
              >
                <div className="space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="kicker-label text-xs text-steel">
                        {lang === 'hi' ? scheme.category_hi : scheme.category} ·{' '}
                        <span className="font-mono tabular-nums">
                          {readyDocs}/{totalDocs}{' '}
                          {lang === 'hi' ? 'दस्तावेज़ तैयार' : 'documents checked'}
                        </span>{' '}
                        ·{' '}
                        <span className="font-mono tabular-nums">
                          {new Date(app.updatedAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <h2 className="font-card-title mt-1.5 text-xl sm:text-2xl font-bold text-navy">
                        {lang === 'hi' ? scheme.name_hi : scheme.name}
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm text-ink/80 tabular-nums">
                        {lang === 'hi' ? scheme.benefits_hi : scheme.benefits}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveApplication(app.schemeId)}
                      title={lang === 'hi' ? 'हटाएं' : 'Remove from tracker'}
                      className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-ink/65 hover:text-plum hover:bg-blush/55 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'हटाएं' : 'Remove'}</span>
                    </button>
                  </div>

                  {/* Animated Progress Line Status Tracker + Confetti on Approved */}
                  <div className="pt-5 border-t border-mist/60 space-y-4">
                    <p className="text-xs font-bold text-navy">
                      {lang === 'hi'
                        ? 'आवेदन की प्रगति (अपडेट करने के लिए चरण चुनें):'
                        : 'Application Progress (Click a stage to update):'}
                    </p>

                    <div className="relative pt-2 pb-1">
                      <div className="hidden sm:block absolute left-[12.5%] right-[12.5%] top-6 h-1.5 rounded-full bg-mist/55 overflow-hidden">
                        <motion.div
                          className="h-full w-full bg-gradient-to-r from-navy via-steel to-plum origin-left"
                          initial={false}
                          animate={{ scaleX: progressRatio }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          style={{ willChange: 'transform' }}
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                        {STATUS_OPTIONS.map((st, idx) => {
                          const isCompletedOrCurrent = idx <= stageIdx;
                          const isCurrent = idx === stageIdx;
                          const isApprovedStage = st.value === 'approved';

                          return (
                            <button
                              key={st.value}
                              type="button"
                              onClick={() => handleStatusClick(app.schemeId, st.value)}
                              className={`min-h-[56px] relative flex flex-col items-center justify-center gap-2 p-2.5 sm:p-2 rounded-2xl border sm:border-transparent transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-white/90 sm:bg-transparent border-steel shadow-2xs sm:shadow-none'
                                  : 'bg-white/50 sm:bg-transparent border-white/75'
                              }`}
                            >
                              {isApprovedStage && (
                                <ConfettiBurst active={celebratingSchemeId === app.schemeId} />
                              )}

                              <span
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-extrabold border-2 transition-colors ${
                                  isCompletedOrCurrent
                                    ? isApprovedStage && isCurrent
                                      ? 'bg-plum border-plum text-white shadow-xs'
                                      : 'bg-navy border-navy text-snow shadow-xs'
                                    : 'bg-snow border-mist text-steel'
                                }`}
                              >
                                {isCompletedOrCurrent ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  idx + 1
                                )}
                              </span>

                              <span
                                className={`text-xs font-bold whitespace-nowrap ${
                                  isCurrent ? 'text-ink' : 'text-ink/65'
                                }`}
                              >
                                {lang === 'hi' ? st.hi : st.en}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-mist/60 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenSchemeDetail(scheme.id)}
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-navy bg-white/85 border border-white rounded-2xl hover:bg-white transition-colors cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4 text-steel" />
                      <span>
                        {lang === 'hi'
                          ? `दस्तावेज़ चेकलिस्ट खोलें (${readyDocs}/${totalDocs})`
                          : `Open Checklist (${readyDocs}/${totalDocs})`}
                      </span>
                    </button>

                    <a
                      href={scheme.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor-label={lang === 'hi' ? 'आवेदन' : 'Apply'}
                      className="btn-shimmer min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-snow bg-navy hover:bg-ink rounded-2xl transition-colors whitespace-nowrap shrink-0 shadow-xs"
                    >
                      <span>
                        {lang === 'hi' ? 'आधिकारिक पोर्टल खोलें' : 'Go to Official Portal'}
                      </span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}

      {/* Bold Civic Grievance / "RAISE YOUR VOICE" Poster Banner */}
      <CivicVoiceBanner lang={lang} onOpenExplainForm={onOpenExplainForm} />
    </div>
  );
};

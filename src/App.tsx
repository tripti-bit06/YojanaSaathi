import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ApplicationStatus,
  CitizenProfile,
  CitizenSessionUser,
  ExtractResponse,
  Language,
  SavedApplication,
  Scheme,
} from './types';
import { matchSchemesAgainstProfile } from './lib/matcher';
import { parseCitizenProfileFallback } from './lib/fallbackParser';
import { toHumanErrorMessage } from './lib/friendlyError';
import { UI_COPY } from './lib/i18n';
import { AppRoute, Header } from './components/Header';
import { HomeDiscovery } from './components/HomeDiscovery';
import { ProfileConfirmForm } from './components/ProfileConfirmForm';
import { ResultsView } from './components/ResultsView';
import { SchemeDetailView } from './components/SchemeDetailView';
import { MyApplicationsView } from './components/MyApplicationsView';
import { ExplainFormView } from './components/ExplainFormView';
import { AuthModal } from './components/AuthModal';
import { CustomCursor } from './components/CustomCursor';
import { SplashIntro } from './components/SplashIntro';
import {
  AmbientBackdrop,
  MagneticButton,
  SkeletonSchemeCards,
} from './components/MotionPrimitives';

const EMPTY_PROFILE: CitizenProfile = {
  age: null,
  gender: null,
  category: null,
  annual_income: null,
  state: null,
  occupation: null,
  education_level: null,
  disability: false,
};

const STORAGE_USER_KEY = 'yojana_saathi_user';
const STORAGE_PROFILE_KEY = 'yojana_saathi_profile';
const STORAGE_LANG_KEY = 'yojana_saathi_lang';

function parsePathToState(pathname: string): { route: AppRoute; schemeId: string | null } {
  if (pathname.startsWith('/scheme/')) {
    const id = pathname.replace('/scheme/', '').trim();
    return { route: 'detail', schemeId: id || null };
  }
  if (pathname === '/confirm') return { route: 'confirm', schemeId: null };
  if (pathname === '/results') return { route: 'results', schemeId: null };
  if (pathname === '/schemes') return { route: 'all-schemes', schemeId: null };
  if (pathname === '/applications') return { route: 'applications', schemeId: null };
  if (pathname === '/explain-form') return { route: 'explain-form', schemeId: null };
  return { route: 'home', schemeId: null };
}

function stateToPath(route: AppRoute, schemeId: string | null): string {
  switch (route) {
    case 'confirm':
      return '/confirm';
    case 'results':
      return '/results';
    case 'all-schemes':
      return '/schemes';
    case 'detail':
      return schemeId ? `/scheme/${schemeId}` : '/schemes';
    case 'applications':
      return '/applications';
    case 'explain-form':
      return '/explain-form';
    default:
      return '/';
  }
}

export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const initialNav = parsePathToState(window.location.pathname);

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    return saved === 'hi' ? 'hi' : 'en';
  });

  const [route, setRoute] = useState<AppRoute>(initialNav.route);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(initialNav.schemeId);
  const [previousListRoute, setPreviousListRoute] = useState<AppRoute>('results');
  const [introReady, setIntroReady] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('yojana_saathi_intro_seen_v1') === '1';
    } catch {
      return true;
    }
  });

  // Schemes dataset state
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [schemesLoading, setSchemesLoading] = useState<boolean>(true);
  const [schemesError, setSchemesError] = useState<string | null>(null);

  // Discovery & Profile state
  const [descriptionText, setDescriptionText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedNote, setExtractedNote] = useState<string | undefined>(undefined);
  const [usedFallback, setUsedFallback] = useState<boolean>(false);
  const [missingFields, setMissingFields] = useState<(keyof CitizenProfile)[]>([]);

  const [profile, setProfile] = useState<CitizenProfile>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
      return raw ? { ...EMPTY_PROFILE, ...JSON.parse(raw) } : EMPTY_PROFILE;
    } catch {
      return EMPTY_PROFILE;
    }
  });

  // Citizen Auth & Saved Applications
  const [user, setUser] = useState<CitizenSessionUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USER_KEY);
      return raw ? (JSON.parse(raw) as CitizenSessionUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingSaveSchemeId, setPendingSaveSchemeId] = useState<string | null>(null);
  const [savedApps, setSavedApps] = useState<SavedApplication[]>([]);
  const [guestCheckedDocs, setGuestCheckedDocs] = useState<Record<string, string[]>>({});

  const navigate = useCallback((nextRoute: AppRoute, schemeId: string | null = null) => {
    setRoute((prev) => {
      if (
        nextRoute === 'detail' &&
        (prev === 'results' || prev === 'all-schemes' || prev === 'applications')
      ) {
        setPreviousListRoute(prev);
      }
      return nextRoute;
    });
    setSelectedSchemeId(schemeId);
    const nextPath = stateToPath(nextRoute, schemeId);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const parsed = parsePathToState(window.location.pathname);
      setRoute(parsed.route);
      setSelectedSchemeId(parsed.schemeId);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  // Load 12 Central Government Schemes
  const fetchSchemes = useCallback(async () => {
    setSchemesLoading(true);
    setSchemesError(null);
    try {
      const res = await fetch('/api/schemes');
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.schemes)) {
        throw new Error(data.error || 'Unable to load government schemes right now.');
      }
      setSchemes(data.schemes);
    } catch (err) {
      setSchemesError(toHumanErrorMessage(err, lang));
    } finally {
      setSchemesLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  // Load saved applications when user logs in
  const fetchUserApplications = useCallback(async (uid: string) => {
    try {
      const res = await fetch('/api/applications', {
        headers: { 'x-citizen-uid': uid },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.applications)) {
          setSavedApps(data.applications);
        }
      }
    } catch {
      // keep local state if offline
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserApplications(user.uid);
    } else {
      setSavedApps([]);
    }
  }, [user, fetchUserApplications]);

  // Pure TypeScript Deterministic Matching (LLM never decides eligibility)
  const matches = useMemo(() => {
    const hasAnyProfileInput =
      profile.age !== null ||
      profile.gender !== null ||
      profile.category !== null ||
      profile.annual_income !== null ||
      profile.state !== null ||
      profile.occupation !== null ||
      profile.education_level !== null ||
      profile.disability === true;

    if (!hasAnyProfileInput) return [];
    return matchSchemesAgainstProfile(schemes, profile);
  }, [schemes, profile]);

  const liveEligibleCount = matches.filter((m) => m.matchType === 'eligible').length;
  const liveVerifyCount = matches.filter((m) => m.matchType === 'needs_verification').length;

  /**
   * Step 1 -> Step 2: Extract profile via server-side Gemini API (/api/extract).
   * If the AI call fails, times out, or network drops, automatically runs the
   * deterministic regex/keyword fallback parser so the citizen NEVER hits a dead end.
   */
  const handleExtractSubmit = async () => {
    if (descriptionText.trim().length < 3) return;
    setIsExtracting(true);
    setExtractError(null);

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 13000);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: descriptionText, lang }),
        signal: controller.signal,
      });

      const data = await res.json();
      if (!res.ok || !data.profile) {
        throw new Error(data.error || 'AI service busy');
      }

      const extracted = data as ExtractResponse;
      setProfile(extracted.profile);
      setMissingFields(extracted.missing_fields || []);
      setExtractedNote(extracted.extracted_note);
      setUsedFallback(Boolean(extracted.used_fallback));
      navigate('confirm');
    } catch {
      // Guaranteed Non-Dead-End Client Fallback: parse profile locally & continue to Step 2
      const fallback = parseCitizenProfileFallback(descriptionText, lang);
      setProfile(fallback.profile);
      setMissingFields(fallback.missing_fields);
      setExtractedNote(fallback.extracted_note);
      setUsedFallback(true);
      navigate('confirm');
    } finally {
      window.clearTimeout(timer);
      setIsExtracting(false);
    }
  };

  // Upsert application on server
  const upsertApplication = async (
    targetUser: CitizenSessionUser,
    schemeId: string,
    status: ApplicationStatus,
    checkedDocuments: string[]
  ) => {
    const optimistic: SavedApplication = {
      schemeId,
      status,
      checkedDocuments,
      updatedAt: new Date().toISOString(),
    };

    setSavedApps((prev) => {
      const idx = prev.findIndex((a) => a.schemeId === schemeId);
      if (idx >= 0) {
        const copyList = [...prev];
        copyList[idx] = optimistic;
        return copyList;
      }
      return [optimistic, ...prev];
    });

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-citizen-uid': targetUser.uid,
        },
        body: JSON.stringify({ schemeId, status, checkedDocuments }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.applications)) {
          setSavedApps(data.applications);
        }
      }
    } catch {
      // keep optimistic UI
    }
  };

  const removeApplication = async (schemeId: string) => {
    if (!user) return;
    setSavedApps((prev) => prev.filter((a) => a.schemeId !== schemeId));
    try {
      await fetch(`/api/applications/${schemeId}`, {
        method: 'DELETE',
        headers: { 'x-citizen-uid': user.uid },
      });
    } catch {
      // ignore
    }
  };

  const handleToggleSaveScheme = (schemeId: string) => {
    if (!user) {
      setPendingSaveSchemeId(schemeId);
      setIsAuthModalOpen(true);
      return;
    }

    const existing = savedApps.find((a) => a.schemeId === schemeId);
    if (existing) {
      removeApplication(schemeId);
    } else {
      const preChecked = guestCheckedDocs[schemeId] || [];
      upsertApplication(user, schemeId, 'saved', preChecked);
    }
  };

  const handleToggleDocument = (schemeId: string, canonicalDoc: string) => {
    const scheme = schemes.find((s) => s.id === schemeId);
    const totalDocs = scheme ? scheme.documents.length : 0;

    if (user) {
      const existing = savedApps.find((a) => a.schemeId === schemeId);
      const currentDocs = existing
        ? existing.checkedDocuments
        : guestCheckedDocs[schemeId] || [];
      const nextDocs = currentDocs.includes(canonicalDoc)
        ? currentDocs.filter((d) => d !== canonicalDoc)
        : [...currentDocs, canonicalDoc];

      let nextStatus: ApplicationStatus = existing ? existing.status : 'saved';
      if (totalDocs > 0 && nextDocs.length === totalDocs && nextStatus === 'saved') {
        nextStatus = 'docs_ready';
      }

      upsertApplication(user, schemeId, nextStatus, nextDocs);
    } else {
      setGuestCheckedDocs((prev) => {
        const current = prev[schemeId] || [];
        const next = current.includes(canonicalDoc)
          ? current.filter((d) => d !== canonicalDoc)
          : [...current, canonicalDoc];
        return { ...prev, [schemeId]: next };
      });
    }
  };

  const handleUpdateApplicationStatus = (schemeId: string, nextStatus: ApplicationStatus) => {
    if (!user) return;
    const existing = savedApps.find((a) => a.schemeId === schemeId);
    if (!existing) return;
    upsertApplication(user, schemeId, nextStatus, existing.checkedDocuments);
  };

  const handleAuthSuccess = (loggedInUser: CitizenSessionUser) => {
    setUser(loggedInUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedInUser));

    if (pendingSaveSchemeId) {
      const preChecked = guestCheckedDocs[pendingSaveSchemeId] || [];
      upsertApplication(loggedInUser, pendingSaveSchemeId, 'saved', preChecked);
      setPendingSaveSchemeId(null);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  const copy = UI_COPY[lang];
  const activeDetailScheme = selectedSchemeId
    ? schemes.find((s) => s.id === selectedSchemeId) || null
    : null;

  const isDiscoverFlow = route === 'home' || route === 'confirm' || route === 'results';

  const discoverSteps: Array<{ id: AppRoute; num: string; en: string; hi: string }> = [
    { id: 'home', num: '1', en: 'Describe', hi: 'विवरण दें' },
    { id: 'confirm', num: '2', en: 'Confirm', hi: 'पुष्टि करें' },
    { id: 'results', num: '3', en: 'Results', hi: 'परिणाम' },
  ];

  return (
    <div
      data-lang={lang}
      className="min-h-screen flex flex-col relative text-ink overflow-x-clip"
    >
      {/* Once-per-session Skippable <=1.4s Navy Curtain Splash */}
      <SplashIntro lang={lang} onComplete={() => setIntroReady(true)} />

      {/* Desktop Soft Custom Cursor + Sparkle Trail (auto-disabled on touch & reduced motion) */}
      <CustomCursor />

      {/* Snow-to-Mist Gradient + Grain + Mouse Parallax Orbs & Blurred Corner Petals */}
      <AmbientBackdrop />

      <Header
        lang={lang}
        onChangeLang={setLang}
        currentRoute={route}
        onNavigate={(next) => navigate(next)}
        user={user}
        savedCount={savedApps.length}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        introReady={introReady}
      />

      {/* Clean Step Indicator on Discover Flow: 1 Describe > 2 Confirm > 3 Results */}
      {isDiscoverFlow && (
        <div className="border-b border-mist/45 bg-white/45 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-1.5 sm:gap-3">
            {discoverSteps.map((step, idx) => {
              const isActive = route === step.id;
              const activeIndex = discoverSteps.findIndex((s) => s.id === route);
              const isCompleted = idx < activeIndex;

              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => navigate(step.id)}
                    className={`min-h-[40px] inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-navy text-snow font-bold shadow-2xs'
                        : isCompleted
                          ? 'text-navy bg-mist/40 hover:bg-mist/65'
                          : 'text-ink/65 hover:text-ink hover:bg-mist/25'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] font-mono font-bold ${
                        isActive
                          ? 'bg-rose text-white'
                          : isCompleted
                            ? 'bg-navy text-snow'
                            : 'bg-mist/65 text-navy'
                      }`}
                    >
                      {step.num}
                    </span>
                    <span>{lang === 'hi' ? step.hi : step.en}</span>
                  </button>

                  {idx < discoverSteps.length - 1 && (
                    <ChevronRight
                      aria-hidden="true"
                      className="w-3.5 h-3.5 text-steel/65 shrink-0"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {schemesLoading ? (
          <SkeletonSchemeCards />
        ) : schemesError ? (
          <div className="glass-panel rounded-[28px] p-8 sm:p-10 text-center max-w-lg mx-auto space-y-4">
            <p className="text-sm sm:text-base font-semibold text-ink">{schemesError}</p>
            <MagneticButton
              type="button"
              onClick={fetchSchemes}
              className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-snow bg-navy hover:bg-ink rounded-2xl cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{lang === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}</span>
            </MagneticButton>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${route}-${selectedSchemeId || ''}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: 'transform, opacity' }}
            >
              {route === 'home' && (
                <HomeDiscovery
                  lang={lang}
                  introReady={introReady}
                  descriptionText={descriptionText}
                  onChangeDescription={setDescriptionText}
                  onExtractSubmit={handleExtractSubmit}
                  onManualEntry={() => {
                    setExtractedNote(undefined);
                    setUsedFallback(false);
                    setMissingFields([]);
                    navigate('confirm');
                  }}
                  onOpenExplainForm={() => navigate('explain-form')}
                  isExtracting={isExtracting}
                  extractError={extractError}
                />
              )}

              {route === 'confirm' && (
                <ProfileConfirmForm
                  lang={lang}
                  profile={profile}
                  missingFields={missingFields}
                  extractedNote={extractedNote}
                  usedFallback={usedFallback}
                  liveEligibleCount={liveEligibleCount}
                  liveVerifyCount={liveVerifyCount}
                  onUpdateProfile={setProfile}
                  onBack={() => navigate('home')}
                  onConfirm={() => navigate('results')}
                />
              )}

              {route === 'results' && (
                <ResultsView
                  mode="matched"
                  lang={lang}
                  matches={matches}
                  allSchemes={schemes}
                  savedApps={savedApps}
                  onEditProfile={() => navigate('confirm')}
                  onSelectScheme={(id) => navigate('detail', id)}
                  onToggleSaveScheme={handleToggleSaveScheme}
                />
              )}

              {route === 'all-schemes' && (
                <ResultsView
                  mode="all"
                  lang={lang}
                  matches={matches}
                  allSchemes={schemes}
                  savedApps={savedApps}
                  onEditProfile={() => navigate('confirm')}
                  onSelectScheme={(id) => navigate('detail', id)}
                  onToggleSaveScheme={handleToggleSaveScheme}
                />
              )}

              {route === 'detail' && activeDetailScheme && (
                <SchemeDetailView
                  scheme={activeDetailScheme}
                  match={matches.find((m) => m.scheme.id === activeDetailScheme.id)}
                  lang={lang}
                  savedApp={savedApps.find((a) => a.schemeId === activeDetailScheme.id)}
                  localCheckedDocs={guestCheckedDocs[activeDetailScheme.id] || []}
                  onBack={() => navigate(previousListRoute)}
                  onToggleDocument={handleToggleDocument}
                  onToggleSave={handleToggleSaveScheme}
                />
              )}

              {route === 'applications' && (
                <MyApplicationsView
                  lang={lang}
                  user={user}
                  applications={savedApps}
                  schemes={schemes}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                  onUpdateStatus={handleUpdateApplicationStatus}
                  onRemoveApplication={removeApplication}
                  onOpenSchemeDetail={(id) => navigate('detail', id)}
                  onBrowseSchemes={() => navigate('home')}
                  onOpenExplainForm={() => navigate('explain-form')}
                />
              )}

              {route === 'explain-form' && <ExplainFormView lang={lang} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Deep Ink (#0A1931) Signature Footer */}
      <footer className="bg-ink text-snow/85 mt-16 border-t border-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="font-hero-title text-lg font-bold text-snow">{copy.brand}</p>
            <p className="text-xs sm:text-sm text-mist/80 leading-relaxed">
              {copy.officialDisclaimer}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold text-mist whitespace-nowrap shrink-0">
            <button
              type="button"
              onClick={() => navigate('all-schemes')}
              className="min-h-[44px] inline-flex items-center hover:text-snow transition-colors cursor-pointer"
            >
              {copy.navAllSchemes}
            </button>
            <span aria-hidden="true" className="text-steel">
              ·
            </span>
            <button
              type="button"
              onClick={() => navigate('explain-form')}
              className="min-h-[44px] inline-flex items-center hover:text-snow transition-colors cursor-pointer"
            >
              {copy.navExplainForm}
            </button>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        lang={lang}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingSaveSchemeId(null);
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

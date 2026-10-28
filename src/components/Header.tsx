import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CitizenSessionUser, Language } from '../types';
import { UI_COPY } from '../lib/i18n';
import { MagneticButton } from './MotionPrimitives';

export type AppRoute =
  | 'home'
  | 'confirm'
  | 'results'
  | 'all-schemes'
  | 'detail'
  | 'applications'
  | 'explain-form';

interface HeaderProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  user: CitizenSessionUser | null;
  savedCount: number;
  onOpenAuth: () => void;
  onSignOut: () => void;
  introReady?: boolean;
}

/**
 * Sticky Glass Navbar with ONLY:
 * Brand, Discover, All Schemes, Explain Form, My Applications, Language Toggle, and Sign In.
 * Active page is clearly highlighted; all tap targets >= 44px.
 */
export const Header: React.FC<HeaderProps> = ({
  lang,
  onChangeLang,
  currentRoute,
  onNavigate,
  user,
  savedCount,
  onOpenAuth,
  onSignOut,
  introReady = true,
}) => {
  const copy = UI_COPY[lang];
  const prefersReducedMotion = useReducedMotion();

  const navItems: { route: AppRoute; label: string }[] = [
    { route: 'home', label: copy.navDiscover },
    { route: 'all-schemes', label: copy.navAllSchemes },
    { route: 'explain-form', label: copy.navExplainForm },
    {
      route: 'applications',
      label: savedCount > 0 ? `${copy.navApplications} (${savedCount})` : copy.navApplications,
    },
  ];

  const isNavItemActive = (itemRoute: AppRoute) =>
    currentRoute === itemRoute ||
    (itemRoute === 'home' && (currentRoute === 'confirm' || currentRoute === 'results'));

  return (
    <motion.header
      initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
      animate={
        prefersReducedMotion
          ? undefined
          : introReady
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: -12 }
      }
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: 'transform, opacity' }}
      className="glass-nav sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8 py-2.5">
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="min-h-[44px] inline-flex items-center font-hero-title text-xl sm:text-2xl font-extrabold text-ink hover:text-navy transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel"
        >
          {copy.brand}
        </button>

        {/* Desktop Primary Navigation: Discover, All Schemes, Explain Form, My Applications */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-2 text-sm font-semibold">
          {navItems.map((item) => {
            const isActive = isNavItemActive(item.route);
            return (
              <button
                key={item.route}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onNavigate(item.route)}
                className={`relative min-h-[44px] px-3.5 inline-flex items-center rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-navy font-bold bg-mist/45'
                    : 'text-ink/75 hover:text-ink hover:bg-mist/25'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId={prefersReducedMotion ? undefined : 'activeNavIndicator'}
                    className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-rose"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Language Toggle + Sign In */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div
            role="group"
            aria-label="Language toggle"
            className="inline-flex items-center p-1 bg-mist/40 border border-white/85 rounded-2xl min-h-[44px]"
          >
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              aria-pressed={lang === 'en'}
              className={`min-h-[36px] px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                lang === 'en'
                  ? 'bg-navy text-snow shadow-xs'
                  : 'text-navy/80 hover:text-ink'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('hi')}
              aria-pressed={lang === 'hi'}
              className={`min-h-[36px] px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                lang === 'hi'
                  ? 'bg-navy text-snow shadow-xs'
                  : 'text-navy/80 hover:text-ink'
              }`}
            >
              हिंदी
            </button>
          </div>

          {user ? (
            <button
              type="button"
              onClick={onSignOut}
              title={user.email}
              className="min-h-[44px] px-4 text-xs font-bold text-navy bg-white/80 border border-mist/80 rounded-2xl hover:bg-mist/55 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {user.name.split(' ')[0]} · {copy.signOut}
            </button>
          ) : (
            <MagneticButton
              type="button"
              onClick={onOpenAuth}
              className="btn-shimmer px-4 sm:px-5 py-2.5 text-xs font-bold text-snow bg-navy hover:bg-ink rounded-2xl shadow-[0_8px_20px_-6px_rgba(26,61,99,0.4)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copy.signIn}
            </MagneticButton>
          )}
        </div>
      </div>

      {/* Responsive Tablet/Mobile Navigation Row (No horizontal overflow) */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-1.5 px-4 py-2 border-t border-mist/45 bg-snow/75 text-xs font-semibold"
      >
        {navItems.map((item) => {
          const isActive = isNavItemActive(item.route);
          return (
            <button
              key={item.route}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(item.route)}
              className={`min-h-[44px] px-2.5 rounded-xl flex items-center justify-center text-center transition-colors cursor-pointer ${
                isActive
                  ? 'bg-navy text-snow font-bold shadow-2xs'
                  : 'text-ink/75 hover:bg-mist/35 hover:text-ink'
              }`}
            >
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </motion.header>
  );
};

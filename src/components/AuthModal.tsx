import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CitizenSessionUser, Language } from '../types';
import { MagneticButton } from './MotionPrimitives';

interface AuthModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onSuccess: (user: CitizenSessionUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, lang, onClose, onSuccess }) => {
  const prefersReducedMotion = useReducedMotion();
  const [name, setName] = useState('Aarav Sharma');
  const [email, setEmail] = useState('citizen@example.in');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !cleanEmail.includes('@')) {
      setError(
        lang === 'hi'
          ? 'कृपया अपना नाम और वैध ईमेल पता दर्ज करें।'
          : 'Please enter your name and a valid email address.'
      );
      return;
    }

    const uid = `citizen_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    onSuccess({ uid, name: cleanName, email: cleanEmail });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 backdrop-blur-md p-4"
        >
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-snow/95 backdrop-blur-2xl border border-white rounded-[28px] p-6 sm:p-8 shadow-[0_28px_70px_-15px_rgba(10,25,49,0.45)]"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-mist/60">
              <div>
                <h2 className="font-card-title text-xl font-bold text-navy">
                  {lang === 'hi'
                    ? 'आवेदन ट्रैकर के लिए साइन इन करें'
                    : 'Sign In to Save & Track Schemes'}
                </h2>
                <p className="text-xs sm:text-sm text-ink/70 mt-1">
                  {lang === 'hi'
                    ? 'योजनाओं को सेव करने और दस्तावेज़ चेकलिस्ट सुरक्षित रखने के लिए अपनी प्रोफ़ाइल जोड़ें।'
                    : 'Save shortlisted schemes, tick off required documents, and track your portal application status.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-steel hover:text-ink hover:bg-mist/40 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="citizen-name"
                  className="block text-xs font-bold text-navy mb-1.5"
                >
                  {lang === 'hi' ? 'पूरा नाम' : 'Full Name'}
                </label>
                <input
                  id="citizen-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  className="min-h-[44px] w-full px-4 py-3 text-sm bg-white border border-mist rounded-2xl text-ink focus:outline-none focus:border-steel"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="citizen-email"
                  className="block text-xs font-bold text-navy mb-1.5"
                >
                  {lang === 'hi'
                    ? 'ईमेल पता (खाता पहचान)'
                    : 'Email Address (Account Identifier)'}
                </label>
                <input
                  id="citizen-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="min-h-[44px] w-full px-4 py-3 text-sm bg-white border border-mist rounded-2xl text-ink focus:outline-none focus:border-steel"
                  required
                />
              </div>

              {error && <p className="text-xs font-bold text-plum">{error}</p>}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2.5 text-xs font-bold text-navy bg-mist/40 rounded-2xl hover:bg-mist/70 transition-colors cursor-pointer"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <MagneticButton
                  type="submit"
                  className="btn-shimmer px-6 py-2.5 text-xs font-bold text-snow bg-navy hover:bg-ink rounded-2xl shadow-sm transition-colors cursor-pointer"
                >
                  {lang === 'hi' ? 'जारी रखें' : 'Continue with Account'}
                </MagneticButton>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-mist/60 flex items-start gap-2.5 text-xs text-ink/70">
              <ShieldCheck className="w-4 h-4 text-steel shrink-0 mt-0.5" />
              <p>
                {lang === 'hi'
                  ? 'योजना साथी आपसे कभी भी आधार नंबर या बैंक ओटीपी नहीं मांगता है। वास्तविक आवेदन केवल आधिकारिक सरकारी वेबसाइट पर होता है।'
                  : 'Yojana Saathi never asks for your Aadhaar number or OTP. Final scheme submission always happens on the official .gov.in portal.'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React, { useEffect } from 'react';
import { motion, useReducedMotion, useSpring } from 'motion/react';

interface BooksStackProps {
  className?: string;
}

/**
 * Original Scholarly Books Stack Illustration (BooksStack.tsx)
 * - 5 stacked hardcover books in --navy, --steel, --mist with 2 rose-pink/plum spines
 * - 1 open book at the front/top with arched fanned pages
 * - Small graduation mortarboard cap perched on top with warm tassel
 * - Soft radial blush & mist glow behind the stack
 * - Gentle 6s vertical float (translateY +-10px) + 3 drifting pages/petals around it
 */
export const BooksStack: React.FC<BooksStackProps> = ({ className = '' }) => {
  const prefersReducedMotion = useReducedMotion();
  const px = useSpring(0, { stiffness: 100, damping: 24 });
  const py = useSpring(0, { stiffness: 100, damping: 24 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches) return;

    const handleMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * -2;
      const ny = (e.clientY / window.innerHeight - 0.5) * -2;
      px.set(nx * 10);
      py.set(ny * 8);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [prefersReducedMotion, px, py]);

  // 3 slowly drifting pages & petals around the books (transform & opacity only)
  const floatingLeaves = [
    {
      type: 'page' as const,
      left: '10%',
      top: '8%',
      delay: 0.4,
      duration: 9.5,
      driftX: 16,
      rotStart: -14,
      rotEnd: 28,
    },
    {
      type: 'petal' as const,
      left: '84%',
      top: '12%',
      delay: 2.2,
      duration: 10.5,
      driftX: -18,
      rotStart: 12,
      rotEnd: -36,
    },
    {
      type: 'page' as const,
      left: '76%',
      top: '4%',
      delay: 4.6,
      duration: 11,
      driftX: -12,
      rotStart: 8,
      rotEnd: 42,
    },
  ];

  return (
    <motion.div
      aria-hidden="true"
      className={`relative select-none pointer-events-none ${className}`}
      style={prefersReducedMotion ? undefined : { x: px, y: py, willChange: 'transform' }}
    >
      {/* Soft Warm Blush & Mist Scholarly Glow Behind the Stack */}
      <div
        className="absolute inset-4 rounded-full blur-2xl opacity-80 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(249,211,220,0.68) 0%, rgba(179,207,229,0.52) 52%, rgba(246,250,253,0) 78%)',
        }}
      />

      {/* 3 Slowly Drifting Pages & Petal Around the Stack */}
      {!prefersReducedMotion &&
        floatingLeaves.map((item, idx) => (
          <motion.div
            key={idx}
            className="absolute z-20 pointer-events-none"
            style={{
              left: item.left,
              top: item.top,
              willChange: 'transform, opacity',
            }}
            initial={{ y: 0, x: 0, rotate: item.rotStart, opacity: 0 }}
            animate={{
              y: [0, 175],
              x: [0, item.driftX, 0],
              rotate: [item.rotStart, item.rotEnd],
              opacity: [0, 0.85, 0.7, 0],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {item.type === 'page' ? (
              <svg viewBox="0 0 28 22" fill="none" className="w-6 h-5 drop-shadow-xs">
                <path
                  d="M2 5 C9 1, 19 3, 26 7 L23 19 C16 15, 7 14, 2 17 Z"
                  fill="#FFFFFF"
                  stroke="#B3CFE5"
                  strokeWidth="1.2"
                />
                <path
                  d="M6 8 C11 6.5, 16 7.5, 20 9.5 M6 12 C10 10.8, 15 11.5, 18 13"
                  stroke="#4A7FA7"
                  strokeOpacity="0.45"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 20 26" fill="none" className="w-4 h-5">
                <path
                  d="M10 2 C16 8, 18 17, 10 24 C2 17, 4 8, 10 2 Z"
                  fill="#F9D3DC"
                  stroke="#E27A9B"
                  strokeOpacity="0.45"
                  strokeWidth="1"
                />
              </svg>
            )}
          </motion.div>
        ))}

      {/* Gently Floating Books Stack (translateY +-10px, 6s loop) */}
      <motion.div
        className="relative z-10 w-full h-full flex items-center justify-center"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                y: [-10, 10, -10],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
        style={{ willChange: 'transform' }}
      >
        <svg
          viewBox="0 0 420 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_22px_32px_rgba(10,25,49,0.13)]"
        >
          <defs>
            {/* Navy Cover Gradient */}
            <linearGradient id="bookNavy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#234E7D" />
              <stop offset="100%" stopColor="#0A1931" />
            </linearGradient>

            {/* Steel Blue Spine Gradient */}
            <linearGradient id="bookSteel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5B92BC" />
              <stop offset="100%" stopColor="#3B6C92" />
            </linearGradient>

            {/* Rose Pink Spine Gradient */}
            <linearGradient id="bookRose" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EE8FAD" />
              <stop offset="100%" stopColor="#CE6186" />
            </linearGradient>

            {/* Mist Soft Blue Spine Gradient */}
            <linearGradient id="bookMist" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C7DFEE" />
              <stop offset="100%" stopColor="#94BBD8" />
            </linearGradient>

            {/* Deep Plum-Rose Slim Spine Gradient */}
            <linearGradient id="bookPlum" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C15080" />
              <stop offset="100%" stopColor="#932F5C" />
            </linearGradient>

            {/* Warm Ivory Paper Block Gradient */}
            <linearGradient id="paperBlock" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#F8F4EC" />
              <stop offset="100%" stopColor="#EAE3D5" />
            </linearGradient>

            {/* Open Book Left & Right Fanned Page Gradients */}
            <linearGradient id="openPageLeft" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="82%" stopColor="#F5F8FC" />
              <stop offset="100%" stopColor="#DCE7F2" />
            </linearGradient>

            <linearGradient id="openPageRight" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="82%" stopColor="#F5F8FC" />
              <stop offset="100%" stopColor="#DCE7F2" />
            </linearGradient>

            {/* Cap Board Gradient */}
            <linearGradient id="capTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1A3D63" />
              <stop offset="100%" stopColor="#0A1931" />
            </linearGradient>
          </defs>

          {/* Soft Ground Contact Shadow */}
          <ellipse cx="210" cy="356" rx="148" ry="16" fill="#1A3D63" opacity="0.1" />
          <ellipse cx="210" cy="356" rx="106" ry="9" fill="#0A1931" opacity="0.09" />

          {/* ==============================================================
              BOOK 1 (Bottom Heavy Foundation Tome — Deep Navy + Page Block)
             ============================================================== */}
          <g>
            {/* Outer Navy Cover */}
            <rect x="66" y="302" width="288" height="44" rx="11" fill="url(#bookNavy)" />
            {/* Cream Fore-edge Page Block (Right side) */}
            <path
              d="M236 307 H344 C349 307, 350 341, 344 341 H236 Z"
              fill="url(#paperBlock)"
            />
            {/* Ruled Page Striations */}
            <path
              d="M244 314 H342 M244 321 H344 M244 328 H343 M244 335 H341"
              stroke="#C9D6E3"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Spine Hub Bands & Title Foil */}
            <rect x="86" y="302" width="6" height="44" fill="#4A7FA7" opacity="0.45" />
            <rect x="100" y="302" width="4" height="44" fill="#F4C873" opacity="0.65" />
            <rect x="122" y="319" width="76" height="5" rx="2.5" fill="#B3CFE5" opacity="0.55" />
            <rect x="122" y="328" width="44" height="3.5" rx="1.75" fill="#B3CFE5" opacity="0.35" />
            {/* Bookmark Ribbon Tail */}
            <path d="M278 326 V355 L285 349 L292 355 V326 Z" fill="#E27A9B" />
          </g>

          {/* ==============================================================
              BOOK 2 (Second Tome — Rose-Pink Spine Accent)
             ============================================================== */}
          <g>
            <rect x="82" y="262" width="262" height="38" rx="10" fill="url(#bookRose)" />
            {/* Left Page Block (Alternating Orientation for Natural Scholarly Look) */}
            <path
              d="M90 267 H186 V295 H90 C85 295, 85 267, 90 267 Z"
              fill="url(#paperBlock)"
            />
            <path
              d="M92 273 H180 M92 280 H182 M92 287 H179"
              stroke="#E5CAD3"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Rose Spine Decorative Gold & Blush Accents */}
            <rect x="314" y="262" width="5" height="38" fill="#F9D3DC" opacity="0.7" />
            <rect x="302" y="262" width="3" height="38" fill="#F4C873" opacity="0.75" />
            <rect x="214" y="276" width="68" height="5" rx="2.5" fill="#FFFFFF" opacity="0.78" />
            <circle cx="200" cy="281" r="4" fill="#F9D3DC" opacity="0.85" />
          </g>

          {/* ==============================================================
              BOOK 3 (Third Tome — Steel Blue Hardcover)
             ============================================================== */}
          <g>
            <rect x="74" y="224" width="258" height="36" rx="9.5" fill="url(#bookSteel)" />
            {/* Right Page Block */}
            <path
              d="M234 229 H324 C328 229, 328 255, 324 255 H234 Z"
              fill="url(#paperBlock)"
            />
            <path
              d="M240 235 H321 M240 242 H323 M240 249 H320"
              stroke="#C9D6E3"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Spine Ridges & Label */}
            <rect x="94" y="224" width="5" height="36" fill="#B3CFE5" opacity="0.55" />
            <rect x="106" y="224" width="3" height="36" fill="#FFFFFF" opacity="0.45" />
            <rect x="124" y="236" width="84" height="12" rx="4" fill="#1A3D63" opacity="0.42" />
            <rect x="132" y="240" width="54" height="4" rx="2" fill="#F6FAFD" opacity="0.8" />
          </g>

          {/* ==============================================================
              BOOK 4 (Fourth Tome — Soft Mist Blue Spine)
             ============================================================== */}
          <g>
            <rect x="94" y="190" width="236" height="32" rx="8.5" fill="url(#bookMist)" />
            <rect x="112" y="190" width="5" height="32" fill="#1A3D63" opacity="0.22" />
            <rect x="298" y="190" width="5" height="32" fill="#1A3D63" opacity="0.22" />
            <rect x="156" y="201" width="96" height="10" rx="4" fill="#FFFFFF" opacity="0.7" />
            <rect x="168" y="204.5" width="72" height="3" rx="1.5" fill="#1A3D63" opacity="0.55" />
          </g>

          {/* ==============================================================
              BOOK 5 (Fifth Slim Hardcover — Plum/Rose Spine, Slight Scholarly Offset)
             ============================================================== */}
          <g transform="rotate(-1.4 210 174)">
            <rect x="106" y="162" width="208" height="26" rx="7" fill="url(#bookPlum)" />
            <rect x="124" y="162" width="4" height="26" fill="#F4C873" opacity="0.75" />
            <rect x="292" y="162" width="4" height="26" fill="#F9D3DC" opacity="0.65" />
            <rect x="158" y="172" width="88" height="4.5" rx="2.25" fill="#F9D3DC" opacity="0.8" />
          </g>

          {/* ==============================================================
              OPEN BOOK WITH FANNED PAGES (Resting atop the stack)
             ============================================================== */}
          <g>
            {/* Open Navy Cover Boards Base */}
            <path
              d="M84 156 C132 146, 182 152, 210 162 C238 152, 288 146, 336 156 L342 163 C290 154, 240 159, 210 169 C180 159, 130 154, 78 163 Z"
              fill="#1A3D63"
            />

            {/* Lower Page Stack Left & Right */}
            <path
              d="M90 153 C136 134, 182 138, 210 159 C182 146, 136 143, 88 156 Z"
              fill="#E5EEF6"
            />
            <path
              d="M330 153 C284 134, 238 138, 210 159 C238 146, 284 143, 332 156 Z"
              fill="#E5EEF6"
            />

            {/* Fanned Sheet 3 (Outer Arch) */}
            <path
              d="M96 146 C138 118, 184 124, 210 157 C182 136, 138 132, 94 150 Z"
              fill="url(#openPageLeft)"
              stroke="#C5D8EA"
              strokeWidth="1"
            />
            <path
              d="M324 146 C282 118, 236 124, 210 157 C238 136, 282 132, 326 150 Z"
              fill="url(#openPageRight)"
              stroke="#C5D8EA"
              strokeWidth="1"
            />

            {/* Fanned Sheet 2 (Middle Arch) */}
            <path
              d="M106 135 C144 102, 186 110, 210 155 C184 124, 144 118, 104 140 Z"
              fill="#FFFFFF"
              stroke="#CFE0EE"
              strokeWidth="1"
            />
            <path
              d="M314 135 C276 102, 234 110, 210 155 C236 124, 276 118, 316 140 Z"
              fill="#FFFFFF"
              stroke="#CFE0EE"
              strokeWidth="1"
            />

            {/* Fanned Sheet 1 (Innermost Steep Fanning Leaves) */}
            <path
              d="M124 122 C156 90, 190 98, 210 153 C188 112, 156 104, 122 126 Z"
              fill="#FFFFFF"
              stroke="#D6E5F2"
              strokeWidth="1"
            />
            <path
              d="M296 122 C264 90, 230 98, 210 153 C232 112, 264 104, 298 126 Z"
              fill="#FFFFFF"
              stroke="#D6E5F2"
              strokeWidth="1"
            />

            {/* Subtle Ruled Lines on Open Pages */}
            <path
              d="M122 133 C148 120, 174 123, 194 138 M116 141 C146 129, 174 132, 196 145"
              stroke="#9AB8D3"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.65"
            />
            <path
              d="M298 133 C272 120, 246 123, 226 138 M304 141 C274 129, 246 132, 224 145"
              stroke="#9AB8D3"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.65"
            />

            {/* Center Spine Gutter Highlight */}
            <circle cx="210" cy="162" r="4.5" fill="#E27A9B" />
          </g>

          {/* ==============================================================
              SMALL GRADUATION MORTARBOARD CAP ON TOP
             ============================================================== */}
          <g transform="translate(14, -6) rotate(4 210 82)">
            {/* Cap Fitted Base (Skullcap) */}
            <path
              d="M174 78 V96 C174 105, 246 105, 246 96 V78 Z"
              fill="#1A3D63"
              stroke="#0A1931"
              strokeWidth="1.5"
            />
            <path
              d="M174 92 C192 99, 228 99, 246 92"
              stroke="#4A7FA7"
              strokeWidth="1.5"
              opacity="0.7"
            />

            {/* Mortarboard Diamond Top */}
            <path
              d="M142 72 L210 46 L278 72 L210 96 L142 72 Z"
              fill="url(#capTopGrad)"
              stroke="#4A7FA7"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />

            {/* Center Button & Hanging Gold/Rose Tassel */}
            <ellipse cx="210" cy="71" rx="5" ry="3" fill="#F4C873" />
            <path
              d="M210 71 C228 75, 248 80, 256 88 V110"
              stroke="#F4C873"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <circle cx="256" cy="108" r="3.5" fill="#E27A9B" />
            <path
              d="M256 110 L252 121 M256 110 L256 122 M256 110 L260 121"
              stroke="#F4C873"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </motion.div>
    </motion.div>
  );
};

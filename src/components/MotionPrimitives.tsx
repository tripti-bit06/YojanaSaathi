import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';

/**
 * Small Blurred Decorative Lily/Petal Cluster for Section Corners
 */
export const CornerPetalAccent: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 120 120"
    fill="none"
    className={`pointer-events-none select-none ${className}`}
  >
    <path
      d="M60 95 C42 66, 18 52, 10 26 C38 24, 58 46, 62 92 Z"
      fill="#F9D3DC"
      opacity="0.72"
    />
    <path
      d="M62 94 C64 56, 82 28, 108 22 C104 52, 84 76, 62 94 Z"
      fill="#E27A9B"
      opacity="0.38"
    />
    <path
      d="M60 96 C54 62, 56 30, 62 12 C70 30, 70 62, 60 96 Z"
      fill="#B3CFE5"
      opacity="0.52"
    />
  </svg>
);

/**
 * Ambient Snow-to-Mist Gradient + Subtle Grain + Mouse Parallax Orbs & Corner Petals.
 */
export const AmbientBackdrop: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const parallaxX = useSpring(0, { stiffness: 90, damping: 24 });
  const parallaxY = useSpring(0, { stiffness: 90, damping: 24 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches) return;

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * -2; // opposite shift max +-14px
      const ny = (e.clientY / window.innerHeight - 0.5) * -2;
      parallaxX.set(nx * 14);
      parallaxY.set(ny * 14);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [parallaxX, parallaxY, prefersReducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 subtle-grain"
      style={{
        background:
          'linear-gradient(165deg, #F6FAFD 0%, #EEF5FB 48%, #E4EFF8 82%, #F6FAFD 100%)',
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={
          prefersReducedMotion ? undefined : { x: parallaxX, y: parallaxY, willChange: 'transform' }
        }
      >
        {/* Soft Blue-Mist Gradient Blobs */}
        <motion.div
          className="absolute -top-32 -left-24 w-[440px] h-[440px] rounded-full opacity-50 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #B3CFE5 0%, rgba(179,207,229,0) 70%)',
            willChange: 'transform',
          }}
          animate={prefersReducedMotion ? undefined : { y: [-16, 18, -16] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 11, repeat: Infinity, ease: 'easeInOut' }
          }
        />

        <motion.div
          className="absolute top-36 -right-28 w-[420px] h-[420px] rounded-full opacity-35 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #8AB5D6 0%, rgba(74,127,167,0) 70%)',
            willChange: 'transform',
          }}
          animate={prefersReducedMotion ? undefined : { y: [18, -18, 18] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 12.5, repeat: Infinity, ease: 'easeInOut' }
          }
        />

        {/* Subtle Blush Glow (~25% Pink Accent Balance) */}
        <div
          className="absolute top-24 right-[18%] w-[300px] h-[300px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #F9D3DC 0%, rgba(249,211,220,0) 72%)',
          }}
        />

        {/* Floating Specular Glass Orbs */}
        <motion.div
          className="glass-orb-blue hidden md:block absolute top-28 left-[6%] w-16 h-16 rounded-full opacity-65"
          style={{ willChange: 'transform' }}
          animate={prefersReducedMotion ? undefined : { y: [-14, 14, -14] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 9, repeat: Infinity, ease: 'easeInOut' }
          }
        />

        {/* 3 Blurred Lower-Opacity Corner Lily/Petal Accents */}
        <CornerPetalAccent className="absolute top-20 right-4 w-28 h-28 opacity-35 blur-[2px] rotate-[-18deg]" />
        <CornerPetalAccent className="absolute bottom-14 left-4 w-32 h-32 opacity-30 blur-[3px] rotate-[28deg]" />
        <CornerPetalAccent className="hidden lg:block absolute bottom-24 right-10 w-24 h-24 opacity-25 blur-[2px] rotate-[-35deg]" />
      </motion.div>
    </div>
  );
};

/**
 * 7 Slowly Drifting Watercolor Petals in the Hero (transform & opacity only).
 */
export const HeroDriftingPetals: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return null;

  const petals = [
    { left: '8%', delay: 0, duration: 15, size: 16, driftX: 22, rot: 140 },
    { left: '22%', delay: 2.5, duration: 17, size: 13, driftX: -18, rot: -120 },
    { left: '42%', delay: 5, duration: 14, size: 15, driftX: 20, rot: 160 },
    { left: '61%', delay: 1.2, duration: 16, size: 18, driftX: -24, rot: -150 },
    { left: '76%', delay: 4, duration: 15.5, size: 14, driftX: 16, rot: 130 },
    { left: '88%', delay: 6.5, duration: 18, size: 16, driftX: -20, rot: -140 },
    { left: '94%', delay: 3.2, duration: 16.5, size: 12, driftX: -14, rot: 110 },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 overflow-hidden -z-0"
    >
      {petals.map((p, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 24 32"
          style={{
            left: p.left,
            top: -28,
            width: p.size,
            height: p.size * 1.3,
            willChange: 'transform, opacity',
          }}
          className="absolute"
          initial={{ y: -20, x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: [0, 440],
            x: [0, p.driftX, 0],
            rotate: [0, p.rot],
            opacity: [0, 0.55, 0.45, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <path
            d="M12 2 C19 9, 22 20, 12 30 C2 20, 5 9, 12 2 Z"
            fill={i % 3 === 0 ? '#E27A9B' : '#F9D3DC'}
            stroke="#E27A9B"
            strokeOpacity="0.25"
          />
        </motion.svg>
      ))}
    </div>
  );
};

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  title?: string;
}

/**
 * Primary CTA Magnetic Button — pulls gently toward cursor within ~60px on desktop,
 * with soft press scale and at least 44px touch height.
 */
export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  title,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const btnRef = useRef<HTMLButtonElement>(null);
  const x = useSpring(0, { stiffness: 260, damping: 20 });
  const y = useSpring(0, { stiffness: 260, damping: 20 });

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion || disabled || e.pointerType !== 'mouse' || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist < Math.max(rect.width / 2 + 60, 90)) {
      x.set(Math.max(-6, Math.min(6, dx * 0.14)));
      y.set(Math.max(-5, Math.min(5, dy * 0.14)));
    }
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={btnRef}
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      whileTap={prefersReducedMotion || disabled ? undefined : { scale: 0.97 }}
      style={prefersReducedMotion ? undefined : { x, y, willChange: 'transform' }}
      className={`min-h-[44px] ${className}`}
    >
      {children}
    </motion.button>
  );
};

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  cursorLabel?: string;
}

/**
 * 3D Perspective Card (max 6deg tilt) + Moving Light Glare + Soft Pop-Up Lift (-6px).
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 5,
  cursorLabel,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useSpring(0, { stiffness: 240, damping: 24 });
  const rotateY = useSpring(0, { stiffness: 240, damping: 24 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const glareBackground = useMotionTemplate`radial-gradient(400px circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.42), transparent 65%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || e.pointerType !== 'mouse' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top) / rect.height;

    const clampedTilt = Math.min(maxTilt, 6);
    rotateX.set((0.5 - yPct) * clampedTilt * 2);
    rotateY.set((xPct - 0.5) * clampedTilt * 2);
    glareX.set(xPct * 100);
    glareY.set(yPct * 100);
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    if (e.pointerType === 'mouse') {
      setIsHovered(true);
    }
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div style={{ perspective: '1000px' }}>
      <motion.div
        ref={cardRef}
        data-cursor-label={cursorLabel}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        whileHover={
          prefersReducedMotion
            ? undefined
            : {
                y: -6,
                transition: { duration: 0.22, ease: 'easeOut' },
              }
        }
        style={
          prefersReducedMotion
            ? undefined
            : {
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                willChange: 'transform',
              }
        }
        className={`relative overflow-hidden transition-shadow duration-300 hover:shadow-[0_26px_54px_-16px_rgba(10,25,49,0.14)] ${className}`}
      >
        {children}

        {!prefersReducedMotion && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
            style={{
              background: glareBackground,
              opacity: isHovered ? 1 : 0,
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

interface BrushHighlightProps {
  children: React.ReactNode;
  color?: 'rose' | 'steel' | 'plum';
  className?: string;
  animateDraw?: boolean;
  drawDelay?: number;
}

export const BrushHighlight: React.FC<BrushHighlightProps> = ({
  children,
  color = 'rose',
  className = '',
  animateDraw = false,
  drawDelay = 0.32,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const fillMap = {
    rose: '#F9D3DC',
    steel: '#B3CFE5',
    plum: '#F7C9D7',
  };

  const shouldAnimate = animateDraw && !prefersReducedMotion;

  return (
    <span className={`relative inline-block px-1.5 ${className}`}>
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 260 54"
        preserveAspectRatio="none"
        initial={shouldAnimate ? { scaleX: 0, opacity: 0 } : false}
        animate={shouldAnimate ? { scaleX: 1, opacity: 1 } : undefined}
        transition={
          shouldAnimate
            ? {
                delay: drawDelay,
                duration: 0.48,
                ease: [0.22, 1, 0.36, 1],
              }
            : undefined
        }
        style={
          shouldAnimate
            ? { transformOrigin: 'left center', willChange: 'transform, opacity' }
            : undefined
        }
        className="absolute -inset-x-1 bottom-0.5 h-[62%] w-[calc(100%+8px)] -z-10 pointer-events-none select-none"
      >
        <path
          d="M6 28 C48 14, 152 10, 253 19 C257 25, 255 39, 246 44 C172 48, 72 49, 10 43 C2 39, 2 32, 6 28 Z"
          fill={fillMap[color]}
        />
        <path
          d="M14 19 C78 11, 184 13, 248 24 C244 31, 168 35, 18 33 Z"
          fill="#E27A9B"
          opacity="0.24"
        />
      </motion.svg>
      <span className="relative z-10">{children}</span>
    </span>
  );
};

/**
 * Pure Shimmer Skeleton Cards (zero text saying "Loading" or "Load failed").
 */
export const SkeletonSchemeCards: React.FC = () => {
  return (
    <div className="space-y-6" aria-busy="true">
      {[0, 1, 2].map((idx) => (
        <div key={idx} className="glass-panel rounded-[28px] p-6 sm:p-8 space-y-5">
          <div className="shimmer-bar h-3.5 w-44 rounded-full bg-mist/55" />
          <div className="shimmer-bar h-8 w-80 max-w-full rounded-xl bg-mist/65" />
          <div className="space-y-2.5">
            <div className="shimmer-bar h-4 w-full rounded-lg bg-mist/45" />
            <div className="shimmer-bar h-4 w-4/5 rounded-lg bg-mist/45" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
            <div className="shimmer-bar h-20 rounded-2xl bg-white/65" />
            <div className="shimmer-bar h-20 rounded-2xl bg-white/65" />
            <div className="shimmer-bar h-20 rounded-2xl bg-white/65" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Friendly Illustrated Empty State with One Clear Primary Action.
 */
export const FriendlyEmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}> = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="glass-panel rounded-[28px] p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5">
      <div className="w-24 h-24 mx-auto">
        <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
          <circle cx="60" cy="60" r="50" fill="#B3CFE5" opacity="0.28" />
          <rect
            x="30"
            y="34"
            width="60"
            height="56"
            rx="10"
            fill="#FFFFFF"
            stroke="#4A7FA7"
            strokeWidth="2.5"
          />
          <path
            d="M42 52 H78 M42 64 H70 M42 76 H60"
            stroke="#B3CFE5"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Small Blush Accent */}
          <path
            d="M84 42 C78 30, 82 18, 92 16 C96 26, 92 36, 84 42 Z"
            fill="#F9D3DC"
            stroke="#A23B6B"
            strokeWidth="1.6"
          />
          <path
            d="M84 42 C92 32, 104 30, 108 38 C100 44, 92 46, 84 42 Z"
            fill="#E27A9B"
            opacity="0.7"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <h2 className="font-card-title text-xl sm:text-2xl font-bold text-navy">{title}</h2>
        <p className="text-sm text-ink/75 leading-relaxed max-w-md mx-auto">{description}</p>
      </div>
      <div className="pt-1">
        <MagneticButton
          onClick={onAction}
          className="btn-shimmer inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-snow bg-navy hover:bg-ink rounded-2xl shadow-sm cursor-pointer transition-colors"
        >
          {actionLabel}
        </MagneticButton>
      </div>
    </div>
  );
};

export const ConfettiBurst: React.FC<{ active: boolean }> = ({ active }) => {
  const prefersReducedMotion = useReducedMotion();
  if (!active || prefersReducedMotion) return null;

  const particles = [
    { x: -54, y: -44, rot: -45, color: '#4A7FA7' },
    { x: -30, y: -58, rot: 30, color: '#E27A9B' },
    { x: -6, y: -64, rot: -20, color: '#F4C873' },
    { x: 22, y: -60, rot: 50, color: '#1A3D63' },
    { x: 46, y: -44, rot: -35, color: '#A23B6B' },
    { x: 60, y: -22, rot: 65, color: '#4A7FA7' },
    { x: -60, y: -16, rot: -60, color: '#F4C873' },
    { x: 34, y: -28, rot: 25, color: '#E27A9B' },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-20"
    >
      {particles.map((p, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.4, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: p.x,
            y: p.y,
            scale: [0.5, 1.1, 0.8],
            rotate: p.rot,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute w-2.5 h-2.5 rounded-xs"
          style={{ backgroundColor: p.color, willChange: 'transform, opacity' }}
        />
      ))}
    </div>
  );
};

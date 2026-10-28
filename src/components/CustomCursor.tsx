import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  color: string;
}

/**
 * Custom Soft Desktop Cursor + Sparse Sparkle Trail.
 * Enabled strictly on fine-pointer desktop devices and disabled when prefers-reduced-motion is set.
 * Animates ONLY transform and opacity at 60fps.
 */
export const CustomCursor: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  const dotX = useSpring(rawX, { stiffness: 750, damping: 38, mass: 0.25 });
  const dotY = useSpring(rawY, { stiffness: 750, damping: 38, mass: 0.25 });

  const ringX = useSpring(rawX, { stiffness: 260, damping: 26, mass: 0.45 });
  const ringY = useSpring(rawY, { stiffness: 260, damping: 26, mass: 0.45 });

  const lastSparkleRef = useRef<{ time: number; x: number; y: number; seq: number }>({
    time: 0,
    x: 0,
    y: 0,
    seq: 0,
  });

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsFinePointer(false);
      return;
    }
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setIsFinePointer(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion) return;

    const handleMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (!visible) setVisible(true);

      const target = e.target as HTMLElement | null;
      const labeledEl = target?.closest?.('[data-cursor-label]') as HTMLElement | null;
      const interactiveEl = target?.closest?.(
        'button, a, select, input[type="checkbox"], [data-cursor="interactive"]'
      );

      if (labeledEl) {
        setCursorLabel(labeledEl.getAttribute('data-cursor-label'));
        setIsInteractive(true);
      } else if (interactiveEl) {
        setCursorLabel(null);
        setIsInteractive(true);
      } else {
        setCursorLabel(null);
        setIsInteractive(false);
      }

      // Sparse 600ms sparkle trail (throttled by time & distance so it stays subtle and 60fps)
      const now = performance.now();
      const dx = e.clientX - lastSparkleRef.current.x;
      const dy = e.clientY - lastSparkleRef.current.y;
      const distSq = dx * dx + dy * dy;

      if (now - lastSparkleRef.current.time > 110 && distSq > 900) {
        const nextId = ++lastSparkleRef.current.seq;
        lastSparkleRef.current = { time: now, x: e.clientX, y: e.clientY, seq: nextId };
        const color = nextId % 2 === 0 ? '#E27A9B' : '#4A7FA7';

        setSparkles((prev) => [
          ...prev.slice(-6),
          { id: nextId, x: e.clientX, y: e.clientY, color },
        ]);

        window.setTimeout(() => {
          setSparkles((prev) => prev.filter((sp) => sp.id !== nextId));
        }, 600);
      }
    };

    const handleLeave = () => setVisible(false);

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, [isFinePointer, prefersReducedMotion, rawX, rawY, visible]);

  if (!isFinePointer || prefersReducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[60] overflow-hidden"
    >
      {/* Sparse 600ms Sparkle Trail */}
      {sparkles.map((sp) => (
        <motion.svg
          key={sp.id}
          viewBox="0 0 16 16"
          className="fixed top-0 left-0 w-3 h-3 -ml-1.5 -mt-1.5 pointer-events-none"
          initial={{ x: sp.x, y: sp.y, scale: 0.4, opacity: 0.72, rotate: 0 }}
          animate={{ x: sp.x, y: sp.y - 10, scale: 0, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ willChange: 'transform, opacity' }}
        >
          <path
            d="M8 0 L9.8 6.2 L16 8 L9.8 9.8 L8 16 L6.2 9.8 L0 8 L6.2 6.2 Z"
            fill={sp.color}
          />
        </motion.svg>
      ))}

      {/* Soft Blurred Spring Ring */}
      <motion.div
        className="fixed top-0 left-0 -ml-5 -mt-5 w-10 h-10 rounded-full flex items-center justify-center pointer-events-none"
        style={{
          x: ringX,
          y: ringY,
          willChange: 'transform, opacity',
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: cursorLabel ? 1.65 : isInteractive ? 1.45 : 1,
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <div
          className={`w-full h-full rounded-full transition-colors duration-200 flex items-center justify-center ${
            isInteractive
              ? 'bg-[#F9D3DC]/55 border border-[#E27A9B] backdrop-blur-[2px]'
              : 'bg-[#B3CFE5]/25 border border-[#4A7FA7]/45 backdrop-blur-[1px]'
          }`}
        >
          {cursorLabel && (
            <span className="text-[7px] font-extrabold uppercase tracking-wider text-[#A23B6B] leading-none select-none">
              {cursorLabel}
            </span>
          )}
        </div>
      </motion.div>

      {/* Crisp Center Dot */}
      <motion.div
        className="fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full pointer-events-none"
        style={{
          x: dotX,
          y: dotY,
          backgroundColor: isInteractive ? '#A23B6B' : '#1A3D63',
          willChange: 'transform, opacity',
        }}
        animate={{
          opacity: visible && !cursorLabel ? 0.9 : 0,
          scale: isInteractive ? 0.75 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
};

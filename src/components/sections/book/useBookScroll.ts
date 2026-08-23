'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useMotionValue, useReducedMotion, type MotionValue } from 'framer-motion';

/**
 * Scroll position is the single source of truth for how far the book is open.
 *
 * Everything that can turn a page — the wheel, a drag, a swipe, the arrow keys,
 * the chevron buttons — ends up calling `window.scrollTo`. Nothing writes the
 * progress value directly, so there is no second clock to keep in sync and no
 * feedback loop between "the user scrolled" and "we moved the book".
 *
 * The section is taller than the viewport and its stage is `position: sticky`,
 * which pins the book while that extra height scrolls past.
 *
 * Smoothing is a hand-rolled exponential chase rather than a spring. A page
 * that overshoots and bounces back reads as rubber rather than paper, so
 * critical damping is what we actually want here; running the integrator in
 * the same rAF loop that measures scroll also keeps the book on one clock.
 */

/** Fraction of the scroll range spent showing the closed book before it opens. */
const LEAD = 0.1;
/** Fraction spent lingering on the closed back cover. */
const TAIL = 0.13;
/** Chase rate, per second. Higher follows the wheel more literally. */
const SMOOTH_RATE = 9;
/** Below this, the chase has arrived. */
const EPSILON = 0.0004;

export interface BookScroll {
  /** 0 … leafCount. Leaf i is turning while this is in (i, i+1). */
  progress: MotionValue<number>;
  /** Scroll to the position where exactly `k` leaves are turned. */
  goTo: (k: number) => void;
  next: () => void;
  prev: () => void;
  /** Spread on the interactive stage element. */
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** True when the pointer travelled far enough that the gesture was a drag. */
  draggedRef: React.RefObject<boolean>;
}

interface Metrics {
  top: number;
  dist: number;
  pxPerLeaf: number;
}

export function useBookScroll(
  sectionRef: React.RefObject<HTMLElement | null>,
  leafCount: number
): BookScroll {
  const reduced = useReducedMotion();
  const progress = useMotionValue(0);
  const leafRef = useRef(0);

  useEffect(
    () =>
      progress.on('change', (v) => {
        leafRef.current = Math.round(v);
      }),
    [progress]
  );

  useEffect(() => {
    const target = { value: progress.get() };
    let measureFrame = 0;
    let animFrame = 0;
    let last = 0;

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const current = progress.get();
      const diff = target.value - current;
      if (Math.abs(diff) < EPSILON) {
        animFrame = 0;
        progress.set(target.value);
        return;
      }
      progress.set(current + diff * (1 - Math.exp(-dt * SMOOTH_RATE)));
      animFrame = requestAnimationFrame(step);
    };

    const chase = () => {
      if (animFrame) return;
      last = performance.now();
      animFrame = requestAnimationFrame(step);
    };

    const measure = () => {
      measureFrame = 0;
      const el = sectionRef.current;
      if (!el) return;
      const dist = el.offsetHeight - window.innerHeight;
      if (dist <= 0) {
        target.value = 0;
        progress.set(0);
        return;
      }
      const travelled = -el.getBoundingClientRect().top / dist;
      const span = 1 - LEAD - TAIL;
      target.value = Math.min(1, Math.max(0, (travelled - LEAD) / span)) * leafCount;
      if (reduced) progress.set(target.value);
      else chase();
    };

    const schedule = () => {
      if (!measureFrame) measureFrame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (measureFrame) cancelAnimationFrame(measureFrame);
      if (animFrame) cancelAnimationFrame(animFrame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [sectionRef, leafCount, progress, reduced]);

  const metrics = useCallback((): Metrics | null => {
    const el = sectionRef.current;
    if (!el) return null;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const dist = el.offsetHeight - window.innerHeight;
    if (dist <= 0) return null;
    return { top, dist, pxPerLeaf: (dist * (1 - LEAD - TAIL)) / leafCount };
  }, [sectionRef, leafCount]);

  const scrollToLeaf = useCallback(
    (k: number, smoothScroll: boolean) => {
      const m = metrics();
      if (!m) return;
      const clamped = Math.min(leafCount, Math.max(0, k));
      window.scrollTo({
        top: m.top + m.dist * LEAD + clamped * m.pxPerLeaf,
        behavior: smoothScroll ? 'smooth' : 'auto',
      });
    },
    [metrics, leafCount]
  );

  const goTo = useCallback((k: number) => scrollToLeaf(k, true), [scrollToLeaf]);
  const next = useCallback(() => goTo(leafRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(leafRef.current - 1), [goTo]);

  // ── Drag to peel ──────────────────────────────────────────────────────────
  // Horizontal drag is translated into vertical scroll, which keeps the one
  // source of truth intact: dragging a page *is* scrolling the section.
  const drag = useRef<{ id: number; x: number; y: number; m: Metrics } | null>(null);
  const draggedRef = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const m = metrics();
      if (!m) return;
      draggedRef.current = false;
      drag.current = { id: e.pointerId, x: e.clientX, y: window.scrollY, m };
    },
    [metrics]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!draggedRef.current) {
      if (Math.abs(dx) < 6) return;
      draggedRef.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }
    // A drag across one page turns roughly one leaf.
    const width = (e.currentTarget as HTMLElement).clientWidth / 2 || 400;
    window.scrollTo({ top: d.y - (dx / width) * d.m.pxPerLeaf, behavior: 'auto' });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (drag.current?.id === e.pointerId) {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      drag.current = null;
    }
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      }
    },
    [next, prev]
  );

  // A resize invalidates every pixel measurement the in-flight drag captured.
  useEffect(() => {
    const cancel = () => {
      drag.current = null;
    };
    window.addEventListener('resize', cancel);
    return () => window.removeEventListener('resize', cancel);
  }, []);

  return {
    progress,
    goTo,
    next,
    prev,
    draggedRef,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onKeyDown },
  };
}

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useMotionValue, useReducedMotion, type MotionValue } from 'framer-motion';

/**
 * Page turning, driven by the reader's hands rather than by page scroll.
 *
 * The book is an ordinary in-flow section: scrolling past it moves the page,
 * not the leaves. Turning comes from tapping a side, dragging across, the
 * arrow keys, or the hidden per-photo links.
 *
 * `progress` runs 0 … leafCount and is tweened toward a target over a fixed
 * duration. The tween itself is linear on purpose: bookGeometry's easeTurn
 * already puts a raised cosine on each leaf's own progress, so easing here too
 * would stack two S-curves and make the page crawl at both ends. A drag writes
 * `progress` directly so the leaf tracks the finger, then releases to the
 * nearest whole leaf.
 */

/** How long a full one-leaf turn takes. */
const TURN_MS = 1500;
/** Floor for short settles, so releasing a nearly-finished drag is not glacial. */
const MIN_MS = 320;
/** Closer than this and there is nothing to animate. */
const EPSILON = 0.0004;
/** Pointer travel before a press counts as a drag rather than a tap. */
const DRAG_SLOP = 6;

export interface BookNav {
  /** 0 … leafCount. Leaf i is turning while this is in (i, i+1). */
  progress: MotionValue<number>;
  /** Turn to the position where exactly `k` leaves are over. */
  goTo: (k: number) => void;
  next: () => void;
  prev: () => void;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** True when the pointer travelled far enough that the gesture was a drag. */
  draggedRef: React.RefObject<boolean>;
}

const clamp = (v: number, hi: number) => (v < 0 ? 0 : v > hi ? hi : v);

export function useBookNav(leafCount: number): BookNav {
  const reduced = useReducedMotion();
  const progress = useMotionValue(0);
  const target = useRef(0);
  const anim = useRef(0);

  const run = useCallback(() => {
    if (anim.current) cancelAnimationFrame(anim.current);
    const to = target.current;
    const from = progress.get();
    const span = to - from;
    if (Math.abs(span) < EPSILON) {
      anim.current = 0;
      progress.set(to);
      return;
    }
    // A whole leaf takes TURN_MS; a partial one takes its share. Multi-leaf
    // jumps stay capped at TURN_MS rather than taking a second per page.
    const duration = Math.min(TURN_MS, Math.max(MIN_MS, TURN_MS * Math.abs(span)));
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      progress.set(from + span * k);
      anim.current = k < 1 ? requestAnimationFrame(step) : 0;
    };
    anim.current = requestAnimationFrame(step);
  }, [progress]);

  useEffect(
    () => () => {
      if (anim.current) cancelAnimationFrame(anim.current);
    },
    []
  );

  const goTo = useCallback(
    (k: number) => {
      target.current = clamp(k, leafCount);
      if (reduced) progress.set(target.current);
      else run();
    },
    [run, leafCount, progress, reduced]
  );

  const next = useCallback(() => goTo(Math.round(target.current) + 1), [goTo]);
  const prev = useCallback(() => goTo(Math.round(target.current) - 1), [goTo]);

  // ── Drag to peel ──────────────────────────────────────────────────────────
  const drag = useRef<{ id: number; x: number; from: number; page: number } | null>(null);
  const draggedRef = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      draggedRef.current = false;
      drag.current = {
        id: e.pointerId,
        x: e.clientX,
        from: progress.get(),
        page: (e.currentTarget as HTMLElement).clientWidth / 2 || 320,
      };
    },
    [progress]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x;
      if (!draggedRef.current) {
        if (Math.abs(dx) < DRAG_SLOP) return;
        draggedRef.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      }
      // Dragging one page-width across turns one leaf. The leaf tracks the
      // finger exactly, so the tween is parked on the same value.
      if (anim.current) {
        cancelAnimationFrame(anim.current);
        anim.current = 0;
      }
      const v = clamp(d.from - dx / d.page, leafCount);
      target.current = v;
      progress.set(v);
    },
    [leafCount, progress]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      drag.current = null;
      if (draggedRef.current) goTo(Math.round(progress.get()));
    },
    [goTo, progress]
  );

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

  return {
    progress,
    goTo,
    next,
    prev,
    draggedRef,
    handlers: { onPointerDown, onPointerMove, onPointerUp: endDrag, onKeyDown },
  };
}

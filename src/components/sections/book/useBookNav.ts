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
 * `progress` runs 0 … leafCount and is chased toward a target with an
 * exponential ease rather than a spring — a page that overshoots and bounces
 * reads as rubber, not paper. A drag writes `progress` directly so the leaf
 * tracks the finger, then releases to the nearest whole leaf.
 */

/** Chase rate, per second. A whole turn lands in a little under a second. */
const RATE = 9;
/** Below this, the chase has arrived. */
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

  const chase = useCallback(() => {
    if (anim.current) return;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const current = progress.get();
      const diff = target.current - current;
      if (Math.abs(diff) < EPSILON) {
        anim.current = 0;
        progress.set(target.current);
        return;
      }
      progress.set(current + diff * (1 - Math.exp(-dt * RATE)));
      anim.current = requestAnimationFrame(step);
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
      else chase();
    },
    [chase, leafCount, progress, reduced]
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
      // finger exactly, so the chase is parked on the same value.
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

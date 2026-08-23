'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * Plain page turning: an index into the spread list, moved by tapping a
 * side, swiping, or the arrow keys. No continuous tracking — a swipe either
 * clears the threshold and turns one spread, or it doesn't and nothing
 * moves. `direction` just says which way the last turn went, for the
 * crossfade's slide offset.
 */

const DRAG_SLOP = 6;
const SWIPE_PX = 50;

export interface SpreadNav {
  index: number;
  direction: number;
  goTo: (i: number) => void;
  next: () => void;
  prev: () => void;
  /** True once a gesture has moved far enough to count as a swipe, not a tap. */
  draggedRef: React.RefObject<boolean>;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
}

const clamp = (v: number, hi: number) => (v < 0 ? 0 : v > hi ? hi : v);

export function useSpreadNav(count: number): SpreadNav {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const indexRef = useRef(0);

  const goTo = useCallback(
    (i: number) => {
      const target = clamp(i, count - 1);
      setDirection(target >= indexRef.current ? 1 : -1);
      indexRef.current = target;
      setIndex(target);
    },
    [count]
  );

  const next = useCallback(() => goTo(indexRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(indexRef.current - 1), [goTo]);

  const drag = useRef<{ id: number; x: number } | null>(null);
  const draggedRef = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    draggedRef.current = false;
    drag.current = { id: e.pointerId, x: e.clientX };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || draggedRef.current) return;
    if (Math.abs(e.clientX - d.x) >= DRAG_SLOP) draggedRef.current = true;
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;
      const dx = e.clientX - d.x;
      if (Math.abs(dx) >= SWIPE_PX) {
        if (dx < 0) next();
        else prev();
      } else {
        // Not far enough to be a swipe — let the click handler treat it as a tap.
        draggedRef.current = false;
      }
    },
    [next, prev]
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
    index,
    direction,
    goTo,
    next,
    prev,
    draggedRef,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onKeyDown },
  };
}

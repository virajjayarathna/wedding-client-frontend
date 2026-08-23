'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { motion, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Leaf from './Leaf';
import { SEGMENTS_DESKTOP, SEGMENTS_MOBILE } from './bookGeometry';
import { buildFaces, isHard, toLeaves, type BookCopy } from './pages';
import { useBookScroll } from './useBookScroll';
import styles from './book.module.css';

/**
 * The gallery book.
 *
 * The section is deliberately taller than the viewport; the stage inside is
 * sticky, so scrolling that extra height turns pages instead of moving the
 * book. See useBookScroll for why scroll position is the only state.
 */

interface BookProps {
  images: string[];
  copy: BookCopy;
}

/** Total scroll budget, in vh, spread across however many leaves there are. */
const SCROLL_BUDGET = 620;
const MIN_PER_LEAF = 26;
const MAX_PER_LEAF = 62;

const DUST_MOTES = 9;

/**
 * Media queries read through useSyncExternalStore rather than an effect, so the
 * strip count is derived during render instead of arriving one paint late.
 * The server snapshot is `false`, which keeps hydration on the cheap variant.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', notify);
      return () => mq.removeEventListener('change', notify);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

export default function Book({ images, copy }: BookProps) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  const leaves = useMemo(() => toLeaves(buildFaces(images)), [images]);
  const leafCount = leaves.length;

  const { progress, goTo, next, prev, draggedRef, handlers } = useBookScroll(
    sectionRef,
    leafCount
  );

  // Strip count is a straight quality/cost trade: it is the multiplier on how
  // many copies of every page live in the DOM.
  const wide = useMediaQuery('(min-width: 768px)');
  const segments = reduced ? 1 : wide ? SEGMENTS_DESKTOP : SEGMENTS_MOBILE;

  const widthRef = useRef(0);
  const [resizeTick, setResizeTick] = useState(0);
  const [spread, setSpread] = useState(0);

  // One page is half the stage. Everything in bookGeometry works in these px.
  // ResizeObserver fires once on observe(), which covers the initial measure.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      widthRef.current = el.clientWidth / 2;
      setResizeTick((n) => n + 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Book-wide reactions to progress: how thick each half of the page block is,
  // how much dust and candlelight the turn stirs up, and the announcement for
  // assistive tech.
  useMotionValueEvent(progress, 'change', (p) => {
    const stage = stageRef.current;
    const book = bookRef.current;
    if (book) {
      const read = leafCount > 0 ? p / leafCount : 0;
      book.style.setProperty('--stack-l', `${1 + 28 * read}px`);
      book.style.setProperty('--stack-r', `${1 + 28 * (1 - read)}px`);
    }
    if (stage) {
      const frac = p - Math.floor(p);
      stage.style.setProperty('--activity', String(Math.sin(Math.PI * frac)));
    }
    const rounded = Math.round(p);
    if (rounded !== spread) setSpread(rounded);
  });

  const perLeaf = Math.max(MIN_PER_LEAF, Math.min(MAX_PER_LEAF, SCROLL_BUDGET / leafCount));

  const motes = useMemo(
    () =>
      Array.from({ length: DUST_MOTES }, (_, i) => ({
        left: `${8 + ((i * 37) % 84)}%`,
        top: `${20 + ((i * 53) % 60)}%`,
        delay: `${(i * 0.47) % 4.5}s`,
        dx: `${((i % 5) - 2) * 9}px`,
      })),
    []
  );

  return (
    <div
      ref={sectionRef}
      className={styles.section}
      style={{ height: `calc(100dvh + ${(leafCount + 1.4) * perLeaf}dvh)` }}
    >
      <div className={styles.sticky}>
        <motion.div
          className={styles.heading}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal">Gallery</h2>
          <div className="w-16 h-[1px] bg-gold/50 mx-auto my-3" />
          <p className="font-sans text-charcoal/60 uppercase tracking-[4px] text-[10px]">
            Our memories
          </p>
        </motion.div>

        <div
          ref={stageRef}
          className={styles.stage}
          tabIndex={0}
          role="group"
          aria-label="Photo album. Use the left and right arrow keys to turn pages."
          onClick={(e) => {
            if (draggedRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            if (e.clientX - rect.left > rect.width / 2) next();
            else prev();
          }}
          {...handlers}
        >
          <div className={styles.glow} />

          <div ref={bookRef} className={styles.book}>
            <div className={`${styles.edge} ${styles.edgeLeft}`} />
            <div className={`${styles.edge} ${styles.edgeRight}`} />

            {leaves.map((leaf, i) => (
              <Leaf
                key={i}
                index={i}
                leafCount={leafCount}
                front={leaf.front}
                back={leaf.back}
                copy={copy}
                progress={progress}
                segments={segments}
                widthRef={widthRef}
                resizeTick={resizeTick}
                hard={isHard(leaf.front) || isHard(leaf.back)}
                reduced={!!reduced}
              />
            ))}
          </div>

          {!reduced && (
            <div className={styles.dust} aria-hidden>
              {motes.map((m, i) => (
                <span
                  key={i}
                  className={styles.mote}
                  style={
                    {
                      left: m.left,
                      top: m.top,
                      animationDelay: m.delay,
                      ['--dx' as string]: m.dx,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}

          <button
            type="button"
            className={`${styles.nav} ${styles.navPrev}`}
            aria-label="Previous page"
            disabled={spread <= 0}
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className={`${styles.nav} ${styles.navNext}`}
            aria-label="Next page"
            disabled={spread >= leafCount}
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <p className={styles.hint}>
          Scroll to turn the pages — or drag a corner, tap a side, use ← →
        </p>

        {/* The book itself is aria-hidden: every page is duplicated once per
            strip, which would read as gibberish. This is the real content. */}
        <div className={styles.srOnly} aria-live="polite">
          Spread {Math.min(spread + 1, leafCount)} of {leafCount}
        </div>
        <ul className={styles.srOnly}>
          {images.map((src, i) => (
            <li key={src}>
              <button type="button" onClick={() => goTo(Math.floor(i / 2) + 1)}>
                Photograph {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

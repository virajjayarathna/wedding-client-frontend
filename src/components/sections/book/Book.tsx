'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { buildFaces, buildSpreads, FaceContent, type BookCopy } from './pages';
import { useSpreadNav } from './useSpreadNav';
import styles from './book.module.css';

/**
 * The gallery book.
 *
 * An ordinary in-flow section: the page scrolls past it untouched, and pages
 * are turned by hand — tap a side, swipe, arrow keys. See useSpreadNav.
 *
 * Turning is a plain crossfade-and-slide between spreads, not an animated
 * page flip. Nothing here is 3D.
 */

interface BookProps {
  images: string[];
  copy: BookCopy;
}

export default function Book({ images, copy }: BookProps) {
  const reduced = useReducedMotion();

  const faces = useMemo(() => buildFaces(images), [images]);
  const spreads = useMemo(() => buildSpreads(faces), [faces]);

  const { index, direction, goTo, next, prev, draggedRef, handlers } = useSpreadNav(spreads.length);

  // Which spread each photograph lives on, for the hidden per-photo links.
  const photoToSpread = useMemo(() => {
    const map: number[] = [];
    spreads.forEach((s, si) => {
      const onSpread = s.kind === 'single' ? [s.face] : [s.left, s.right];
      for (const f of onSpread) {
        if (f.kind === 'plate') map[f.index] = si;
      }
    });
    return map;
  }, [spreads]);

  const spread = spreads[index];
  const slide = reduced ? 0 : 36;

  return (
    <div className={styles.wrap}>
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
        <div className={styles.seam} />

        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={index}
            className={styles.spread}
            initial={{ opacity: 0, x: direction * slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -slide }}
            transition={{ duration: reduced ? 0 : 0.42, ease: [0.4, 0, 0.2, 1] }}
          >
            {spread.kind === 'single' ? (
              <div className={styles.pageSingle}>
                <FaceContent face={spread.face} recto copy={copy} seed={index} />
              </div>
            ) : (
              <>
                <div className={styles.pageLeft}>
                  <FaceContent face={spread.left} recto={false} copy={copy} seed={index * 2} />
                </div>
                <div className={styles.pageRight}>
                  <FaceContent face={spread.right} recto copy={copy} seed={index * 2 + 1} />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className={styles.hint}>Tap a side to turn the page — or swipe, or use ← →</p>

      <div className={styles.srOnly} aria-live="polite">
        Spread {index + 1} of {spreads.length}
      </div>
      <ul className={styles.srOnly}>
        {images.map((src, i) => (
          <li key={src}>
            <button type="button" onClick={() => goTo(photoToSpread[i] ?? 0)}>
              Photograph {i + 1}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

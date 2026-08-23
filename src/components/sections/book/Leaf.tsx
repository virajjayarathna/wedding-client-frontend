'use client';

import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useMotionValueEvent, type MotionValue } from 'framer-motion';
import { makePose, solveLeaf } from './bookGeometry';
import { FaceContent, type BookCopy, type Face } from './pages';
import styles from './book.module.css';

/**
 * One turnable leaf: a recto, the verso behind it, and the strips that let the
 * pair bow while it swings.
 *
 * Each strip is a direct child of the leaf and carries a complete matrix of its
 * own, written here on every frame. Nothing in the turn goes through React —
 * a leaf renders when its content or the strip count changes, and never
 * because the reader turned a page.
 *
 * A leaf at rest is drawn as ONE piece rather than as strips. Strips are
 * separately clipped boxes, and their shared edges land on fractional device
 * pixels: too little overlap and the background shows through as hairlines,
 * too much and the page's translucent gradients composite twice and draw them
 * anyway. There is no overlap that is right at every zoom and pixel ratio. A
 * resting page is perfectly flat, though, so it does not need strips at all —
 * and while it is moving, nobody can see a hairline.
 */

interface LeafProps {
  index: number;
  leafCount: number;
  front: Face;
  back: Face;
  copy: BookCopy;
  /** 0 … leafCount. This leaf turns while it passes through (index, index+1). */
  progress: MotionValue<number>;
  segments: number;
  /** Live pixel width of one page. Written by the stage's ResizeObserver. */
  widthRef: React.RefObject<number>;
  /** Bumped on resize so the layout effect re-runs with fresh measurements. */
  resizeTick: number;
  /** Covers do not bend, and neither does anything under reduced motion. */
  hard: boolean;
  reduced: boolean;
}

/** Leaves further than this from the current spread are not painted. */
const WINDOW = 2.2;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function Leaf({
  index,
  leafCount,
  front,
  back,
  copy,
  progress,
  segments,
  widthRef,
  resizeTick,
  hard,
  reduced,
}: LeafProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frontSegs = useRef<(HTMLDivElement | null)[]>([]);
  const backSegs = useRef<(HTMLDivElement | null)[]>([]);
  const frontShade = useRef<(HTMLDivElement | null)[]>([]);
  const backShade = useRef<(HTMLDivElement | null)[]>([]);
  const frontSheen = useRef<(HTMLDivElement | null)[]>([]);
  const backSheen = useRef<(HTMLDivElement | null)[]>([]);
  const castR = useRef<HTMLDivElement>(null);
  const castL = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const flatFront = useRef<HTMLDivElement>(null);
  const flatBack = useRef<HTMLDivElement>(null);

  const pose = useMemo(() => makePose(segments), [segments]);
  // The one-piece pose used at rest. Solved flat: a single strip given a bow
  // would just tilt, since there is no neighbour to bend against.
  const restPose = useMemo(() => makePose(1), []);
  // Threshold-crossing state, so display / z-index / will-change are only
  // touched when they actually change rather than sixty times a second.
  const shown = useRef(true);
  const flipped = useRef(false);
  const moving = useRef(false);

  const paint = useCallback(
    (p: number) => {
      const root = rootRef.current;
      if (!root) return;
      // The shared measurement is the fast path; falling back to the leaf's own
      // box means a leaf can always pose itself, even before the stage's
      // ResizeObserver has had a chance to report.
      const w = widthRef.current || root.offsetWidth;
      if (!w) return;

      const near = Math.abs(p - index) < WINDOW;
      if (near !== shown.current) {
        shown.current = near;
        root.style.display = near ? '' : 'none';
      }
      if (!near) return;

      const t = clamp01(p - index);
      // Reduced motion keeps the book navigable but skips the swing entirely.
      const tt = reduced ? (t < 0.5 ? 0 : 1) : t;

      const isFlipped = tt >= 0.5;
      if (isFlipped !== flipped.current) {
        flipped.current = isFlipped;
        // Unturned leaves stack with the lowest index on top; turned ones the
        // other way round, which is how a real book restacks as you read.
        root.style.zIndex = String(isFlipped ? index : leafCount - index);
      }

      const isMoving = tt > 0.001 && tt < 0.999;
      if (isMoving !== moving.current) {
        moving.current = isMoving;
        root.style.willChange = isMoving ? 'transform' : 'auto';
        // Swap between the seam-free one-piece page and the strips that can
        // bow. visibility rather than display: the strips keep their layout,
        // so starting a turn costs a paint and not a reflow of every page.
        if (plane.current) plane.current.style.visibility = isMoving ? 'visible' : 'hidden';
        const rest = isMoving ? 'hidden' : 'visible';
        if (flatFront.current) flatFront.current.style.visibility = rest;
        if (flatBack.current) flatBack.current.style.visibility = rest;
      }

      const zBase = (isFlipped ? -(leafCount - index) : -index) * 0.12;
      solveLeaf(pose, tt, w, zBase, hard || !!reduced);

      for (let i = 0; i < segments; i++) {
        const f = frontSegs.current[i];
        if (f) {
          f.style.transform = `translate3d(${pose.px[i]}px, 0, ${pose.pz[i]}px) rotateY(${pose.ang[i]}deg)`;
        }
        const b = backSegs.current[i];
        if (b) {
          // The verso strip covers the same span, entered from its far end.
          b.style.transform = `translate3d(${pose.px[i + 1]}px, 0, ${pose.pz[i + 1]}px) rotateY(${pose.ang[i] + 180}deg)`;
        }
        const fs = frontShade.current[i];
        if (fs) fs.style.opacity = String(pose.shadeFront[i]);
        const bs = backShade.current[i];
        if (bs) bs.style.opacity = String(pose.shadeBack[i]);
        const fh = frontSheen.current[i];
        if (fh) fh.style.opacity = String(pose.sheenFront[i]);
        const bh = backSheen.current[i];
        if (bh) bh.style.opacity = String(pose.sheenBack[i]);
      }

      solveLeaf(restPose, tt, w, zBase, true);
      if (flatFront.current) {
        flatFront.current.style.transform = `translate3d(${restPose.px[0]}px, 0, ${restPose.pz[0]}px) rotateY(${restPose.ang[0]}deg)`;
      }
      if (flatBack.current) {
        flatBack.current.style.transform = `translate3d(${restPose.px[1]}px, 0, ${restPose.pz[1]}px) rotateY(${restPose.ang[0] + 180}deg)`;
      }

      // The cast shadow rides just behind this leaf, so it darkens the page
      // being uncovered but never the leaf throwing it.
      const z = zBase - 0.06;
      if (castR.current) {
        castR.current.style.opacity = String(pose.cast * (1 - tt) * 0.85);
        castR.current.style.transform = `translate3d(0, 0, ${z}px)`;
      }
      if (castL.current) {
        castL.current.style.opacity = String(pose.cast * tt * 0.85);
        castL.current.style.transform = `translate3d(0, 0, ${z}px)`;
      }
    },
    [index, leafCount, pose, restPose, segments, widthRef, hard, reduced]
  );

  useMotionValueEvent(progress, 'change', paint);

  useLayoutEffect(() => {
    paint(progress.get());
  }, [paint, progress, resizeTick]);

  const strips = useMemo(() => Array.from({ length: segments }, (_, i) => i), [segments]);
  const vars = { ['--n' as string]: String(segments) } as React.CSSProperties;
  // One piece, and no overlap to draw twice.
  const oneVars = { ['--n' as string]: '1', ['--i' as string]: '0', ['--ov' as string]: '0px' } as React.CSSProperties;

  return (
    <div ref={rootRef} className={styles.leaf} style={vars} aria-hidden>
      <div ref={plane} className={styles.plane}>
      {strips.map((i) => {
        const iVar = { ['--i' as string]: String(i) } as React.CSSProperties;
        return (
          <div
            key={`f${i}`}
            ref={(el) => {
              frontSegs.current[i] = el;
            }}
            className={styles.seg}
            style={iVar}
          >
            <div className={`${styles.face} ${styles.faceFront}`}>
              <FaceContent face={front} recto copy={copy} seed={index * 2} />
            </div>
            <div
              ref={(el) => {
                frontShade.current[i] = el;
              }}
              className={styles.shade}
            />
            <div
              ref={(el) => {
                frontSheen.current[i] = el;
              }}
              className={styles.sheen}
            />
          </div>
        );
      })}

      {strips.map((i) => {
        const iVar = { ['--i' as string]: String(i) } as React.CSSProperties;
        return (
          <div
            key={`b${i}`}
            ref={(el) => {
              backSegs.current[i] = el;
            }}
            className={styles.seg}
            style={iVar}
          >
            <div className={`${styles.face} ${styles.faceBack}`}>
              <FaceContent face={back} recto={false} copy={copy} seed={index * 2 + 1} />
            </div>
            <div
              ref={(el) => {
                backShade.current[i] = el;
              }}
              className={styles.shade}
            />
            <div
              ref={(el) => {
                backSheen.current[i] = el;
              }}
              className={styles.sheen}
            />
          </div>
        );
      })}

      </div>

      {/* The seam-free page, shown whenever the leaf is not mid-turn. */}
      <div ref={flatFront} className={styles.seg} style={oneVars}>
        <div className={`${styles.face} ${styles.faceFront}`}>
          <FaceContent face={front} recto copy={copy} seed={index * 2} />
        </div>
      </div>
      <div ref={flatBack} className={styles.seg} style={oneVars}>
        <div className={`${styles.face} ${styles.faceBack}`}>
          <FaceContent face={back} recto={false} copy={copy} seed={index * 2 + 1} />
        </div>
      </div>

      <div ref={castR} className={`${styles.cast} ${styles.castRight}`} />
      <div ref={castL} className={`${styles.cast} ${styles.castLeft}`} />
    </div>
  );
}

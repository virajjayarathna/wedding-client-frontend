/**
 * Page-turn geometry.
 *
 * A turning leaf is not a flat rectangle on a hinge — paper bows. We model the
 * leaf as a chain of `n` rigid strips running from the gutter (the hinge) out
 * to the fore-edge. Each strip gets its own Y rotation; walking the chain gives
 * the strip's position in the book's 3D space, and the strip's angle relative
 * to the light gives its shading.
 *
 * Everything here is pure and allocation-light: it runs once per animation
 * frame per turning leaf, and the caller writes the result straight to
 * `element.style` without a React render.
 *
 * Coordinate space matches CSS: origin at the gutter, +x toward the fore-edge,
 * +z toward the viewer. CSS `rotateY(a)` sends a local point (w,0,0) to
 * (w·cos a, 0, −w·sin a), which is why the walk below subtracts the sine.
 */

/** Strip counts. More strips = smoother bow, linearly more DOM per leaf. */
export const SEGMENTS_DESKTOP = 6;
export const SEGMENTS_MOBILE = 3;

/** Peak symmetric bow, in degrees, reached halfway through the turn. */
const BOW = 27;
/** Antisymmetric lag: the tip trails on the way up, whips on the way down. */
const LAG = 17;
/** How the bow distributes along the leaf. >1 keeps the root near the hinge. */
const BOW_SHAPE = 1.3;

/** Direction the (single, warm, front-left) light comes from. Unit-ish. */
const LIGHT_X = -0.34;
const LIGHT_Z = 0.94;

export interface Pose {
  /** n+1 chain points, from the hinge outward. */
  px: Float64Array;
  pz: Float64Array;
  /** n strip angles, degrees. */
  ang: Float64Array;
  /** n darkening opacities for the recto strips. */
  shadeFront: Float64Array;
  /** n darkening opacities for the verso strips. */
  shadeBack: Float64Array;
  /** Specular band strength, front and back. */
  sheenFront: Float64Array;
  sheenBack: Float64Array;
  /** 0…1 — how much shadow this leaf casts on the page beneath it. */
  cast: number;
}

export function makePose(n: number): Pose {
  return {
    px: new Float64Array(n + 1),
    pz: new Float64Array(n + 1),
    ang: new Float64Array(n),
    shadeFront: new Float64Array(n),
    shadeBack: new Float64Array(n),
    sheenFront: new Float64Array(n),
    sheenBack: new Float64Array(n),
    cast: 0,
  };
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Turn easing. A raised cosine (so the leaf starts and lands at rest) biased
 * slightly late, because lifting a page against gravity is slower than
 * dropping it.
 */
export function easeTurn(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return (1 - Math.cos(Math.PI * Math.pow(t, 1.12))) / 2;
}

/** Lambert term for a strip at `deg`, front face. Negate for the back face. */
function lambert(deg: number): number {
  const a = (deg * Math.PI) / 180;
  return Math.sin(a) * LIGHT_X + Math.cos(a) * LIGHT_Z;
}

/**
 * Fills `pose` for a leaf at turn progress `t` (0 = closed on the right,
 * 1 = laid flat on the left).
 *
 * `leafW` is the leaf's pixel width, `zBase` the tiny Z offset that keeps
 * stacked leaves from z-fighting, and `flat` disables the bow entirely
 * (reduced-motion, or the rigid covers, which do not bend).
 */
export function solveLeaf(
  pose: Pose,
  t: number,
  leafW: number,
  zBase: number,
  flat: boolean
): Pose {
  const n = pose.ang.length;
  const segW = leafW / n;
  const theta = -180 * easeTurn(t);

  // Both terms vanish at t=0 and t=1, so a resting leaf is perfectly planar
  // and its strips line up seam-free.
  const bend = flat ? 0 : BOW * Math.sin(Math.PI * t) + LAG * Math.sin(2 * Math.PI * t);
  const turning = Math.sin(Math.PI * clamp01(t));

  let x = 0;
  let z = zBase;
  pose.px[0] = x;
  pose.pz[0] = z;

  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const a = theta + bend * Math.pow(u, BOW_SHAPE);
    pose.ang[i] = a;

    const rad = (a * Math.PI) / 180;
    x += segW * Math.cos(rad);
    z -= segW * Math.sin(rad);
    pose.px[i + 1] = x;
    pose.pz[i + 1] = z;

    const lf = lambert(a);
    pose.shadeFront[i] = clamp01(0.62 * (1 - lf));
    pose.shadeBack[i] = clamp01(0.62 * (1 + lf));
    // Sheen only exists while the sheet is moving through the light.
    pose.sheenFront[i] = Math.pow(clamp01(lf), 12) * 0.4 * turning;
    pose.sheenBack[i] = Math.pow(clamp01(-lf), 12) * 0.4 * turning;
  }

  pose.cast = turning;
  return pose;
}

/**
 * Deterministic per-index jitter for mounted prints, so photos sit slightly
 * askew like real tipped-in plates. Must not be random: the server and the
 * client have to agree or React screams about the mismatch.
 */
export function plateTilt(index: number): number {
  return (((index * 37) % 9) - 4) * 0.34;
}

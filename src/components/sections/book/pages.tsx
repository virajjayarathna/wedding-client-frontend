'use client';

import { plateTilt } from './bookGeometry';
import styles from './book.module.css';

/**
 * What goes on the faces of the book.
 *
 * A leaf owns two consecutive faces: an even index is a recto (right-hand page)
 * and an odd index is a verso (left-hand page). `buildFaces` lays the whole
 * book out in reading order and guarantees the front cover lands first and the
 * back cover lands last, padding with an endpaper when the parity needs it.
 *
 * Everything here renders many times over — once per strip, per face — so the
 * markup stays flat and cheap and carries no interactive elements.
 */

export type Face =
  | { kind: 'cover' }
  | { kind: 'backcover' }
  | { kind: 'frontispiece' }
  | { kind: 'endpaper' }
  | { kind: 'chapter'; verse: string[] }
  | { kind: 'closing' }
  | { kind: 'plate'; src: string; index: number };

export interface BookCopy {
  brideName: string;
  groomName: string;
  monogram: string;
  dateLabel: string;
  yearLabel: string;
}

/** Verses that break up long runs of photographs. */
const VERSES: string[][] = [
  ['Ours began with a smile,', 'grew through friendship,', 'blossomed into love,', 'and now leads us to forever.'],
  ['Every great story begins', 'with a single page —', 'and every page since', 'has had you on it.'],
  ['Some chapters we planned.', 'The best ones', 'simply happened.'],
  ['We invite you to turn the page', 'and become part of the most', 'beautiful chapter of our lives.'],
];

/** One verse page after each run of this many plates. */
const PLATES_PER_CHAPTER = 6;

export function buildFaces(images: string[]): Face[] {
  const faces: Face[] = [{ kind: 'cover' }, { kind: 'frontispiece' }];

  images.forEach((src, i) => {
    if (i > 0 && i % PLATES_PER_CHAPTER === 0) {
      faces.push({ kind: 'chapter', verse: VERSES[(i / PLATES_PER_CHAPTER) % VERSES.length] });
    }
    faces.push({ kind: 'plate', src, index: i });
  });

  faces.push({ kind: 'closing' });
  // The back cover has to be the final verso, so the array length must be even
  // once it is pushed — i.e. odd immediately before.
  if (faces.length % 2 === 0) faces.push({ kind: 'endpaper' });
  faces.push({ kind: 'backcover' });

  return faces;
}

/** Faces pair up two at a time; a leaf is a recto plus the verso behind it. */
export function toLeaves(faces: Face[]): { front: Face; back: Face }[] {
  const leaves: { front: Face; back: Face }[] = [];
  for (let i = 0; i < faces.length; i += 2) {
    leaves.push({ front: faces[i], back: faces[i + 1] ?? { kind: 'endpaper' } });
  }
  return leaves;
}

/** Covers are rigid: they must not bow while they swing. */
export function isHard(face: Face): boolean {
  return face.kind === 'cover' || face.kind === 'backcover';
}

// ── Ornaments ──────────────────────────────────────────────────────────────

function Fleuron({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden>
      <path d="M2 2h16M2 2v16" strokeLinecap="round" />
      <path d="M6 6c10 0 16 6 16 16" opacity="0.8" />
      <path d="M22 22c0-6-4-10-10-10 5 0 9 1 12 4 3 3 4 7 4 12-2-4-4-6-6-6z" fill="currentColor" opacity="0.5" stroke="none" />
      <circle cx="8" cy="20" r="1.6" fill="currentColor" stroke="none" opacity="0.7" />
      <circle cx="20" cy="8" r="1.6" fill="currentColor" stroke="none" opacity="0.7" />
    </svg>
  );
}

function Filigree() {
  return (
    <svg className={styles.watermark} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden preserveAspectRatio="xMidYMid meet">
      <circle cx="100" cy="100" r="72" />
      <circle cx="100" cy="100" r="56" strokeDasharray="3 7" />
      <path d="M100 28c22 30 22 114 0 144-22-30-22-114 0-144z" />
      <path d="M28 100c30-22 114-22 144 0-30 22-114 22-144 0z" />
      <path d="M49 49c30 6 96 72 102 102-30-6-96-72-102-102z" opacity="0.7" />
      <path d="M151 49c-6 30-72 96-102 102 6-30 72-96 102-102z" opacity="0.7" />
    </svg>
  );
}

function Ornament() {
  return (
    <svg width="76" height="14" viewBox="0 0 76 14" fill="none" stroke="var(--book-gilt)" strokeWidth="1" aria-hidden>
      <path d="M2 7h22M52 7h22" strokeLinecap="round" opacity="0.8" />
      <path d="M38 1c4 3 6 4.5 6 6s-2 3-6 6c-4-3-6-4.5-6-6s2-3 6-6z" fill="var(--book-gilt)" opacity="0.65" />
      <circle cx="27" cy="7" r="1.4" fill="var(--book-gilt)" stroke="none" />
      <circle cx="49" cy="7" r="1.4" fill="var(--book-gilt)" stroke="none" />
    </svg>
  );
}

// ── Face rendering ─────────────────────────────────────────────────────────

interface FaceProps {
  face: Face;
  /** Rectos hinge on their left edge; versos on their right. */
  recto: boolean;
  copy: BookCopy;
  /** Stable per-face number, used to vary foxing and plate tilt. */
  seed: number;
}

export function FaceContent({ face, recto, copy, seed }: FaceProps) {
  const paper = `${styles.paper} ${recto ? styles.paperRecto : styles.paperVerso}`;
  const fox = { ['--fox' as string]: String(seed % 5) } as React.CSSProperties;

  switch (face.kind) {
    case 'cover':
    case 'backcover': {
      const front = face.kind === 'cover';
      return (
        <div className={`${styles.cover} ${front ? styles.coverFront : styles.coverBack}`}>
          <div className={`${styles.bands} ${front ? styles.bandsLeft : styles.bandsRight}`} />
          <div className={styles.coverRule} />
          <Fleuron className={`${styles.fleuron} ${styles.fTL}`} />
          <Fleuron className={`${styles.fleuron} ${styles.fTR}`} />
          <Fleuron className={`${styles.fleuron} ${styles.fBL}`} />
          <Fleuron className={`${styles.fleuron} ${styles.fBR}`} />
          <div className={`${styles.boss} ${front ? styles.bossTR : styles.bossTL}`} />
          <div className={`${styles.boss} ${front ? styles.bossBR : styles.bossBL}`} />

          <div className={styles.medallion}>{copy.monogram}</div>

          {front ? (
            <>
              <p className={`${styles.foil} ${styles.coverKicker}`}>the union of</p>
              <h3 className={`${styles.foil} ${styles.coverNames}`}>
                {copy.groomName.toUpperCase()}
                <br />
                &amp;
                <br />
                {copy.brideName.toUpperCase()}
              </h3>
              <div className={styles.rule} />
              <p className={`${styles.foil} ${styles.smallCaps}`}>a chronicle of our memories</p>
            </>
          ) : (
            <>
              <p className={`${styles.foil} ${styles.smallCaps}`}>a lifetime of shared love</p>
              <div className={styles.rule} />
              <p className={`${styles.foil} ${styles.smallCaps}`}>{copy.yearLabel}</p>
            </>
          )}
        </div>
      );
    }

    case 'endpaper':
      return <div className={`${paper} ${styles.endpaper}`} style={fox} />;

    case 'frontispiece':
      return (
        <div className={`${paper} ${styles.endpaper}`} style={fox}>
          <Filigree />
          <p className={styles.smallCaps}>the chronicle of</p>
          <div className={styles.rule} />
          <p className={styles.script} style={{ textAlign: 'center' }}>
            {copy.brideName}
            <br />
            &amp; {copy.groomName}
          </p>
          <div className={styles.rule} />
          {copy.dateLabel && <p className={styles.smallCaps}>{copy.dateLabel}</p>}
          <div style={{ height: 'clamp(8px, 2vh, 20px)' }} />
          <div className={styles.wax}>{copy.monogram}</div>
        </div>
      );

    case 'chapter':
      return (
        <div className={paper} style={fox}>
          <Filigree />
          <div className={styles.verse} style={{ position: 'relative', maxWidth: '84%' }}>
            <span className={styles.dropCap}>{face.verse[0].charAt(0)}</span>
            {face.verse[0].slice(1)}
            {face.verse.slice(1).map((line) => (
              <span key={line}>
                <br />
                {line}
              </span>
            ))}
          </div>
          <div className={styles.rule} />
          <Ornament />
        </div>
      );

    case 'closing':
      return (
        <div className={paper} style={fox}>
          <Filigree />
          <p className={styles.script} style={{ textAlign: 'center', fontSize: 'clamp(14px, 2.6vw, 30px)' }}>
            And so, our story continues…
          </p>
          <div className={styles.rule} />
          <p className={styles.verse} style={{ maxWidth: '82%' }}>
            Though this book comes to an end,
            <br />
            our greatest adventure is only just beginning.
            <br />
            <br />
            Thank you for walking beside us.
          </p>
          <div className={styles.rule} />
          <p className={styles.serif} style={{ fontSize: 'clamp(11px, 1.8vw, 19px)' }}>
            {copy.brideName} &amp; {copy.groomName}
          </p>
          <div style={{ height: 8 }} />
          <p className={styles.smallCaps}>happily ever after starts here</p>
        </div>
      );

    case 'plate': {
      // Every fourth plate gets a hand-written plate number, which breaks up
      // the rhythm without needing per-photo copy from the couple.
      const numbered = face.index % 4 === 3;
      const tilt = { ['--tilt' as string]: `${plateTilt(face.index)}deg` } as React.CSSProperties;
      return (
        <div className={paper} style={fox}>
          <div className={styles.plate} style={tilt}>
            <div className={styles.plateMount}>
              <img
                className={styles.plateImg}
                src={face.src}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              {numbered && <span className={styles.plateCaption}>no. {face.index + 1}</span>}
              <div className={`${styles.corner} ${styles.cTL}`} />
              <div className={`${styles.corner} ${styles.cTR}`} />
              <div className={`${styles.corner} ${styles.cBL}`} />
              <div className={`${styles.corner} ${styles.cBR}`} />
            </div>
          </div>
        </div>
      );
    }
  }
}

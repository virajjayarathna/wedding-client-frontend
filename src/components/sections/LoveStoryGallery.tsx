'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import Book from './book/Book';
import type { BookCopy } from './book/pages';

interface LoveStoryGalleryProps {
  images: string[];
  brideName?: string;
  groomName?: string;
  weddingDate?: string | null;
}

/**
 * Section wrapper for the gallery book. Everything visual lives in ./book —
 * this only turns wedding data into the handful of strings the covers and
 * title pages need.
 *
 * Note the absence of `overflow-hidden` here: the book pins itself with
 * `position: sticky`, which silently stops working under a clipped ancestor.
 */
export default function LoveStoryGallery({
  images,
  brideName = 'Ruwanthi',
  groomName = 'Kasun',
  weddingDate,
}: LoveStoryGalleryProps) {
  const copy: BookCopy = useMemo(() => {
    const date = weddingDate ? new Date(weddingDate) : null;
    const valid = date && !Number.isNaN(date.getTime()) ? date : null;
    return {
      brideName,
      groomName,
      monogram: `${groomName.charAt(0)}${brideName.charAt(0)}`.toUpperCase(),
      dateLabel: valid ? format(valid, 'd MMMM yyyy') : '',
      yearLabel: valid ? `est. ${format(valid, 'yyyy')}` : '',
    };
  }, [brideName, groomName, weddingDate]);

  if (!images || images.length === 0) return null;

  return (
    <section id="gallery" className="relative z-10 section-bg-gallery">
      <Book images={images} copy={copy} />
    </section>
  );
}

import { Suspense, cache } from 'react';
import type { Metadata } from 'next';
import InviteClient from './InviteClient';
import { API_URL } from '@/lib/api';
import { weddingThemeCss } from '@/lib/theme';

interface InvitePageProps {
  params: Promise<{ slug: string }>;
}

const DEFAULT_TITLE = 'Wedding Invitation';
const DEFAULT_DESCRIPTION = 'You are invited to celebrate our special day.';

/**
 * Static fallback shipped in /public. Used when a wedding has no imagery at all,
 * so a shared link never degrades to the bare text-only preview card.
 */
const FALLBACK_OG_IMAGE = '/og-fallback.jpg';

/**
 * Server-side fetch of the invite, shared by generateMetadata and the page
 * itself. Wrapped in React's `cache` so the two callers hit the API once per
 * request rather than twice. Returns null instead of throwing — an invalid or
 * expired token is a normal outcome here, and the client component renders the
 * real error state.
 */
const getInvite = cache(async (slug: string) => {
  try {
    const res = await fetch(`${API_URL}/invite/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.wedding ?? null;
  } catch {
    return null;
  }
});

/**
 * Picks the image WhatsApp / Facebook / Viber will show for a shared invite link.
 *
 * Order matters. `sharePreviewUrl` is the only source we can make promises about:
 * the admin panel crops and re-encodes it to exactly 1200x630 JPEG under ~300 KB
 * before upload, which is what these scrapers actually require. WhatsApp in
 * particular fetches the og:image itself and silently drops it — rendering the
 * text-only card — when the file is a multi-megabyte phone photo, so the cover
 * and hero photos below are a best-effort fallback, not a reliable preview.
 *
 * Only `sharePreviewUrl` declares width/height; announcing 1200x630 for an
 * arbitrary portrait cover photo is a lie that makes some scrapers skip it.
 */
function pickOgImage(wedding: {
  sharePreviewUrl?: string | null;
  coverPhotoUrl?: string | null;
  heroPhotoUrl?: string | null;
  pdfLogoUrl?: string | null;
}): { url: string; width?: number; height?: number } {
  if (wedding.sharePreviewUrl) {
    return { url: wedding.sharePreviewUrl, width: 1200, height: 630 };
  }
  const fallback = wedding.coverPhotoUrl || wedding.heroPhotoUrl || wedding.pdfLogoUrl;
  if (fallback) return { url: fallback };
  return { url: FALLBACK_OG_IMAGE, width: 1200, height: 630 };
}

/**
 * Per-guest Open Graph metadata so sharing an invite link (e.g. via WhatsApp)
 * renders a rich preview card — couple names, wedding date, and a representative
 * image — instead of the generic text-only link preview.
 */
export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await getInvite(slug);

  // Invalid/expired token, unpublished wedding, or the API being unreachable —
  // fall back to the generic metadata rather than leaking an error.
  if (!wedding?.brideName || !wedding?.groomName) {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      openGraph: {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        type: 'website',
        images: [{ url: FALLBACK_OG_IMAGE, width: 1200, height: 630, alt: DEFAULT_TITLE }],
      },
    };
  }

  const isHomeComing = wedding.ceremonyType === 'HOME_COMING';
  const title = isHomeComing
    ? `${wedding.groomName} & ${wedding.brideName}'s Homecoming`
    : `${wedding.brideName} & ${wedding.groomName}'s Wedding`;
  const weddingDate = wedding.weddingDate
    ? new Date(wedding.weddingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const description = isHomeComing
    ? `You are cordially invited to the homecoming of ${wedding.groomName} & ${wedding.brideName}${weddingDate ? ` on ${weddingDate}` : ''}. View your invitation and RSVP here.`
    : `You are cordially invited to the wedding of ${wedding.brideName} & ${wedding.groomName}${weddingDate ? ` on ${weddingDate}` : ''}. View your invitation and RSVP here.`;

  const image = pickOgImage(wedding);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: title,
      images: [{ url: image.url, width: image.width, height: image.height, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { slug } = await params;

  // Resolved on the server so the themed palette is in the HTML from the first
  // paint. Doing this client-side after the invite data loads would show every
  // guest a flash of the default gold palette before their couple's theme
  // swapped in — most visible on the envelope, which is the first thing they see.
  const wedding = await getInvite(slug);
  const themeCssText = weddingThemeCss(wedding);

  return (
    <>
      <style id="wedding-theme" dangerouslySetInnerHTML={{ __html: themeCssText }} />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading your invitation...</div>}>
        <InviteClient />
      </Suspense>
    </>
  );
}

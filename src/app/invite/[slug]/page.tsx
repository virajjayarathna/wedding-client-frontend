import { Suspense } from 'react';
import type { Metadata } from 'next';
import InviteClient from './InviteClient';
import { API_URL } from '@/lib/api';

interface InvitePageProps {
  params: Promise<{ slug: string }>;
}

const DEFAULT_TITLE = 'Wedding Invitation';
const DEFAULT_DESCRIPTION = 'You are invited to celebrate our special day.';

/**
 * Per-guest Open Graph metadata so sharing an invite link (e.g. via WhatsApp)
 * renders a rich preview card — couple names, wedding date, and the cover/hero
 * photo — instead of the generic text-only link preview.
 */
export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_URL}/invite/${slug}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Invite not found');
    const json = await res.json();
    const wedding = json?.data?.wedding;
    if (!wedding?.brideName || !wedding?.groomName) throw new Error('Invite not found');

    const title = `${wedding.brideName} & ${wedding.groomName}'s Wedding`;
    const weddingDate = wedding.weddingDate
      ? new Date(wedding.weddingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : '';
    const description = `You are cordially invited to the wedding of ${wedding.brideName} & ${wedding.groomName}${weddingDate ? ` on ${weddingDate}` : ''}. View your invitation and RSVP here.`;
    // Prefer the cover photo (matches what guests see first on the page), fall back to the hero photo.
    const image: string | undefined = wedding.coverPhotoUrl || wedding.heroPhotoUrl || undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined,
      },
      twitter: {
        card: image ? 'summary_large_image' : 'summary',
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    // Invalid/expired token, unpublished wedding, or the API being unreachable —
    // fall back to the generic metadata rather than leaking an error.
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      openGraph: {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        type: 'website',
      },
    };
  }
}

// Server Component Wrapper
export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading your invitation...</div>}>
      <InviteClient />
    </Suspense>
  );
}

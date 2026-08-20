export type RsvpStatus = 'PENDING' | 'ATTENDING' | 'DECLINING' | 'MAYBE';
export type GuestTitle = 'MR' | 'MRS' | 'MR_AND_MRS' | 'MS' | 'DR' | 'FAMILY' | 'MASTER';
export type MusicType = 'SPOTIFY' | 'UPLOAD';

export interface TimelineEvent {
  time: string;
  title: string;
  description?: string;
}

export interface RsvpContact {
  id: string;
  name: string;
  phone: string;
}

export interface GuestDetails {
  id: string;
  title: GuestTitle;
  firstName: string;
  lastName: string;
  maxAttendants: number;
  rsvpStatus: RsvpStatus;
  attendingCount?: number | null;
  dietaryNotes?: string | null;
  rsvpSubmittedAt?: string | null;
  firstRsvpContact?: RsvpContact | null;
  secondRsvpContact?: RsvpContact | null;
}

export interface WeddingInfo {
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingSlug: string;
  loveStory?: string | null;
  coverPhotoUrl?: string | null;
  heroPhotoUrl?: string | null;
  /** 1200x630 image used as og:image for WhatsApp / social link previews. */
  sharePreviewUrl?: string | null;
  galleryUrls: string[];
  venueName?: string | null;
  venueAddress?: string | null;
  venueMapsUrl?: string | null;
  bridePhone?: string | null;
  groomPhone?: string | null;
  brideFatherName?: string | null;
  brideFatherPhone?: string | null;
  groomFatherName?: string | null;
  groomFatherPhone?: string | null;
  timeline: TimelineEvent[];
  musicUrl?: string | null;
  musicType?: MusicType | null;
  primaryColor: string;
  // ── Theme ──────────────────────────────────────────────────────────────
  // Resolved into CSS custom properties by src/lib/theme.ts. Every field is
  // optional at runtime: unset ones fall back to the named preset, and an
  // unknown preset falls back to Classic Gold — so weddings created before
  // theming existed keep rendering exactly as they did.
  /** id of a THEME_PRESETS entry, e.g. 'emerald'. */
  themePreset?: string | null;
  accentColor: string;
  /** Heading font family. */
  fontFamily: string;
  bodyFont?: string | null;
  bgColor?: string | null;
  surfaceColor?: string | null;
  cardColor?: string | null;
  textColor?: string | null;
  mutedColor?: string | null;
  pdfLogoUrl?: string | null;
  pdfFont?: string | null;
}

export interface InvitePayload {
  guest: GuestDetails;
  wedding: WeddingInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

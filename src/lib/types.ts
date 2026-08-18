export type RsvpStatus = 'PENDING' | 'ATTENDING' | 'DECLINING' | 'MAYBE';
export type GuestTitle = 'MR' | 'MRS' | 'MS' | 'DR' | 'FAMILY' | 'MASTER';
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
  accentColor: string;
  fontFamily: string;
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

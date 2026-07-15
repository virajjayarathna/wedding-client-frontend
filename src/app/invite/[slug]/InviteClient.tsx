'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '@/lib/api';
import type { InvitePayload } from '@/lib/types';

// Components
import ParticleCanvas from '@/components/ui/ParticleCanvas';
import EnvelopeWelcome from '@/components/sections/EnvelopeWelcome';
import HeroSection from '@/components/sections/HeroSection';
import InvitationCard from '@/components/sections/InvitationCard';
import CountdownTimer from '@/components/sections/CountdownTimer';
import LoveStoryGallery from '@/components/sections/LoveStoryGallery';
import VenueSection from '@/components/sections/VenueSection';
import TimelineSection from '@/components/sections/TimelineSection';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/sections/Footer';
import FloatingNav from '@/components/sections/FloatingNav';
import RsvpModal from '@/components/sections/RsvpModal';

const TITLE_MAP: Record<string, string> = { MR: 'Mr.', MRS: 'Mrs.', MS: 'Ms.', DR: 'Dr.', FAMILY: 'The', MASTER: 'Master' };

export default function InviteClient() {
  const params = useParams();
  const token = params.slug as string | null;

  // Data State
  const [data, setData] = useState<InvitePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI State
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided.');
      setLoading(false);
      return;
    }
    api.get(`/invite/${token}`)
      .then(res => {
        setData(res.data.data);
      })
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [token]);

  // Audio handling
  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error('Audio play failed:', e));
      setIsPlaying(true);
    }
  };

  const handleOpenEnvelope = () => {
    setIsEnvelopeOpen(true);
    // Auto-play music if it's set up
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.error('Auto-play blocked:', e);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <Heart size={40} className="text-gold/50" />
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-ivory">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gold-light/20">
          <div className="text-4xl mb-4">💌</div>
          <h1 className="text-2xl font-serif mb-2 text-charcoal">Invitation Unavailable</h1>
          <p className="text-charcoal/60 font-sans">{error || 'Could not load invitation.'}</p>
        </div>
      </div>
    );
  }

  const { wedding, guest } = data;
  const isFamily = guest.title === 'FAMILY';
  const guestName = isFamily ? `${TITLE_MAP[guest.title]} ${guest.lastName} Family` : `${TITLE_MAP[guest.title]} ${guest.firstName} ${guest.lastName}`;

  // Build contacts array for ContactSection
  const contacts = [];
  
  if (guest.brideRsvpContact === 'BRIDE_FATHER' && wedding.brideFatherPhone) {
    contacts.push({ name: wedding.brideFatherName || "Bride's Father", phone: wedding.brideFatherPhone });
  } else if (wedding.bridePhone) {
    contacts.push({ name: wedding.brideName, phone: wedding.bridePhone });
  }

  if (guest.groomRsvpContact === 'GROOM_FATHER' && wedding.groomFatherPhone) {
    contacts.push({ name: wedding.groomFatherName || "Groom's Father", phone: wedding.groomFatherPhone });
  } else if (wedding.groomPhone) {
    contacts.push({ name: wedding.groomName, phone: wedding.groomPhone });
  }

  return (
    <main className="min-h-screen bg-ivory text-charcoal font-sans relative">
      {/* Background Audio */}
      {wedding.musicUrl && (
        <audio 
          ref={audioRef} 
          src={wedding.musicUrl} 
          loop 
          autoPlay={false} 
        />
      )}

      {/* 1. Envelope Welcome Screen (Shown before opening) */}
      {!isEnvelopeOpen && (
        <EnvelopeWelcome 
          guestName={guestName} 
          onOpen={handleOpenEnvelope} 
          onSequenceComplete={() => {}}
        />
      )}

      {/* 2. Main Invitation Content (Shown after opening) */}
      {isEnvelopeOpen && (
        <>
          {/* Ambient Background */}
          <ParticleCanvas />

          {/* Sections */}
          <HeroSection wedding={wedding} />
          
          <div className="relative z-10 -mt-20">
            <InvitationCard brideName={wedding.brideName} groomName={wedding.groomName} />
          </div>

          <CountdownTimer targetDate={wedding.weddingDate} />
          
          {wedding.galleryUrls && wedding.galleryUrls.length > 0 && (
            <LoveStoryGallery images={wedding.galleryUrls} />
          )}

          <VenueSection wedding={wedding} />
          
          {wedding.timeline && (wedding.timeline as any[]).length > 0 && (
            <TimelineSection timeline={wedding.timeline as any} />
          )}

          <ContactSection contacts={contacts} />
          
          <Footer brideName={wedding.brideName} groomName={wedding.groomName} />

          {/* Floating Navigation */}
          <FloatingNav 
            onRsvpClick={() => setIsRsvpModalOpen(true)}
            pdfUrl={`/api/v1/invite/${token}/pdf`}
            onToggleMusic={wedding.musicUrl ? toggleAudio : undefined}
            isPlaying={isPlaying}
          />
        </>
      )}

      {/* RSVP Modal */}
      <RsvpModal 
        isOpen={isRsvpModalOpen}
        onClose={() => setIsRsvpModalOpen(false)}
        wedding={wedding}
        guest={guest}
        token={token!}
        initialStatus={guest.rsvpStatus !== 'PENDING' ? guest.rsvpStatus : ''}
        initialAttendants={guest.attendingCount || 1}
        initialDietary={guest.dietaryNotes || ''}
      />
    </main>
  );
}

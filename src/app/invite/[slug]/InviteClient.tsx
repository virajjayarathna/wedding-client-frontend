'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, Calendar, Clock, Music, Heart, Check, X, HelpCircle, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api, { getErrorMessage } from '@/lib/api';
import type { InvitePayload, RsvpStatus } from '@/lib/types';

const TITLE_MAP: Record<string, string> = { MR: 'Mr.', MRS: 'Mrs.', MS: 'Ms.', DR: 'Dr.', FAMILY: 'The', MASTER: 'Master' };

export default function InviteClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [data, setData] = useState<InvitePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // RSVP Form State
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus | ''>('');
  const [attendants, setAttendants] = useState(1);
  const [dietary, setDietary] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
        const g = res.data.data.guest;
        if (g.rsvpStatus !== 'PENDING') {
          setRsvpStatus(g.rsvpStatus);
          setAttendants(g.attendingCount || 1);
          setDietary(g.dietaryNotes || '');
        }
      })
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [token]);

  // Parallax scroll setup
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <Heart size={40} className="text-gray-300" />
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-[#fdfbf7]">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="text-4xl mb-4">💌</div>
          <h1 className="text-2xl font-semibold mb-2 text-gray-800">Invitation Unavailable</h1>
          <p className="text-gray-500">{error || 'Could not load invitation.'}</p>
        </div>
      </div>
    );
  }

  const { wedding, guest } = data;
  const isFamily = guest.title === 'FAMILY';
  const guestName = isFamily ? `${TITLE_MAP[guest.title]} ${guest.lastName} Family` : `${TITLE_MAP[guest.title]} ${guest.firstName} ${guest.lastName}`;
  const weddingDateStr = wedding.weddingDate ? format(new Date(wedding.weddingDate), 'EEEE, MMMM do, yyyy') : '';

  async function handleRsvpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rsvpStatus) return toast.error('Please select your attendance status');
    setSubmitting(true);
    try {
      await api.post(`/invite/${token}/rsvp`, {
        rsvpStatus,
        attendingCount: rsvpStatus === 'ATTENDING' ? attendants : undefined,
        dietaryNotes: dietary,
        notes,
      });
      if (rsvpStatus === 'ATTENDING') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: [wedding.primaryColor, wedding.accentColor, '#ffffff'] });
        toast.success("Yay! We can't wait to see you! 🎉");
      } else {
        toast.success("RSVP submitted successfully.");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMusic() {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  }

  return (
    <div
      style={{
        '--theme-primary': wedding.primaryColor,
        '--theme-accent': wedding.accentColor,
        '--font-heading': wedding.fontFamily,
      } as React.CSSProperties}
      className="min-h-screen relative overflow-x-hidden"
    >
      {/* Background Music Player */}
      {wedding.musicUrl && wedding.musicType === 'UPLOAD' && (
        <>
          <audio ref={audioRef} src={wedding.musicUrl} loop />
          <button onClick={toggleMusic} className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-[var(--theme-primary)] hover:scale-110 transition-transform">
            <Music size={20} className={isPlaying ? 'animate-pulse' : ''} />
          </button>
        </>
      )}

      {/* Hero Section */}
      <section className="relative h-[100svh] w-full flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          {wedding.coverPhotoUrl ? (
            <img src={wedding.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] opacity-20" />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <div className="relative z-10 text-center px-6 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
            <p className="text-white/80 text-sm md:text-base tracking-[0.2em] uppercase mb-4">You are invited to the wedding of</p>
            <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl text-white mb-6 drop-shadow-lg">
              {wedding.brideName} <br className="md:hidden" /><span className="text-[var(--theme-primary)] mx-4">&amp;</span><br className="md:hidden" /> {wedding.groomName}
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-light tracking-wide drop-shadow-md">
              {weddingDateStr}
            </p>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-px h-16 bg-gradient-to-b from-white/0 via-white to-white/0" />
        </motion.div>
      </section>

      {/* Greeting */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <h2 className="font-heading text-4xl md:text-5xl mb-6 text-[var(--theme-primary)]">Dear {guestName},</h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light">
            We joyfully request the pleasure of your company as we celebrate our marriage. Your presence will make our special day complete.
          </p>
          
          {wedding.loveStory && (
            <div className="mt-16">
              <div className="flex justify-center mb-6">
                <Heart size={32} className="text-[var(--theme-accent)] opacity-50" />
              </div>
              <h3 className="font-heading text-3xl mb-6">Our Story</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{wedding.loveStory}</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Venue & Details */}
      <section className="py-24 bg-[var(--theme-primary)]/5 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            {wedding.heroPhotoUrl ? (
              <div className="rounded-[2rem] overflow-hidden shadow-2xl relative aspect-[4/5]">
                <img src={wedding.heroPhotoUrl} alt="The Couple" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-[2rem] bg-gradient-to-tr from-[var(--theme-primary)] to-[var(--theme-accent)] aspect-[4/5] opacity-20" />
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex flex-col gap-10">
            <div>
              <h2 className="font-heading text-4xl md:text-5xl mb-8">When & Where</h2>
              
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center shrink-0 text-[var(--theme-primary)]">
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Date & Time</h4>
                  <p className="text-gray-600">{weddingDateStr}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center shrink-0 text-[var(--theme-primary)]">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">{wedding.venueName || 'Venue TBD'}</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{wedding.venueAddress}</p>
                  {wedding.venueMapsUrl && (
                    <a href={wedding.venueMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-[var(--theme-primary)] font-medium hover:underline">
                      View on Google Maps →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      {wedding.timeline && wedding.timeline.length > 0 && (
        <section className="py-24 px-6 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl mb-4">Itinerary</h2>
            <p className="text-gray-500">What to expect on our special day</p>
          </motion.div>

          <div className="relative border-l-2 border-[var(--theme-primary)]/30 ml-4 md:ml-1/2 space-y-12 pb-8">
            {wedding.timeline.map((event, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="relative pl-8">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[var(--theme-primary)] shadow-[0_0_0_4px_var(--theme-bg)]" />
                <div className="text-[var(--theme-primary)] font-semibold mb-1 flex items-center gap-2">
                  <Clock size={16} /> {event.time}
                </div>
                <h4 className="text-xl font-heading font-semibold mb-2">{event.title}</h4>
                {event.description && <p className="text-gray-600">{event.description}</p>}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* RSVP Form */}
      <section className="py-24 px-6 bg-[#1a1a1a] text-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative z-10 max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="font-heading text-4xl md:text-5xl mb-4">RSVP</h2>
            <p className="text-white/60">Please let us know if you can make it!</p>
          </div>

          <form onSubmit={handleRsvpSubmit} className="space-y-8">
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-4">Will you be attending?</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { val: 'ATTENDING', label: 'Joyfully Accept', icon: <Check size={18} /> },
                  { val: 'DECLINING', label: 'Regretfully Decline', icon: <X size={18} /> },
                  { val: 'MAYBE', label: 'Not Sure Yet', icon: <HelpCircle size={18} /> },
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setRsvpStatus(opt.val as RsvpStatus)}
                    className={`flex items-center justify-center gap-2 py-4 px-4 rounded-xl border transition-all ${
                      rsvpStatus === opt.val
                        ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]'
                        : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {opt.icon} <span className="font-medium text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Attendants (if attending) */}
            {rsvpStatus === 'ATTENDING' && guest.maxAttendants > 1 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Number of guests attending (including yourself)
                </label>
                <p className="text-xs text-white/50 mb-3">You can bring up to {guest.maxAttendants} guests.</p>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setAttendants(Math.max(1, attendants - 1))} className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20">-</button>
                  <span className="text-xl font-medium w-6 text-center">{attendants}</span>
                  <button type="button" onClick={() => setAttendants(Math.min(guest.maxAttendants, attendants + 1))} className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20">+</button>
                </div>
              </motion.div>
            )}

            {/* Dietary & Notes */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Dietary Requirements</label>
                <input
                  type="text"
                  placeholder="e.g. Vegetarian, Nut allergy (Leave blank if none)"
                  value={dietary}
                  onChange={e => setDietary(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[var(--theme-primary)] focus:bg-white/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Message for the couple</label>
                <textarea
                  placeholder="Leave a sweet note..."
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[var(--theme-primary)] focus:bg-white/10 transition-all resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !rsvpStatus}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg transition-all ${
                submitting || !rsvpStatus
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-[var(--theme-primary)] text-white hover:opacity-90 hover:scale-[1.02] shadow-lg shadow-[var(--theme-primary)]/30'
              }`}
            >
              {submitting ? 'Submitting...' : <>Send RSVP <Send size={18} /></>}
            </button>
          </form>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 bg-black">
        <p>Made with love for {wedding.brideName} & {wedding.groomName}</p>
      </footer>
    </div>
  );
}

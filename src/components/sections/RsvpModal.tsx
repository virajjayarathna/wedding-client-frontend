'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import api, { getErrorMessage } from '@/lib/api';
import type { RsvpStatus } from '@/lib/types';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  wedding: any;
  guest: any;
  initialStatus: RsvpStatus | '';
  initialAttendants: number;
  initialDietary: string;
}

export default function RsvpModal({
  isOpen, onClose, token, wedding, guest,
  initialStatus, initialAttendants, initialDietary
}: RsvpModalProps) {
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus | ''>(initialStatus);
  const [attendants, setAttendants] = useState(initialAttendants);
  const [dietary, setDietary] = useState(initialDietary);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const deadlinePassed = !!wedding.rsvpDeadline && new Date() > new Date(wedding.rsvpDeadline);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deadlinePassed) return toast.error('The RSVP deadline has passed.');
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
        // Confetti is drawn on a canvas, so it can't inherit CSS variables —
        // read the live theme values off the document instead of hard-coding gold.
        const css = getComputedStyle(document.documentElement);
        const themeColor = (name: string, fallback: string) =>
          css.getPropertyValue(name).trim() || fallback;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: [
            themeColor('--gold', '#D4AF37'),
            themeColor('--gold-light', '#E6D5B8'),
            themeColor('--charcoal', '#333230'),
          ],
        });
        toast.success("Yay! We can't wait to see you! 🎉");
      } else {
        toast.success("RSVP submitted successfully.");
      }
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-lg bg-ivory rounded-t-[2rem] shadow-2xl relative z-10 pointer-events-auto max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-ivory/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gold-light/20 z-20">
              <h2 className="font-serif text-2xl text-charcoal">RSVP</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-charcoal hover:bg-gold-light transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {deadlinePassed ? (
              <div className="p-6 md:p-8 text-center space-y-2">
                <p className="text-charcoal font-medium text-lg">The RSVP deadline has passed.</p>
                <p className="text-charcoal/60 text-sm">Please contact the couple directly if your plans have changed.</p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
              <div>
                <label className="block text-sm font-medium text-charcoal/80 mb-4">Will you be attending?</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { val: 'ATTENDING', label: 'Joyfully Accept', icon: <Check size={18} /> },
                    { val: 'DECLINING', label: 'Regretfully Decline', icon: <X size={18} /> },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setRsvpStatus(opt.val as RsvpStatus)}
                      className={`flex items-center justify-center gap-3 h-14 rounded-xl border transition-all ${
                        rsvpStatus === opt.val
                          ? 'border-gold bg-gold/10 text-charcoal shadow-sm'
                          : 'border-charcoal/10 bg-cream text-charcoal/60 hover:bg-card hover:border-gold-light'
                      }`}
                    >
                      {opt.icon} <span className="font-medium text-base">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {rsvpStatus === 'ATTENDING' && guest.maxAttendants > 1 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                  <label className="block text-sm font-medium text-charcoal/80 mb-2 mt-2">
                    Number of guests attending (including yourself)
                  </label>
                  <p className="text-xs text-charcoal/50 mb-3">You can bring up to {guest.maxAttendants} guests.</p>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setAttendants(Math.max(1, attendants - 1))} className="w-12 h-12 rounded-xl bg-cream border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-card">-</button>
                    <span className="text-2xl font-serif w-8 text-center">{attendants}</span>
                    <button type="button" onClick={() => setAttendants(Math.min(guest.maxAttendants, attendants + 1))} className="w-12 h-12 rounded-xl bg-cream border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-card">+</button>
                  </div>
                </motion.div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal/80 mb-2">Dietary Requirements</label>
                  <input
                    type="text"
                    placeholder="e.g. Vegetarian, Nut allergy (Leave blank if none)"
                    value={dietary}
                    onChange={e => setDietary(e.target.value)}
                    className="w-full bg-cream border border-charcoal/10 rounded-xl px-4 h-14 text-charcoal placeholder-charcoal/30 outline-none focus:border-gold focus:bg-card transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal/80 mb-2">Message for the couple</label>
                  <textarea
                    placeholder="Leave a sweet note..."
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-cream border border-charcoal/10 rounded-xl px-4 py-3 text-charcoal placeholder-charcoal/30 outline-none focus:border-gold focus:bg-card transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || !rsvpStatus}
                  className={`w-full h-14 flex items-center justify-center gap-2 rounded-xl font-medium text-lg transition-all ${
                    submitting || !rsvpStatus
                      ? 'bg-charcoal/5 text-charcoal/30 cursor-not-allowed'
                      : 'btn-primary shadow-lg hover:shadow-xl hover:scale-[1.02]'
                  }`}
                >
                  {submitting ? 'Submitting...' : <>Send RSVP <Send size={18} /></>}
                </button>
              </div>
            </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

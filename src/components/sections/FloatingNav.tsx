'use client';

import { motion } from 'framer-motion';
import { Mail, Image as ImageIcon, MapPin, Download, Music, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FloatingNavProps {
  onRsvpClick: () => void;
  pdfUrl?: string; // e.g., `/invite/${token}/pdf`
  onToggleMusic?: () => void;
  isPlaying?: boolean;
}

export default function FloatingNav({ onRsvpClick, pdfUrl, onToggleMusic, isPlaying }: FloatingNavProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show nav only after user scrolls down a bit past the hero
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={isVisible ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm glass-panel rounded-full px-2 py-2 flex items-center justify-between"
    >
      <button 
        onClick={() => scrollTo('gallery')} 
        className="w-12 h-12 flex flex-col items-center justify-center gap-1 text-charcoal/60 hover:text-gold transition-colors"
        aria-label="Gallery"
      >
        <ImageIcon size={18} />
      </button>
      
      <button 
        onClick={() => scrollTo('location')} 
        className="w-12 h-12 flex flex-col items-center justify-center gap-1 text-charcoal/60 hover:text-gold transition-colors"
        aria-label="Location"
      >
        <MapPin size={18} />
      </button>

      {onToggleMusic && (
        <button 
          onClick={onToggleMusic} 
          className="w-12 h-12 flex flex-col items-center justify-center gap-1 text-charcoal/60 hover:text-gold transition-colors"
          aria-label={isPlaying ? "Mute Music" : "Play Music"}
        >
          {isPlaying ? <Music size={18} /> : <VolumeX size={18} />}
        </button>
      )}

      {pdfUrl && (
        <a 
          href={pdfUrl} 
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 flex flex-col items-center justify-center gap-1 text-charcoal/60 hover:text-gold transition-colors"
          aria-label="Download PDF"
        >
          <Download size={18} />
        </a>
      )}

      <button
        onClick={onRsvpClick}
        className="flex items-center gap-2 px-6 h-12 rounded-full bg-gradient-to-r from-gold to-champagne text-charcoal font-medium shadow-md hover:shadow-lg transition-all"
      >
        <Mail size={16} />
        RSVP
      </button>
    </motion.nav>
  );
}

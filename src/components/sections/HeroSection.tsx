'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

interface HeroSectionProps {
  wedding: any;
}

export default function HeroSection({ wedding }: HeroSectionProps) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const weddingDateStr = wedding.weddingDate 
    ? format(new Date(wedding.weddingDate), 'EEEE, MMMM do, yyyy') 
    : '';

  // Google Calendar Link generator
  const getGoogleCalendarUrl = () => {
    if (!wedding.weddingDate) return '#';
    const startDate = new Date(wedding.weddingDate);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // Assume 4 hours long

    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Wedding of ${wedding.brideName} & ${wedding.groomName}`,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: 'We cannot wait to celebrate with you!',
      location: wedding.venueAddress || wedding.venueName || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <section className="relative h-[100svh] w-full flex items-center justify-center overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        {wedding.coverPhotoUrl ? (
          <img 
            src={wedding.coverPhotoUrl} 
            alt="Cover" 
            className="w-full h-full object-cover scale-105" // scale slightly to prevent edge revealing on bounce
          />
        ) : (
          <div className="w-full h-full bg-cream" />
        )}
        {/* Soft overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-charcoal/40 to-charcoal/60" />
      </motion.div>

      <div className="relative z-10 text-center px-6 flex flex-col items-center mt-20 md:mt-0">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.2, delay: 0.5 }}
        >
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-white mb-6 drop-shadow-lg tracking-wide">
            {wedding.brideName} 
            <br className="md:hidden" />
            <span className="text-gold mx-4 text-5xl md:text-7xl">&amp;</span>
            <br className="md:hidden" /> 
            {wedding.groomName}
          </h1>
          <div className="w-16 h-[1px] bg-gold/70 mx-auto mb-6" />
          <p className="text-white/90 text-sm md:text-base font-sans tracking-[4px] uppercase drop-shadow-md mb-8">
            {weddingDateStr} • {wedding.venueName || 'Sri Lanka'}
          </p>

          {wedding.weddingDate && (
            <motion.a 
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm hover:bg-white/20 transition-colors shadow-lg"
            >
              <Calendar size={16} /> Add to Calendar
            </motion.a>
          )}
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 2, duration: 1 }} 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/70 to-transparent" />
      </motion.div>
    </section>
  );
}

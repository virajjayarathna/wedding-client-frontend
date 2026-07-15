'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface VenueSectionProps {
  wedding: any;
}

export default function VenueSection({ wedding }: VenueSectionProps) {
  const weddingDateStr = wedding.weddingDate 
    ? format(new Date(wedding.weddingDate), 'EEEE, MMMM do, yyyy') 
    : '';

  return (
    <section id="location" className="py-24 bg-cream/30 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -40 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true, margin: "-100px" }} 
          transition={{ duration: 0.8 }}
        >
          {wedding.heroPhotoUrl ? (
            <div className="rounded-2xl overflow-hidden shadow-2xl relative aspect-[4/5] border border-gold-light/30 p-2 bg-white">
              <img src={wedding.heroPhotoUrl} alt="The Couple" className="w-full h-full object-cover rounded-xl" />
            </div>
          ) : (
            <div className="rounded-[2rem] bg-gradient-to-tr from-ivory to-cream aspect-[4/5] opacity-50" />
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 40 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true, margin: "-100px" }} 
          transition={{ duration: 0.8 }} 
          className="flex flex-col gap-10"
        >
          <div>
            <h2 className="font-serif text-4xl md:text-5xl mb-8 text-charcoal">When & Where</h2>
            
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0 text-gold border border-gold/20">
                <Calendar size={20} />
              </div>
              <div>
                <h4 className="font-serif text-xl mb-1 text-charcoal">Date & Time</h4>
                <p className="font-sans text-charcoal/70 leading-relaxed">{weddingDateStr}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0 text-gold border border-gold/20">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-serif text-xl mb-1 text-charcoal">{wedding.venueName || 'Venue TBD'}</h4>
                <p className="font-sans text-charcoal/70 whitespace-pre-wrap leading-relaxed">{wedding.venueAddress}</p>
                {wedding.venueMapsUrl && (
                  <a 
                    href={wedding.venueMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block mt-4 text-sm uppercase tracking-wider font-semibold text-gold hover:text-charcoal transition-colors border-b border-gold/50 pb-1"
                  >
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

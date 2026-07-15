'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimelineEvent {
  time: string;
  title: string;
  description?: string;
}

interface TimelineSectionProps {
  timeline: TimelineEvent[];
}

export default function TimelineSection({ timeline }: TimelineSectionProps) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <section className="py-24 px-4 md:px-6 relative z-10 max-w-4xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: "-100px" }} 
        transition={{ duration: 0.8 }} 
        className="text-center mb-16"
      >
        <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">Itinerary</h2>
        <div className="w-16 h-[1px] bg-gold/50 mx-auto mb-6" />
        <p className="font-sans text-charcoal/60 uppercase tracking-[4px] text-xs">Our special day</p>
      </motion.div>

      <div className="relative w-full">
        {/* Center vertical line */}
        <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-[1px] bg-gold/30 transform md:-translate-x-1/2" />

        <div className="space-y-12 w-full pb-8">
          {timeline.map((event, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-100px" }} 
                transition={{ duration: 0.6, delay: 0.1 }} 
                className="relative flex flex-col md:flex-row w-full items-start md:items-center"
              >
                {/* Dot */}
                <div className="absolute left-[16.5px] md:left-1/2 top-1 md:top-1/2 w-[8px] h-[8px] rounded-full bg-gold transform md:-translate-x-1/2 md:-translate-y-1/2 shadow-[0_0_0_4px_var(--bg-ivory)] z-10" />

                {/* Content Container (Alternating) */}
                <div className={`pl-12 md:pl-0 w-full md:w-1/2 flex flex-col ${isEven ? 'md:pr-12 md:text-right md:items-end' : 'md:ml-auto md:pl-12 md:items-start'}`}>
                  
                  <div className={`text-gold font-sans font-medium mb-2 flex items-center gap-2 text-xs md:text-sm uppercase tracking-wide ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    <Clock size={14} /> {event.time}
                  </div>
                  
                  <h4 className="text-xl md:text-2xl font-serif text-charcoal font-medium mb-3">{event.title}</h4>
                  
                  {event.description && (
                    <p className="text-charcoal/70 text-sm md:text-base leading-relaxed md:max-w-xs">{event.description}</p>
                  )}
                  
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';

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
    <section className="py-24 relative z-10 w-full overflow-hidden section-bg-timeline">
      <div className="max-w-4xl mx-auto px-4 md:px-6 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }} 
          transition={{ duration: 0.8 }} 
          className="text-center mb-20 relative"
        >

          <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-6">Wedding Timeline</h2>
          <div className="w-16 h-[2px] bg-gold/50 mx-auto mb-6" />
          <p className="font-sans text-charcoal/60 uppercase tracking-[4px] text-xs">Our special day</p>
        </motion.div>

        <div className="relative w-full">
          {/* Center vertical line */}
          <div className="absolute left-[24px] md:left-1/2 top-4 bottom-0 w-[2px] bg-gold/30 transform -translate-x-1/2" />

          <div className="space-y-16 md:space-y-20 w-full pb-8">
            {timeline.map((event, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 30 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: "-100px" }} 
                  transition={{ duration: 0.6, delay: 0.1 * (idx % 3) }} 
                  className="relative flex flex-col md:flex-row w-full items-start md:items-center group"
                >
                  {/* Marker with ring and dot */}
                  <div className="absolute left-[24px] md:left-1/2 top-0 md:top-1/2 transform -translate-x-1/2 md:-translate-y-1/2 z-10 bg-ivory p-1 mt-1 md:mt-0">
                    <motion.div 
                      whileHover={{ scale: 1.2 }}
                      className="w-[18px] h-[18px] rounded-full border-[2px] border-gold/60 flex items-center justify-center cursor-pointer transition-colors duration-300 group-hover:border-gold group-hover:bg-gold/10"
                    >
                      <div className="w-[6px] h-[6px] rounded-full bg-gold transition-transform duration-300 group-hover:scale-125" />
                    </motion.div>
                  </div>



                  {/* Content Container (Alternating) */}
                  <div className={`pl-16 md:pl-0 w-full md:w-1/2 flex flex-col ${isEven ? 'md:pr-14 md:text-right md:items-end' : 'md:ml-auto md:pl-14 md:items-start'}`}>
                    
                    <div className={`text-gold font-sans font-bold mb-1 tracking-wider text-sm md:text-base ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                      {event.time}
                    </div>
                    
                    <h4 className="text-2xl md:text-3xl font-serif text-charcoal font-semibold mb-2 group-hover:text-gold transition-colors duration-300">
                      {event.title}
                    </h4>
                    
                    {event.description && (
                      <p className="text-charcoal/70 text-sm md:text-base leading-relaxed md:max-w-xs font-sans">
                        {event.description}
                      </p>
                    )}
                    
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Bottom decorative fading line end */}
          <div className="absolute left-[24px] md:left-1/2 bottom-[-40px] h-[40px] w-[2px] bg-gradient-to-b from-gold/30 to-transparent transform -translate-x-1/2" />
        </div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';

interface InvitationCardProps {
  brideName: string;
  groomName: string;
}

export default function InvitationCard({ brideName, groomName }: InvitationCardProps) {
  return (
    <section className="py-24 px-4 md:px-6 relative z-10 w-full flex justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="card-elegant w-full max-w-2xl p-10 md:p-16 text-center relative"
      >
        <div className="absolute inset-0 border-[1px] border-gold opacity-30 m-3 md:m-4 pointer-events-none" />
        
        <p className="font-sans text-[10px] md:text-xs uppercase tracking-[3px] text-charcoal/60 mb-8">
          Together with their families
        </p>
        
        <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-4 font-medium">
          {brideName}
        </h2>
        <span className="font-serif text-2xl text-gold italic block mb-4">&amp;</span>
        <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-8 font-medium">
          {groomName}
        </h2>
        
        <div className="w-12 h-[1px] bg-gold/50 mx-auto mb-8" />

        <p className="font-sans text-sm md:text-base leading-relaxed text-charcoal/80 max-w-md mx-auto">
          Joyfully request the pleasure of your company as we celebrate our marriage. 
          Your presence will make our special day complete.
        </p>
      </motion.div>
    </section>
  );
}

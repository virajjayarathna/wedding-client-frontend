'use client';

import { motion } from 'framer-motion';

interface InvitationCardProps {
  wedding: any;
  guestName: string;
}

export default function InvitationCard({ wedding, guestName }: InvitationCardProps) {
  const primaryColor = wedding?.primaryColor || '#C5A059';
  const accentColor = wedding?.accentColor || '#E8E8E8';

  return (
    <section className="py-24 px-4 md:px-6 relative z-10 w-full flex justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="w-full max-w-2xl p-8 md:p-14 text-center relative bg-white flex flex-col items-center"
        style={{
          border: `1px solid ${accentColor}`,
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        }}
      >
        <div 
          className="absolute inset-0 pointer-events-none m-4 md:m-5" 
          style={{ border: `2px solid ${primaryColor}`, opacity: 1 }}
        />
        <div 
          className="absolute inset-0 pointer-events-none m-[22px] md:m-[27px]" 
          style={{ border: `1px solid ${accentColor}`, opacity: 1 }}
        />
        
        {wedding?.pdfLogoUrl ? (
          <div className="mb-6 md:mb-8 h-32 md:h-48 flex items-center justify-center relative z-10 mt-6">
            <img src={wedding.pdfLogoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <div className="mb-6 md:mb-8 flex items-center justify-center relative z-10 mt-8">
            <div 
              className="text-7xl md:text-8xl flex"
              style={{ 
                color: primaryColor,
                fontFamily: wedding?.pdfFont ? `'${wedding.pdfFont}', cursive` : "'Great Vibes', cursive",
                lineHeight: 1
              }}
            >
              <span>{wedding?.brideName?.[0]}</span>
              <span className="-ml-4 md:-ml-6 opacity-90">{wedding?.groomName?.[0]}</span>
            </div>
          </div>
        )}

        <div className="font-serif text-[11px] md:text-[13px] tracking-[2px] uppercase text-[#333333] mb-4 md:mb-6 leading-[1.8] relative z-10" style={{ fontFamily: "'Playfair Display', serif" }}>
          MR. &amp; MRS. {wedding?.brideFatherName?.toUpperCase() || ''}<br/>
          <span className="inline-block my-2 text-[11px] md:text-[13px] tracking-[2px]">TOGETHER WITH</span><br/>
          MR. &amp; MRS. {wedding?.groomFatherName?.toUpperCase() || ''}
        </div>

        <div className="font-serif text-[11px] md:text-[13px] text-[#333333] uppercase tracking-[1px] my-4 md:my-6 relative z-10" style={{ fontFamily: "'Playfair Display', serif" }}>
          REQUEST THE HONOUR OF THE PRESENCE OF
        </div>

        <div 
          className="font-serif text-lg md:text-xl text-[#333333] my-4 md:my-6 py-4 px-8 w-full max-w-[80%] relative z-10"
          style={{ borderTop: `1px solid ${accentColor}`, borderBottom: `1px solid ${accentColor}`, fontFamily: "'Playfair Display', serif" }}
        >
          {guestName.toUpperCase()}
        </div>

        <div className="font-serif text-[10px] md:text-[12px] text-[#333333] uppercase tracking-[1px] my-4 md:my-6 leading-[1.8] relative z-10" style={{ fontFamily: "'Playfair Display', serif" }}>
          TO CELEBRATE THE WEDDING OF THEIR DAUGHTER &amp; SON
        </div>

        <h2 
          className="text-5xl md:text-6xl mb-6 relative z-10 pt-4"
          style={{ 
            color: primaryColor,
            fontFamily: wedding?.pdfFont ? `'${wedding.pdfFont}', cursive` : "'Great Vibes', cursive",
            lineHeight: 1.2,
            padding: '0 10px'
          }}
        >
          {wedding?.brideName} <span className="font-serif text-3xl md:text-4xl italic px-2 text-gold" style={{ fontFamily: "'Playfair Display', serif" }}>&amp;</span> {wedding?.groomName}
        </h2>
        
      </motion.div>
    </section>
  );
}

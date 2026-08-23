'use client';

import { motion } from 'framer-motion';

interface InvitationCardProps {
  wedding: any;
  guestName: string;
}

export default function InvitationCard({ wedding, guestName }: InvitationCardProps) {
  // Read the resolved theme rather than the raw record. The invite page emits
  // --gold / --gold-light for the couple's palette, so the card's rules and
  // monogram stay in step with the rest of the page even when the wedding has
  // no explicit primaryColor saved.
  const primaryColor = 'var(--gold)';
  const accentColor = 'var(--gold-light)';
  // The card's body copy is set in the theme's heading face, not a hard-coded
  // Playfair — swapping the heading font has to carry through here or the
  // invitation reads as a different design from the sections around it.
  const formalFont = 'var(--font-serif)';

  // Home-coming cards are sent from the groom's side, so the couple reads
  // groom-first and the celebrate line swaps "daughter & son" accordingly.
  // Anything other than HOME_COMING (including a missing value) keeps the
  // original wedding wording.
  const isHomeComing = wedding?.ceremonyType === 'HOME_COMING';
  const firstName = isHomeComing ? wedding?.groomName : wedding?.brideName;
  const secondName = isHomeComing ? wedding?.brideName : wedding?.groomName;

  return (
    <section className="py-24 px-4 md:px-6 relative z-10 w-full flex justify-center section-bg-card">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="w-full max-w-2xl p-8 md:p-14 text-center relative bg-card flex flex-col items-center"
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
                fontFamily: wedding?.pdfFont ? `'${wedding.pdfFont}', cursive` : 'var(--font-script)',
                lineHeight: 1
              }}
            >
              <span>{wedding?.brideName?.[0]}</span>
              <span className="-ml-4 md:-ml-6 opacity-90">{wedding?.groomName?.[0]}</span>
            </div>
          </div>
        )}

        <div className="font-serif text-[11px] md:text-[13px] tracking-[2px] uppercase text-charcoal mb-3 md:mb-4 leading-[1.3] relative z-10" style={{ fontFamily: formalFont }}>
          MR. &amp; MRS. {wedding?.brideFatherName?.toUpperCase() || ''}<br />
          <span className="inline-block my-0.5 text-[11px] md:text-[13px] tracking-[2px]">TOGETHER WITH</span><br />
          MR. &amp; MRS. {wedding?.groomFatherName?.toUpperCase() || ''}
        </div>

        <div className="font-serif text-[11px] md:text-[13px] text-charcoal uppercase tracking-[1px] my-4 md:my-6 relative z-10" style={{ fontFamily: formalFont }}>
          REQUEST THE HONOUR OF THE PRESENCE OF
        </div>

        <div
          className="font-serif text-lg md:text-xl text-charcoal my-4 md:my-6 py-4 px-8 w-full max-w-[80%] relative z-10"
          style={{ borderTop: `1px solid ${accentColor}`, borderBottom: `1px solid ${accentColor}`, fontFamily: formalFont }}
        >
          {guestName.toUpperCase()}
        </div>

        <div className="font-serif text-[10px] md:text-[12px] text-charcoal uppercase tracking-[1px] my-4 md:my-6 leading-[1.8] relative z-10" style={{ fontFamily: formalFont }}>
          {isHomeComing
            ? 'TO CELEBRATE THE HOMECOMING OF THEIR SON & DAUGHTER'
            : 'TO CELEBRATE THE WEDDING OF THEIR DAUGHTER & SON'}
        </div>

        <h2
          className="text-5xl md:text-6xl mb-6 relative z-10 pt-4"
          style={{
            color: primaryColor,
            fontFamily: wedding?.pdfFont ? `'${wedding.pdfFont}', cursive` : 'var(--font-script)',
            lineHeight: 1.2,
            padding: '0 10px'
          }}
        >
          {firstName} <span className="font-serif text-3xl md:text-4xl italic px-2 text-gold" style={{ fontFamily: formalFont }}>&amp;</span> {secondName}
        </h2>

      </motion.div>
    </section>
  );
}

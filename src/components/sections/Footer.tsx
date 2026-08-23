'use client';

import type { CeremonyType } from '@/lib/types';

interface FooterProps {
  brideName: string;
  groomName: string;
  ceremonyType?: CeremonyType | null;
}

export default function Footer({ brideName, groomName, ceremonyType }: FooterProps) {
  // Home-coming cards are sent from the groom's side, so the couple reads
  // groom-first there instead of the default bride-first order.
  const isHomeComing = ceremonyType === 'HOME_COMING';
  const firstName = isHomeComing ? groomName : brideName;
  const secondName = isHomeComing ? brideName : groomName;

  return (
    <footer className="py-12 px-6 text-center bg-charcoal text-ivory relative z-10 border-t border-gold-light/20 pb-32 md:pb-24">
      <div className="w-12 h-[1px] bg-gold/30 mx-auto mb-6" />
      <p className="font-sans text-[10px] md:text-xs tracking-[3px] uppercase text-ivory/60">
        Made with love for
      </p>
      <h3 className="font-serif text-2xl text-gold mt-4 font-light">
        {firstName} &amp; {secondName}
      </h3>
    </footer>
  );
}

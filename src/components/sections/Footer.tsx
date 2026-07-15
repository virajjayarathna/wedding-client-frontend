'use client';

interface FooterProps {
  brideName: string;
  groomName: string;
}

export default function Footer({ brideName, groomName }: FooterProps) {
  return (
    <footer className="py-12 px-6 text-center bg-charcoal text-ivory relative z-10 border-t border-gold-light/20 pb-32 md:pb-24">
      <div className="w-12 h-[1px] bg-gold/30 mx-auto mb-6" />
      <p className="font-sans text-[10px] md:text-xs tracking-[3px] uppercase text-ivory/60">
        Made with love for
      </p>
      <h3 className="font-serif text-2xl text-gold mt-4 font-light">
        {brideName} &amp; {groomName}
      </h3>
    </footer>
  );
}

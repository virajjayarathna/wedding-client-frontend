import LoveStoryGallery from '@/components/sections/LoveStoryGallery';

const IMAGES = Array.from({ length: 8 }, (_, i) => `/lab/${i + 1}.svg`);

export default function BookLab() {
  return (
    <main className="min-h-screen bg-ivory">
      <div className="h-[40vh] flex items-center justify-center text-charcoal/40 font-serif italic">
        scroll down
      </div>
      <LoveStoryGallery images={IMAGES} brideName="Ruwanthi" groomName="Kasun" weddingDate="2026-11-14" />
      <div className="h-[60vh]" />
    </main>
  );
}

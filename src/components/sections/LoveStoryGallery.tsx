'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './turnbook.module.css';

interface LoveStoryGalleryProps {
  images: string[];
  brideName?: string;
  groomName?: string;
}

export default function LoveStoryGallery({ images, brideName = "RUWANTHI", groomName = "KASUN" }: LoveStoryGalleryProps) {
  const [currentPage, setCurrentPage] = useState(0);

  if (!images || images.length === 0) return null;

  // Setup pages: Cover -> Photos -> Backcover
  const pages: any[] = [
    { type: 'cover' }
  ];
  
  for (let i = 0; i < images.length; i += 2) {
    pages.push({
      type: 'photo',
      front: images[i],
      back: images[i + 1] || null, 
    });
  }
  
  pages.push({ type: 'backcover' });

  const nextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(c => c + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(c => c - 1);
    }
  };

  return (
    <section id="gallery" className="py-24 px-4 md:px-6 relative z-10 section-bg-gallery overflow-hidden">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">Gallery</h2>
          <div className="w-16 h-[1px] bg-gold/50 mx-auto mb-6" />
          <p className="font-sans text-charcoal/60 uppercase tracking-[4px] text-xs">Our memories</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className={styles.bookContainer}
      >
        <button 
          onClick={prevPage} 
          disabled={currentPage === 0}
          className={`${styles.navButton} ${styles.navPrev}`}
          aria-label="Previous page"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Background text phases */}
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-0">
          {/* Opening Phase (Left) */}
          <div 
            className={`w-1/2 h-full p-4 md:p-8 flex flex-col items-center justify-center text-center transition-opacity duration-1000 ${currentPage === 0 ? 'opacity-100' : 'opacity-0'}`}
          >
            <h4 className="font-serif text-lg md:text-2xl text-gold mb-4 italic">Every great story begins with a single page...</h4>
            <div className="w-16 h-[1px] bg-gold/50 mx-auto mb-6" />
            <p className="font-sans text-xs md:text-sm text-charcoal/80 leading-relaxed mb-4">
              Ours began with a smile,<br/>
              grew through friendship,<br/>
              blossomed into love,<br/>
              and now leads us to forever.
            </p>
            <p className="font-sans text-xs md:text-sm text-charcoal/80 leading-relaxed italic mt-2">
              We invite you to turn the page<br/>
              and become part of the most beautiful<br/>
              chapter of our lives.
            </p>
          </div>

          {/* Closing Phase (Right) */}
          <div 
            className={`w-1/2 h-full p-4 md:p-8 flex flex-col items-center justify-center text-center transition-opacity duration-1000 ${currentPage === pages.length ? 'opacity-100' : 'opacity-0'}`}
          >
            <h4 className="font-serif text-lg md:text-2xl text-gold mb-6 italic">And so, our story continues...</h4>
            <div className="w-16 h-[1px] bg-gold/50 mx-auto mb-6" />
            <p className="font-sans text-xs md:text-sm text-charcoal/80 leading-relaxed mb-4">
              Though this book comes to an end,<br/>
              our greatest adventure is only just beginning.
            </p>
            <p className="font-sans text-xs md:text-sm text-charcoal/80 leading-relaxed mb-6">
              Thank you for walking beside us<br/>
              as we begin this lifelong journey together.
            </p>
            <p className="font-serif italic text-gold mb-2 text-sm">With all our love,</p>
            <p className="font-serif text-base md:text-xl text-charcoal/90 mb-4">{brideName} & {groomName}</p>
            <p className="font-sans text-[10px] uppercase tracking-widest text-gold-light">Happily Ever After Starts Here.</p>
          </div>
        </div>

        <div className={`${styles.book} z-10`}>
          {pages.map((page, index) => {
            const isFlipped = index < currentPage;
            const zIndex = isFlipped ? index : pages.length - index;

            if (page.type === 'cover') {
              return (
                <div 
                  key={index} 
                  className={`${styles.page} ${isFlipped ? styles.pageFlipped : ''}`}
                  style={{ zIndex }}
                  onClick={() => {
                    if (isFlipped) prevPage();
                    else nextPage();
                  }}
                >
                  <div className={`${styles.pageFront} ${styles.coverFront}`}>
                    <div className={styles.embossedText}>
                      <p className="font-serif text-xl italic mb-4" style={{ color: '#D4AF37' }}>The Union of</p>
                      <h2 className="font-serif text-3xl md:text-4xl" style={{ color: '#F1D570' }}>{groomName.toUpperCase()} & {brideName.toUpperCase()}</h2>
                    </div>
                    <div className={`${styles.goldFiligree} my-8`} />
                    <div className={styles.embossedText}>
                      <p className="font-sans text-[10px] md:text-xs tracking-widest text-gold-light uppercase">A Chronicle of Our Memories</p>
                    </div>
                  </div>
                  <div className={`${styles.pageBack} ${styles.coverInside}`}>
                    <div className="w-full h-full border border-gold-light/20 flex items-center justify-center">
                      <span className="font-serif text-gold/20 text-4xl">✦</span>
                    </div>
                  </div>
                </div>
              );
            }
            
            if (page.type === 'backcover') {
              return (
                <div 
                  key={index} 
                  className={`${styles.page} ${isFlipped ? styles.pageFlipped : ''}`}
                  style={{ zIndex }}
                  onClick={() => {
                    if (isFlipped) prevPage();
                    else nextPage();
                  }}
                >
                  <div className={`${styles.pageFront} ${styles.coverInside}`}>
                    <div className="w-full h-full border border-gold-light/20 flex items-center justify-center">
                      <span className="font-serif text-gold/20 text-4xl">✦</span>
                    </div>
                  </div>
                  <div className={`${styles.pageBack} ${styles.coverBack}`}>
                    <div className={styles.embossedText}>
                       <h3 className="font-serif text-xl tracking-widest text-gold mb-4">OUR WEDDING BOOK</h3>
                       <div className="w-16 h-[1px] bg-gold mx-auto mb-6" />
                       <p className="font-serif italic text-gold-light mb-8">A Lifetime of Shared Love</p>
                       <p className="font-sans text-[10px] tracking-[4px] text-gold-light">EST. 2024</p>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={index} 
                className={`${styles.page} ${isFlipped ? styles.pageFlipped : ''}`}
                style={{ zIndex }}
                onClick={() => {
                  if (isFlipped) prevPage();
                  else nextPage();
                }}
              >
                <div className={styles.pageFront}>
                  <div className={styles.photoWrapper}>
                    <img src={page.front} alt={`Gallery ${index * 2}`} className={styles.photo} loading="lazy" />
                  </div>
                </div>
                <div className={styles.pageBack}>
                  {page.back ? (
                    <div className={styles.photoWrapper}>
                      <img src={page.back} alt={`Gallery ${index * 2 + 1}`} className={styles.photo} loading="lazy" />
                    </div>
                  ) : (
                    <div className="w-full h-full border border-gold-light/30 bg-cream/50 flex items-center justify-center">
                      <span className="font-serif text-gold/30 text-4xl">✦</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={nextPage} 
          disabled={currentPage >= pages.length}
          className={`${styles.navButton} ${styles.navNext}`}
          aria-label="Next page"
        >
          <ChevronRight size={24} />
        </button>
      </motion.div>
      
      <p className="text-center text-charcoal/40 text-xs mt-16 italic font-serif">
        Tap on the pages or use arrows to flip
      </p>
    </section>
  );
}

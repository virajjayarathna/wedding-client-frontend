'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './turnbook.module.css';

interface LoveStoryGalleryProps {
  images: string[];
}

export default function LoveStoryGallery({ images }: LoveStoryGalleryProps) {
  const [currentPage, setCurrentPage] = useState(0);

  if (!images || images.length === 0) return null;

  // Pair images into pages
  const pages = [];
  for (let i = 0; i < images.length; i += 2) {
    pages.push({
      front: images[i],
      back: images[i + 1] || null, 
    });
  }

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
    <section id="gallery" className="py-24 px-4 md:px-6 relative z-10 bg-cream/30 overflow-hidden">
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

        <div className={styles.book}>
          {pages.map((page, index) => {
            const isFlipped = index < currentPage;
            const zIndex = isFlipped ? index : pages.length - index;

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

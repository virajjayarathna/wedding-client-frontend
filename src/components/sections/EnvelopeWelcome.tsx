'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './envelope.module.css';

interface EnvelopeWelcomeProps {
  guestName: string;
  onOpen: () => void;
  onSequenceComplete: () => void;
}

export default function EnvelopeWelcome({ guestName, onOpen, onSequenceComplete }: EnvelopeWelcomeProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleTap = () => {
    if (isAnimating || isDone) return;
    setIsAnimating(true);
    
    // Trigger audio playback immediately on user interaction
    onOpen(); 
    
    // Sequence timing
    // 1. Flap opens: 0 -> 0.8s
    // 2. Card slides up: 0.5s -> 1.7s
    // 3. Whole overlay fades out: 1.5s -> 2.3s
    setTimeout(() => {
      setIsDone(true);
      onSequenceComplete();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.8, ease: 'easeInOut' } }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-center px-4 flex flex-col items-center w-full max-w-2xl mx-auto"
          >
            {/* Vintage top flourish */}
            <div className={styles.vintageOrnament} />

            <p className="font-sans text-[10px] md:text-xs uppercase tracking-[4px] text-gold-dark mb-4 opacity-80">
              A Special Invitation For
            </p>

            <h1 className={`${styles.vintageName} font-serif text-3xl md:text-5xl text-charcoal mb-6 px-4 py-2`}>
              {guestName}
            </h1>

            {/* Vintage bottom divider */}
            <div className={styles.vintageDivider} />
          </motion.div>

          <motion.div
            className={styles.envelopeContainer}
            onClick={handleTap}
            role="button"
            aria-label="Tap to open envelope"
            whileHover={!isAnimating && !isDone ? { scale: 1.05 } : {}}
            whileTap={!isAnimating && !isDone ? { scale: 0.95 } : {}}
            initial={{ scale: 1, y: 0 }}
            animate={
              !isAnimating
                ? { y: [0, -10, 0], transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' } }
                : { y: 0 }
            }
          >
            {/* The Back (Inside) */}
            <div className={styles.envelopeBack} />

            {/* The Card (slides up) */}
            <motion.div
              className={styles.cardInside}
              animate={isAnimating ? { y: '-80%', opacity: [1, 1, 0] } : { y: '0%' }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
            >
              <div className={styles.cardInnerBorder} />
              <span className={styles.cardInitials}>✦</span>
            </motion.div>

            {/* The Front Body (where the side and bottom flaps fold in) */}
            <div className={styles.envelopeFront}>
              <div className={styles.envelopeLeftFlap} />
              <div className={styles.envelopeRightFlap} />
              <div className={styles.envelopeBottomFlap} />
            </div>

            {/* The Top Flap (flips open) */}
            <motion.div
              className={styles.envelopeFlap}
              animate={isAnimating ? { rotateX: 180, zIndex: 0 } : { rotateX: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              style={{ transformOrigin: 'top', backfaceVisibility: 'hidden' }}
            >
              <div className={styles.envelopeFlapShape} />
              <div className={styles.waxSeal}>
                <div className={styles.waxSealInner}>
                  <span className={styles.waxSealLetter}>W</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.p
            className={styles.instructionText}
            animate={{ opacity: isAnimating ? 0 : [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            Tap to open
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

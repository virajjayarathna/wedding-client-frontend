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
            className="text-center px-4"
          >
            <p className="font-sans text-[10px] md:text-xs uppercase tracking-[4px] text-earth-brown mb-4">
              A Special Invitation For
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-semibold mb-8">
              {guestName}
            </h1>
          </motion.div>

          <motion.div
            className={styles.envelopeContainer}
            onClick={handleTap}
            initial={{ scale: 1 }}
            animate={
              !isAnimating
                ? { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' } }
                : { scale: 1 }
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

            {/* The Front Body */}
            <div className={styles.envelopeFront} />

            {/* The Top Flap (flips open) */}
            <motion.div
              className={styles.envelopeFlap}
              animate={isAnimating ? { rotateX: 180, zIndex: 0 } : { rotateX: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              style={{ transformOrigin: 'top', backfaceVisibility: 'hidden' }}
            >
              <div className={styles.waxSeal}>
                <div className={styles.waxSealInner} />
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

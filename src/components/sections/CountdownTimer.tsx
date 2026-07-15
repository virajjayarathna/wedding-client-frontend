'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  targetDate: string | Date; // ISO string or Date object
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    // Run once immediately
    const now = new Date().getTime();
    const difference = target - now;
    if (difference > 0) {
       setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
    }

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) return null; // Avoid hydration mismatch

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-3 md:gap-8 my-12 w-full">
      {timeBlocks.map((block, idx) => (
        <motion.div
          key={block.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: idx * 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-cream border border-gold-light/30 flex items-center justify-center shadow-inner mb-3">
            <span className="font-serif text-2xl md:text-3xl text-charcoal font-semibold">
              {block.value.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="font-sans text-[9px] md:text-xs uppercase tracking-[2px] text-charcoal/60 font-medium">
            {block.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';

// Cap at 30 FPS to save battery on mobile
const FPS = 30;
const FRAME_MIN_TIME = (1000 / 60) * (60 / FPS) - (1000 / 60) * 0.5;

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  angleSpeed: number;
  type: 'petal' | 'heart' | 'leaf';
  color: string;
  opacity: number;
}

/**
 * Falling petals are drawn to a canvas, so they can't pick up CSS variables the
 * way the rest of the page does. Sample the resolved theme once per mount and
 * tint them to it — a pink petal drifting over an emerald or midnight
 * invitation is the one thing that gives away a bolted-on theme.
 *
 * The fallbacks reproduce the original pinks, so this degrades to the old look
 * if the variables are somehow absent.
 */
function readThemeColors(): Record<'petal' | 'heart' | 'leaf', string[]> {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;

  const primary = token('--gold', '#D4AF37');
  const primaryLight = token('--gold-light', '#E6D5B8');
  const paper = token('--envelope-paper', '#FFE4E1');
  const muted = token('--earth-brown', '#8C7863');

  return {
    petal: [primaryLight, paper, primary],
    heart: [primary, primaryLight],
    leaf: [primaryLight, muted, paper],
  };
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    
    // Adjust particle count based on screen size (desktop vs mobile)
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 15 : 30;
    
    let particles: Particle[] = [];
    const COLORS = readThemeColors();

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (): Particle => {
      const types: Array<'petal' | 'heart' | 'leaf'> = ['petal', 'heart', 'leaf'];
      const type = types[Math.floor(Math.random() * types.length)];
      const colorOptions = COLORS[type];
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];

      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height, // Initial random distribution
        size: Math.random() * 5 + 3, // 3-8px
        speedY: Math.random() * 0.4 + 0.1, // 0.1-0.5 (gentle drift)
        speedX: (Math.random() - 0.5) * 0.3, // Slight wind
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.02, // Slow rotation
        type,
        color,
        opacity: Math.random() * 0.4 + 0.15, // 0.15-0.55
      };
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    // Draw a custom heart shape
    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(x, y + topCurveHeight);
      // Top left curve
      ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
      // Bottom left curve
      ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
      // Bottom right curve
      ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
      // Top right curve
      ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
      ctx.closePath();
      ctx.fill();
    };

    // Draw a leaf (ellipse)
    const drawLeaf = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.ellipse(x, y, size / 3, size / 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);

      // Throttle FPS
      if (time - lastTime < FRAME_MIN_TIME) {
        return; // Skip frame
      }
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Update position
        p.y += p.speedY;
        p.x += Math.sin(p.angle) * 0.4 + p.speedX; // Sine wave swaying motion
        p.angle += p.angleSpeed;

        // Reset if off screen (bottom or sides)
        if (p.y > canvas.height + p.size) {
          p.y = -p.size;
          p.x = Math.random() * canvas.width;
        } else if (p.x > canvas.width + p.size) {
          p.x = -p.size;
        } else if (p.x < -p.size) {
          p.x = canvas.width + p.size;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        
        // Translate and rotate context to draw particle at angle
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        
        if (p.type === 'petal') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'heart') {
           drawHeart(ctx, 0, -p.size / 2, p.size); // offset slightly so rotation is centered
        } else if (p.type === 'leaf') {
           drawLeaf(ctx, 0, 0, p.size);
        }
        
        ctx.restore();
      });
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initParticles();
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[1]"
    />
  );
}

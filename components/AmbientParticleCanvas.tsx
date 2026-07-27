import React, { useEffect, useRef } from 'react';

interface AmbientParticleCanvasProps {
  moteCount?: number;
  fiberCount?: number;
  particleColor?: string; // e.g., 'rgba(235, 220, 205, '
  glowColor?: string; // e.g., 'rgba(250, 240, 230, '
  speedMultiplier?: number;
  className?: string;
}

interface Particle {
  type: 'mote' | 'fiber';
  x: number;
  y: number;
  baseX: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  maxOpacity: number;
  seed: number;
  waveSpeed: number;
  waveAmplitude: number;
  
  // Mote specific
  hasGlow: boolean;

  // Fiber specific
  length: number;
  curveX: number;
  curveY: number;
  angle: number;
  curlSpeed: number;
  thickness: number;
}

export const AmbientParticleCanvas: React.FC<AmbientParticleCanvasProps> = ({
  moteCount = 35,
  fiberCount = 12,
  particleColor = '235, 218, 204', // RGB format to append opacity dynamically
  glowColor = '250, 242, 235',
  speedMultiplier = 0.6,
  className = 'absolute inset-0 pointer-events-none z-[1]',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    // Helper to generate a random number within a range
    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    // Create a single dust mote particle
    const createMote = (isInitial = false): Particle => {
      const pWidth = width || window.innerWidth;
      const pHeight = height || window.innerHeight;
      
      const size = random(0.8, 3.2);
      const maxOpacity = random(0.15, 0.55);
      
      return {
        type: 'mote',
        x: random(0, pWidth),
        y: isInitial ? random(0, pHeight) : pHeight + random(10, 80),
        baseX: random(0, pWidth),
        size,
        speedY: random(0.2, 0.65) * (1 / (size * 0.4 + 0.5)), // smaller particles drift faster or slower based on air density
        speedX: random(-0.08, 0.08),
        opacity: 0, // starts fully transparent to fade in
        maxOpacity,
        seed: random(0, 1000),
        waveSpeed: random(0.003, 0.012),
        waveAmplitude: random(8, 28),
        hasGlow: size > 1.8 && Math.random() > 0.3,
        length: 0,
        curveX: 0,
        curveY: 0,
        angle: 0,
        curlSpeed: 0,
        thickness: 0,
      };
    };

    // Create a single fabric fiber particle
    const createFiber = (isInitial = false): Particle => {
      const pWidth = width || window.innerWidth;
      const pHeight = height || window.innerHeight;
      
      const maxOpacity = random(0.1, 0.35);
      const length = random(15, 45);
      
      return {
        type: 'fiber',
        x: random(0, pWidth),
        y: isInitial ? random(0, pHeight) : pHeight + random(20, 120),
        baseX: random(0, pWidth),
        size: length, // size represents length here
        speedY: random(0.15, 0.45),
        speedX: random(-0.04, 0.04),
        opacity: 0,
        maxOpacity,
        seed: random(0, 1000),
        waveSpeed: random(0.002, 0.008),
        waveAmplitude: random(15, 40),
        hasGlow: false,
        length,
        curveX: random(-12, 12),
        curveY: random(-6, 6),
        angle: random(-Math.PI / 4, Math.PI / 4),
        curlSpeed: random(0.001, 0.004),
        thickness: random(0.35, 0.75),
      };
    };

    // Initialize particle system
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < moteCount; i++) {
        particles.push(createMote(true));
      }
      for (let i = 0; i < fiberCount; i++) {
        particles.push(createFiber(true));
      }
    };

    // Resize handler with high DPI support
    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (!entries || entries.length === 0) return;
      
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      
      if (Math.abs(width - newWidth) < 1 && Math.abs(height - newHeight) < 1) return;

      width = newWidth;
      height = newHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      // Re-distribute particles if initial or adapt coordinates
      if (particles.length === 0) {
        initParticles();
      } else {
        // Adjust coordinate space of existing particles so they don't get lost
        particles.forEach(p => {
          if (p.x > width) p.x = random(0, width);
          if (p.baseX > width) p.baseX = random(0, width);
          if (p.y > height + 100) p.y = height + random(10, 80);
        });
      }
    };

    // Responsive sizing via ResizeObserver as instructed
    const resizeObserver = new ResizeObserver((entries) => {
      // Use requestAnimationFrame to debounce and prevent layout thrashing
      requestAnimationFrame(() => handleResize(entries));
    });

    resizeObserver.observe(container);

    let lastTime = 0;

    // Main 60 FPS animation loop
    const animate = (time: number) => {
      if (!width || !height) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // Smooth delta-time calculation to keep animation stable across refresh rates
      const deltaTime = lastTime ? (time - lastTime) / 16.666 : 1;
      lastTime = time;

      // Soft clear for natural-looking trails (very high transparency clear)
      ctx.clearRect(0, 0, width, height);

      const len = particles.length;
      for (let i = 0; i < len; i++) {
        const p = particles[i];

        // Update physics
        p.seed += p.waveSpeed * deltaTime;
        
        // Vertical movement (rising upwards)
        p.y -= p.speedY * speedMultiplier * deltaTime;
        
        // Horizontal movement: subtle sine wave drift + linear anchor drift
        p.baseX += p.speedX * speedMultiplier * deltaTime;
        const drift = Math.sin(p.seed) * p.waveAmplitude;
        p.x = p.baseX + drift;

        // Wrap around horizontal boundaries gently
        if (p.baseX < -50) {
          p.baseX = width + 50;
          p.x = p.baseX;
        } else if (p.baseX > width + 50) {
          p.baseX = -50;
          p.x = p.baseX;
        }

        // Elegant fade-in at bottom, fade-out near top & bounds
        let fadeScale = 1;
        const bottomFadeZone = 120;
        const topFadeZone = 180;

        if (p.y > height) {
          // Beyond the bottom edge
          fadeScale = 0;
        } else if (p.y > height - bottomFadeZone) {
          // Fading in as it rises from bottom
          fadeScale = (height - p.y) / bottomFadeZone;
        } else if (p.y < topFadeZone) {
          // Fading out as it nears the top
          fadeScale = Math.max(0, p.y / topFadeZone);
        }

        // Apply smooth clamping
        fadeScale = Math.max(0, Math.min(1, fadeScale));
        
        // Calculate dynamic opacity
        const currentOpacity = p.maxOpacity * fadeScale;

        // Draw particle based on type
        if (p.type === 'mote') {
          ctx.beginPath();
          
          if (p.hasGlow) {
            // High-performance soft radial glowing gradient for dust motes
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.2);
            gradient.addColorStop(0, `rgba(${glowColor}, ${currentOpacity * 1.0})`);
            gradient.addColorStop(0.3, `rgba(${particleColor}, ${currentOpacity * 0.45})`);
            gradient.addColorStop(1, `rgba(${particleColor}, 0)`);
            ctx.fillStyle = gradient;
            ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          } else {
            // Clean flat translucent circle for smaller dust motes
            ctx.fillStyle = `rgba(${particleColor}, ${currentOpacity})`;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          }
          
          ctx.fill();
        } else {
          // Draw elegant curved luxury silk fabric fiber (Quadratic Bezier path)
          ctx.save();
          
          // Micro-bending of the fiber itself over time
          const currentAngle = p.angle + Math.sin(p.seed * p.curlSpeed * 2.5) * 0.22;
          const currentCurveX = p.curveX + Math.cos(p.seed * p.curlSpeed * 3) * 6;
          
          // Calculate curve start and end relative to center (p.x, p.y)
          const halfLength = p.length / 2;
          const cosAngle = Math.cos(currentAngle);
          const sinAngle = Math.sin(currentAngle);

          const startX = p.x - halfLength * cosAngle;
          const startY = p.y - halfLength * sinAngle;
          
          const endX = p.x + halfLength * cosAngle;
          const endY = p.y + halfLength * sinAngle;

          // Control point in the middle, offset for elegant curve
          const ctrlX = p.x + currentCurveX * -sinAngle;
          const ctrlY = p.y + p.curveY * cosAngle;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
          
          ctx.strokeStyle = `rgba(${particleColor}, ${currentOpacity})`;
          ctx.lineWidth = p.thickness;
          ctx.lineCap = 'round';
          ctx.stroke();
          
          ctx.restore();
        }

        // Recycle particle when it goes fully off the top
        if (p.y < -50) {
          if (p.type === 'mote') {
            particles[i] = createMote(false);
          } else {
            particles[i] = createFiber(false);
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Start loop
    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [moteCount, fiberCount, particleColor, glowColor, speedMultiplier]);

  return (
    <div ref={containerRef} className={className} id="ambient-particle-container">
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
        id="ambient-particle-canvas"
      />
    </div>
  );
};

export default AmbientParticleCanvas;

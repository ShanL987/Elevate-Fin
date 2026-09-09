import React, { useEffect, useRef } from 'react';

interface FungusThemeTransitionProps {
  isActive: boolean;
  targetTheme: 'dark' | 'light';
  origin: { x: number; y: number };
  duration?: number; // default 420ms
  onComplete: () => void;
}

export const FungusThemeTransition: React.FC<FungusThemeTransitionProps> = ({
  isActive,
  targetTheme,
  origin,
  duration = 420,
  onComplete,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const haloPathRef = useRef<SVGPathElement>(null);
  const coreLineRef = useRef<SVGPathElement>(null);
  const innerLineRef = useRef<SVGPathElement>(null);
  const sporeCanvasRef = useRef<HTMLCanvasElement>(null);

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      startTimeRef.current = null;
      return;
    }

    const W = window.innerWidth;
    const H = window.innerHeight;

    // Initialize spore canvas
    const canvas = sporeCanvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (canvas) {
      canvas.width = W;
      canvas.height = H;
    }

    // Reset overlay opacity
    if (overlayRef.current) {
      overlayRef.current.style.opacity = '1';
      overlayRef.current.style.transition = 'none';
    }

    // Calculate maximum radius required to cover all 4 screen corners from the origin
    const dxMax = Math.max(origin.x, W - origin.x);
    const dyMax = Math.max(origin.y, H - origin.y);
    const maxRadius = Math.hypot(dxMax, dyMax) * 1.25;

    const numPoints = 40;
    startTimeRef.current = null;

    const isGrowingIntoDark = targetTheme === 'dark';
    const rimColor = isGrowingIntoDark ? '#10b981' : '#0ea5e9';
    const glowShadow = isGrowingIntoDark ? 'rgba(16, 185, 129, 0.7)' : 'rgba(14, 165, 233, 0.7)';

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Smooth quad easing: quick start, smooth expanding sweep, soft deceleration
      const progress =
        rawProgress < 0.5
          ? 2 * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

      const currentRadius = maxRadius * progress;
      const phase = elapsed * 0.005;

      // Generate harmonic rounded lobes (smooth, non-spiky organic fungal perimeter)
      const points: Array<{ x: number; y: number }> = [];
      const spores: Array<{ x: number; y: number; size: number; alpha: number }> = [];

      for (let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * 2 * Math.PI;

        const wave1 = Math.sin(2 * theta + phase * 1.5) * 0.05;
        const wave2 = Math.cos(3 * theta - phase) * 0.03;
        const wave3 = Math.sin(theta + 1.2) * 0.02;

        const r = Math.max(0, currentRadius * (1 + wave1 + wave2 + wave3));
        const px = origin.x + r * Math.cos(theta);
        const py = origin.y + r * Math.sin(theta);

        points.push({ x: px, y: py });

        // Ambient spore nodes along advancing wave rim
        if (i % 3 === 0 && rawProgress > 0.05 && rawProgress < 0.95) {
          const sporeR = r + Math.sin(theta * 5 + phase * 2) * 5;
          spores.push({
            x: origin.x + sporeR * Math.cos(theta),
            y: origin.y + sporeR * Math.sin(theta),
            size: 1.5 + Math.abs(Math.sin(i + phase * 2)) * 2.2,
            alpha: (1 - rawProgress) * (0.3 + Math.abs(Math.sin(theta * 2 + phase)) * 0.4),
          });
        }
      }

      // Convert points to smooth closed cubic bezier SVG path
      let d = '';
      if (points.length > 2) {
        d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} `;
        for (let i = 0; i < points.length; i++) {
          const p0 = points[(i - 1 + points.length) % points.length];
          const p1 = points[i];
          const p2 = points[(i + 1) % points.length];
          const p3 = points[(i + 2) % points.length];

          const cp1x = p1.x + (p2.x - p0.x) / 6;
          const cp1y = p1.y + (p2.y - p0.y) / 6;
          const cp2x = p2.x - (p3.x - p1.x) / 6;
          const cp2y = p2.y - (p3.y - p1.y) / 6;

          d += `C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} `;
        }
        d += 'Z';
      }

      // Direct DOM attribute updates
      if (haloPathRef.current) haloPathRef.current.setAttribute('d', d);
      if (coreLineRef.current) coreLineRef.current.setAttribute('d', d);
      if (innerLineRef.current) innerLineRef.current.setAttribute('d', d);

      // Render spores on 2D canvas
      if (ctx) {
        ctx.clearRect(0, 0, W, H);
        if (spores.length > 0 && rawProgress < 0.95) {
          ctx.fillStyle = rimColor;
          ctx.shadowColor = glowShadow;
          ctx.shadowBlur = 8;
          for (let s = 0; s < spores.length; s++) {
            const spore = spores[s];
            ctx.globalAlpha = spore.alpha;
            ctx.beginPath();
            ctx.arc(spore.x, spore.y, spore.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      }

      if (rawProgress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        if (overlayRef.current) {
          overlayRef.current.style.transition = 'opacity 0.08s ease-out';
          overlayRef.current.style.opacity = '0';
        }
        setTimeout(() => {
          onComplete();
        }, 90);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isActive, duration, origin.x, origin.y, targetTheme, onComplete]);

  if (!isActive) return null;

  const isGrowingIntoDark = targetTheme === 'dark';
  const rimColor = isGrowingIntoDark ? '#10b981' : '#0ea5e9';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="fungusRimGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Spore particles canvas */}
      <canvas
        ref={sporeCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Smooth Bioluminescent Fungal Boundary Frontier Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${typeof window !== 'undefined' ? window.innerWidth : 1920} ${
          typeof window !== 'undefined' ? window.innerHeight : 1080
        }`}
      >
        {/* Outer soft ambient halo */}
        <path
          ref={haloPathRef}
          d=""
          fill="none"
          stroke={rimColor}
          strokeWidth="7"
          strokeOpacity="0.3"
          filter="url(#fungusRimGlow)"
        />
        {/* Core glowing mycelium front line */}
        <path
          ref={coreLineRef}
          d=""
          fill="none"
          stroke={rimColor}
          strokeWidth="2.5"
          strokeOpacity="0.85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner white accent thread */}
        <path
          ref={innerLineRef}
          d=""
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeOpacity="0.8"
        />
      </svg>
    </div>
  );
};

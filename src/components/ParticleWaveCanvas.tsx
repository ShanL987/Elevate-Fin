import React, { useEffect, useRef } from 'react';

interface ParticleWaveCanvasProps {
  className?: string;
  theme?: 'dark' | 'light';
}

export const ParticleWaveCanvas: React.FC<ParticleWaveCanvasProps> = ({ 
  className = '',
  theme = 'dark' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef<'dark' | 'light'>(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 3;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;

    const render = () => {
      time += 0.018;
      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const isDark = themeRef.current === 'dark';
      const waveColor = isDark ? 'rgba(16, 185, 129, ' : 'rgba(5, 150, 105, ';
      const nodeColor = isDark ? '#34d399' : '#059669';

      // Draw flowing sine waves across the screen
      for (let r = 0; r < 4; r++) {
        const yBase = height * 0.28 + r * 65;
        const amplitude = 32 + r * 12;
        const frequency = 0.0022 + r * 0.0008;
        const speed = time * (0.8 + r * 0.3);

        ctx.beginPath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = `${waveColor}${0.14 - r * 0.025})`;

        for (let x = 0; x <= width + 40; x += 15) {
          // Distance from mouse to create gentle ripple deflection
          const distToMouse = Math.hypot(x - mouseX, yBase - mouseY);
          const mouseDeflection = Math.max(0, 1 - distToMouse / 300) * 35;

          const y =
            yBase +
            Math.sin(x * frequency + speed) * amplitude +
            Math.cos(x * frequency * 0.6 - speed * 0.7) * (amplitude * 0.4) +
            mouseDeflection;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          // Draw shimmering node dots at wave peaks
          if (x % 120 === 0) {
            const glowAlpha = 0.25 + Math.sin(x + speed * 3) * 0.2;
            ctx.fillStyle = `${nodeColor}`;
            ctx.globalAlpha = Math.max(0.1, glowAlpha);
            ctx.beginPath();
            ctx.arc(x, y, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.85 }}
    />
  );
};

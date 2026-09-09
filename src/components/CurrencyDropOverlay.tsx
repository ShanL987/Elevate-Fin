import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { NavTab } from '../types';

export interface CurrencyItem {
  symbol: string;
  name: string;
  color: string;
  glowColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

// Exactly the 4 requested signs: $, ₹, €, £
export const CURRENCY_ITEMS: CurrencyItem[] = [
  { symbol: '$', name: 'Dollar', color: '#10b981', glowColor: 'rgba(16, 185, 129, 0.45)', bgColor: '#064e3b', borderColor: '#34d399', textColor: '#ffffff' },
  { symbol: '₹', name: 'Rupee', color: '#34d399', glowColor: 'rgba(52, 211, 153, 0.45)', bgColor: '#065f46', borderColor: '#6ee7b7', textColor: '#ffffff' },
  { symbol: '€', name: 'Euro', color: '#38bdf8', glowColor: 'rgba(56, 189, 248, 0.45)', bgColor: '#0c4a6e', borderColor: '#7dd3fc', textColor: '#ffffff' },
  { symbol: '£', name: 'Pound', color: '#fbbf24', glowColor: 'rgba(251, 191, 36, 0.45)', bgColor: '#78350f', borderColor: '#fde68a', textColor: '#ffffff' },
];

interface CurrencyParticle {
  id: number;
  symbol: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  color: string;
  glowColor: string;
  fontSize: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface CurrencyNavigationContextType {
  activeTab: NavTab;
  navigateToTab: (
    tab: NavTab,
    trigger?: HTMLElement | React.MouseEvent | { x: number; y: number; width?: number; height?: number; bottom?: number }
  ) => void;
  triggerCurrencyDrop: (
    trigger?: HTMLElement | React.MouseEvent | { x: number; y: number; width?: number; height?: number; bottom?: number },
    onSwitch?: () => void
  ) => void;
  isSwitchingPage: boolean;
}

const CurrencyNavigationContext = createContext<CurrencyNavigationContextType | null>(null);

export const CurrencyNavigationProvider: React.FC<{
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  children: React.ReactNode;
}> = ({ activeTab, setActiveTab, children }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<CurrencyParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const [isSwitchingPage, setIsSwitchingPage] = useState<boolean>(false);
  const lastSpawnTimeRef = useRef<number>(0);
  const lastSpawnPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Resize canvas to match screen DPR
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [updateCanvasSize]);

  // Physics and render loop for floating currency symbols
  const animateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    const particles = particlesRef.current;
    const nextParticles: CurrencyParticle[] = [];

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life++;

      // Gentle movement: low speed, decelerating softly, small total distance (~15-20px)
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94; // air drag
      p.vy *= 0.94; // slows down quickly
      p.rotation += p.vRot;

      // Smooth opacity envelope: quick 3-frame fade-in, brief steady visibility, soft fade-out
      const progress = p.life / p.maxLife;
      if (p.life <= 3) {
        p.opacity = p.life / 3;
      } else if (progress < 0.6) {
        p.opacity = 0.95;
      } else {
        p.opacity = Math.max(0, 0.95 * (1 - (progress - 0.6) / 0.4));
      }

      if (p.life < p.maxLife && p.opacity > 0.02) {
        nextParticles.push(p);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        // Clean typographic currency symbol ($, ₹, €, £) - NO coins or gambling graphics
        ctx.font = `600 ${p.fontSize}px "JetBrains Mono", "Plus Jakarta Sans", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = 4;
        ctx.fillStyle = p.color;
        ctx.fillText(p.symbol, 0, 0);

        ctx.restore();
      }
    }

    particlesRef.current = nextParticles;

    if (nextParticles.length > 0) {
      animFrameRef.current = requestAnimationFrame(animateParticles);
    } else {
      ctx.clearRect(0, 0, w, h);
      animFrameRef.current = null;
    }
  }, []);

  // Spawn subtle floating currency symbols ($, ₹, €, £)
  const spawnCurrencySymbols = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      // Debounce duplicate triggers within 60ms & 20px
      if (
        now - lastSpawnTimeRef.current < 60 &&
        Math.hypot(x - lastSpawnPosRef.current.x, y - lastSpawnPosRef.current.y) < 20
      ) {
        return;
      }
      lastSpawnTimeRef.current = now;
      lastSpawnPosRef.current = { x, y };

      // Generate 4 subtle symbols using ONLY the 4 requested signs: $, ₹, €, £
      const shuffledSigns = [...CURRENCY_ITEMS].sort(() => Math.random() - 0.5);
      const count = 4;
      const newParticles: CurrencyParticle[] = [];

      for (let i = 0; i < count; i++) {
        const item = shuffledSigns[i % shuffledSigns.length];

        // Subtle radial dispersion around cursor / button (radius 8 to 16px)
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const dist = 6 + Math.random() * 10;
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist;

        // Low speed & small distance: drifting ~14-18px total before fading out
        const speed = 0.55 + Math.random() * 0.6;
        const vx = Math.cos(angle) * speed * 0.75;
        const vy = -0.5 - Math.random() * 0.6; // gentle upward drift

        newParticles.push({
          id: Math.random() + Date.now(),
          symbol: item.symbol,
          x: px,
          y: py,
          vx,
          vy,
          rotation: (Math.random() - 0.5) * 0.2,
          vRot: (Math.random() - 0.5) * 0.015,
          color: item.color,
          glowColor: item.glowColor,
          fontSize: 14 + Math.floor(Math.random() * 4), // 14px to 17px
          opacity: 0,
          life: 0,
          maxLife: 26 + Math.floor(Math.random() * 8), // ~450ms - 550ms
        });
      }

      particlesRef.current = [...particlesRef.current, ...newParticles];

      if (!animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(animateParticles);
      }
    },
    [animateParticles]
  );

  // Global click listener on any button
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const button = target.closest('button, [role="button"], a.btn-flash');
      if (button) {
        if (button instanceof HTMLButtonElement && button.disabled) return;

        let clickX = e.clientX;
        let clickY = e.clientY;

        // If keyboard triggered (Enter/Space)
        if (clickX === 0 && clickY === 0) {
          const rect = button.getBoundingClientRect();
          clickX = rect.left + rect.width / 2;
          clickY = rect.top + rect.height / 2;
        }

        spawnCurrencySymbols(clickX, clickY);
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, [spawnCurrencySymbols]);

  // Programmatic trigger
  const triggerCurrencyDrop = useCallback(
    (
      trigger?: HTMLElement | React.MouseEvent | { x: number; y: number; width?: number; height?: number; bottom?: number },
      onSwitch?: () => void
    ) => {
      let x = window.innerWidth / 2;
      let y = window.innerHeight * 0.45;

      if (trigger) {
        if (trigger instanceof HTMLElement) {
          const rect = trigger.getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        } else if ('clientX' in trigger && typeof trigger.clientX === 'number') {
          x = trigger.clientX;
          y = trigger.clientY;
        } else if ('currentTarget' in trigger && trigger.currentTarget) {
          const rect = (trigger.currentTarget as HTMLElement).getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        } else if ('x' in trigger && 'y' in trigger) {
          x = trigger.x;
          y = trigger.y;
        }
      }

      spawnCurrencySymbols(x, y);

      // Instant execution: no artificial delay
      onSwitch?.();
    },
    [spawnCurrencySymbols]
  );

  // Navigate to target tab with instant page switch and currency symbols
  const navigateToTab = useCallback(
    (
      tab: NavTab,
      trigger?: HTMLElement | React.MouseEvent | { x: number; y: number; width?: number; height?: number; bottom?: number }
    ) => {
      triggerCurrencyDrop(trigger, () => {
        setActiveTab(tab);
      });
    },
    [setActiveTab, triggerCurrencyDrop]
  );

  return (
    <CurrencyNavigationContext.Provider
      value={{
        activeTab,
        navigateToTab,
        triggerCurrencyDrop,
        isSwitchingPage,
      }}
    >
      {children}
      {/* Canvas for rendering floating currency symbols */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[99998]"
        aria-hidden="true"
      />
    </CurrencyNavigationContext.Provider>
  );
};

const defaultCurrencyNavigationContext: CurrencyNavigationContextType = {
  activeTab: 'overview',
  navigateToTab: () => {},
  triggerCurrencyDrop: (_trigger, onSwitch) => {
    onSwitch?.();
  },
  isSwitchingPage: false,
};

export const useCurrencyNavigation = () => {
  const context = useContext(CurrencyNavigationContext);
  if (!context) {
    return defaultCurrencyNavigationContext;
  }
  return context;
};



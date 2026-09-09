import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FungusThemeTransition } from '../components/FungusThemeTransition';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  targetTheme: Theme;
  isTransitioning: boolean;
  toggleTheme: (originOrEvent?: React.MouseEvent | { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('elevate_theme') as Theme | null;
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [targetTheme, setTargetTheme] = useState<Theme>('dark');
  const [transitionOrigin, setTransitionOrigin] = useState<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth - 80 : 500,
    y: 35,
  });

  // Apply data-theme to document on load and theme change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(
    (originOrEvent?: React.MouseEvent | { x: number; y: number }) => {
      if (isTransitioning) return;

      let origin = { x: window.innerWidth - 80, y: 35 };

      if (originOrEvent) {
        if ('clientX' in originOrEvent && typeof originOrEvent.clientX === 'number') {
          origin = { x: originOrEvent.clientX, y: originOrEvent.clientY };
        } else if ('x' in originOrEvent && typeof originOrEvent.x === 'number') {
          origin = { x: originOrEvent.x, y: originOrEvent.y };
        }
      }

      const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
      setTargetTheme(nextTheme);
      setTransitionOrigin(origin);

      // Apply theme to DOM immediately so there is ZERO delay before color change
      document.documentElement.setAttribute('data-theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
      setTheme(nextTheme);
      localStorage.setItem('elevate_theme', nextTheme);

      // Trigger lightweight expanding visual wavefront
      setIsTransitioning(true);
    },
    [theme, isTransitioning]
  );

  const handleTransitionComplete = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, targetTheme, isTransitioning, toggleTheme }}>
      <div id="theme-root" data-theme={theme} className="min-h-screen w-full transition-colors duration-300">
        {children}
      </div>

      {/* Lightweight, zero-lag organic wavefront transition without cloning app tree */}
      <FungusThemeTransition
        isActive={isTransitioning}
        targetTheme={targetTheme}
        origin={transitionOrigin}
        duration={420}
        onComplete={handleTransitionComplete}
      />
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

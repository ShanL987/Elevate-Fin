import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, isTransitioning, toggleTheme } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    toggleTheme({ x, y });
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isTransitioning}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`btn-flash relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
        isDark
          ? 'bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 border-white/[0.08] hover:border-amber-400/30'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300/80 hover:border-slate-400'
      } ${isTransitioning ? 'opacity-70 pointer-events-none' : ''} ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-mono font-medium">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}

      {/* Subtle indicator dot for active mode */}
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isDark ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]'
        }`}
      />
    </button>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Sliders, 
  Landmark, 
  ShieldCheck, 
  Sparkles,
  TrendingUp,
  User,
  ChevronRight,
  LogOut,
  Pin,
  PinOff,
  ChevronLeft,
  BellRing
} from 'lucide-react';
import { NavTab, FinancialProfile } from '../types';
import { useCurrencyNavigation } from './CurrencyDropOverlay';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  profile?: FinancialProfile;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  profile,
  onOpenProfile,
  onLogout,
  onCloseMobileMenu,
}) => {
  const { navigateToTab } = useCurrencyNavigation();

  // Navigation auto-pop out state:

  // When cursor is near or hovered, it pops out. When cursor moves away, it tucks back into compact dock.
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);

  const isExpanded = isPinned || isHovered;

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { 
      id: 'health_alerts', 
      label: 'Health Alerts', 
      icon: <BellRing className="w-4 h-4 shrink-0 text-emerald-400" />,
      badge: profile && profile.debtRatio > 45 ? 'ALERT' : undefined
    },
    { id: 'emi_planner', label: 'EMI Planner', icon: <Sliders className="w-4 h-4 shrink-0" /> },
    { id: 'loans', label: 'Loan Offers', icon: <Landmark className="w-4 h-4 shrink-0" />, badge: '5' },
    { id: 'credit', label: 'Credit Score', icon: <CreditCard className="w-4 h-4 shrink-0" />, badge: `${profile?.creditScore || 792}` },
    { id: 'insurance', label: 'Insurance Vault', icon: <ShieldCheck className="w-4 h-4 shrink-0" /> },
    { id: 'ai_advisor', label: 'AI Advisor', icon: <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" /> },
  ];

  return (
    <>
      {/* Invisible Magnetic Edge Trigger zone on desktop to pop out before cursor reaches border */}
      <div 
        className="hidden lg:block fixed left-0 top-0 bottom-0 w-5 z-40 pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
      />

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-white/[0.07] bg-[#080b11]/90 backdrop-blur-2xl lg:min-h-screen relative z-30 select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExpanded ? 'lg:w-64 shadow-[10px_0_30px_rgba(0,0,0,0.5)]' : 'lg:w-20'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/[0.05] h-16">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className={`transition-opacity duration-200 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'lg:opacity-0 lg:w-0 overflow-hidden'}`}>
              <span className="font-display font-bold text-base tracking-tight text-white block">
                ELEVATE
              </span>
              <p className="text-[11px] text-slate-400">
                Financial Terminal
              </p>
            </div>
          </div>

          {/* Desktop Pin / Unpin button */}
          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            title={isPinned ? 'Unpin navbar (auto-collapse when cursor moves away)' : 'Pin navbar open'}
            className={`hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0 ${
              isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } ${isPinned ? 'text-emerald-400 bg-emerald-500/10' : ''}`}
          >
            {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 flex-1 overflow-x-hidden">
          <div className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold transition-opacity duration-200 ${
            isExpanded ? 'opacity-100' : 'lg:opacity-0 lg:h-0 lg:py-0 overflow-hidden'
          }`}>
            Menu
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  navigateToTab(item.id, e);
                  onCloseMobileMenu?.();
                }}
                title={!isExpanded ? item.label : undefined}
                className={`btn-flash w-full group relative flex items-center rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isExpanded ? 'px-3.5 py-2.5 justify-between' : 'lg:p-3 lg:justify-center px-3.5 py-2.5 justify-between'
                } ${
                  isActive
                    ? 'text-white bg-emerald-500/15 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>
                  <span className={`tracking-tight whitespace-nowrap transition-opacity duration-200 ${
                    isExpanded ? 'opacity-100' : 'lg:opacity-0 lg:w-0 overflow-hidden'
                  }`}>
                    {item.label}
                  </span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full tracking-wider transition-all ${
                      isExpanded 
                        ? 'opacity-100' 
                        : 'lg:opacity-0 lg:w-0 overflow-hidden'
                    } ${
                      isActive
                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold'
                        : 'bg-white/[0.04] text-slate-400 border border-white/[0.05]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Compact badge indicator dot when collapsed */}
                {item.badge && !isExpanded && (
                  <span className="hidden lg:block absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-white/[0.06] bg-[#070a0f]/60">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenProfile}
              title={!isExpanded ? profile?.clientName || 'Private Client' : undefined}
              className={`btn-flash flex-1 flex items-center rounded-xl hover:bg-white/[0.04] transition-colors group text-left cursor-pointer ${
                isExpanded ? 'p-2 justify-between' : 'lg:p-2 lg:justify-center p-2 justify-between'
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {(profile?.clientName || 'PC')
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className={`truncate transition-opacity duration-200 ${
                  isExpanded ? 'opacity-100' : 'lg:opacity-0 lg:w-0 overflow-hidden'
                }`}>
                  <div className="text-xs font-medium text-white group-hover:text-emerald-300 transition-colors truncate">
                    {profile?.clientName || 'Private Client'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {profile?.clientTier || 'Standard Account'}
                  </div>
                </div>
              </div>
              {isExpanded && (
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5 shrink-0" />
              )}
            </button>

            {onLogout && isExpanded && (
              <button
                onClick={onLogout}
                title="Sign Out"
                className="btn-flash p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};


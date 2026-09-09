import React from 'react';
import { ShieldCheck, Activity, ArrowUpRight, Sparkles, AlertCircle, BellRing, Clock } from 'lucide-react';
import { FinancialProfile } from '../types';

interface FinancialHealthHeroProps {
  profile: FinancialProfile;
  onExploreAdvice?: (e?: React.MouseEvent) => void;
  onNavigateToHealthAlerts?: (e?: React.MouseEvent) => void;
  dangerDurationDays?: number;
}

export const FinancialHealthHero: React.FC<FinancialHealthHeroProps> = ({ 
  profile,
  onExploreAdvice,
  onNavigateToHealthAlerts,
  dangerDurationDays = 0,
}) => {
  const score = profile.healthScore; // 78
  const maxScore = 100;
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / maxScore) * circumference;

  const isDanger = profile.debtRatio > 45 || score < 55;
  const isCaution = !isDanger && (profile.debtRatio > 35 || score < 70);

  const statusColor = isDanger ? '#ef4444' : isCaution ? '#f59e0b' : '#10b981';
  const statusLabel = isDanger ? 'DANGER' : isCaution ? 'CAUTION' : 'HEALTHY';

  return (
    <div className={`relative rounded-2xl glass-card border p-6 lg:p-8 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all ${
      isDanger ? 'border-red-500/40 glow-danger-red' : 'border-white/[0.08]'
    }`}>
      {/* Background ambient radial glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-700" 
        style={{ backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.07)' }}
      />
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-teal-500/[0.04] blur-2xl pointer-events-none" />

      {/* Glossy top edge highlight */}
      <div 
        className="absolute inset-x-0 top-0 h-[1px]" 
        style={{ 
          background: isDanger 
            ? 'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.6), transparent)' 
            : 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.4), transparent)' 
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left / Hero Score Element */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-2">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-slate-300 font-semibold mb-4 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" style={{ color: statusColor }} />
            FINANCIAL HEALTH
          </div>

          {/* Glowing Circular Radial Ring */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center my-1">
            {/* Soft outer glow layer */}
            <div 
              className="absolute inset-4 rounded-full blur-xl transition-all"
              style={{ backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.12)' }}
            />

            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="healthTerminalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  {isDanger ? (
                    <>
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="50%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </>
                  ) : isCaution ? (
                    <>
                      <stop offset="0%" stopColor="#fcd34d" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#b45309" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </>
                  )}
                </linearGradient>
                <filter id="healthGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Track Ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-white/[0.06]"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />

              {/* Foreground Animated Glowing Progress Ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="url(#healthTerminalGradient)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                filter="url(#healthGlowFilter)"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Core Score */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-display text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_24px_rgba(16,185,129,0.55)] float-result-number">
                {score}
              </span>
              <span 
                className="text-[11px] font-mono uppercase tracking-[0.2em] font-bold mt-1 px-2.5 py-0.5 rounded-full border transition-all"
                style={{
                  color: statusColor,
                  backgroundColor: `${statusColor}22`,
                  borderColor: `${statusColor}55`,
                  boxShadow: `0 0 12px ${statusColor}44`,
                }}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-xs mt-3 leading-relaxed">
            {isDanger 
              ? 'CRITICAL DANGER: Insolvency risk is acute. Debt servicing severely compresses emergency liquid reserves.'
              : 'Healthy financial profile with balanced obligations and solid liquidity reserves.'}
          </p>

          {/* Solvency Spectrum Scale */}
          <div className="flex items-center justify-center gap-3 text-[10px] font-mono mt-3 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> &gt;75 Safe
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 55-74 Caution
            </span>
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" /> &lt;55 DANGER
            </span>
          </div>
        </div>

        {/* Right / Breakdown Metrics & AI Quick Signal */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Financial Health Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Core indicators across debt load, liquidity runway, and repayment consistency.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onNavigateToHealthAlerts && (
                  <button
                    onClick={(e) => onNavigateToHealthAlerts(e)}
                    className={`btn-flash inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isDanger 
                        ? 'bg-red-500/15 hover:bg-red-500/25 border-red-500/40 text-red-300' 
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>View Financial Alerts &rarr;</span>
                  </button>
                )}

                {onExploreAdvice && (
                  <button
                    onClick={(e) => onExploreAdvice(e)}
                    className="btn-flash hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Advice</span>
                  </button>
                )}
              </div>
            </div>

            {/* Diagnostic Pillars */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 transition-all">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1.5">
                  <span>DEBT-TO-INCOME</span>
                  <span className={`${profile.debtRatio > 45 ? 'text-red-400 font-bold' : 'text-emerald-400'} font-semibold`}>
                    {profile.debtRatio}%
                  </span>
                </div>
                <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden mb-2 relative">
                  <div 
                    className={`h-full rounded-full ${profile.debtRatio > 45 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-400 shadow-[0_0_6px_#10b981]'}`} 
                    style={{ width: `${Math.min(100, (profile.debtRatio / 60) * 100)}%` }} 
                  />
                  {/* Danger threshold indicator marker at 45% DTI */}
                  <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-red-500/80 shadow-[0_0_4px_#ef4444]" title="45% Danger Threshold" />
                </div>
                <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                  <span className="text-slate-400">Current DTI</span>
                  <span className="text-red-400 font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>&gt;45% Danger</span>
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 transition-all">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1.5">
                  <span>EMERGENCY RUNWAY</span>
                  <span className="text-emerald-400 font-semibold">{profile.liquidRunwayMonths || 8.2} Mos</span>
                </div>
                <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-emerald-400 h-full rounded-full shadow-[0_0_6px_#10b981]" style={{ width: '84%' }} />
                </div>
                <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                  <span className="text-slate-400">Liquid reserves</span>
                  <span className="text-red-400 font-mono text-[10px] font-semibold">&lt;3 Mos Danger</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 transition-all">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1.5">
                  <span>ON-TIME PAYMENTS</span>
                  <span className="text-emerald-400 font-semibold">100%</span>
                </div>
                <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-emerald-400 h-full rounded-full shadow-[0_0_6px_#10b981]" style={{ width: '100%' }} />
                </div>
                <span className="text-[11px] text-slate-400">
                  Zero default or overdue history.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 transition-all">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1.5">
                  <span>SAFE BORROWING BUFFER</span>
                  <span className="text-emerald-400 font-semibold">₹7,500/mo</span>
                </div>
                <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-emerald-400 h-full rounded-full shadow-[0_0_6px_#10b981]" style={{ width: '75%' }} />
                </div>
                <span className="text-[11px] text-slate-400">
                  Safe additional monthly payment room.
                </span>
              </div>
            </div>
          </div>

          {/* Proactive Recommendation Banner */}
          {isDanger ? (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/60 via-red-900/30 to-transparent border border-red-500/50 flex items-start gap-3 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-danger-pulse">
              <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5 border border-red-500/40">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-red-300 flex items-center gap-1.5">
                  <span>Critical Debt-to-Income Warning</span>
                  <span className="px-1.5 py-0.2 rounded bg-red-500 text-white font-mono text-[9px] uppercase font-bold">
                    DANGER
                  </span>
                </div>
                <p className="text-red-200/90 mt-0.5">
                  Monthly debt exceeds the safe 45% DTI ceiling. Avoid taking new loans and consider pre-paying high-interest debts.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <span>Financial Guidance</span>
                </div>
                <p className="text-slate-300 mt-0.5">
                  Your monthly income allows up to ₹5.2L in low-risk borrowing. Keeping additional EMIs under ₹7,500/mo maintains your healthy score.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

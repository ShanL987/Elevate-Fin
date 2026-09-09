import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  Info,
  Calendar,
  Percent,
  Wallet
} from 'lucide-react';
import { calculateEmi, formatINR, formatCompactINR, evaluateLoanRisk } from '../utils/finance';

interface EmiPlannerProps {
  monthlyIncome?: number;
  currentEmi?: number;
  onApplyForTranche?: (amount: number, emi: number, tenure: number) => void;
  onConsultAi?: (promptText: string, e?: React.MouseEvent) => void;
}

export const EmiPlanner: React.FC<EmiPlannerProps> = ({
  monthlyIncome = 80000,
  currentEmi = 18400,
  onApplyForTranche,
  onConsultAi,
}) => {
  // Primary Interactive States
  const [loanAmount, setLoanAmount] = useState<number>(500000); // ₹5,00,000 default
  const [tenureMonths, setTenureMonths] = useState<number>(36); // 36 months default
  const [interestRate, setInterestRate] = useState<number>(12.0); // 12% default yields exactly ₹16,607 for ₹5L/36m

  // Calculations
  const simulatedEmi = useMemo(() => {
    return calculateEmi(loanAmount, interestRate, tenureMonths);
  }, [loanAmount, interestRate, tenureMonths]);

  const totalMonthlyObligation = currentEmi + simulatedEmi;
  const projectedDti = useMemo(() => {
    return ((totalMonthlyObligation / monthlyIncome) * 100).toFixed(1);
  }, [totalMonthlyObligation, monthlyIncome]);

  const totalPayable = simulatedEmi * tenureMonths;
  const totalInterest = Math.max(0, totalPayable - loanAmount);

  // Dynamic Risk Profile
  const risk = useMemo(() => {
    return evaluateLoanRisk(monthlyIncome, currentEmi, simulatedEmi);
  }, [monthlyIncome, currentEmi, simulatedEmi]);

  // Safe preset amounts
  const presets = [100000, 300000, 500000, 1000000, 1500000, 2000000];
  const tenures = [12, 24, 36, 48, 60, 72];

  // Dynamic Glow and Theme based on Risk
  const riskTheme = useMemo(() => {
    if (risk.tier === 'LOW RISK') {
      return {
        accentColor: '#10b981',
        textClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/10',
        borderClass: 'border-emerald-500/30',
        glowStyle: '0 0 35px -5px rgba(16, 185, 129, 0.3)',
        gradientTrack: 'linear-gradient(90deg, #10b981, #34d399)',
        zoneLabel: 'PRUDENT ZONE',
      };
    } else if (risk.tier === 'MODERATE RISK') {
      return {
        accentColor: '#f59e0b',
        textClass: 'text-amber-400',
        bgClass: 'bg-amber-500/10',
        borderClass: 'border-amber-500/30',
        glowStyle: '0 0 35px -5px rgba(245, 158, 11, 0.3)',
        gradientTrack: 'linear-gradient(90deg, #10b981 0%, #f59e0b 100%)',
        zoneLabel: 'ELEVATED OBLIGATION ZONE',
      };
    } else {
      return {
        accentColor: '#ef4444',
        textClass: 'text-red-400',
        bgClass: 'bg-red-500/15',
        borderClass: 'border-red-500/50',
        glowStyle: '0 0 55px -5px rgba(239, 68, 68, 0.45)',
        gradientTrack: 'linear-gradient(90deg, #10b981 0%, #f59e0b 45%, #ef4444 80%)',
        zoneLabel: 'CRITICAL DANGER ZONE',
      };
    }
  }, [risk.tier]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400 font-semibold">
              LOAN SIMULATOR
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            EMI & Debt Calculator
          </h2>
        </div>

        <button
          onClick={() => {
            setLoanAmount(500000);
            setTenureMonths(36);
            setInterestRate(12.0);
          }}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to ₹5L</span>
        </button>
      </div>

      {/* Main Hero Card: EMI Planner Canvas */}
      <div 
        className="glass-card rounded-3xl p-6 sm:p-10 border transition-all duration-500 relative overflow-hidden"
        style={{
          borderColor: riskTheme.accentColor + '35',
          boxShadow: `0 25px 60px -15px rgba(0,0,0,0.8), ${riskTheme.glowStyle}`,
        }}
      >
        {/* Dynamic Zone Ambient Backlight */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[320px] rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: riskTheme.accentColor }}
        />

        {/* Central Loan Amount Display */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-slate-300 font-semibold mb-2">
            LOAN AMOUNT
          </div>

          <div className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all">
            {formatINR(loanAmount)}
          </div>

          <p className="text-xs text-slate-300 mt-2 font-mono">
            {formatCompactINR(loanAmount)} over {tenureMonths} months @ {interestRate}% APR
          </p>

          {/* Glowing Interactive Slider */}
          <div className="w-full max-w-2xl mt-8 mb-4 px-2">
            <div className="relative flex items-center">
              <input
                type="range"
                min="50000"
                max="2500000"
                step="10000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-3 glow-slider cursor-pointer relative z-10"
              />
            </div>

            {/* Slider Scale Indicators */}
            <div className="flex justify-between text-[11px] font-mono text-slate-300 mt-2.5">
              <span>₹50K (Min)</span>
              <span className="hidden sm:inline">₹5L</span>
              <span className="hidden sm:inline">₹10L</span>
              <span className="hidden sm:inline">₹18L</span>
              <span>₹25L (Max)</span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {presets.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setLoanAmount(amt)}
                  className={`btn-flash px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    loanAmount === amt
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-400'
                      : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  {formatCompactINR(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Central Monthly EMI Highlight */}
          <div className="mt-8 mb-6 p-5 sm:p-6 rounded-2xl bg-[#090d16]/90 border border-white/[0.09] max-w-lg w-full text-center shadow-[0_15px_35px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-300 font-semibold mb-1">
              ESTIMATED MONTHLY COMMITMENT
            </div>

            <div className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_0_18px_rgba(16,185,129,0.35)] float-result-number">
              {formatINR(simulatedEmi)}
              <span className="text-sm sm:text-base font-normal text-slate-300 font-mono ml-1.5">
                / month
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-slate-300 mt-3 pt-3 border-t border-white/[0.05]">
              <span>Principal: {formatCompactINR(loanAmount / tenureMonths)}/mo</span>
              <span className="text-white/20">•</span>
              <span>Interest: {formatCompactINR(totalInterest / tenureMonths)}/mo</span>
            </div>
          </div>

          {/* Large Risk Visualization Hero Element */}
          <div className="w-full max-w-2xl mt-3 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] relative">
            {/* Dynamic Danger Alert Banner when DTI breaches prudent limits */}
            {risk.isDanger && (
              <div className="mb-5 p-4 rounded-xl bg-red-950/50 border-2 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.35)] flex items-start gap-3.5 animate-danger-pulse">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5 border border-red-500/40">
                  <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                </div>
                <div className="text-xs">
                  <div className="font-display font-extrabold text-red-400 text-sm flex items-center gap-2">
                    <span>CRITICAL DANGER: SOLVENCY THRESHOLD BREACHED</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500 text-white font-black uppercase tracking-wider">
                      DANGER
                    </span>
                  </div>
                  <p className="text-red-200/90 mt-1 leading-relaxed">
                    Projected DTI of <strong className="text-white font-mono">{projectedDti}%</strong> exceeds your private banking safety ceiling of 48%. This high repayment burden triggers negative bureau markers, depletes liquid reserves, and sharply increases insolvency risk.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-300 font-semibold block">
                  LEVERAGE TOLERANCE AUDIT
                </span>
                {/* Large Risk Badge */}
                <div className="flex items-center gap-2.5 mt-1 justify-center sm:justify-start">
                  <div 
                    className="w-3 h-3 rounded-full animate-ping"
                    style={{ backgroundColor: riskTheme.accentColor }}
                  />
                  <h3 
                    className="font-display text-2xl sm:text-3xl font-black tracking-tight"
                    style={{ color: riskTheme.accentColor }}
                  >
                    {risk.tier}
                  </h3>
                </div>
              </div>

              {/* Status pill */}
              <div className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider ${riskTheme.bgClass} ${riskTheme.borderClass}`} style={{ color: riskTheme.accentColor }}>
                {riskTheme.zoneLabel}
              </div>
            </div>

            {/* Smooth Radial / Gradient Gauge Indicator */}
            <div className="relative w-full py-2">
              {/* Multi-tier Gradient Risk Bar */}
              <div className="w-full h-3.5 rounded-full bg-white/[0.06] p-0.5 relative overflow-hidden border border-white/[0.08]">
                {/* Gradient Fill showing Safe -> Mod -> High */}
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(8, Number(projectedDti) * 1.5))}%`,
                    background: riskTheme.gradientTrack,
                    boxShadow: `0 0 14px ${riskTheme.accentColor}`,
                  }}
                />
              </div>

              {/* Threshold Ticks */}
              <div className="flex justify-between text-[10px] font-mono text-slate-300 mt-2">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span>◀ 0% - 35% Safe</span>
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <span>36% - 48% Moderate</span>
                </span>
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse mr-0.5" />
                  <span>&gt; 48% DANGER ZONE ▶</span>
                </span>
              </div>
            </div>

            {/* Dynamic Telemetry Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/[0.05]">
              <div className={`p-3 rounded-xl border transition-all ${
                risk.isDanger 
                  ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.25)]' 
                  : 'bg-black/30 border-white/[0.04]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-300">Projected DTI Ratio</span>
                  {risk.isDanger && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-black">
                      DANGER
                    </span>
                  )}
                </div>
                <div className={`text-xl font-display font-bold mt-0.5 ${
                  risk.isDanger ? 'text-red-400 font-black' : 'text-white'
                }`}>
                  {projectedDti}%
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  Base: 31% + {((simulatedEmi / monthlyIncome) * 100).toFixed(1)}% new
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04]">
                <div className="text-[10px] font-mono uppercase text-slate-300">Total Monthly Debt</div>
                <div className="text-xl font-display font-bold text-white mt-0.5">
                  {formatINR(totalMonthlyObligation)}
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  Against ₹80K monthly income
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04]">
                <div className="text-[10px] font-mono uppercase text-slate-300">Recommended Max Loan</div>
                <div className="text-xl font-display font-bold text-emerald-400 mt-0.5">
                  {formatINR(risk.recommendedMaxLoan)}
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  To safeguard prime tier
                </div>
              </div>
            </div>

            {/* Risk Explanation Message */}
            <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-slate-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
              <span>{risk.message}</span>
            </div>
          </div>
        </div>

        {/* Secondary Fine-tuning Controls (Tenure & Interest Rate) */}
        <div className="mt-8 pt-8 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Tenure Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Repayment Tenure
              </span>
              <span className="text-xs font-mono text-emerald-300 font-bold">
                {tenureMonths} Months ({(tenureMonths / 12).toFixed(1)} Yrs)
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {tenures.map((t) => (
                <button
                  key={t}
                  onClick={() => setTenureMonths(t)}
                  className={`btn-flash py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    tenureMonths === t
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)] font-bold'
                      : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.05]'
                  }`}
                >
                  {t}M
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate Tuning */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                Interest Rate (APR)
              </span>
              <span className="text-xs font-mono text-emerald-300 font-bold">
                {interestRate.toFixed(1)}% p.a.
              </span>
            </div>

            <div className="flex items-center gap-4 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
              <input
                type="range"
                min="9.5"
                max="15.0"
                step="0.25"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 glow-slider cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-300 shrink-0">
                {interestRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-300 text-center sm:text-left">
            <span>Verified against your ₹80,000 monthly cash flow. Instant soft check; zero CIBIL impact.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onConsultAi && (
              <button
                onClick={(e) => onConsultAi(`Should I proceed with a loan of ${formatINR(loanAmount)} at ${interestRate}% for ${tenureMonths} months given my ₹80K income?`, e)}
                className="btn-flash flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 text-xs font-semibold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate with AI</span>
              </button>
            )}

            <button
              onClick={() => onApplyForTranche?.(loanAmount, simulatedEmi, tenureMonths)}
              className="btn-flash flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
            >
              <span>Lock Pre-Approved Tranche</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

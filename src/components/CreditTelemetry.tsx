import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import { FinancialProfile } from '../types';

interface CreditTelemetryProps {
  profile: FinancialProfile;
  onSimulateScore?: () => void;
}

export const CreditTelemetry: React.FC<CreditTelemetryProps> = ({ profile }) => {
  const [simulatedPrepay, setSimulatedPrepay] = useState<number>(50000);
  const score = profile.creditScore; // 792
  const isDanger = score < 650;
  const isCaution = score >= 650 && score < 750;
  const scoreColor = isDanger ? '#ef4444' : isCaution ? '#f59e0b' : '#10b981';
  const scoreLabel = isDanger ? 'DANGER ZONE' : isCaution ? 'FAIR' : 'EXCELLENT';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400 font-semibold">
            CREDIT REPORT
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            CIBIL & EXPERIAN
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
          Credit Score & Utilization
        </h2>
        <p className="text-xs text-slate-300 mt-0.5">
          Real-time score standing, credit utilization limits, and payment history.
        </p>
      </div>

      {/* Hero Credit Card & Score Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Ring */}
        <div className={`lg:col-span-5 glass-card rounded-2xl p-6 border flex flex-col items-center justify-center text-center relative overflow-hidden transition-all ${
          isDanger ? 'border-red-500/40 glow-danger-red' : 'border-white/[0.08]'
        }`}>
          <div 
            className="absolute top-0 right-0 w-40 h-40 rounded-full blur-2xl pointer-events-none" 
            style={{ backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.08)' }}
          />

          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-300 font-semibold mb-4">
            COMPOSITE CREDIT RATING
          </span>

          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="64"
                className="text-white/[0.06]"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke={scoreColor}
                strokeWidth="8"
                strokeDasharray={402}
                strokeDashoffset={402 - (score / 900) * 402}
                strokeLinecap="round"
                fill="transparent"
                style={{ filter: `drop-shadow(0 0 8px ${scoreColor})` }}
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-display text-4xl sm:text-5xl font-black text-white drop-shadow-[0_0_16px_rgba(16,185,129,0.5)] float-result-number">
                {score}
              </span>
              <span 
                className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 border"
                style={{
                  color: scoreColor,
                  backgroundColor: `${scoreColor}25`,
                  borderColor: `${scoreColor}50`,
                }}
              >
                {scoreLabel}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-xs mt-3">
            {isDanger
              ? 'CRITICAL DANGER: Score indicates severe past delinquency. Immediate credit remediation required.'
              : 'Top 4% tier across national banking registries. Zero derogatory remarks or overdue notices.'}
          </p>

          {/* Bureau Risk Spectrum */}
          <div className="flex items-center justify-center gap-3 text-[10px] font-mono mt-3 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 750+ Prime
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 650-749 Fair
            </span>
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" /> &lt;650 DANGER
            </span>
          </div>
        </div>

        {/* Credit Breakdown Pillars */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Primary Bureau Metrics
            </h3>

            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300">Credit Card Utilization (18.2%)</span>
                  <span className="text-emerald-400 font-bold">₹1.42L / ₹7.80L Limit</span>
                </div>
                <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden relative">
                  <div className="bg-emerald-400 h-full rounded-full shadow-[0_0_8px_#10b981]" style={{ width: '18.2%' }} />
                  {/* Danger threshold indicator at 50% utilization */}
                  <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-red-500 shadow-[0_0_4px_#ef4444]" title="50% Danger Threshold" />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-300 mt-1.5">
                  <span>Safe threshold &lt;30%</span>
                  <span className="text-red-400 font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> &gt;50% DANGER ZONE
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300">On-Time Payment Record</span>
                  <span className="text-emerald-400 font-bold">99.4% (36 Months)</span>
                </div>
                <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full shadow-[0_0_8px_#10b981]" style={{ width: '99.4%' }} />
                </div>
                <div className="text-[11px] text-slate-300 mt-1">0 missed payments across 4 active institutions.</div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300">Average Credit Age</span>
                  <span className="text-white font-bold">5.8 Years</span>
                </div>
                <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-full" style={{ width: '75%' }} />
                </div>
                <div className="text-[11px] text-slate-300 mt-1">Oldest active credit line opened July 2019.</div>
              </div>
            </div>
          </div>

          {/* Interactive Prepayment Simulation */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] bg-white/[0.02] p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-300">Score Uplift Simulator:</span>
              <span className="text-emerald-300 font-bold">Prepay ₹{simulatedPrepay.toLocaleString('en-IN')} ➔ +14 Pts</span>
            </div>
            <input
              type="range"
              min="10000"
              max="200000"
              step="10000"
              value={simulatedPrepay}
              onChange={(e) => setSimulatedPrepay(Number(e.target.value))}
              className="w-full h-2 glow-slider cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

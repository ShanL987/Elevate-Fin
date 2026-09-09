import React from 'react';
import { 
  TrendingUp, 
  CreditCard, 
  Percent, 
  ShieldAlert, 
  ArrowUpRight, 
  Wallet,
  Coins
} from 'lucide-react';
import { FinancialProfile } from '../types';

interface MetricCardsProps {
  profile?: FinancialProfile;
  onSelectMetric?: (metricKey: string, e?: React.MouseEvent) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ 
  profile, 
  onSelectMetric 
}) => {
  const incomeVal = profile?.monthlyIncome || 80000;
  const emiVal = profile?.monthlyEmi || 0;
  const debtRatioVal = profile?.debtRatio ?? 0;
  const safeEmiVal = profile?.safeAdditionalEmi ?? Math.max(0, Math.round(incomeVal * 0.4) - emiVal);

  const metrics = [
    {
      id: 'income',
      value: `₹${Math.round(incomeVal / 1000)}K`,
      rawAmount: `₹ ${incomeVal.toLocaleString('en-IN')}`,
      label: 'Monthly Income',
      caption: 'Verified primary post-tax inflow',
      icon: <Wallet className="w-4 h-4 text-emerald-400" />,
      tag: '+6.2% YoY',
      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      glow: 'drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]',
      borderAccent: 'hover:border-emerald-500/30',
    },
    {
      id: 'emi',
      value: `₹${(emiVal / 1000).toFixed(1)}K`,
      rawAmount: `₹ ${emiVal.toLocaleString('en-IN')}`,
      label: 'Monthly EMI',
      caption: 'Active loan & debt obligations',
      icon: <CreditCard className="w-4 h-4 text-teal-400" />,
      tag: emiVal > 0 ? 'Auto-debited' : 'Zero Debt',
      tagColor: 'text-slate-300 bg-white/[0.04] border-white/[0.08]',
      glow: 'drop-shadow-[0_0_12px_rgba(45,212,191,0.25)]',
      borderAccent: 'hover:border-teal-500/30',
    },
    {
      id: 'debt_ratio',
      value: `${debtRatioVal}%`,
      rawAmount: `${debtRatioVal}% DTI`,
      label: 'Debt Ratio',
      caption: 'Safe <35% • DANGER >45%',
      icon: <Percent className={`w-4 h-4 ${debtRatioVal > 45 ? 'text-red-400' : 'text-emerald-400'}`} />,
      tag: debtRatioVal > 45 ? 'DANGER' : debtRatioVal > 35 ? 'Moderate' : 'Prudent',
      tagColor: debtRatioVal > 45 
        ? 'text-red-400 bg-red-500/20 border-red-500/40 font-black shadow-[0_0_10px_rgba(239,68,68,0.35)]' 
        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      glow: debtRatioVal > 45 
        ? 'drop-shadow-[0_0_14px_rgba(239,68,68,0.5)]' 
        : 'drop-shadow-[0_0_14px_rgba(16,185,129,0.35)]',
      borderAccent: debtRatioVal > 45 ? 'border-red-500/50' : 'hover:border-emerald-500/30',
      isDanger: debtRatioVal > 45,
    },
    {
      id: 'safe_emi',
      value: `₹${Math.round(safeEmiVal / 1000)}K`,
      rawAmount: `₹ ${safeEmiVal.toLocaleString('en-IN')}`,
      label: 'Safe Additional EMI',
      caption: 'Buffer before breaching 40% DTI',
      icon: <Coins className="w-4 h-4 text-emerald-400" />,
      tag: 'Pre-Approved',
      tagColor: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
      glow: 'drop-shadow-[0_0_16px_rgba(16,185,129,0.45)]',
      borderAccent: 'hover:border-emerald-500/40',
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => (
        <div
          key={m.id}
          onClick={(e) => onSelectMetric?.(m.id, e)}
          className={`btn-flash glass-card glass-card-interactive rounded-2xl p-5 border border-white/[0.07] ${m.borderAccent} cursor-pointer group relative overflow-hidden`}
        >
          {/* Highlight indicator for Safe Additional EMI */}
          {m.highlight && (
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.08] blur-xl pointer-events-none" />
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
                {m.icon}
              </div>
              <span className="text-xs font-medium text-slate-300 tracking-wide">
                {m.label}
              </span>
            </div>

            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${m.tagColor}`}>
              {m.tag}
            </span>
          </div>

          <div className="my-2">
            <div className={`font-display text-3xl font-extrabold tracking-tight text-white ${m.glow} group-hover:text-emerald-300 transition-colors ${
              idx % 2 === 0 ? 'float-result-number' : 'float-result-number-delayed'
            }`}>
              {m.value}
            </div>
            <div className="text-[11px] font-mono text-slate-300 mt-1">
              {m.rawAmount}
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-300">
            <span className="truncate">{m.caption}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 ml-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

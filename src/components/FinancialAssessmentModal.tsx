import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  ArrowRight, 
  IndianRupee, 
  Building2, 
  Car, 
  CreditCard, 
  Wallet, 
  AlertTriangle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { FinancialProfile } from '../types';
import { formatINR, computeFinancialTelemetry, FinancialAssessmentInputs } from '../utils/finance';

interface FinancialAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile?: FinancialProfile;
  onCalculateAndNavigate: (calculatedProfile: FinancialProfile) => void;
  title?: string;
  subtitle?: string;
}

export const FinancialAssessmentModal: React.FC<FinancialAssessmentModalProps> = ({
  isOpen,
  onClose,
  initialProfile,
  onCalculateAndNavigate,
  title = "Financial Assessment & Solvency Audit",
  subtitle = "Enter your income and loan obligations to calculate your exact EMI, credit score standing, and DTI telemetry."
}) => {
  const [clientName, setClientName] = useState<string>(initialProfile?.clientName || 'Private Client');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(initialProfile?.monthlyIncome || 80000);
  
  // Loan breakdown mode: 'quick' or 'itemized'
  const [loanMode, setLoanMode] = useState<'quick' | 'itemized'>('quick');
  const [totalMonthlyEmi, setTotalMonthlyEmi] = useState<number>(initialProfile?.monthlyEmi || 18400);
  
  // Itemized loan fields
  const [homeLoan, setHomeLoan] = useState<number>(initialProfile?.loanBreakdown?.homeLoan || 0);
  const [personalLoan, setPersonalLoan] = useState<number>(initialProfile?.loanBreakdown?.personalLoan || 0);
  const [autoLoan, setAutoLoan] = useState<number>(initialProfile?.loanBreakdown?.autoLoan || 0);
  const [otherDebt, setOtherDebt] = useState<number>(initialProfile?.loanBreakdown?.otherDebt || 0);

  // Liquid savings
  const [liquidSavings, setLiquidSavings] = useState<number>(
    initialProfile?.liquidSavings || (initialProfile ? Math.round(initialProfile.monthlyIncome * 3.5) : 280000)
  );

  if (!isOpen) return null;

  // Real-time active total EMI calculation
  const computedTotalEmi = loanMode === 'quick' 
    ? totalMonthlyEmi 
    : (homeLoan + personalLoan + autoLoan + otherDebt);

  // Instant live preview
  const livePreviewInputs: FinancialAssessmentInputs = {
    name: clientName,
    monthlyIncome,
    totalMonthlyEmi: computedTotalEmi,
    homeLoanEmi: homeLoan,
    personalLoanEmi: personalLoan,
    autoLoanEmi: autoLoan,
    otherEmi: otherDebt,
    liquidSavings,
  };
  const preview = computeFinancialTelemetry(livePreviewInputs);
  const isDanger = preview.debtRatio > 45;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProfile = computeFinancialTelemetry({
      name: clientName.trim() || 'Private Client',
      monthlyIncome,
      totalMonthlyEmi: computedTotalEmi,
      homeLoanEmi: loanMode === 'itemized' ? homeLoan : 0,
      personalLoanEmi: loanMode === 'itemized' ? personalLoan : 0,
      autoLoanEmi: loanMode === 'itemized' ? autoLoan : 0,
      otherEmi: loanMode === 'itemized' ? otherDebt : 0,
      liquidSavings,
    });
    onCalculateAndNavigate(finalProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-card w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative my-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight">
                {title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-5 space-y-6">
          
          {/* Section 1: Personal & Income Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                <span>1. Monthly Net Income</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">Post-tax salary / business profit</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 font-mono mb-1">
                  Client / Account Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-emerald-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-mono mb-1">
                  Monthly Inflow Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">₹</span>
                  <input
                    type="number"
                    min="15000"
                    max="2000000"
                    step="5000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-xs font-bold focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Quick Income Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-mono text-slate-500">Presets:</span>
              {[50000, 80000, 120000, 160000, 250000].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setMonthlyIncome(inc)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    monthlyIncome === inc
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {formatINR(inc)}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Active Loans & Debt Obligations */}
          <div className="space-y-4 pt-4 border-t border-white/[0.06]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>2. Active Loan Obligations & EMIs</span>
              </span>

              {/* Mode Toggle */}
              <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setLoanMode('quick')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    loanMode === 'quick'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Total Monthly EMI
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoanMode('itemized');
                    if (homeLoan === 0 && personalLoan === 0 && autoLoan === 0 && otherDebt === 0) {
                      setHomeLoan(Math.round(totalMonthlyEmi * 0.6));
                      setPersonalLoan(Math.round(totalMonthlyEmi * 0.4));
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    loanMode === 'itemized'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Itemized Loans Breakdown
                </button>
              </div>
            </div>

            {loanMode === 'quick' ? (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-300">
                    Combined Monthly EMI Burden
                  </label>
                  <span className="font-mono text-sm font-bold text-white">
                    {formatINR(totalMonthlyEmi)}
                    <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(100000, Math.round(monthlyIncome * 0.8))}
                  step="1000"
                  value={totalMonthlyEmi}
                  onChange={(e) => setTotalMonthlyEmi(Number(e.target.value))}
                  className="w-full h-2 glow-slider cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>₹0 (Debt Free)</span>
                  <span>₹{Math.round(monthlyIncome * 0.4).toLocaleString('en-IN')} (40% Ceiling)</span>
                  <span>{formatINR(Math.round(monthlyIncome * 0.8))}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <label className="text-[11px] text-slate-300 font-mono flex items-center gap-1 mb-1">
                    <Building2 className="w-3 h-3 text-emerald-400" />
                    <span>Home Loan EMI</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={homeLoan}
                    onChange={(e) => setHomeLoan(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-mono flex items-center gap-1 mb-1">
                    <CreditCard className="w-3 h-3 text-teal-400" />
                    <span>Personal Loan EMI</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={personalLoan}
                    onChange={(e) => setPersonalLoan(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-mono flex items-center gap-1 mb-1">
                    <Car className="w-3 h-3 text-cyan-400" />
                    <span>Auto / Vehicle Loan EMI</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={autoLoan}
                    onChange={(e) => setAutoLoan(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-mono flex items-center gap-1 mb-1">
                    <CreditCard className="w-3 h-3 text-purple-400" />
                    <span>Credit Card / Other EMI</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={otherDebt}
                    onChange={(e) => setOtherDebt(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Total Combined Monthly EMI:</span>
                  <span className="font-bold text-white">{formatINR(computedTotalEmi)} / mo</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Liquid Reserves & Savings */}
          <div className="space-y-3 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>3. Liquid Cash Reserves & FDs</span>
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {formatINR(liquidSavings)}
              </span>
            </div>
            <input
              type="range"
              min="20000"
              max="2000000"
              step="10000"
              value={liquidSavings}
              onChange={(e) => setLiquidSavings(Number(e.target.value))}
              className="w-full h-2 glow-slider cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>₹20K</span>
              <span>₹5 Lakh</span>
              <span>₹20 Lakh</span>
            </div>
          </div>

          {/* Live Dynamic Calculation Preview Bar */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDanger 
              ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              : 'bg-emerald-950/30 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isDanger ? (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Live Solvency Preview
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                isDanger ? 'bg-red-500 text-white' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {isDanger ? 'DANGER (>45% DTI)' : 'HEALTHY BUFFER'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2 rounded-xl bg-white/[0.03]">
                <span className="text-[10px] font-mono text-slate-400 block">DTI RATIO</span>
                <span className={`text-base font-mono font-extrabold ${isDanger ? 'text-red-400' : 'text-emerald-400'}`}>
                  {preview.debtRatio}%
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white/[0.03]">
                <span className="text-[10px] font-mono text-slate-400 block">HEALTH SCORE</span>
                <span className={`text-base font-mono font-extrabold ${isDanger ? 'text-red-400' : 'text-emerald-400'}`}>
                  {preview.healthScore} / 100
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white/[0.03]">
                <span className="text-[10px] font-mono text-slate-400 block">EST. CREDIT SCORE</span>
                <span className={`text-base font-mono font-extrabold ${preview.creditScore < 650 ? 'text-red-400' : 'text-teal-300'}`}>
                  {preview.creditScore}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white/[0.03]">
                <span className="text-[10px] font-mono text-slate-400 block">SAFE EXTRA EMI</span>
                <span className="text-base font-mono font-extrabold text-white">
                  ₹{(preview.safeAdditionalEmi / 1000).toFixed(1)}K
                </span>
              </div>
            </div>
          </div>

          {/* Action Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-mono border border-white/[0.08] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 cursor-pointer"
            >
              <span>Calculate & View Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

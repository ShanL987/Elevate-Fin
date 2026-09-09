import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Wallet, 
  ShieldCheck, 
  CreditCard, 
  TrendingUp, 
  Building2, 
  Plus, 
  DollarSign, 
  PieChart, 
  Sliders
} from 'lucide-react';
import { formatINR, computeFinancialTelemetry, calculateEmi } from '../utils/finance';
import { updateUserProfile, addUserLoan } from '../lib/firebase';
import { UserFinancialData } from '../types';

interface FirstLoginOnboardingModalProps {
  isOpen: boolean;
  user?: UserFinancialData | null;
  uid?: string;
  userEmail?: string;
  userName?: string;
  onComplete: () => void;
}

export const FirstLoginOnboardingModal: React.FC<FirstLoginOnboardingModalProps> = ({
  isOpen,
  user,
  uid,
  userEmail,
  userName,
  onComplete,
}) => {
  const effectiveUid = uid || user?.uid || '';
  const effectiveName = userName || user?.name || userEmail?.split('@')[0] || 'Client';

  const [step, setStep] = useState<'financial_info' | 'first_loan' | 'complete'>('financial_info');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Financial inputs with robust fallbacks
  const [monthlyIncome, setMonthlyIncome] = useState<number>(user?.monthlyIncome || 85000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(user?.monthlyExpenses || 35000);
  const [savings, setSavings] = useState<number>(user?.savings || 250000);
  const [investments, setInvestments] = useState<number>(user?.investments || 150000);
  const [creditScore, setCreditScore] = useState<number>(user?.creditScore || 785);
  const [healthInsurance, setHealthInsurance] = useState<number>(user?.healthInsuranceCoverage || 1000000);
  const [termInsurance, setTermInsurance] = useState<number>(user?.termInsuranceCoverage || 10000000);

  // Optional First Loan
  const [hasLoan, setHasLoan] = useState<boolean>(false);
  const [loanLender, setLoanLender] = useState<string>('HDFC Bank');
  const [loanType, setLoanType] = useState<'home' | 'personal' | 'auto' | 'education' | 'other'>('personal');
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [loanInterestRate, setLoanInterestRate] = useState<number>(11.5);
  const [loanTenureMonths, setLoanTenureMonths] = useState<number>(36);
  const [loanEmi, setLoanEmi] = useState<number>(9886);

  // Calculated telemetry preview
  const previewEmi = hasLoan ? loanEmi : 0;
  const previewTelemetry = computeFinancialTelemetry({
    name: effectiveName,
    monthlyIncome,
    totalMonthlyEmi: previewEmi,
    liquidSavings: savings,
  });

  // Keep state in sync if user data arrives asynchronously
  React.useEffect(() => {
    if (user?.monthlyIncome) setMonthlyIncome(user.monthlyIncome);
    if (user?.monthlyExpenses) setMonthlyExpenses(user.monthlyExpenses);
    if (user?.savings) setSavings(user.savings);
    if (user?.investments) setInvestments(user.investments);
    if (user?.creditScore) setCreditScore(user.creditScore);
    if (user?.healthInsuranceCoverage) setHealthInsurance(user.healthInsuranceCoverage);
    if (user?.termInsuranceCoverage) setTermInsurance(user.termInsuranceCoverage);
  }, [user]);

  if (!isOpen) return null;

  const handleUpdateLoanAmountOrRate = (amt: number, rate: number, tenure: number) => {
    setLoanAmount(amt);
    setLoanInterestRate(rate);
    setLoanTenureMonths(tenure);
    setLoanEmi(calculateEmi(amt, rate, tenure));
  };

  const handleSaveAndFinish = async () => {
    if (!effectiveUid) return;
    setIsSaving(true);
    try {
      // 1. If user opted to add their first loan, persist to subcollection
      if (hasLoan && loanAmount > 0) {
        await addUserLoan(effectiveUid, {
          lender: loanLender.trim() || 'Primary Bank',
          type: loanType,
          amount: loanAmount,
          interestRate: loanInterestRate,
          tenureMonths: loanTenureMonths,
          emi: loanEmi,
          status: 'active',
          disbursedDate: new Date().toISOString().split('T')[0],
          notes: 'Added during account onboarding',
        });
      }

      // 2. Recompute final profile telemetry
      const finalEmi = hasLoan ? loanEmi : 0;
      const finalTelemetry = computeFinancialTelemetry({
        name: effectiveName,
        monthlyIncome,
        totalMonthlyEmi: finalEmi,
        liquidSavings: savings,
      });

      // 3. Save profile to Firestore
      await updateUserProfile(effectiveUid, {
        name: effectiveName,
        monthlyIncome,
        monthlyExpenses,
        savings,
        investments,
        creditScore,
        healthInsuranceCoverage: healthInsurance,
        termInsuranceCoverage: termInsurance,
        clientTier: finalTelemetry.clientTier,
        healthScore: finalTelemetry.healthScore,
        monthlyEmi: finalEmi,
        debtRatio: finalTelemetry.debtRatio,
        safeAdditionalEmi: finalTelemetry.safeAdditionalEmi,
        liquidRunwayMonths: finalTelemetry.liquidRunwayMonths,
        onboardingCompleted: true,
      });

      setStep('complete');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="glass-card w-full max-w-2xl rounded-3xl p-6 sm:p-9 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative overflow-hidden text-slate-100">
        
        {/* Glow Header Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-36 bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* STEP 1: WELCOME & FINANCIAL POSITION */}
        {step === 'financial_info' && (
          <div className="space-y-6">
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Account Initialized</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome to Elevate, {effectiveName.split(' ')[0]}
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                "Let's understand your financial position." Enter your baselines to unlock real-time debt capacity telemetry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-1">
              
              {/* Monthly Income */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Monthly Inflow (Income)</span>
                  <span className="text-emerald-400 font-bold">{formatINR(monthlyIncome)}</span>
                </label>
                <input
                  type="number"
                  min="10000"
                  step="5000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              {/* Monthly Expenses */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Monthly Living Expenses</span>
                  <span className="text-slate-200 font-bold">{formatINR(monthlyExpenses)}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="2000"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              {/* Liquid Savings */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Liquid Emergency Savings</span>
                  <span className="text-teal-400 font-bold">{formatINR(savings)}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={savings}
                  onChange={(e) => setSavings(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              {/* Investments */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Investments (MFs/Stocks/FDs)</span>
                  <span className="text-blue-400 font-bold">{formatINR(investments)}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={investments}
                  onChange={(e) => setInvestments(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              {/* Credit Score */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Bureau Credit Score</span>
                  <span className="text-emerald-400 font-bold">{creditScore}</span>
                </label>
                <input
                  type="number"
                  min="300"
                  max="900"
                  value={creditScore}
                  onChange={(e) => setCreditScore(Math.min(900, Math.max(300, Number(e.target.value))))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              {/* Health Insurance */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Health Insurance Coverage</span>
                  <span className="text-indigo-300 font-bold">{formatINR(healthInsurance)}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={healthInsurance}
                  onChange={(e) => setHealthInsurance(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              {/* Term Insurance */}
              <div className="sm:col-span-2 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Term Life Insurance Coverage</span>
                  <span className="text-amber-300 font-bold">{formatINR(termInsurance)}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={termInsurance}
                  onChange={(e) => setTermInsurance(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

            </div>

            {/* Navigation to step 2 */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <span className="text-xs font-mono text-slate-400">Step 1 of 2</span>
              <button
                type="button"
                onClick={() => setStep('first_loan')}
                className="btn-flash px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: OPTIONAL FIRST LOAN */}
        {step === 'first_loan' && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono mb-2">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Existing Obligations</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                Add your first loan
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Do you currently have an active home loan, personal loan, or vehicle loan? You can add it now or skip to proceed with clean slate.
              </p>
            </div>

            {/* Toggle Loan Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">I have active loan obligations</span>
                <span className="text-xs text-slate-400">Include monthly EMI in my initial solvency model</span>
              </div>
              <button
                type="button"
                onClick={() => setHasLoan(!hasLoan)}
                className={`btn-flash px-4 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  hasLoan
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-white/[0.06] text-slate-300 hover:text-white'
                }`}
              >
                {hasLoan ? 'Active' : 'No Loans (Clean)'}
              </button>
            </div>

            {/* Loan Inputs if hasLoan */}
            {hasLoan && (
              <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">Lender / Institution</label>
                    <input
                      type="text"
                      value={loanLender}
                      onChange={(e) => setLoanLender(e.target.value)}
                      placeholder="e.g. HDFC Bank, SBI, ICICI"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">Obligation Type</label>
                    <select
                      value={loanType}
                      onChange={(e) => setLoanType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0f1420] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="personal">Personal Loan</option>
                      <option value="home">Home Loan</option>
                      <option value="auto">Auto / Vehicle Loan</option>
                      <option value="education">Education Loan</option>
                      <option value="other">Other Debt</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">
                      Outstanding Amount ({formatINR(loanAmount)})
                    </label>
                    <input
                      type="number"
                      step="25000"
                      value={loanAmount}
                      onChange={(e) => handleUpdateLoanAmountOrRate(Number(e.target.value), loanInterestRate, loanTenureMonths)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">Annual Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={loanInterestRate}
                      onChange={(e) => handleUpdateLoanAmountOrRate(loanAmount, Number(e.target.value), loanTenureMonths)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">Remaining Tenure (Months)</label>
                    <input
                      type="number"
                      min="6"
                      max="360"
                      value={loanTenureMonths}
                      onChange={(e) => handleUpdateLoanAmountOrRate(loanAmount, loanInterestRate, Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">Monthly EMI</label>
                    <input
                      type="number"
                      value={loanEmi}
                      onChange={(e) => setLoanEmi(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setStep('financial_info')}
                className="btn-flash px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-300 font-mono cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleSaveAndFinish}
                disabled={isSaving}
                className="btn-flash px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                {isSaving ? <span>Saving Profile...</span> : <span>Compute & Complete</span>}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: YOUR ELEVATE PROFILE IS READY */}
        {step === 'complete' && (
          <div className="space-y-6 text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-display text-3xl font-extrabold text-white tracking-tight">
                Your Elevate profile is ready.
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
                Initial financial telemetry has been calibrated and saved to your private encrypted account.
              </p>
            </div>

            {/* Calculated Results Showcase */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] max-w-lg mx-auto text-center">
              <div className="p-2">
                <div className="text-[10px] font-mono uppercase text-slate-400">Financial Health</div>
                <div className="text-2xl font-display font-extrabold text-emerald-400 mt-0.5">
                  {previewTelemetry.healthScore}
                  <span className="text-xs font-mono font-normal text-slate-400">/100</span>
                </div>
              </div>

              <div className="p-2 border-x border-white/[0.06]">
                <div className="text-[10px] font-mono uppercase text-slate-400">Initial DTI</div>
                <div className="text-2xl font-display font-extrabold text-emerald-300 mt-0.5">
                  {previewTelemetry.debtRatio}%
                </div>
              </div>

              <div className="p-2">
                <div className="text-[10px] font-mono uppercase text-slate-400">Safe Headroom</div>
                <div className="text-2xl font-display font-extrabold text-white mt-0.5">
                  {formatINR(previewTelemetry.safeAdditionalEmi)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onComplete}
              className="btn-flash w-full max-w-sm mx-auto py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Elevate Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

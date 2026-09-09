import React, { useState } from 'react';
import { X, Building2, CheckCircle2, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/finance';
import { addUserLoan } from '../lib/firebase';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid?: string;
  loanDetails: {
    bankName?: string;
    amount: number;
    emi: number;
    tenureMonths: number;
    rate?: number;
  };
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ 
  isOpen, 
  onClose, 
  uid,
  loanDetails 
}) => {
  const [step, setStep] = useState<'review' | 'submitting' | 'confirmed'>('review');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setStep('submitting');
    try {
      if (uid) {
        await addUserLoan(uid, {
          lender: loanDetails.bankName || 'Approved Partner Bank',
          type: 'personal',
          amount: loanDetails.amount,
          interestRate: loanDetails.rate || 10.5,
          tenureMonths: loanDetails.tenureMonths,
          emi: loanDetails.emi,
          status: 'active',
          disbursedDate: new Date().toISOString().split('T')[0],
          notes: 'Pre-approved tranche issued via Elevate Terminal',
        });
      }
    } catch (err) {
      console.error('Failed to register loan in portfolio:', err);
    }
    setTimeout(() => {
      setStep('confirmed');
    }, 1000);
  };

  const handleCloseAndReset = () => {
    setStep('review');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                {loanDetails.bankName || 'ABC BANK'} Private Tranche
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Institutional Disbursal Mandate
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseAndReset}
            className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Stages */}
        {step === 'review' && (
          <div className="py-5 space-y-5">
            <div className="p-4 rounded-2xl bg-black/50 border border-white/[0.06] text-center">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Approved Principal
              </div>
              <div className="font-display text-4xl font-extrabold text-white mt-1 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                {formatINR(loanDetails.amount)}
              </div>
              <div className="text-xs font-mono text-emerald-400 mt-1">
                {formatINR(loanDetails.emi)} / month for {loanDetails.tenureMonths} Months
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero processing surcharge waived for Private Wealth clients.</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Auto-syncs into your private Elevate Active Loans portfolio.</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Disbursal to linked verified salary account upon final review.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleCloseAndReset}
                className="btn-flash flex-1 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-mono transition-colors"
              >
                Modify Specs
              </button>
              <button
                onClick={handleConfirm}
                className="btn-flash flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 text-xs font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Authorize Disbursal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 'submitting' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <span className="w-12 h-12 rounded-full bg-emerald-500/20 animate-ping absolute" />
              <Sparkles className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
            <div className="font-mono text-sm font-bold text-white tracking-wider">
              Executing cryptographic smart contract & adding to portfolio...
            </div>
            <p className="text-xs text-slate-400 max-w-xs">
              Confirming collateral-free prime underwriting with partner banking API.
            </p>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="font-display text-2xl font-bold text-white">
              Tranche Registered & Confirmed
            </div>
            <p className="text-xs text-slate-300 max-w-sm">
              Pre-approval reservation confirmed and added to your private portfolio. Pre-approval code <span className="text-emerald-400 font-mono font-bold">ELV-8942-PRIME</span>.
            </p>

            <div className="w-full pt-4">
              <button
                onClick={handleCloseAndReset}
                className="btn-flash w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono tracking-wider transition-colors cursor-pointer"
              >
                Return to Terminal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

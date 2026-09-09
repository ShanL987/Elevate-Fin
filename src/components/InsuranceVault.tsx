import React, { useState } from 'react';
import { ShieldCheck, HeartPulse, Umbrella, AlertTriangle, ArrowUpRight, CheckCircle2, Edit3, Save, X } from 'lucide-react';
import { FinancialProfile, UserFinancialData } from '../types';
import { formatINR, formatCompactINR } from '../utils/finance';
import { updateUserProfile } from '../lib/firebase';

interface InsuranceVaultProps {
  profile?: FinancialProfile;
  userData?: UserFinancialData | null;
}

export const InsuranceVault: React.FC<InsuranceVaultProps> = ({ profile, userData }) => {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [healthCover, setHealthCover] = useState<number>(userData?.healthInsuranceCoverage || 1000000);
  const [termCover, setTermCover] = useState<number>(userData?.termInsuranceCoverage || 10000000);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const annualIncome = (userData?.monthlyIncome || profile?.monthlyIncome || 85000) * 12;
  const termAdequacyPct = Math.min(100, Math.round((termCover / Math.max(1, annualIncome * 15)) * 100));
  const healthAdequate = healthCover >= 1000000;

  const handleSaveCoverage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.uid) return;
    setIsSaving(true);
    try {
      await updateUserProfile(userData.uid, {
        healthInsuranceCoverage: healthCover,
        termInsuranceCoverage: termCover,
      });
      setIsEditOpen(false);
    } catch (err) {
      console.error('Failed to update insurance cover in Firestore:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const policies = [
    {
      id: 'term',
      type: 'Term Life Cover',
      coverage: formatCompactINR(userData?.termInsuranceCoverage || termCover),
      insurer: 'Tata AIA Private Shield',
      premium: `₹${Math.round(termCover * 0.00015)} / mo`,
      status: 'Active (To age 75)',
      adequacy: `${termAdequacyPct}% of 15x Recommended Annual Inflow`,
      isOptimal: termAdequacyPct >= 80,
    },
    {
      id: 'health',
      type: 'Comprehensive Health Cover',
      coverage: formatCompactINR(userData?.healthInsuranceCoverage || healthCover),
      insurer: 'HDFC ERGO Optima Secure',
      premium: `₹${Math.round(healthCover * 0.0011)} / mo`,
      status: 'Active (Zero Co-pay)',
      adequacy: healthAdequate ? 'Optimal for Tier 1 Private Hospitals' : 'Below recommended ₹10L base',
      isOptimal: healthAdequate,
    },
    {
      id: 'critical',
      type: 'Critical Illness Protection',
      coverage: '₹25.0L',
      insurer: 'Max Bupa Health Companion',
      premium: '₹750 / mo',
      status: 'Active',
      adequacy: '64 Major Critical Conditions Covered',
      isOptimal: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400 font-semibold">
              CAPITAL RESILIENCE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              PROTECTION SCORE: {termAdequacyPct >= 80 && healthAdequate ? '92%' : '78%'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Wealth Protection Vault
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Insulate your loan commitments and family solvency against unforeseen health or life events.
          </p>
        </div>

        {userData?.uid && (
          <button
            onClick={() => setIsEditOpen(true)}
            className="btn-flash px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-200 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Update Coverage</span>
          </button>
        )}
      </div>

      {/* Insurance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {policies.map((pol) => (
          <div
            key={pol.id}
            className="glass-card rounded-2xl p-5 border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-slate-300 uppercase tracking-wide">
                  {pol.type}
                </span>
                {pol.isOptimal ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OPTIMAL
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    REVIEW
                  </span>
                )}
              </div>

              <div className="font-display text-3xl font-extrabold text-white my-2 tracking-tight">
                {pol.coverage}
              </div>

              <div className="text-xs font-semibold text-slate-200">
                {pol.insurer}
              </div>

              <div className="text-[11px] font-mono text-slate-300 mt-1">
                Estimated Premium: {pol.premium}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.05] text-[11px] text-slate-300 space-y-1">
                <div>• Status: {pol.status}</div>
                <div>• {pol.adequacy}</div>
              </div>
            </div>

            <button
              onClick={() => setIsEditOpen(true)}
              className="mt-5 w-full py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-xs font-mono text-slate-200 border border-white/[0.06] transition-colors cursor-pointer"
            >
              Adjust Coverage Amount
            </button>
          </div>
        ))}
      </div>

      {/* Edit Coverage Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-bold text-lg text-white">
                  Update Protection Limits
                </h3>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCoverage} className="py-4 space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between mb-1">
                  <span>Comprehensive Health Insurance</span>
                  <span className="text-emerald-400 font-bold">{formatINR(healthCover)}</span>
                </label>
                <input
                  type="number"
                  min="100000"
                  step="100000"
                  value={healthCover}
                  onChange={(e) => setHealthCover(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between mb-1">
                  <span>Term Life Insurance Coverage</span>
                  <span className="text-amber-300 font-bold">{formatINR(termCover)}</span>
                </label>
                <input
                  type="number"
                  min="500000"
                  step="500000"
                  value={termCover}
                  onChange={(e) => setTermCover(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="btn-flash px-4 py-2 rounded-xl bg-white/[0.04] text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-flash px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  {isSaving ? 'Syncing...' : 'Save to Cloud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

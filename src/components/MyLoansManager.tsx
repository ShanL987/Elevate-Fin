import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Percent, 
  Wallet, 
  ShieldCheck, 
  X,
  ArrowRight,
  TrendingDown,
  ChevronDown
} from 'lucide-react';
import { UserLoan } from '../types';
import { formatINR, calculateEmi } from '../utils/finance';
import { addUserLoan, updateUserLoan, deleteUserLoan } from '../lib/firebase';

interface MyLoansManagerProps {
  uid: string;
  loans: UserLoan[];
  monthlyIncome: number;
}

export const MyLoansManager: React.FC<MyLoansManagerProps> = ({
  uid,
  loans,
  monthlyIncome,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingLoan, setEditingLoan] = useState<UserLoan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form states
  const [lender, setLender] = useState<string>('');
  const [loanType, setLoanType] = useState<UserLoan['type']>('personal');
  const [amount, setAmount] = useState<number>(400000);
  const [rate, setRate] = useState<number>(11.5);
  const [tenure, setTenure] = useState<number>(36);
  const [emi, setEmi] = useState<number>(13187);
  const [status, setStatus] = useState<'active' | 'closed'>('active');
  const [notes, setNotes] = useState<string>('');

  const openAddModal = () => {
    setEditingLoan(null);
    setLender('');
    setLoanType('personal');
    setAmount(400000);
    setRate(11.5);
    setTenure(36);
    setEmi(calculateEmi(400000, 11.5, 36));
    setStatus('active');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (loan: UserLoan) => {
    setEditingLoan(loan);
    setLender(loan.lender);
    setLoanType(loan.type);
    setAmount(loan.amount);
    setRate(loan.interestRate);
    setTenure(loan.tenureMonths);
    setEmi(loan.emi);
    setStatus(loan.status);
    setNotes(loan.notes || '');
    setIsAddModalOpen(true);
  };

  const handleAmountOrRateChange = (newAmt: number, newRate: number, newTenure: number) => {
    setAmount(newAmt);
    setRate(newRate);
    setTenure(newTenure);
    setEmi(calculateEmi(newAmt, newRate, newTenure));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lender.trim()) return;
    setIsSaving(true);
    try {
      if (editingLoan) {
        await updateUserLoan(uid, editingLoan.id, {
          lender: lender.trim(),
          type: loanType,
          amount,
          interestRate: rate,
          tenureMonths: tenure,
          emi,
          status,
          notes: notes.trim(),
        });
      } else {
        await addUserLoan(uid, {
          lender: lender.trim(),
          type: loanType,
          amount,
          interestRate: rate,
          tenureMonths: tenure,
          emi,
          status,
          disbursedDate: new Date().toISOString().split('T')[0],
          notes: notes.trim(),
        });
      }
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to save loan:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteUserLoan(uid, id);
    } catch (err) {
      console.error('Failed to delete loan:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const totalMonthlyEmi = loans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + (Number(l.emi) || 0), 0);

  const totalOutstanding = loans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

  const dti = monthlyIncome > 0 ? Math.round((totalMonthlyEmi / monthlyIncome) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & Add Button */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-white/[0.08] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <h2 className="font-display text-xl font-bold text-white tracking-tight">
                My Loan Portfolio
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {loans.filter((l) => l.status === 'active').length} Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Synchronized with your private Firestore record. Changes immediately update your live Financial Health Score.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="btn-flash px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Loan</span>
          </button>
        </div>

        {/* Aggregate Mini Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/[0.06]">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Monthly EMI</span>
            <span className="text-lg sm:text-xl font-display font-bold text-emerald-400">
              {formatINR(totalMonthlyEmi)}
              <span className="text-[10px] text-slate-400 font-mono font-normal ml-1">/mo</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Outstanding Debt</span>
            <span className="text-lg sm:text-xl font-display font-bold text-white">
              {formatINR(totalOutstanding)}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Debt-to-Income (DTI)</span>
            <span className={`text-lg sm:text-xl font-display font-bold ${
              dti > 45 ? 'text-red-400' : dti > 35 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {dti}%
              <span className="text-[10px] text-slate-400 font-mono font-normal ml-1">
                ({dti > 45 ? 'Danger' : dti > 35 ? 'Moderate' : 'Safe'})
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Loans Cards List */}
      {loans.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 border border-white/[0.07] text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No active loans registered</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your debt ratio is currently 0%. Add your existing commitments or explore curated institutional loan offers below.
          </p>
          <button
            onClick={openAddModal}
            className="btn-flash inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add My First Loan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className="glass-card rounded-2xl p-5 border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{loan.lender}</h4>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {loan.type} loan
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    loan.status === 'active' 
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-white/[0.05] text-slate-400 border border-white/[0.08]'
                  }`}>
                    {loan.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/[0.05] text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">MONTHLY EMI</span>
                    <span className="text-emerald-400 font-bold text-base">{formatINR(loan.emi)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">PRINCIPAL</span>
                    <span className="text-white font-semibold">{formatINR(loan.amount)}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-500 text-[10px] block">INTEREST RATE</span>
                    <span className="text-slate-200">{loan.interestRate}% p.a.</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-500 text-[10px] block">TENURE</span>
                    <span className="text-slate-200">{loan.tenureMonths} Months</span>
                  </div>
                </div>

                {loan.notes && (
                  <p className="text-[11px] text-slate-400 italic mt-3 line-clamp-1">
                    "{loan.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <span className="text-[10px] font-mono text-slate-500">
                  {loan.disbursedDate ? `Disbursed ${loan.disbursedDate}` : 'Tracked'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(loan)}
                    className="btn-flash p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Loan"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(loan.id)}
                    disabled={deletingId === loan.id}
                    className="btn-flash p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
                    title="Delete Loan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT LOAN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-bold text-lg text-white">
                  {editingLoan ? 'Edit Loan Commitment' : 'Add Loan to Portfolio'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Lender / Financial Institution</label>
                <input
                  type="text"
                  required
                  value={lender}
                  onChange={(e) => setLender(e.target.value)}
                  placeholder="e.g. HDFC Bank, SBI, ICICI, Bajaj Finserv"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Loan Type</label>
                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1420] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="personal">Personal Loan</option>
                    <option value="home">Home Loan</option>
                    <option value="auto">Auto Loan</option>
                    <option value="education">Education Loan</option>
                    <option value="business">Business Loan</option>
                    <option value="other">Other Debt</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1420] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="active">Active (Current)</option>
                    <option value="closed">Closed / Paid Off</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Principal Amount (₹)</label>
                  <input
                    type="number"
                    min="1000"
                    step="10000"
                    value={amount}
                    onChange={(e) => handleAmountOrRateChange(Number(e.target.value), rate, tenure)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="45"
                    value={rate}
                    onChange={(e) => handleAmountOrRateChange(amount, Number(e.target.value), tenure)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    min="3"
                    max="360"
                    value={tenure}
                    onChange={(e) => handleAmountOrRateChange(amount, rate, Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    value={emi}
                    onChange={(e) => setEmi(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Notes / Identifier (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Account #4829, fixed rate tranche"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-flash px-4 py-2 rounded-xl bg-white/[0.04] text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-flash px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  {isSaving ? 'Saving...' : editingLoan ? 'Update Loan' : 'Save Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

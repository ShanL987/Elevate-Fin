import React, { useState } from 'react';
import { 
  X, 
  Save, 
  UserCheck, 
  LogOut, 
  Mail, 
  Wallet, 
  ShieldCheck, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { UserFinancialData, FinancialProfile } from '../types';
import { formatINR } from '../utils/finance';
import { updateUserProfile } from '../lib/firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserFinancialData | null;
  profile?: FinancialProfile;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
  profile,
  onLogout,
}) => {
  const [name, setName] = useState<string>(userData?.name || profile?.clientName || 'Private Client');
  const [income, setIncome] = useState<number>(userData?.monthlyIncome || profile?.monthlyIncome || 85000);
  const [expenses, setExpenses] = useState<number>(userData?.monthlyExpenses || 38000);
  const [essentialExpenses, setEssentialExpenses] = useState<number>(userData?.essentialExpenses || Math.round((userData?.monthlyExpenses || 38000) * 0.65));
  const [discretionaryExpenses, setDiscretionaryExpenses] = useState<number>(userData?.discretionaryExpenses || Math.round((userData?.monthlyExpenses || 38000) * 0.35));
  const [savings, setSavings] = useState<number>(userData?.savings || profile?.liquidSavings || 280000);
  const [investments, setInvestments] = useState<number>(userData?.investments || 150000);
  const [creditScore, setCreditScore] = useState<number>(userData?.creditScore || profile?.creditScore || 785);
  const [healthInsurance, setHealthInsurance] = useState<number>(userData?.healthInsuranceCoverage || 1000000);
  const [termInsurance, setTermInsurance] = useState<number>(userData?.termInsuranceCoverage || 10000000);

  // Sync inputs if userData or profile arrives or changes
  React.useEffect(() => {
    if (userData?.name || profile?.clientName) setName(userData?.name || profile?.clientName || 'Private Client');
    if (userData?.monthlyIncome || profile?.monthlyIncome) setIncome(userData?.monthlyIncome || profile?.monthlyIncome || 85000);
    if (userData?.monthlyExpenses) {
      setExpenses(userData.monthlyExpenses);
      setEssentialExpenses(userData.essentialExpenses || Math.round(userData.monthlyExpenses * 0.65));
      setDiscretionaryExpenses(userData.discretionaryExpenses || Math.round(userData.monthlyExpenses * 0.35));
    }
    if (userData?.savings || profile?.liquidSavings) setSavings(userData?.savings || profile?.liquidSavings || 280000);
    if (userData?.investments) setInvestments(userData.investments);
    if (userData?.creditScore || profile?.creditScore) setCreditScore(userData?.creditScore || profile?.creditScore || 785);
    if (userData?.healthInsuranceCoverage) setHealthInsurance(userData.healthInsuranceCoverage);
    if (userData?.termInsuranceCoverage) setTermInsurance(userData.termInsuranceCoverage);
  }, [userData, profile]);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.uid) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateUserProfile(userData.uid, {
        name: name.trim() || 'Private Client',
        monthlyIncome: income,
        monthlyExpenses: expenses,
        essentialExpenses,
        discretionaryExpenses,
        savings,
        investments,
        creditScore,
        healthInsuranceCoverage: healthInsurance,
        termInsuranceCoverage: termInsurance,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to update user profile in Firestore:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (name || 'Private Client')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="glass-card w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Client Profile & Financial Vault
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Encrypted Account Credentials & Live Baselines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity Snapshot */}
        <div className="py-4 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5">
            {userData?.photoURL ? (
              <img
                src={userData.photoURL}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-sm font-bold font-mono">
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-white">{name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {userData?.provider === 'google' ? 'Google Authenticated' : 'Private Password Auth'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                <Mail className="w-3 h-3 text-slate-500" />
                <span>{userData?.email || 'Authenticated Account'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="btn-flash flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-mono transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Form to Edit Name & Financial Parameters */}
        <form onSubmit={handleSave} className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          
          {/* Edit Legal Name */}
          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              Legal Name (Display Name)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-medium"
            />
          </div>

          {/* Financial Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Monthly Inflow / Income (₹)
              </label>
              <input
                type="number"
                min="10000"
                step="5000"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Total Monthly Living Expenses (₹)
              </label>
              <input
                type="number"
                min="0"
                step="2000"
                value={expenses}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setExpenses(val);
                  setEssentialExpenses(Math.round(val * 0.65));
                  setDiscretionaryExpenses(Math.round(val * 0.35));
                }}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Essential Living Outflow (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={essentialExpenses}
                onChange={(e) => setEssentialExpenses(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                placeholder="Rent, utilities, groceries"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Discretionary Lifestyle Outflow (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={discretionaryExpenses}
                onChange={(e) => setDiscretionaryExpenses(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                placeholder="Dining, leisure, subscriptions"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Liquid Emergency Savings (₹)
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={savings}
                onChange={(e) => setSavings(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Investments Portfolio (₹)
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={investments}
                onChange={(e) => setInvestments(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Bureau Credit Score (300-900)
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

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Health Insurance Coverage (₹)
              </label>
              <input
                type="number"
                min="0"
                step="100000"
                value={healthInsurance}
                onChange={(e) => setHealthInsurance(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Term Life Insurance Coverage (₹)
              </label>
              <input
                type="number"
                min="0"
                step="500000"
                value={termInsurance}
                onChange={(e) => setTermInsurance(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-flash px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-mono cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-flash px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved to Cloud!</span>
                </>
              ) : isSaving ? (
                <span>Syncing Cloud...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Check, 
  Save, 
  ShieldAlert, 
  Calendar, 
  CreditCard, 
  TrendingDown, 
  Landmark,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { NotificationPreferences } from '../types';
import { updateNotificationPreferences, getNotificationPreferences } from '../lib/firebase';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  userEmail?: string;
  onPreferencesUpdated?: (prefs: NotificationPreferences) => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  uid,
  userEmail,
  onPreferencesUpdated,
}) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    weeklyCheckin: true,
    dangerZoneAlerts: true,
    spendingAlerts: true,
    creditAlerts: true,
    loanEmiAlerts: true,
    emailAddress: userEmail || '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && uid) {
      setIsLoading(true);
      getNotificationPreferences(uid)
        .then((data) => {
          setPrefs((prev) => ({
            ...prev,
            ...data,
            emailAddress: data.emailAddress || userEmail || prev.emailAddress,
          }));
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, uid, userEmail]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof Omit<NotificationPreferences, 'emailAddress' | 'updatedAt'>) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;

    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await updateNotificationPreferences(uid, prefs);
      setSavedSuccess(true);
      onPreferencesUpdated?.(prefs);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to update notification preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Notification & Alert Controls
              </h3>
              <p className="text-xs text-slate-400">
                Proactive intelligence triggers & email frequency rules
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

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          {/* Email destination input */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Primary Alert Destination</span>
            </label>
            <input
              type="email"
              value={prefs.emailAddress || ''}
              onChange={(e) => setPrefs({ ...prefs, emailAddress: e.target.value })}
              placeholder="client@elevate.internal"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
            <span className="text-[10px] text-slate-500 block">
              Dispatched via configured transactional SMTP relay or encrypted in-app audit vault.
            </span>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-2.5">
            {/* Weekly Check-In */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Weekly Financial Check-In
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Comprehensive 7-day health telemetry, score movements, and 1 priority action.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('weeklyCheckin')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border border-transparent ${
                  prefs.weeklyCheckin ? 'bg-emerald-500' : 'bg-white/[0.1]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    prefs.weeklyCheckin ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Danger Zone Alerts */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Danger Zone Solvency Alerts
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Urgent notification when financial state enters Danger Zone or stays for 7+ days.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('dangerZoneAlerts')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border border-transparent ${
                  prefs.dangerZoneAlerts ? 'bg-emerald-500' : 'bg-white/[0.1]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    prefs.dangerZoneAlerts ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* High Discretionary Spending */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Spending Volatility Warnings
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Alerts when discretionary spending exceeds 35% of monthly verified cash flow.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('spendingAlerts')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border border-transparent ${
                  prefs.spendingAlerts ? 'bg-emerald-500' : 'bg-white/[0.1]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    prefs.spendingAlerts ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Credit Score Bureau Monitoring */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Credit Rating & Bureau Telemetry
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Notifies when DTI or utilization shifts credit bureau standing.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('creditAlerts')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border border-transparent ${
                  prefs.creditAlerts ? 'bg-emerald-500' : 'bg-white/[0.1]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    prefs.creditAlerts ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Loan EMI Due Reminders */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Landmark className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Institutional Debt Due Reminders
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Advance notice 3 days prior to loan auto-debit dates to maintain 100% on-time metric.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('loanEmiAlerts')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border border-transparent ${
                  prefs.loanEmiAlerts ? 'bg-emerald-500' : 'bg-white/[0.1]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    prefs.loanEmiAlerts ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-flash flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

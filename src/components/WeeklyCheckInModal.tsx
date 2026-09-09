import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  ExternalLink,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { HealthEvaluationResult } from '../utils/healthEngine';
import { formatINR } from '../utils/finance';
import { saveNotificationRecord } from '../lib/firebase';
import { NotificationRecord } from '../types';

interface WeeklyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: HealthEvaluationResult;
  userEmail: string;
  userName: string;
  uid: string;
  onNotificationSaved?: (record: NotificationRecord) => void;
}

export const WeeklyCheckInModal: React.FC<WeeklyCheckInModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  userEmail,
  userName,
  uid,
  onNotificationSaved,
}) => {
  const [recipientEmail, setRecipientEmail] = useState<string>(userEmail || '');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    deliveredVia: 'smtp' | 'audit_log';
    message: string;
  } | null>(null);

  const [activeView, setActiveView] = useState<'summary' | 'email_preview'>('summary');
  const [previewHtml, setPreviewHtml] = useState<string>('');

  React.useEffect(() => {
    if (userEmail) setRecipientEmail(userEmail);
  }, [userEmail]);

  if (!isOpen) return null;

  const isDanger = evaluation.status === 'DANGER';
  const isWatch = evaluation.status === 'WATCH';
  const statusColor = isDanger ? '#ef4444' : isWatch ? '#f59e0b' : '#10b981';

  const handleSendCheckin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!recipientEmail) return;

    setIsSending(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/notifications/send-weekly-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: recipientEmail.trim(),
          userName,
          metrics: evaluation,
          forceSend: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSendResult({
          success: true,
          deliveredVia: data.deliveredVia,
          message: data.message,
        });
        if (data.htmlPreview) {
          setPreviewHtml(data.htmlPreview);
        }

        // Persist notification record in Firestore
        if (uid && data.notificationRecord) {
          try {
            await saveNotificationRecord(uid, {
              type: 'weekly_checkin',
              title: 'Weekly Financial Check-In',
              message: `Weekly telemetry check-in dispatched for ${evaluation.status} status (Score: ${evaluation.healthScore}/100).`,
              financialStatus: evaluation.status,
              emailSent: data.emailSent,
              emailTo: recipientEmail.trim(),
              deliveredVia: data.deliveredVia,
              createdAt: new Date().toISOString(),
              status: 'sent',
            });
            onNotificationSaved?.({
              id: 'local-' + Date.now(),
              type: 'weekly_checkin',
              title: 'Weekly Financial Check-In',
              message: `Weekly telemetry check-in dispatched for ${evaluation.status} status.`,
              financialStatus: evaluation.status,
              emailSent: data.emailSent,
              emailTo: recipientEmail.trim(),
              deliveredVia: data.deliveredVia,
              createdAt: new Date().toISOString(),
              status: 'sent',
            });
          } catch (fireErr) {
            console.warn('Could not save notification to Firestore:', fireErr);
          }
        }
      } else {
        setSendResult({
          success: false,
          deliveredVia: 'audit_log',
          message: data.error || 'Failed to dispatch weekly check-in.',
        });
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        deliveredVia: 'audit_log',
        message: err.message || 'Network error occurred while dispatching check-in.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="glass-card w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                Weekly Financial Check-In
                <span 
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                  style={{
                    color: statusColor,
                    backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.15)' : isWatch ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    border: `1px solid ${statusColor}40`,
                  }}
                >
                  {isDanger ? `Danger · ${evaluation.dangerDurationDays}d` : evaluation.status}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated 7-day risk audit & transactional email dispatch
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

        {/* Tab switcher: Summary vs HTML Email Preview */}
        <div className="flex items-center gap-2 pt-4 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('summary')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'summary' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            Telemetry Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveView('email_preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'email_preview' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Email Template Preview
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4">
          {activeView === 'summary' ? (
            <>
              {/* Financial Health Status Hero */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    CURRENT SCORE & STATUS
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-display font-extrabold" style={{ color: statusColor }}>
                      {evaluation.healthScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                    {evaluation.scoreDelta !== undefined && evaluation.scoreDelta !== 0 && (
                      <span className={`text-xs font-mono font-semibold ${evaluation.scoreDelta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ({evaluation.scoreDelta > 0 ? `+${evaluation.scoreDelta}` : evaluation.scoreDelta} pts this week)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    STATUS DURATION
                  </span>
                  <div className="text-sm font-bold text-white mt-1">
                    {isDanger ? (
                      <span className="text-red-400 flex items-center justify-end gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        Danger Zone · {evaluation.dangerDurationDays} {evaluation.dangerDurationDays === 1 ? 'day' : 'days'}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-mono">
                        Healthy & Stable
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cash Flow Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 block">MONTHLY INCOME</span>
                  <span className="text-sm font-bold text-white block mt-1">
                    {formatINR(evaluation.monthlyIncome)}
                  </span>
                  <span className="text-[10px] text-slate-500">Verified cash inflow</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 block">TOTAL EXPENSES</span>
                  <span className="text-sm font-bold text-white block mt-1">
                    {formatINR(evaluation.monthlyExpenses)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ₹{formatINR(evaluation.essentialExpenses)} essential
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 block">MONTHLY EMI</span>
                  <span className="text-sm font-bold text-white block mt-1">
                    {formatINR(evaluation.monthlyEMI)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    DTI: {evaluation.DTI}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 block">FREE CASH</span>
                  <span className={`text-sm font-bold block mt-1 ${evaluation.freeCash < 5000 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {formatINR(evaluation.freeCash)}
                  </span>
                  <span className="text-[10px] text-slate-500">Net monthly surplus</span>
                </div>
              </div>

              {/* Major Risk Factors & Key Observations */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold block">
                  AUDIT OBSERVATIONS & RISK TELEMETRY
                </span>
                <ul className="space-y-1.5">
                  {evaluation.majorRiskFactors.map((factor, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Single Top Recommended Action for This Week */}
              <div className="p-3.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/25 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold block">
                  RECOMMENDED THIS WEEK
                </span>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  {evaluation.recommendedActions[0] || 'Maintain current debt service cadence and build your liquid buffer.'}
                </p>
              </div>
            </>
          ) : (
            /* HTML Email Live Preview */
            <div className="rounded-xl border border-white/[0.1] bg-[#070a10] p-4 text-xs font-mono overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <span className="text-[11px] text-slate-400">
                  Transactional Email Template (ELEVATE Brand)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Responsive HTML
                </span>
              </div>
              <div 
                className="bg-[#0d121d] rounded-xl p-4 max-h-[360px] overflow-y-auto text-slate-200 font-sans shadow-inner border border-white/[0.06]"
                dangerouslySetInnerHTML={{
                  __html: previewHtml || `
                    <div style="text-align: center; padding: 24px; color: #94a3b8;">
                      <p style="font-size: 14px; margin-bottom: 8px; font-weight: 600; color: #f8fafc;">Click "Send Check-In Now" below to compile and dispatch the live transactional email.</p>
                      <p style="font-size: 12px; color: #64748b;">The email template features dark luxury styling, current health scores, DTI analytics, free cash breakdown, and one priority tactical action.</p>
                    </div>
                  `
                }}
              />
            </div>
          )}

          {/* Recipient Form & Action */}
          <form onSubmit={handleSendCheckin} className="pt-2 border-t border-white/[0.08] space-y-3">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Recipient Email Address
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSending || !recipientEmail}
                  className="btn-flash flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Dispatching...' : 'Send Check-In Now'}</span>
                </button>
              </div>
            </div>

            {/* Delivery Feedback Banner */}
            {sendResult && (
              <div 
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-fade-in ${
                  sendResult.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                    : 'bg-red-500/10 border-red-500/30 text-red-200'
                }`}
              >
                {sendResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block">
                    {sendResult.deliveredVia === 'smtp' 
                      ? 'Email Sent via SMTP' 
                      : 'Recorded in Encrypted Audit Log'}
                  </span>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    {sendResult.message}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

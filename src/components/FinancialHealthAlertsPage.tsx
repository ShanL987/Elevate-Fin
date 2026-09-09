import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  Mail, 
  Sliders, 
  RefreshCw, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ExternalLink,
  ChevronRight,
  UserCheck,
  Send
} from 'lucide-react';
import { 
  UserFinancialData, 
  UserLoan, 
  FinancialHealthSnapshot, 
  NotificationRecord,
  NotificationPreferences 
} from '../types';
import { evaluateFinancialHealth, HealthEvaluationResult } from '../utils/healthEngine';
import { formatINR } from '../utils/finance';
import { 
  saveFinancialHealthSnapshot, 
  subscribeToFinancialHealthSnapshots,
  subscribeToNotifications,
  saveNotificationRecord,
  updateUserProfile
} from '../lib/firebase';
import { WeeklyCheckInModal } from './WeeklyCheckInModal';
import { NotificationPreferencesModal } from './NotificationPreferencesModal';

interface FinancialHealthAlertsPageProps {
  userData: UserFinancialData | null;
  loans: UserLoan[];
  uid: string;
  onNavigateToPlanner: (e?: React.MouseEvent) => void;
  onOpenProfile: () => void;
}

export const FinancialHealthAlertsPage: React.FC<FinancialHealthAlertsPageProps> = ({
  userData,
  loans,
  uid,
  onNavigateToPlanner,
  onOpenProfile,
}) => {
  const [snapshots, setSnapshots] = useState<FinancialHealthSnapshot[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState<boolean>(false);
  const [isPrefsModalOpen, setIsPrefsModalOpen] = useState<boolean>(false);

  // AI Explanation State
  const [aiExplanation, setAiExplanation] = useState<{
    summary: string;
    riskFactors: string[];
    recommendedActions: string[];
    severity: string;
    generatedAt?: string;
  } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState<boolean>(false);
  const [snapshotSavedFeedback, setSnapshotSavedFeedback] = useState<boolean>(false);

  // Subscribe to real Firestore subcollections for the authenticated user
  useEffect(() => {
    if (!uid) return;

    const unsubSnapshots = subscribeToFinancialHealthSnapshots(uid, (data) => {
      setSnapshots(data);
    });

    const unsubNotifications = subscribeToNotifications(uid, (data) => {
      setNotifications(data);
    });

    return () => {
      unsubSnapshots();
      unsubNotifications();
    };
  }, [uid]);

  // Deterministic evaluation from real user records
  const evaluation: HealthEvaluationResult = evaluateFinancialHealth(userData, loans, snapshots);

  // Synchronize dangerZoneStartDate with user profile if newly entered or exited danger
  useEffect(() => {
    if (!uid || !userData) return;

    if (evaluation.status === 'DANGER' && !userData.dangerZoneStartDate) {
      // Record danger zone start timestamp
      const startDate = new Date().toISOString();
      updateUserProfile(uid, {
        dangerZoneStartDate: startDate,
        lastHealthStatus: 'DANGER',
      }).catch(console.error);
    } else if (evaluation.status !== 'DANGER' && userData.dangerZoneStartDate) {
      // Clear danger zone start date upon recovery
      updateUserProfile(uid, {
        dangerZoneStartDate: null,
        lastHealthStatus: evaluation.status,
      }).catch(console.error);
    }
  }, [uid, evaluation.status, userData?.dangerZoneStartDate]);

  // Fetch AI quantitative explanation on mount or evaluation change
  const fetchAiExplanation = async () => {
    if (evaluation.hasInsufficientData) return;
    setIsLoadingAi(true);

    try {
      const response = await fetch('/api/financial-health/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: evaluation,
          previousMetrics: snapshots.length > 0 ? snapshots[0] : null,
          userName: userData?.name || 'Private Client',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiExplanation(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI health explanation:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAiExplanation();
  }, [evaluation.status, evaluation.healthScore, evaluation.freeCash]);

  // Manually take and persist a snapshot to Firestore
  const handleTakeSnapshot = async () => {
    if (!uid || evaluation.hasInsufficientData) return;
    setIsSavingSnapshot(true);
    setSnapshotSavedFeedback(false);

    try {
      await saveFinancialHealthSnapshot(uid, {
        timestamp: new Date().toISOString(),
        financialHealthScore: evaluation.healthScore,
        status: evaluation.status,
        monthlyIncome: evaluation.monthlyIncome,
        monthlyExpenses: evaluation.monthlyExpenses,
        essentialExpenses: evaluation.essentialExpenses,
        discretionaryExpenses: evaluation.discretionaryExpenses,
        monthlyEMI: evaluation.monthlyEMI,
        freeCash: evaluation.freeCash,
        recommendedBuffer: evaluation.recommendedBuffer,
        emergencyBuffer: evaluation.emergencyBuffer,
        emergencyBufferMonths: evaluation.emergencyBufferMonths,
        DTI: evaluation.DTI,
        savingsRate: evaluation.savingsRate,
        dangerDurationDays: evaluation.dangerDurationDays,
        dangerZoneStartDate: evaluation.dangerZoneStartDate,
        majorRiskFactors: evaluation.majorRiskFactors,
        recommendedActions: evaluation.recommendedActions,
        aiExplanation: aiExplanation ? {
          summary: aiExplanation.summary,
          riskFactors: aiExplanation.riskFactors,
          recommendedActions: aiExplanation.recommendedActions,
          severity: aiExplanation.severity as any,
          generatedAt: new Date().toISOString(),
        } : undefined,
      });

      setSnapshotSavedFeedback(true);
      setTimeout(() => setSnapshotSavedFeedback(false), 2500);
    } catch (err) {
      console.error('Error saving snapshot:', err);
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  const isDanger = evaluation.status === 'DANGER';
  const isWatch = evaluation.status === 'WATCH';
  const statusColor = isDanger ? '#ef4444' : isWatch ? '#f59e0b' : '#10b981';
  const statusBadgeBg = isDanger ? 'rgba(239, 68, 68, 0.15)' : isWatch ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
  const statusBorder = isDanger ? 'border-red-500/40' : isWatch ? 'border-amber-500/40' : 'border-emerald-500/30';

  // 1. Insufficient Data State
  if (evaluation.hasInsufficientData) {
    return (
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto select-none">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-white/10 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">
            Insufficient Financial Telemetry
          </h2>
          <p className="text-slate-300 max-w-md mx-auto text-sm leading-relaxed mb-6">
            Add more financial information to activate accurate financial monitoring, solvency alerts, and automated weekly check-ins.
          </p>
          <button
            onClick={onOpenProfile}
            className="btn-flash inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Complete Financial Profile</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto select-none pb-12">
      {/* Top Header & Fast Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400 font-semibold">
              PROACTIVE INTELLIGENCE LAYER
            </span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-[11px] font-mono text-slate-400">
              Monitor &rarr; Detect &rarr; Explain &rarr; Recommend &rarr; Improve
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1 flex items-center gap-3">
            Financial Health Alerts
            <span 
              className="text-xs font-mono px-3 py-1 rounded-full font-bold uppercase tracking-wider"
              style={{
                color: statusColor,
                backgroundColor: statusBadgeBg,
                border: `1px solid ${statusColor}50`,
              }}
            >
              {isDanger ? `Danger Zone · ${evaluation.dangerDurationDays} Days` : evaluation.status}
            </span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Notification Preferences */}
          <button
            onClick={() => setIsPrefsModalOpen(true)}
            className="btn-flash flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Notification & Frequency Settings"
          >
            <Bell className="w-3.5 h-3.5 text-slate-400" />
            <span>Preferences</span>
          </button>

          {/* Weekly Check-In Dispatch */}
          <button
            onClick={() => setIsCheckInModalOpen(true)}
            className="btn-flash flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>Weekly Check-In</span>
          </button>

          {/* Sync Snapshot Now */}
          <button
            onClick={handleTakeSnapshot}
            disabled={isSavingSnapshot}
            className="btn-flash flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSavingSnapshot ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span>{snapshotSavedFeedback ? 'Snapshot Saved!' : isSavingSnapshot ? 'Syncing...' : 'Save Snapshot'}</span>
          </button>
        </div>
      </div>

      {/* Hero Current Status Card */}
      <div 
        className={`glass-card rounded-3xl p-6 sm:p-8 border relative overflow-hidden transition-all shadow-[0_20px_60px_rgba(0,0,0,0.8)] ${
          isDanger 
            ? 'border-red-500/50 glow-danger-red bg-gradient-to-b from-red-950/20 via-[#0d1017] to-[#07090e]' 
            : isWatch 
            ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/20 via-[#0d1017] to-[#07090e]'
            : 'border-emerald-500/30 bg-gradient-to-b from-emerald-950/15 via-[#0d1017] to-[#07090e]'
        }`}
      >
        {/* Glossy top edge highlight */}
        <div 
          className="absolute inset-x-0 top-0 h-[1px]" 
          style={{ 
            background: isDanger 
              ? 'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.7), transparent)' 
              : isWatch 
              ? 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.6), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.5), transparent)' 
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Status Badge & Score Hero (Left 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-2 mb-3">
              {isDanger ? (
                <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              ) : isWatch ? (
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}

              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 font-semibold block">
                  FINANCIAL HEALTH STATUS
                </span>
                <span className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                  {isDanger ? 'DANGER ZONE' : isWatch ? 'WATCH ZONE' : 'HEALTHY STATE'}
                </span>
              </div>
            </div>

            {/* Status Duration Pill */}
            <div className="my-2">
              {isDanger ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-xs font-semibold animate-danger-pulse">
                  <Clock className="w-3.5 h-3.5 text-red-400" />
                  <span>Continuous in Danger Zone: {evaluation.dangerDurationDays} {evaluation.dangerDurationDays === 1 ? 'Day' : 'Days'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Status: Prudent Safety Buffer</span>
                </div>
              )}
            </div>

            {/* Large Health Score */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-display font-black tracking-tight" style={{ color: statusColor }}>
                {evaluation.healthScore}
              </span>
              <div>
                <span className="text-sm font-semibold text-slate-400 block">/ 100</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {isDanger ? 'High Risk Tier' : isWatch ? 'Cautionary Tier' : 'Prime Solvency Tier'}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-300 mt-2 max-w-sm">
              {isDanger 
                ? 'Elevated debt obligations or thin liquid reserves have crossed institutional warning thresholds.' 
                : isWatch
                ? 'Approaching prudent debt or expense limits. Review cash burn to preserve Prime standing.'
                : 'Your monthly income, low debt obligations, and savings runway easily absorb financial shocks.'}
            </p>
          </div>

          {/* 4-Cell Telemetry Metric Cards (Right 7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free Cash vs Recommended Buffer */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/20 transition-all">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>MONTHLY FREE CASH</span>
                <span className={evaluation.freeCash < 5000 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {formatINR(evaluation.freeCash)}
                </span>
              </div>
              <div className="text-lg font-display font-bold text-white mb-2">
                {formatINR(evaluation.freeCash)}
              </div>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full ${evaluation.freeCash < 5000 ? 'bg-red-500' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min(100, Math.max(5, (evaluation.freeCash / Math.max(1000, evaluation.monthlyIncome)) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Rec. Buffer: {formatINR(evaluation.recommendedBuffer / 6)}/mo</span>
                <span className={evaluation.freeCash < 5000 ? 'text-red-400' : 'text-slate-400'}>
                  {evaluation.freeCash < 5000 ? 'Deficit Warning' : 'Healthy Cushion'}
                </span>
              </div>
            </div>

            {/* Debt-to-Income (DTI) */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/20 transition-all">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>DEBT-TO-INCOME (DTI)</span>
                <span className={evaluation.DTI > 45 ? 'text-red-400 font-bold' : evaluation.DTI > 35 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {evaluation.DTI}%
                </span>
              </div>
              <div className="text-lg font-display font-bold text-white mb-2">
                {evaluation.DTI}%
              </div>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full ${evaluation.DTI > 45 ? 'bg-red-500' : evaluation.DTI > 35 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min(100, evaluation.DTI)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Safe: &le; 35%</span>
                <span className={evaluation.DTI > 45 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                  Danger: &gt; 45%
                </span>
              </div>
            </div>

            {/* Emergency Reserve Runway */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/20 transition-all">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>EMERGENCY RUNWAY</span>
                <span className={evaluation.emergencyBufferMonths < 3.0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {evaluation.emergencyBufferMonths} Mos
                </span>
              </div>
              <div className="text-lg font-display font-bold text-white mb-2">
                {formatINR(evaluation.emergencyBuffer)}
              </div>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full ${evaluation.emergencyBufferMonths < 3.0 ? 'bg-red-500' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min(100, (evaluation.emergencyBufferMonths / 6) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Burn: {formatINR(evaluation.monthlyExpenses + evaluation.monthlyEMI)}/mo</span>
                <span>Rec: &ge; 6.0 Mos</span>
              </div>
            </div>

            {/* Active Monthly EMI Obligations */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/20 transition-all">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>RECURRING DEBT OBLIGATIONS</span>
                <span className="text-white font-bold">{loans.filter(l => l.status === 'active').length} Loans</span>
              </div>
              <div className="text-lg font-display font-bold text-white mb-2">
                {formatINR(evaluation.monthlyEMI)}/mo
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-3">
                <button
                  onClick={onNavigateToPlanner}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <span>Simulate Prepayment in Planner</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Section: Why You're In Danger (Risk Factors) & Recommended Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Why Status is Danger / Risk Factors */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  {isDanger ? "Why You're in the Danger Zone" : isWatch ? "Key Prudence Drivers" : "Solvency Baseline Strengths"}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Quantitative risk factors detected from Firestore records
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {evaluation.majorRiskFactors.map((factor, index) => (
              <div 
                key={index}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-400 shrink-0 mt-1.5 shadow-[0_0_6px_#ef4444]" />
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {factor}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Concrete Calculated Recommended Actions */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  High-Impact Recovery Actions
                </h3>
                <p className="text-[11px] text-slate-400">
                  Targeted moves to elevate solvency and lower risk tier
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {evaluation.recommendedActions.map((action, index) => (
              <div 
                key={index}
                className="p-3.5 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-sans">
                    {action}
                  </p>
                </div>
              </div>
            ))}

            {/* Fast Action Navigation Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenProfile}
                className="btn-flash text-xs px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Adjust Monthly Budget in Profile</span>
              </button>
              <button
                onClick={onNavigateToPlanner}
                className="btn-flash text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate Debt Amortization</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Financial Intelligence Layer (Gemini Explanation) */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                Quantitative AI Solvency Diagnosis
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Gemini Flash
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Grounded explanation of calculated health status, key deltas, and strategic outlook
              </p>
            </div>
          </div>

          <button
            onClick={fetchAiExplanation}
            disabled={isLoadingAi}
            className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh AI Analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>

        {isLoadingAi ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <p className="text-xs font-mono text-slate-400">
              Synthesizing quantitative balance sheet telemetry with Gemini...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-950/10 border border-purple-500/20 text-xs text-purple-100/90 leading-relaxed font-sans">
              {aiExplanation?.summary || (
                `Your current verified income and liabilities evaluate to ${evaluation.status} status. Debt service burden stands at ${evaluation.DTI}% with ${evaluation.emergencyBufferMonths} months of liquid reserve runway.`
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
              <span>Grounding: Deterministic application figures only</span>
              <span>Educational and institutional guidance purpose</span>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Financial Check-In Hub Section */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Weekly Financial Check-In Hub
              </h3>
              <p className="text-xs text-slate-400">
                Automated 7-day personal report dispatched directly to your verified inbox
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCheckInModalOpen(true)}
              className="btn-flash flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Preview & Dispatch Report</span>
            </button>
          </div>
        </div>

        {/* 3-Column Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Score & Trend */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              1. HEALTH STANDING
            </span>
            <div className="text-2xl font-display font-extrabold text-white">
              {evaluation.healthScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
            <p className="text-xs text-slate-300">
              Status: <strong style={{ color: statusColor }}>{evaluation.status}</strong>
              {evaluation.dangerDurationDays > 0 && ` (${evaluation.dangerDurationDays} days in danger)`}
            </p>
          </div>

          {/* Card 2: Free Cash Flow Delta */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              2. FREE CASH FLOW VELOCITY
            </span>
            <div className="text-2xl font-display font-extrabold text-white">
              {formatINR(evaluation.freeCash)}
            </div>
            <p className="text-xs text-slate-300">
              Net surplus after essential living and loan EMIs.
            </p>
          </div>

          {/* Card 3: Priority Recommendation */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold">
              3. PRIORITY FOR THIS WEEK
            </span>
            <p className="text-xs text-slate-200 leading-relaxed line-clamp-2">
              {evaluation.recommendedActions[0] || 'Maintain current debt service cadence.'}
            </p>
          </div>
        </div>
      </div>

      {/* Snapshot History & Notification Dispatch Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subcollection 1: Historical Snapshots */}
        <div className="glass-card rounded-3xl p-6 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <span>Financial Health Snapshots Vault</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400">
                {snapshots.length} Records
              </span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-400">
              Firestore Encrypted
            </span>
          </div>

          {snapshots.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 font-mono">
              No historical snapshots saved yet. Click "Save Snapshot" above to register your initial record.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {snapshots.slice(0, 8).map((snap) => (
                <div 
                  key={snap.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ 
                        backgroundColor: snap.status === 'DANGER' ? '#ef4444' : snap.status === 'WATCH' ? '#f59e0b' : '#10b981' 
                      }} 
                    />
                    <div>
                      <span className="font-semibold text-white block">
                        Score: {snap.financialHealthScore}/100 ({snap.status})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(snap.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px]">
                    <span className="text-slate-300 block">Free Cash: {formatINR(snap.freeCash)}</span>
                    <span className="text-slate-500">DTI: {snap.DTI}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subcollection 2: Notifications & Dispatch Audit Log */}
        <div className="glass-card rounded-3xl p-6 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <span>Notification & Email Audit Log</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400">
                {notifications.length} Logs
              </span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-400">
              Anti-Spam Enforced
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 font-mono">
              No notifications dispatched yet. Use "Weekly Check-In" to test report generation.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {notifications.slice(0, 8).map((notif) => (
                <div 
                  key={notif.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">
                        {notif.title}
                      </span>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(notif.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span 
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold ${
                        notif.deliveredVia === 'smtp' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-white/[0.06] text-slate-300 border border-white/[0.08]'
                      }`}
                    >
                      {notif.deliveredVia === 'smtp' ? 'SMTP' : 'Audit Log'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <WeeklyCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        evaluation={evaluation}
        userEmail={userData?.email || ''}
        userName={userData?.name || 'Private Client'}
        uid={uid}
        onNotificationSaved={(record) => {
          setNotifications(prev => [record, ...prev]);
        }}
      />

      <NotificationPreferencesModal
        isOpen={isPrefsModalOpen}
        onClose={() => setIsPrefsModalOpen(false)}
        uid={uid}
        userEmail={userData?.email || ''}
      />
    </div>
  );
};

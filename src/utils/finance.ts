/**
 * Financial calculation engine for Elevate
 */
import { FinancialProfile } from '../types';

export function calculateEmi(principal: number, annualRatePct: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const monthlyRate = annualRatePct / 12 / 100;
  if (monthlyRate === 0) return Math.round(principal / tenureMonths);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
              (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount).replace('₹', '₹ ');
}

export function formatCompactINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    const val = amount / 100000;
    return `₹${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}L`;
  }
  if (amount >= 1000) {
    const val = amount / 1000;
    return `₹${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`;
  }
  return `₹${amount}`;
}

export interface RiskProfile {
  tier: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK';
  color: string;
  badgeBg: string;
  borderGlow: string;
  glowClass: string;
  recommendedMaxLoan: number;
  message: string;
  percentage: number; // 0-100 gauge positioning
  isDanger: boolean;
}

export function evaluateLoanRisk(
  monthlyIncome: number,
  currentEmi: number,
  additionalEmi: number
): RiskProfile {
  const totalEmi = currentEmi + additionalEmi;
  const debtRatio = (totalEmi / monthlyIncome) * 100;

  // Prudence benchmarks:
  // < 35% : Prime / Safe / Low Risk (Emerald)
  // 35% - 48% : Moderate Risk (Amber)
  // > 48% : High Risk / Danger Zone (Vivid Red)
  if (debtRatio <= 36) {
    return {
      tier: 'LOW RISK',
      color: '#10b981', // emerald-500
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      borderGlow: 'rgba(16, 185, 129, 0.4)',
      glowClass: 'glow-emerald-soft',
      recommendedMaxLoan: 650000,
      message: 'Excellent leverage headroom. Cash flow reserves easily withstand unexpected rate volatility.',
      percentage: Math.min(35, Math.max(10, debtRatio)),
      isDanger: false,
    };
  } else if (debtRatio <= 48) {
    return {
      tier: 'MODERATE RISK',
      color: '#f59e0b', // amber-500
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      borderGlow: 'rgba(245, 158, 11, 0.4)',
      glowClass: 'glow-amber-soft',
      recommendedMaxLoan: 420000,
      message: 'Approaching prudent debt ceiling. Consider extending tenure or allocating liquid prepayments.',
      percentage: Math.min(70, Math.max(40, debtRatio)),
      isDanger: false,
    };
  } else {
    return {
      tier: 'HIGH RISK',
      color: '#ef4444', // red-500 danger
      badgeBg: 'rgba(239, 68, 68, 0.18)',
      borderGlow: 'rgba(239, 68, 68, 0.6)',
      glowClass: 'glow-danger-red',
      recommendedMaxLoan: 250000,
      message: 'CRITICAL DANGER: Maximum debt threshold exceeded (>48% DTI). Triggers solvency warnings and depletes liquid emergency buffers.',
      percentage: Math.min(98, Math.max(75, debtRatio)),
      isDanger: true,
    };
  }
}

export interface FinancialAssessmentInputs {
  name: string;
  monthlyIncome: number;
  homeLoanEmi?: number;
  personalLoanEmi?: number;
  autoLoanEmi?: number;
  otherEmi?: number;
  totalMonthlyEmi?: number;
  liquidSavings?: number;
  tier?: string;
}

export function computeFinancialTelemetry(inputs: FinancialAssessmentInputs): FinancialProfile {
  const income = Math.max(1000, Number(inputs.monthlyIncome) || 80000);
  
  const home = Math.max(0, Number(inputs.homeLoanEmi) || 0);
  const personal = Math.max(0, Number(inputs.personalLoanEmi) || 0);
  const auto = Math.max(0, Number(inputs.autoLoanEmi) || 0);
  const other = Math.max(0, Number(inputs.otherEmi) || 0);
  
  let totalEmi = 0;
  if (inputs.totalMonthlyEmi !== undefined && inputs.totalMonthlyEmi > 0) {
    totalEmi = Number(inputs.totalMonthlyEmi);
  } else {
    totalEmi = home + personal + auto + other;
  }
  
  const activeLoanCount = [home, personal, auto, other].filter(x => x > 0).length || (totalEmi > 0 ? 1 : 0);

  // Exact DTI percentage
  const rawDti = (totalEmi / income) * 100;
  const dti = Math.round(rawDti);

  // Safe additional EMI headroom before reaching safe 40% DTI ceiling
  const safeCeilingEmi = Math.round(income * 0.40);
  const safeAdditionalEmi = Math.max(0, safeCeilingEmi - totalEmi);

  // Emergency liquid reserve calculation
  const savings = inputs.liquidSavings !== undefined && inputs.liquidSavings >= 0
    ? inputs.liquidSavings 
    : Math.round(income * 3.2);

  // Monthly burn rate = 45% living expenses + total EMIs
  const estimatedLivingBurn = income * 0.45;
  const monthlyBurn = estimatedLivingBurn + totalEmi;
  const liquidRunwayMonths = Number((savings / Math.max(1000, monthlyBurn)).toFixed(1));

  // Bureau Credit Score calculation:
  // Baseline is 800.
  // DTI < 25%: 800-845
  // DTI 25%-35%: 770-799
  // DTI 36%-45%: 710-769 (Caution)
  // DTI 46%-55%: 630-685 (Danger threshold breached)
  // DTI > 55%: 500-620 (Critical danger)
  let creditScore = 800;
  if (dti <= 20) {
    creditScore = Math.min(850, 810 + Math.round((20 - dti) * 1.5));
  } else if (dti <= 35) {
    creditScore = 790 - Math.round((dti - 20) * 1.6);
  } else if (dti <= 45) {
    creditScore = 765 - Math.round((dti - 35) * 6.5);
  } else if (dti <= 60) {
    creditScore = 680 - Math.round((dti - 45) * 6);
  } else {
    creditScore = Math.max(480, 590 - Math.round((dti - 60) * 4));
  }
  creditScore = Math.min(850, Math.max(450, Math.round(creditScore)));

  // Financial Health Score (0 - 100):
  // Combines DTI burden, liquidity runway, and repayment capacity
  let baseScore = 100;
  baseScore -= (dti * 0.95);
  
  // Runway contribution (+ bonus if > 6 months, penalty if < 3 months)
  if (liquidRunwayMonths >= 6) {
    baseScore += Math.min(10, Math.round((liquidRunwayMonths - 6) * 1.2));
  } else if (liquidRunwayMonths < 3) {
    baseScore -= Math.round((3 - liquidRunwayMonths) * 5);
  }

  // If in Danger DTI (>45%), cap health score strictly below 55
  if (dti > 45) {
    baseScore = Math.min(50, baseScore);
  }
  if (dti > 55) {
    baseScore = Math.min(36, baseScore);
  }
  if (dti <= 30 && liquidRunwayMonths >= 6) {
    baseScore = Math.max(80, baseScore);
  }

  const healthScore = Math.min(98, Math.max(15, Math.round(baseScore)));

  // Client tier determination
  let clientTier = inputs.tier || 'Premier Client Tier';
  if (!inputs.tier) {
    if (income >= 250000) clientTier = 'Sovereign Ultra Tier';
    else if (income >= 120000) clientTier = 'Private Wealth Tier';
    else if (income >= 60000) clientTier = 'Premier Client Tier';
    else clientTier = 'Standard Client Tier';
  }

  return {
    monthlyIncome: income,
    monthlyEmi: totalEmi,
    debtRatio: dti,
    healthScore,
    safeAdditionalEmi,
    clientName: inputs.name || 'Private Client',
    clientTier,
    liquidRunwayMonths,
    creditScore,
    activeLoanCount,
    loanBreakdown: {
      homeLoan: home,
      personalLoan: personal,
      autoLoan: auto,
      otherDebt: other,
    },
    liquidSavings: savings,
    assessmentTimestamp: new Date().toISOString(),
  };
}

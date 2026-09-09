/**
 * Deterministic Financial Health Status Engine for Elevate.
 * Evaluates real Firestore user data against central benchmarks.
 */

import { FINANCIAL_HEALTH_CONFIG } from '../config/financialHealthConfig';
import { 
  UserFinancialData, 
  UserLoan, 
  FinancialHealthSnapshot, 
  FinancialHealthStatus,
  FinancialProfile 
} from '../types';
import { computeFinancialTelemetry, formatINR } from './finance';

export interface HealthEvaluationResult {
  hasInsufficientData: boolean;
  status: FinancialHealthStatus;
  healthScore: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  essentialExpenses: number;
  discretionaryExpenses: number;
  monthlyEMI: number;
  freeCash: number;
  recommendedBuffer: number;
  emergencyBuffer: number;
  emergencyBufferMonths: number;
  DTI: number;
  savingsRate: number;
  dangerDurationDays: number;
  dangerZoneStartDate: string | null;
  statusDurationDays: number; // Days in current status regardless of type
  majorRiskFactors: string[];
  recommendedActions: string[];
  insuranceGap: boolean;
  scoreDelta?: number; // Compared to previous snapshot
  freeCashDelta?: number;
}

export function evaluateFinancialHealth(
  userData: UserFinancialData | null,
  loans: UserLoan[] = [],
  previousSnapshots: FinancialHealthSnapshot[] = []
): HealthEvaluationResult {
  const config = FINANCIAL_HEALTH_CONFIG;

  // Check for insufficient data
  if (!userData || !userData.monthlyIncome || userData.monthlyIncome <= 0) {
    return {
      hasInsufficientData: true,
      status: 'WATCH',
      healthScore: 50,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      essentialExpenses: 0,
      discretionaryExpenses: 0,
      monthlyEMI: 0,
      freeCash: 0,
      recommendedBuffer: 60000,
      emergencyBuffer: 0,
      emergencyBufferMonths: 0,
      DTI: 0,
      savingsRate: 0,
      dangerDurationDays: 0,
      dangerZoneStartDate: null,
      statusDurationDays: 0,
      majorRiskFactors: [
        'Insufficient financial telemetry: Verified income and living expenses are not yet recorded.',
      ],
      recommendedActions: [
        'Complete your financial profile to calibrate real-time health alerts and risk monitoring.',
      ],
      insuranceGap: false,
    };
  }

  const income = Math.max(0, Number(userData.monthlyIncome) || 0);
  
  // Calculate active loan EMI obligations
  const activeLoans = loans.filter((l) => l.status === 'active');
  const monthlyEMI = activeLoans.reduce((sum, l) => sum + (Number(l.emi) || 0), 0);

  // Calculate expenses breakdown
  const monthlyExpenses = Math.max(0, Number(userData.monthlyExpenses) || 0);
  
  let essentialExpenses = userData.essentialExpenses;
  if (essentialExpenses === undefined || essentialExpenses <= 0) {
    essentialExpenses = Math.round(monthlyExpenses * config.expenseSplitDefaults.essentialRatio);
  }

  let discretionaryExpenses = userData.discretionaryExpenses;
  if (discretionaryExpenses === undefined || discretionaryExpenses < 0) {
    discretionaryExpenses = Math.max(0, monthlyExpenses - essentialExpenses);
  }

  // Free Cash = Income - Total Expenses - EMI Obligations
  const freeCash = income - monthlyExpenses - monthlyEMI;
  const freeCashRatio = income > 0 ? freeCash / income : 0;

  // Debt-to-income ratio
  const rawDti = income > 0 ? (monthlyEMI / income) * 100 : 0;
  const DTI = Math.round(rawDti);

  // Emergency buffer calculation
  const savings = Math.max(0, Number(userData.savings) || 0);
  const monthlyBurn = Math.max(1000, monthlyExpenses + monthlyEMI);
  const emergencyBufferMonths = Number((savings / monthlyBurn).toFixed(1));
  const recommendedBuffer = Math.round(monthlyBurn * config.emergencyBufferMonths.healthyMin);

  // Savings rate
  const savingsRate = income > 0 ? Math.max(0, Math.round((freeCash / income) * 100)) : 0;

  // Insurance check
  const healthInsurance = Number(userData.healthInsuranceCoverage) || 0;
  const insuranceGap = healthInsurance < 500000;

  // Baseline Financial Health Score calculation
  const telemetry = computeFinancialTelemetry({
    name: userData.name,
    monthlyIncome: income,
    totalMonthlyEmi: monthlyEMI,
    liquidSavings: savings,
    tier: userData.clientTier,
  });
  
  let healthScore = telemetry.healthScore;
  // Further penalize if free cash is negative or under 5%
  if (freeCash < 0) {
    healthScore = Math.min(42, healthScore - 15);
  } else if (freeCashRatio < 0.10) {
    healthScore = Math.min(54, healthScore - 8);
  }

  // Determine STATUS (HEALTHY, WATCH, DANGER)
  const isDanger = 
    freeCash < config.freeCashRatio.criticalMinAmount ||
    freeCashRatio < config.freeCashRatio.dangerMax ||
    DTI > config.dti.dangerMin ||
    emergencyBufferMonths < config.emergencyBufferMonths.dangerMax ||
    healthScore < config.healthScore.dangerMax;

  let status: FinancialHealthStatus = 'HEALTHY';

  if (isDanger) {
    status = 'DANGER';
  } else {
    const isWatch = 
      freeCashRatio < config.freeCashRatio.watchMin ||
      DTI > config.dti.healthyMax ||
      emergencyBufferMonths < config.emergencyBufferMonths.healthyMin ||
      insuranceGap ||
      healthScore < config.healthScore.healthyMin;

    if (isWatch) {
      status = 'WATCH';
    } else {
      status = 'HEALTHY';
    }
  }

  // Calculate danger zone duration
  const now = Date.now();
  let dangerZoneStartDate: string | null = userData.dangerZoneStartDate || null;
  let dangerDurationDays = 0;

  if (status === 'DANGER') {
    if (!dangerZoneStartDate) {
      // Check if previous snapshot was already danger
      const sortedSnapshots = [...previousSnapshots].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const prevDanger = sortedSnapshots.find(s => s.status === 'DANGER');
      if (prevDanger && prevDanger.dangerZoneStartDate) {
        dangerZoneStartDate = prevDanger.dangerZoneStartDate;
      } else {
        dangerZoneStartDate = new Date().toISOString();
      }
    }

    const startMs = new Date(dangerZoneStartDate).getTime();
    dangerDurationDays = Math.max(1, Math.round((now - startMs) / (1000 * 60 * 60 * 24)));
  } else {
    // Reset danger zone if user is no longer in danger
    dangerZoneStartDate = null;
    dangerDurationDays = 0;
  }

  // Calculate days in current status
  let statusDurationDays = dangerDurationDays;
  if (status !== 'DANGER') {
    const sortedSnapshots = [...previousSnapshots].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    let consecutiveCount = 1;
    for (const snap of sortedSnapshots) {
      if (snap.status === status) {
        consecutiveCount++;
      } else {
        break;
      }
    }
    // Estimated days based on snapshot intervals (at least 1 day)
    statusDurationDays = Math.max(1, consecutiveCount * 2);
  }

  // Concrete Deterministic Risk Factors
  const majorRiskFactors: string[] = [];

  if (freeCash < 0) {
    majorRiskFactors.push(
      `Deficit Cash Flow: Outflows (Expenses ₹${formatINR(monthlyExpenses)} + EMI ₹${formatINR(monthlyEMI)}) exceed verified income by ₹${formatINR(Math.abs(freeCash))}/mo.`
    );
  } else if (freeCash < config.freeCashRatio.criticalMinAmount) {
    majorRiskFactors.push(
      `Critical Free Cash: Monthly free cash of ${formatINR(freeCash)} is beneath the ₹5,000 threshold, leaving zero cushion for volatility.`
    );
  } else if (freeCashRatio < 0.15) {
    majorRiskFactors.push(
      `Constrained Liquidity: Free cash flow is only ${(freeCashRatio * 100).toFixed(0)}% of income (recommended > 25%).`
    );
  }

  if (DTI > config.dti.dangerMin) {
    majorRiskFactors.push(
      `Debt Over-Leverage: Monthly EMI obligations consume ${DTI}% of income, breaching the 45% critical prudence mark.`
    );
  } else if (DTI > config.dti.healthyMax) {
    majorRiskFactors.push(
      `Elevated Debt Ratio: Current DTI stands at ${DTI}% (safe benchmark is <= 35%).`
    );
  }

  if (emergencyBufferMonths < config.emergencyBufferMonths.dangerMax) {
    majorRiskFactors.push(
      `Liquid Buffer Deficit: Current savings (${formatINR(savings)}) sustain only ${emergencyBufferMonths} months of living burn (recommended >= 6.0 months).`
    );
  } else if (emergencyBufferMonths < config.emergencyBufferMonths.healthyMin) {
    majorRiskFactors.push(
      `Moderate Reserve Runway: Emergency liquidity covers ${emergencyBufferMonths} months, shy of the 6-month institutional benchmark.`
    );
  }

  if (discretionaryExpenses > income * 0.30) {
    const discPct = Math.round((discretionaryExpenses / income) * 100);
    majorRiskFactors.push(
      `High Discretionary Burn: Non-essential lifestyle expenses absorb ${discPct}% of monthly income (${formatINR(discretionaryExpenses)}).`
    );
  }

  if (insuranceGap) {
    majorRiskFactors.push(
      `Under-Insured Vulnerability: Health insurance coverage is below ₹5,00,000, exposing emergency cash reserves to hospitalization liabilities.`
    );
  }

  if (majorRiskFactors.length === 0) {
    majorRiskFactors.push(
      'Balanced Debt Load: Debt-to-income ratio is in the prime tier (< 35%) with zero delinquency risk.'
    );
    majorRiskFactors.push(
      `Robust Solvency: Emergency reserves cover ${emergencyBufferMonths} months of recurring commitments.`
    );
  }

  // Concrete Deterministic Recommended Actions
  const recommendedActions: string[] = [];

  if (discretionaryExpenses > income * 0.20) {
    const targetReduction = Math.round(discretionaryExpenses * 0.30);
    recommendedActions.push(
      `Reduce discretionary expenditures by ${formatINR(targetReduction)}/mo to immediately rebuild monthly free cash reserves.`
    );
  }

  if (DTI > config.dti.healthyMax) {
    recommendedActions.push(
      'Enforce an immediate freeze on new retail debt obligations or EMI card purchases until DTI drops below 35%.'
    );
    if (loans.length > 0) {
      const highestRateLoan = [...loans].sort((a, b) => b.interestRate - a.interestRate)[0];
      if (highestRateLoan) {
        recommendedActions.push(
          `Prioritize prepaying ${highestRateLoan.lender} (${highestRateLoan.interestRate}% APR) to shave recurring monthly liabilities.`
        );
      }
    }
  }

  if (emergencyBufferMonths < config.emergencyBufferMonths.healthyMin) {
    const deficitToBuffer = Math.max(0, recommendedBuffer - savings);
    const monthlyContribution = freeCash > 5000 ? Math.round(freeCash * 0.5) : 5000;
    recommendedActions.push(
      `Direct a recurring systematic transfer of ${formatINR(monthlyContribution)}/mo into high-yield liquid reserves to target a ${formatINR(recommendedBuffer)} 6-month buffer.`
    );
  }

  if (insuranceGap) {
    recommendedActions.push(
      'Upgrade comprehensive healthcare coverage to at least ₹10L to safeguard long-term portfolio capital.'
    );
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push(
      'Maintain active auto-debit payments to preserve your prime credit tier and deploy free cash surplus into disciplined wealth instruments.'
    );
  }

  // Calculate deltas if previous snapshot is available
  let scoreDelta: number | undefined = undefined;
  let freeCashDelta: number | undefined = undefined;

  if (previousSnapshots && previousSnapshots.length > 0) {
    const lastSnap = previousSnapshots[0];
    scoreDelta = healthScore - lastSnap.financialHealthScore;
    freeCashDelta = freeCash - lastSnap.freeCash;
  }

  return {
    hasInsufficientData: false,
    status,
    healthScore,
    monthlyIncome: income,
    monthlyExpenses,
    essentialExpenses,
    discretionaryExpenses,
    monthlyEMI,
    freeCash,
    recommendedBuffer,
    emergencyBuffer: savings,
    emergencyBufferMonths,
    DTI,
    savingsRate,
    dangerDurationDays,
    dangerZoneStartDate,
    statusDurationDays,
    majorRiskFactors: majorRiskFactors.slice(0, 3),
    recommendedActions: recommendedActions.slice(0, 3),
    insuranceGap,
    scoreDelta,
    freeCashDelta,
  };
}

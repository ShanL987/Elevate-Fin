/**
 * Central Configuration for Elevate Financial Health Status Engine & Alert Rules.
 * All thresholds are configured here in accordance with strict private wealth prudence benchmarks.
 */

export interface FinancialHealthThresholds {
  dti: {
    healthyMax: number;   // <= 35%
    watchMax: number;     // <= 45%
    dangerMin: number;    // > 45%
  };
  emergencyBufferMonths: {
    healthyMin: number;   // >= 6.0 months
    watchMin: number;     // >= 3.0 months
    dangerMax: number;    // < 3.0 months
  };
  freeCashRatio: {
    healthyMin: number;   // >= 25% of gross income
    watchMin: number;     // >= 10% of gross income
    dangerMax: number;    // < 10% of gross income
    criticalMinAmount: number; // Minimum ₹ buffer, e.g. ₹5,000
  };
  savingsRate: {
    healthyMin: number;   // >= 20%
    watchMin: number;     // >= 8%
    dangerMax: number;    // < 8%
  };
  healthScore: {
    healthyMin: number;   // >= 72
    watchMin: number;     // >= 52
    dangerMax: number;    // < 52
  };
  expenseSplitDefaults: {
    essentialRatio: number;      // 65% of expenses
    discretionaryRatio: number;  // 35% of expenses
  };
  antiSpam: {
    weeklyCheckinIntervalDays: number; // 7 days
    dangerAlertCooldownHours: number;  // 24 hours
    persistentDangerAlertDays: number; // 7 days in danger zone
    significantScoreDrop: number;      // >= 10 pts
  };
}

export const FINANCIAL_HEALTH_CONFIG: FinancialHealthThresholds = {
  dti: {
    healthyMax: 35,
    watchMax: 45,
    dangerMin: 45,
  },
  emergencyBufferMonths: {
    healthyMin: 6.0,
    watchMin: 3.0,
    dangerMax: 3.0,
  },
  freeCashRatio: {
    healthyMin: 0.25,
    watchMin: 0.10,
    dangerMax: 0.10,
    criticalMinAmount: 5000,
  },
  savingsRate: {
    healthyMin: 20,
    watchMin: 8,
    dangerMax: 8,
  },
  healthScore: {
    healthyMin: 72,
    watchMin: 52,
    dangerMax: 52,
  },
  expenseSplitDefaults: {
    essentialRatio: 0.65,
    discretionaryRatio: 0.35,
  },
  antiSpam: {
    weeklyCheckinIntervalDays: 7,
    dangerAlertCooldownHours: 24,
    persistentDangerAlertDays: 7,
    significantScoreDrop: 10,
  },
};

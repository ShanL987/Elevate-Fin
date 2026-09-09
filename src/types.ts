export type NavTab = 
  | 'overview' 
  | 'health_alerts'
  | 'credit' 
  | 'emi_planner' 
  | 'loans' 
  | 'insurance' 
  | 'ai_advisor';

export type FinancialHealthStatus = 'HEALTHY' | 'WATCH' | 'DANGER';

export interface FinancialHealthAiExplanation {
  summary: string;
  riskFactors: string[];
  recommendedActions: string[];
  severity: 'healthy' | 'watch' | 'danger';
  generatedAt: string;
}

export interface FinancialHealthSnapshot {
  id: string;
  timestamp: string; // ISO string
  financialHealthScore: number;
  status: FinancialHealthStatus;
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
  dangerZoneStartDate?: string | null;
  majorRiskFactors: string[];
  recommendedActions: string[];
  aiExplanation?: FinancialHealthAiExplanation;
}

export interface NotificationRecord {
  id: string;
  type: 'weekly_checkin' | 'danger_alert' | 'status_change' | 'spending_alert' | 'credit_alert';
  createdAt: string;
  status: 'sent' | 'pending' | 'failed';
  emailSent: boolean;
  emailTo: string;
  title: string;
  financialStatus: FinancialHealthStatus;
  message: string;
  relatedSnapshotId?: string;
  deliveredVia: 'smtp' | 'audit_log' | 'in_app';
  read?: boolean;
}

export interface NotificationPreferences {
  weeklyCheckin: boolean;
  dangerZoneAlerts: boolean;
  spendingAlerts: boolean;
  creditAlerts: boolean;
  loanEmiAlerts: boolean;
  emailAddress?: string;
  updatedAt?: string;
}

export interface FinancialProfile {
  monthlyIncome: number;
  monthlyEmi: number;
  debtRatio: number; // percentage, e.g. 31
  healthScore: number; // 0-100, e.g. 78
  safeAdditionalEmi: number;
  clientName: string;
  clientTier: string;
  liquidRunwayMonths: number;
  creditScore: number;
  activeLoanCount?: number;
  loanBreakdown?: {
    homeLoan?: number;
    personalLoan?: number;
    autoLoan?: number;
    otherDebt?: number;
  };
  liquidSavings?: number;
  assessmentTimestamp?: string;
}

export interface LoanOffer {
  id: string;
  bankName: string;
  tierTag: string;
  interestRate: number; // e.g. 10.5
  startingRateStr: string;
  estimatedEmi: number;
  estimatedEmiStr: string;
  maxAmount: number;
  maxAmountStr: string;
  processingFee: string;
  approvalSpeed: string;
  isBestFit?: boolean;
  perks: string[];
}

export interface AdvisorMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isAnalyzing?: boolean;
  metadata?: {
    model?: string;
    dtiImpact?: string;
  };
}

export interface ChartDataPoint {
  month: string;
  income: number;
  existingEmi: number;
  plannedEmi: number;
  totalDebt: number;
  safeCeiling: number;
  netSurplus: number;
}

export interface UserLoan {
  id: string;
  lender: string;
  type: 'home' | 'personal' | 'auto' | 'education' | 'business' | 'other';
  amount: number;
  interestRate: number;
  tenureMonths: number;
  emi: number;
  disbursedDate?: string;
  status: 'active' | 'closed';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFinancialData {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  provider: 'password' | 'google';
  createdAt: string;
  updatedAt?: string;
  onboardingCompleted: boolean;

  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  investments: number;
  creditScore: number;
  healthInsuranceCoverage: number;
  termInsuranceCoverage: number;

  clientTier: string;
  healthScore: number;
  monthlyEmi: number;
  debtRatio: number;
  safeAdditionalEmi: number;
  liquidRunwayMonths: number;

  // Granular expense & health alert tracking
  essentialExpenses?: number;
  discretionaryExpenses?: number;
  dangerZoneStartDate?: string | null;
  lastHealthStatus?: FinancialHealthStatus;
  lastNotificationSentAt?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  photoURL?: string;
  tier: string;
  provider: 'email' | 'gmail' | 'password' | 'google';
  createdAt: string;
  financialProfile?: FinancialProfile;
  monthlyIncome?: number;
}


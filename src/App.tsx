import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  LogOut,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';
import { NavTab, FinancialProfile, LoanOffer, UserFinancialData, UserLoan } from './types';
import { Sidebar } from './components/Sidebar';
import { FinancialHealthHero } from './components/FinancialHealthHero';
import { FinancialHealthAlertsPage } from './components/FinancialHealthAlertsPage';
import { MetricCards } from './components/MetricCards';
import { TerminalChart } from './components/TerminalChart';
import { EmiPlanner } from './components/EmiPlanner';
import { AiAdvisor } from './components/AiAdvisor';
import { LoanCards } from './components/LoanCards';
import { MyLoansManager } from './components/MyLoansManager';
import { CreditTelemetry } from './components/CreditTelemetry';
import { InsuranceVault } from './components/InsuranceVault';
import { ApplyModal } from './components/ApplyModal';
import { ProfileModal } from './components/ProfileModal';
import { HomePage } from './components/HomePage';
import { FirstLoginOnboardingModal } from './components/FirstLoginOnboardingModal';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyNavigationProvider, useCurrencyNavigation } from './components/CurrencyDropOverlay';
import { 
  auth, 
  onAuthStateChanged, 
  subscribeToUserProfile, 
  subscribeToUserLoans, 
  buildFinancialProfile,
  logOut 
} from './lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface MainAppContentProps {
  isLoggedIn: boolean;
  currentUser: FirebaseUser | null;
  userData: UserFinancialData | null;
  userLoans: UserLoan[];
  handleLogout: () => void;
  profile: FinancialProfile;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isApplyModalOpen: boolean;
  setIsApplyModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLoanDetails: {
    bankName?: string;
    amount: number;
    emi: number;
    tenureMonths: number;
    rate?: number;
  };
  setSelectedLoanDetails: React.Dispatch<React.SetStateAction<{
    bankName?: string;
    amount: number;
    emi: number;
    tenureMonths: number;
    rate?: number;
  }>>;
  aiPromptToPass: string;
  setAiPromptToPass: React.Dispatch<React.SetStateAction<string>>;
  handleApplyForOffer: (offer: LoanOffer) => void;
  handleApplyForPlannerTranche: (amount: number, emi: number, tenure: number) => void;
  onRefreshAuth: () => void;
}

function MainAppContent({
  isLoggedIn,
  currentUser,
  userData,
  userLoans,
  handleLogout,
  profile,
  mobileMenuOpen,
  setMobileMenuOpen,
  isApplyModalOpen,
  setIsApplyModalOpen,
  isProfileModalOpen,
  setIsProfileModalOpen,
  isOnboardingOpen,
  setIsOnboardingOpen,
  selectedLoanDetails,
  aiPromptToPass,
  setAiPromptToPass,
  handleApplyForOffer,
  handleApplyForPlannerTranche,
  onRefreshAuth,
}: MainAppContentProps) {
  const { activeTab, navigateToTab } = useCurrencyNavigation();

  const handleConsultAi = (prompt: string, e?: React.MouseEvent) => {
    setAiPromptToPass(prompt);
    navigateToTab('ai_advisor', e);
  };

  return (
    <div id="app-main-shell" className="w-full min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-300">
      {!isLoggedIn ? (
        <HomePage onAuthenticated={onRefreshAuth} />
      ) : (
        <div className="min-h-screen flex flex-col lg:flex-row relative selection:bg-emerald-500/20 selection:text-emerald-300">
          {/* Sidebar Navigation */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                navigateToTab(tab);
              }}
              onCloseMobileMenu={() => setMobileMenuOpen(false)}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              onLogout={handleLogout}
              profile={profile}
            />
          </div>

          {/* Main Content Terminal Canvas */}
          <main className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
            {/* Top Terminal Bar */}
            <header className="h-16 border-b border-white/[0.06] bg-[#070a10]/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
              {/* Left section: mobile hamburger & page title */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="btn-flash lg:hidden p-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white cursor-pointer"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white font-bold text-sm tracking-tight font-display">
                    {activeTab === 'overview' && 'Financial Overview'}
                    {activeTab === 'emi_planner' && 'EMI & Loan Calculator'}
                    {activeTab === 'loans' && 'My Loans & Institutional Marketplace'}
                    {activeTab === 'credit' && 'Credit Bureau Standing'}
                    {activeTab === 'insurance' && 'Wealth Protection Vault'}
                    {activeTab === 'ai_advisor' && 'AI Financial Advisor'}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Cloud Sync
                  </span>
                </div>
              </div>

              {/* Right section: Theme Toggle, user profile & sign out */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Theme Toggle */}
                <ThemeToggle showLabel />

                {/* Profile trigger */}
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="btn-flash flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs transition-colors cursor-pointer"
                  title="Open Client Profile"
                >
                  <span className="font-medium text-slate-200 hidden sm:inline max-w-[120px] truncate">
                    {userData?.name || profile.clientName}
                  </span>
                  {userData?.photoURL ? (
                    <img
                      src={userData.photoURL}
                      alt={profile.clientName}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-lg object-cover border border-emerald-500/40"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-[10px] font-bold font-mono">
                      {(userData?.name || profile.clientName).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Real Firebase Logout button */}
                <button
                  onClick={handleLogout}
                  className="btn-flash flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-red-500/15 text-slate-400 hover:text-red-300 border border-white/[0.06] hover:border-red-500/30 text-xs transition-colors cursor-pointer"
                  title="Sign Out of Firebase"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </header>

            {/* Tab Views */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                  {/* Hero Element: Financial Health Score with circular radial progress ring */}
                  <FinancialHealthHero
                    profile={profile}
                    onExploreAdvice={(e) => navigateToTab('ai_advisor', e)}
                    onNavigateToHealthAlerts={(e) => navigateToTab('health_alerts', e)}
                  />

                  {/* Core Metric Cards: Income, EMI, DTI Ratio, Safe Additional EMI */}
                  <MetricCards
                    profile={profile}
                    onSelectMetric={(id, e) => {
                      if (id === 'debt_ratio') {
                        navigateToTab('health_alerts', e);
                      } else if (id === 'safe_emi' || id === 'emi') {
                        navigateToTab('emi_planner', e);
                      }
                    }}
                  />

                  {/* Charts Section: Dark financial terminal chart with projected cashflow */}
                  <TerminalChart />
                </div>
              )}

              {activeTab === 'emi_planner' && (
                <div className="animate-fade-in">
                  <EmiPlanner
                    monthlyIncome={profile.monthlyIncome}
                    currentEmi={profile.monthlyEmi}
                    onApplyForTranche={handleApplyForPlannerTranche}
                    onConsultAi={handleConsultAi}
                  />
                </div>
              )}

              {activeTab === 'ai_advisor' && (
                <div className="animate-fade-in">
                  <AiAdvisor
                    profile={profile}
                    initialPrompt={aiPromptToPass}
                    onClearInitialPrompt={() => setAiPromptToPass('')}
                    onNavigateToPlanner={(e) => navigateToTab('emi_planner', e)}
                  />
                </div>
              )}

              {activeTab === 'loans' && (
                <div className="space-y-10 animate-fade-in">
                  {/* Section 1: User's Actual Active Loans (Firestore backed: Add/Edit/Delete) */}
                  <MyLoansManager
                    uid={currentUser?.uid || ''}
                    loans={userLoans}
                    monthlyIncome={profile.monthlyIncome}
                  />

                  {/* Section 2: Institutional Pre-Approved Marketplace Offers */}
                  <div className="pt-4 border-t border-white/[0.08]">
                    <div className="mb-4">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-semibold block">
                        INSTITUTIONAL MARKETPLACE
                      </span>
                      <h3 className="font-display font-bold text-lg text-white">
                        Curated Pre-Approved Capital Offers
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Collateral-free liquidity tranches calibrated to your credit rating and debt capacity.
                      </p>
                    </div>

                    <LoanCards
                      onApplyForOffer={handleApplyForOffer}
                      onSimulateInPlanner={(amt, rate, e) => {
                        navigateToTab('emi_planner', e);
                      }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'health_alerts' && (
                <div className="animate-fade-in">
                  <FinancialHealthAlertsPage
                    userData={userData}
                    loans={userLoans}
                    uid={currentUser?.uid || ''}
                    onNavigateToPlanner={(e) => navigateToTab('emi_planner', e)}
                    onOpenProfile={() => setIsProfileModalOpen(true)}
                  />
                </div>
              )}

              {activeTab === 'credit' && (
                <div className="animate-fade-in">
                  <CreditTelemetry profile={profile} />
                </div>
              )}

              {activeTab === 'insurance' && (
                <div className="animate-fade-in">
                  <InsuranceVault profile={profile} userData={userData} />
                </div>
              )}
            </div>
          </main>

          {/* Modals */}
          <ApplyModal
            isOpen={isApplyModalOpen}
            onClose={() => setIsApplyModalOpen(false)}
            uid={currentUser?.uid}
            loanDetails={selectedLoanDetails}
          />

          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            userData={userData}
            profile={profile}
            onLogout={handleLogout}
          />

          {/* First Login Onboarding Modal for New Authenticated Accounts */}
          {currentUser && (
            <FirstLoginOnboardingModal
              isOpen={isOnboardingOpen}
              user={userData}
              uid={currentUser.uid}
              userEmail={currentUser.email || ''}
              userName={userData?.name || currentUser.displayName || ''}
              onComplete={() => setIsOnboardingOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function MainApp() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserFinancialData | null>(null);
  const [userLoans, setUserLoans] = useState<UserLoan[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [selectedLoanDetails, setSelectedLoanDetails] = useState<{
    bankName?: string;
    amount: number;
    emi: number;
    tenureMonths: number;
    rate?: number;
  }>({
    bankName: 'HDFC Bank',
    amount: 500000,
    emi: 10618,
    tenureMonths: 60,
    rate: 10.5,
  });

  const [aiPromptToPass, setAiPromptToPass] = useState<string>('');

  // 1. Listen to Real Firebase Auth State Changes
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeLoans: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setCurrentUser(fbUser);
      if (fbUser) {
        // Subscribe to user Firestore profile
        unsubscribeProfile = subscribeToUserProfile(fbUser.uid, (data) => {
          setUserData(data);
          if (data && data.onboardingCompleted === false) {
            setIsOnboardingOpen(true);
          }
        });

        // Subscribe to user Firestore loans collection
        unsubscribeLoans = subscribeToUserLoans(fbUser.uid, (loans) => {
          setUserLoans(loans);
        });
      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        if (unsubscribeLoans) unsubscribeLoans();
        setUserData(null);
        setUserLoans([]);
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeLoans) unsubscribeLoans();
    };
  }, []);

  // Compute live dynamic financial profile from Firestore records
  const profile: FinancialProfile = buildFinancialProfile(userData, userLoans);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCurrentUser(null);
    setUserData(null);
    setUserLoans([]);
    setActiveTab('overview');
  };

  const handleApplyForOffer = (offer: LoanOffer) => {
    setSelectedLoanDetails({
      bankName: offer.bankName,
      amount: 500000,
      emi: offer.estimatedEmi,
      tenureMonths: 60,
      rate: offer.interestRate,
    });
    setIsApplyModalOpen(true);
  };

  const handleApplyForPlannerTranche = (amount: number, emi: number, tenure: number) => {
    setSelectedLoanDetails({
      bankName: 'Institutional Approved Tranche',
      amount: amount,
      emi: emi,
      tenureMonths: tenure,
      rate: 11.25,
    });
    setIsApplyModalOpen(true);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#05070c] text-slate-100 flex flex-col items-center justify-center space-y-4 p-4">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
          <TrendingUp className="w-7 h-7 text-emerald-400" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-display font-bold text-lg text-white tracking-wider">
            ELEVATE TERMINAL
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Synchronizing Encrypted Financial Vault...
          </p>
        </div>
      </div>
    );
  }

  return (
    <CurrencyNavigationProvider activeTab={activeTab} setActiveTab={setActiveTab}>
      <MainAppContent
        isLoggedIn={!!currentUser}
        currentUser={currentUser}
        userData={userData}
        userLoans={userLoans}
        handleLogout={handleLogout}
        profile={profile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isApplyModalOpen={isApplyModalOpen}
        setIsApplyModalOpen={setIsApplyModalOpen}
        isProfileModalOpen={isProfileModalOpen}
        setIsProfileModalOpen={setIsProfileModalOpen}
        isOnboardingOpen={isOnboardingOpen}
        setIsOnboardingOpen={setIsOnboardingOpen}
        selectedLoanDetails={selectedLoanDetails}
        setSelectedLoanDetails={setSelectedLoanDetails}
        aiPromptToPass={aiPromptToPass}
        setAiPromptToPass={setAiPromptToPass}
        handleApplyForOffer={handleApplyForOffer}
        handleApplyForPlannerTranche={handleApplyForPlannerTranche}
        onRefreshAuth={() => {}}
      />
    </CurrencyNavigationProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

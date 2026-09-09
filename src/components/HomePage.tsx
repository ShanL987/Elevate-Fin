import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  Lock, 
  Activity, 
  Sliders, 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  KeyRound,
  ChevronLeft
} from 'lucide-react';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  sendResetEmail 
} from '../lib/firebase';
import { ParticleWaveCanvas } from './ParticleWaveCanvas';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { formatINR } from '../utils/finance';

interface HomePageProps {
  onAuthenticated: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onAuthenticated }) => {
  const { theme } = useTheme();
  
  // Auth Modes: 'signin' | 'signup' | 'forgot_password'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot_password'>('signin');
  
  // Form fields
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Form feedback states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string>('');

  // Interactive Live Preview Simulation on Hero (Left Column)
  const [simLoanAmount, setSimLoanAmount] = useState<number>(500000);
  const simTenure = 48;
  const simRate = 10.75;
  const simEmi = Math.round(
    (simLoanAmount * (simRate / 1200) * Math.pow(1 + simRate / 1200, simTenure)) /
    (Math.pow(1 + simRate / 1200, simTenure) - 1)
  );
  // Assume a median benchmark income of ₹85,000 for illustration
  const simDti = Math.min(80, Math.round(((18400 + simEmi) / 85000) * 100));

  // Email format validator
  const isValidEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setResetSuccessMessage('');

    const cleanEmail = email.trim();

    // 1. Forgot Password Mode
    if (authMode === 'forgot_password') {
      if (!cleanEmail || !isValidEmail(cleanEmail)) {
        setErrorMessage('Please enter a valid email address to receive reset instructions.');
        return;
      }
      setIsLoading(true);
      try {
        await sendResetEmail(cleanEmail);
        setResetSuccessMessage('Password reset email sent. Check your inbox.');
      } catch (err: any) {
        if (err?.code === 'auth/user-not-found') {
          setErrorMessage('No account found with this email address.');
        } else if (err?.code === 'auth/invalid-email') {
          setErrorMessage('The email address is badly formatted.');
        } else {
          setErrorMessage(err?.message || 'Failed to send password reset email. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2. Client-side Form Validation
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (authMode === 'signup') {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setErrorMessage('Please enter your full legal name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify both password fields.');
        return;
      }
    }

    // 3. Execution
    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        await signUpWithEmail(fullName.trim(), cleanEmail, password);
      } else {
        await signInWithEmail(cleanEmail, password);
      }
      onAuthenticated();
    } catch (err: any) {
      console.error('Authentication error:', err);
      if (err?.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Please sign in instead.');
      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found') {
        setErrorMessage('Invalid email or password. Please verify your credentials.');
      } else if (err?.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please use at least 6 characters.');
      } else if (err?.code === 'auth/too-many-requests') {
        setErrorMessage('Access temporarily restricted due to multiple failed attempts. Try again later.');
      } else {
        setErrorMessage(err?.message || 'Authentication failed. Please verify your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setResetSuccessMessage('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onAuthenticated();
    } catch (err: any) {
      console.error('Google Auth error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google sign-in window was closed before completion.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        setErrorMessage(err?.message || 'Failed to authenticate with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070c] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Background Particles & Ambient Glows */}
      <ParticleWaveCanvas theme={theme} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-emerald-500/[0.05] blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-[450px] h-[450px] rounded-full bg-teal-500/[0.03] blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="h-16 border-b border-white/[0.06] bg-[#070a10]/80 backdrop-blur-xl px-4 sm:px-10 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-b from-emerald-500/20 to-emerald-950/40 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg tracking-tight text-white">
              ELEVATE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
              TERMINAL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle showLabel />
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Firebase 256-Bit Encrypted</span>
          </div>
        </div>
      </header>

      {/* Status Ticker Bar */}
      <div className="border-b border-white/[0.05] bg-emerald-950/20 backdrop-blur-md px-4 sm:px-10 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 relative z-20 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>SOLVENCY ENGINE ACTIVE</span>
          </div>
          <span className="text-white/20">•</span>
          <span>RBI Benchmark Repo Rate: <strong className="text-slate-200">6.50%</strong></span>
          <span className="text-white/20">•</span>
          <span>Encrypted Cloud Security: <strong className="text-emerald-300">Firebase Firestore</strong></span>
          <span className="text-white/20">•</span>
          <span className="text-slate-300">Isolated User Schemas & Zero Cross-Access</span>
        </div>
      </div>

      {/* Main Focus Split-Screen Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: ELEVATE Value & Live Financial Terminal Simulation */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Private Banking & Debt Intelligence</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                ELEVATE
              </h1>
              <p className="font-display text-xl sm:text-2xl text-emerald-300 font-semibold tracking-tight">
                "Know what you can afford before you borrow."
              </p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Calculate exact EMI schedules, model debt-to-income limits, and unlock pre-approved private capital with real-time financial health telemetry.
            </p>

            {/* Live Financial Terminal Telemetry Demonstration */}
            <div className="glass-card rounded-2xl p-5 border border-white/[0.08] shadow-[0_15px_35px_rgba(0,0,0,0.5)] text-left">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    Live Telemetry Simulation
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Interactive
                </span>
              </div>

              {/* Slider Input */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Sample Loan Principal:</span>
                  <span className="text-white font-bold">{formatINR(simLoanAmount)}</span>
                </div>

                <input
                  type="range"
                  min="100000"
                  max="1500000"
                  step="25000"
                  value={simLoanAmount}
                  onChange={(e) => setSimLoanAmount(Number(e.target.value))}
                  className="w-full h-2 glow-slider cursor-pointer"
                />
              </div>

              {/* Real-time Dynamic Results */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/[0.05]">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Simulated Monthly EMI</div>
                  <div className="text-lg sm:text-xl font-display font-bold text-emerald-400 float-result-number">
                    {formatINR(simEmi)}
                    <span className="text-[10px] font-normal font-mono text-slate-400 ml-1">/mo</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Debt-to-Income (DTI)</div>
                  <div className={`text-lg sm:text-xl font-display font-bold float-result-number-delayed ${
                    simDti > 45 ? 'text-red-400' : simDti > 35 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {simDti}%
                    <span className="text-[10px] font-mono font-normal text-slate-400 ml-1">
                      ({simDti > 45 ? 'Danger' : simDti > 35 ? 'Caution' : 'Safe'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Solvency Warning Banner */}
              {simDti > 45 && (
                <div className="mt-3 p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] font-mono flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span>SOLVENCY WARNING: Debt obligations exceed prudent 45% ceiling.</span>
                </div>
              )}
            </div>

            {/* Core Capability Badges */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-left text-xs">
              <div className="p-3 rounded-xl glass-card border border-white/[0.06]">
                <span className="text-emerald-400 font-bold block mb-0.5">Isolated Data</span>
                <span className="text-slate-400 text-[11px]">Strict per-user Firestore isolation.</span>
              </div>
              <div className="p-3 rounded-xl glass-card border border-white/[0.06]">
                <span className="text-emerald-400 font-bold block mb-0.5">Real OAuth</span>
                <span className="text-slate-400 text-[11px]">Authentic Google & Email verification.</span>
              </div>
              <div className="p-3 rounded-xl glass-card border border-white/[0.06]">
                <span className="text-emerald-400 font-bold block mb-0.5">Cloud Sync</span>
                <span className="text-slate-400 text-[11px]">Persists across browser sessions.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card with Sign In / Create Account / Forgot Password */}
          <div className="lg:col-span-6 max-w-md mx-auto w-full">
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.10] shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                
                {/* Auth Mode Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      {authMode === 'signin' && 'Sign In'}
                      {authMode === 'signup' && 'Create Account'}
                      {authMode === 'forgot_password' && 'Reset Password'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {authMode === 'signin' && 'Enter your credentials to access your financial terminal'}
                      {authMode === 'signup' && 'Register your private credentials to begin'}
                      {authMode === 'forgot_password' && 'Enter your registered email for password recovery'}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    {authMode === 'forgot_password' ? <KeyRound className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                </div>

                {/* Tabs for Sign In vs Create Account */}
                {authMode !== 'forgot_password' && (
                  <div className="p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage('');
                        setResetSuccessMessage('');
                      }}
                      className={`btn-flash flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                        authMode === 'signin'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMessage('');
                        setResetSuccessMessage('');
                      }}
                      className={`btn-flash flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                        authMode === 'signup'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                )}

                {/* Return to Sign In if on Forgot Password */}
                {authMode === 'forgot_password' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMessage('');
                      setResetSuccessMessage('');
                    }}
                    className="btn-flash inline-flex items-center gap-1 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Success Banner */}
                {resetSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span>{resetSuccessMessage}</span>
                  </div>
                )}

                {/* Primary Form */}
                <form onSubmit={handleEmailPasswordSubmit} className="space-y-3">
                  
                  {/* Full Name for Sign Up */}
                  {authMode === 'signup' && (
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Vikram Singhania"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                  </div>

                  {/* Password (for signin and signup) */}
                  {authMode !== 'forgot_password' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-slate-300">Password</label>
                        {authMode === 'signin' && (
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('forgot_password');
                              setErrorMessage('');
                              setResetSuccessMessage('');
                            }}
                            className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-9 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="btn-flash absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Confirm Password (for signup) */}
                  {authMode === 'signup' && (
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-flash w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isLoading ? (
                      <span>Processing...</span>
                    ) : authMode === 'signup' ? (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : authMode === 'forgot_password' ? (
                      <>
                        <span>Send Password Reset Email</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider & Google OAuth Button */}
                {authMode !== 'forgot_password' && (
                  <>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex-1 h-[1px] bg-white/[0.06]" />
                      <span className="text-[11px] text-slate-500 font-mono">OR</span>
                      <div className="flex-1 h-[1px] bg-white/[0.06]" />
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleGoogleSignIn}
                      className="btn-flash w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-xs font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </>
                )}

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-white/[0.06] px-6 sm:px-12 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">ELEVATE</span>
          <span>• Private Banking & Financial Intelligence Terminal</span>
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          Firebase Authenticated Session
        </div>
      </footer>
    </div>
  );
};

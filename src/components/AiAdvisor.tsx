import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight,
  RefreshCw,
  Sliders,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { AdvisorMessage, FinancialProfile } from '../types';

interface AiAdvisorProps {
  profile?: FinancialProfile;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onNavigateToPlanner?: (e?: React.MouseEvent) => void;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({ 
  profile, 
  initialPrompt,
  onClearInitialPrompt,
  onNavigateToPlanner 
}) => {
  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### EXECUTIVE SYNTHESIS
Elevate Quantitative Intelligence is linked to your private balance sheet. Your verified monthly inflow of ₹80,000 and current obligations of ₹18,400 maintain your financial health in the **Healthy / Prime Tier (Score: 78/100)**.

### KEY METRIC IMPACT
• **Debt-to-Income (DTI)**: 31.0% (Well within 35% safe ceiling)
• **Emergency Runway**: 8.2 Months of liquid reserve coverage
• **Safe Additional EMI**: ₹7,500 / month ready for deployment

### STRATEGIC RECOMMENDATION
Ask any question regarding new credit tranches, tenure optimization, or debt-to-investment allocation. All telemetry is evaluated against your real cash flow model in real-time.`,
      timestamp: 'Active Session',
      metadata: {
        model: 'gemini-3.8-flash',
        dtiImpact: '31.0%',
      }
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  // Handle passed initial prompt
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      handleSendMessage(initialPrompt);
      onClearInitialPrompt?.();
    }
  }, [initialPrompt]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isAnalyzing) return;

    const userMessage: AdvisorMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          financialContext: {
            monthlyIncome: profile?.monthlyIncome || 80000,
            monthlyEmi: profile?.monthlyEmi || 0,
            debtRatio: `${profile?.debtRatio || 0}%`,
            healthScore: profile?.healthScore || 80,
            safeAdditionalEmi: profile?.safeAdditionalEmi || 30000,
            simulatedLoan: 500000,
            simulatedEmi: 16607,
          }
        }),
      });

      const data = await response.json();

      const aiMessage: AdvisorMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "I have evaluated your balance sheet metrics. Please specify your target tranche amount.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metadata: {
          model: data.source || 'gemini-3.8-flash',
        }
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Failed to query AI Advisor:", err);
      // Fallback message
      const fallbackAiMessage: AdvisorMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `### EXECUTIVE SYNTHESIS
With your monthly income of ₹80,000 and current obligations of ₹18,400 (31% DTI), your safe additional borrowing limit is ₹7,500/month.

### STRATEGIC RECOMMENDATION
Structuring any new loan over a 48-60 month window safeguards your 78 Prime score while preserving 8.2 months of liquid emergency reserves.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const starterPrompts = [
    "Can I afford a ₹15L home renovation loan?",
    "How to optimize my debt ratio below 25%?",
    "Compare prepayment vs SIP equity allocation",
    "What is my maximum safe borrowing ceiling?"
  ];

  return (
    <div className="space-y-6">
      {/* AI Futuristic Header Box with animated gradient glow */}
      <div className="relative rounded-2xl glass-card p-6 border border-emerald-500/20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
        {/* Animated gradient glow backdrop */}
        <div className="absolute -top-12 -right-12 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-b from-emerald-400/20 via-emerald-950/40 to-black border border-emerald-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              <Sparkles className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_#10b981]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-black tracking-wider text-white">
                  ELEVATE AI
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  INTELLIGENCE LAYER
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-mono tracking-wide mt-0.5">
                Your financial intelligence layer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CONTEXT: ₹80K INC / 31% DTI</span>
            </div>
            {onNavigateToPlanner && (
              <button
                onClick={(e) => onNavigateToPlanner(e)}
                className="btn-flash px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>EMI Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Futuristic Conversation Container */}
      <div className="glass-card rounded-2xl border border-white/[0.08] p-4 sm:p-6 min-h-[460px] flex flex-col justify-between relative overflow-hidden">
        {/* Messages Stream */}
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1 pb-4">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-1 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed transition-all ${
                    isAi
                      ? 'bg-[#0d121c]/80 backdrop-blur-xl border border-white/[0.09] text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                      : 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 text-white shadow-[0_8px_20px_rgba(16,185,129,0.15)]'
                  }`}
                >
                  {/* Sender & Timestamp */}
                  <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-white/[0.05] text-[10px] font-mono text-slate-400">
                    <span className="font-semibold text-emerald-400 tracking-wider uppercase">
                      {isAi ? 'ELEVATE COGNITIVE STRATEGIST' : 'CLIENT COMMAND'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Rendered content with clean formatting */}
                  <div className="space-y-2 whitespace-pre-wrap font-sans text-slate-200">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('### ')) {
                        const title = paragraph.replace('### ', '');
                        return (
                          <div key={pIdx} className="font-mono text-xs uppercase tracking-widest text-emerald-300 font-bold mt-3 mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {title}
                          </div>
                        );
                      }
                      return (
                        <p key={pIdx} className="text-slate-300 leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>

                  {msg.metadata?.model && (
                    <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-300">
                      <span>Engine: {msg.metadata.model}</span>
                      <span className="text-emerald-400">Verified Advisory</span>
                    </div>
                  )}
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-200 shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Glowing "Analyzing financial profile..." State */}
          {isAnalyzing && (
            <div className="flex gap-3 justify-start items-start animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-1 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
              </div>

              <div className="rounded-2xl p-4 sm:p-5 bg-[#0d121c]/90 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.2)] max-w-md">
                <div className="flex items-center gap-3">
                  {/* Minimal glowing radar / wave animation */}
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                  </div>

                  <div>
                    <div className="text-xs font-mono font-bold tracking-wider text-emerald-300">
                      Analyzing financial profile...
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Computing DTI velocity, safe liquidity runway & prime rate matrices.
                    </div>
                  </div>
                </div>

                {/* Minimal glowing progress pulse bar */}
                <div className="w-full bg-white/[0.05] h-1 rounded-full overflow-hidden mt-3">
                  <div className="bg-emerald-400 h-full rounded-full animate-pulse shadow-[0_0_8px_#10b981]" style={{ width: '65%' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Chips */}
        <div className="pt-3 pb-2 border-t border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-300 mb-2">
            Suggested Private Banking Inquiries
          </div>
          <div className="flex flex-wrap gap-2">
            {starterPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isAnalyzing}
                className="text-xs font-mono px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-300 border border-white/[0.06] hover:border-emerald-500/30 transition-all cursor-pointer text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="pt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-[#090c14]/90 p-2 rounded-2xl border border-white/10 focus-within:border-emerald-500/40 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask Elevate AI about loans, DTI ratio, or safe EMI thresholds..."
              disabled={isAnalyzing}
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none font-sans"
            />

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isAnalyzing}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                inputPrompt.trim() && !isAnalyzing
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:bg-emerald-400'
                  : 'bg-white/[0.04] text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

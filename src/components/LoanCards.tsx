import React, { useState } from 'react';
import { 
  Landmark, 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Percent, 
  FileText,
  Building2,
  ChevronRight
} from 'lucide-react';
import { LoanOffer } from '../types';

interface LoanCardsProps {
  onApplyForOffer?: (offer: LoanOffer) => void;
  onSimulateInPlanner?: (amount: number, rate: number, e?: React.MouseEvent) => void;
}

export const LoanCards: React.FC<LoanCardsProps> = ({ 
  onApplyForOffer,
  onSimulateInPlanner 
}) => {
  const [filterType, setFilterType] = useState<'all' | 'preapproved' | 'lowest_rate'>('all');

  const offers: LoanOffer[] = [
    {
      id: 'abc-bank',
      bankName: 'ABC BANK',
      tierTag: 'Private Banking Preferred',
      interestRate: 10.5,
      startingRateStr: '10.5%',
      estimatedEmi: 10618,
      estimatedEmiStr: '₹10,618',
      maxAmount: 2500000,
      maxAmountStr: '₹25,00,000',
      processingFee: 'Zero Surcharge (Waived)',
      approvalSpeed: 'Instant (12 Mins)',
      isBestFit: true, // Highlighted with BEST FIT and soft emerald glow
      perks: [
        'Pre-approved sovereign rate locked for 30 days',
        'Zero prepayment penalty after 6 months',
        'Direct relationship manager assignment',
      ]
    },
    {
      id: 'sc-private',
      bankName: 'STANDARD CHARTERED',
      tierTag: 'Priority Wealth Tranche',
      interestRate: 10.45,
      startingRateStr: '10.45%',
      estimatedEmi: 10598,
      estimatedEmiStr: '₹10,598',
      maxAmount: 3000000,
      maxAmountStr: '₹30,00,000',
      processingFee: '₹1,999 Flat',
      approvalSpeed: '24 Hours',
      isBestFit: false,
      perks: [
        'Multi-currency disbursement option',
        'Complimentary golf & airport lounge access',
        'Flexible step-down EMI structure',
      ]
    },
    {
      id: 'hdfc-infinity',
      bankName: 'HDFC INFINITY',
      tierTag: 'Super-Prime Tier',
      interestRate: 10.75,
      startingRateStr: '10.75%',
      estimatedEmi: 10747,
      estimatedEmiStr: '₹10,747',
      maxAmount: 2000000,
      maxAmountStr: '₹20,00,000',
      processingFee: '0.25% (Discounted)',
      approvalSpeed: 'Under 2 Hours',
      isBestFit: false,
      perks: [
        'Linked overdraft facility up to ₹5 Lakhs',
        'Automated repayment synchronization',
        'Preferential forex card issuance',
      ]
    },
    {
      id: 'icici-wealth',
      bankName: 'ICICI WEALTH',
      tierTag: 'Emerald Portfolio Select',
      interestRate: 10.9,
      startingRateStr: '10.9%',
      estimatedEmi: 10812,
      estimatedEmiStr: '₹10,812',
      maxAmount: 1800000,
      maxAmountStr: '₹18,00,000',
      processingFee: 'Waived for Private Clients',
      approvalSpeed: 'Instant Disbursal',
      isBestFit: false,
      perks: [
        'Instant disbursement to current account',
        'Free 1-year personal cyber insurance',
        'Zero documentation digital journey',
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400 font-semibold">
              INSTITUTIONAL SYNDICATE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              4 VERIFIED OFFERS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Private Banking Credit Lines
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Pre-qualified loan facilities calibrated to your ₹80K income & 78 Financial Health Score.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Tranches
            </button>
            <button
              onClick={() => setFilterType('preapproved')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'preapproved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pre-Approved Only
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Dark Glass Loan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {offers.map((offer) => {
          const isBest = offer.isBestFit;

          return (
            <div
              key={offer.id}
              className={`glass-card rounded-2xl p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isBest
                  ? 'border-emerald-500/40 glow-emerald shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.18)]'
                  : 'border-white/[0.08] hover:border-white/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.7)]'
              }`}
            >
              {/* Subtle gradient border highlight */}
              <div 
                className={`absolute inset-x-0 top-0 h-[2px] ${
                  isBest
                    ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'
                }`}
              />

              {/* Background ambient corner glow for Best Fit */}
              {isBest && (
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/[0.12] blur-2xl pointer-events-none" />
              )}

              <div>
                {/* Top Row: Bank Name + Best Fit Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
                      isBest 
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-300'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>

                    <div>
                      <h3 className="font-display font-extrabold text-base sm:text-lg text-white tracking-wider">
                        {offer.bankName}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-300">
                        {offer.tierTag}
                      </p>
                    </div>
                  </div>

                  {/* BEST FIT Highlighting */}
                  {isBest && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.35)]">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>BEST FIT</span>
                    </div>
                  )}
                </div>

                {/* Main Value Metrics: Rate + EMI */}
                <div className="grid grid-cols-2 gap-4 my-5 p-4 rounded-xl bg-black/40 border border-white/[0.05]">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                      Starting rate
                    </div>
                    <div className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {offer.startingRateStr}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      Fixed APR Tranche
                    </div>
                  </div>

                  <div className="border-l border-white/[0.06] pl-4">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                      Estimated EMI
                    </div>
                    <div className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_0_12px_rgba(16,185,129,0.3)] float-result-number">
                      {offer.estimatedEmiStr}
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                      For ₹5 Lakhs / 60 Mos
                    </div>
                  </div>
                </div>

                {/* Telemetry points */}
                <div className="space-y-2 mb-6">
                  {offer.perks.map((perk, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isBest ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                {/* Sub details */}
                <div className="pt-3 border-t border-white/[0.05] grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 mb-5">
                  <div>
                    <span className="text-slate-300 block">Processing:</span>
                    <span className="text-white font-medium">{offer.processingFee}</span>
                  </div>
                  <div>
                    <span className="text-slate-300 block">Disbursal:</span>
                    <span className="text-emerald-400 font-medium">{offer.approvalSpeed}</span>
                  </div>
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={(e) => onSimulateInPlanner?.(500000, offer.interestRate, e)}
                  className="btn-flash flex-1 py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-white/[0.06] text-xs font-mono transition-all text-center cursor-pointer"
                >
                  Simulate EMI
                </button>

                <button
                  onClick={() => onApplyForOffer?.(offer)}
                  className={`btn-flash flex-1 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isBest
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_18px_rgba(16,185,129,0.4)]'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  <span>Select Tranche</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

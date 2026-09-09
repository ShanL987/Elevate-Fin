import React, { useState, useMemo } from 'react';
import { TrendingUp, BarChart2, Calendar, Maximize2, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/finance';

interface TerminalChartProps {
  onZoom?: () => void;
}

interface DataPoint {
  period: string;
  inflow: number;
  existingDebt: number;
  projectedDebt: number;
  safeReserve: number;
  dti: number;
}

export const TerminalChart: React.FC<TerminalChartProps> = () => {
  const [timeframe, setTimeframe] = useState<'6M' | '1Y' | '3Y'>('1Y');
  const [activeMetric, setActiveMetric] = useState<'cashflow' | 'dti'>('cashflow');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Timeframe datasets
  const data: DataPoint[] = useMemo(() => {
    if (timeframe === '6M') {
      return [
        { period: 'Apr', inflow: 80000, existingDebt: 19800, projectedDebt: 18400, safeReserve: 52700, dti: 33 },
        { period: 'May', inflow: 80000, existingDebt: 19200, projectedDebt: 18400, safeReserve: 53300, dti: 32 },
        { period: 'Jun', inflow: 80000, existingDebt: 18800, projectedDebt: 18400, safeReserve: 53700, dti: 31.5 },
        { period: 'Jul', inflow: 80000, existingDebt: 18400, projectedDebt: 18400, safeReserve: 54100, dti: 31.0 },
        { period: 'Aug', inflow: 82500, existingDebt: 18400, projectedDebt: 17200, safeReserve: 56900, dti: 29.8 },
        { period: 'Sep', inflow: 82500, existingDebt: 17200, projectedDebt: 16100, safeReserve: 59200, dti: 28.5 },
      ];
    } else if (timeframe === '1Y') {
      return [
        { period: 'Q1 25', inflow: 76000, existingDebt: 21000, projectedDebt: 20000, safeReserve: 47000, dti: 34.5 },
        { period: 'Q2 25', inflow: 78000, existingDebt: 19800, projectedDebt: 19000, safeReserve: 50200, dti: 32.8 },
        { period: 'Q3 25', inflow: 80000, existingDebt: 18400, projectedDebt: 18400, safeReserve: 54100, dti: 31.0 },
        { period: 'Q4 25', inflow: 82000, existingDebt: 18400, projectedDebt: 17800, safeReserve: 55800, dti: 29.7 },
        { period: 'Q1 26', inflow: 85000, existingDebt: 17100, projectedDebt: 16500, safeReserve: 60400, dti: 27.2 },
        { period: 'Q2 26', inflow: 88000, existingDebt: 15800, projectedDebt: 14200, safeReserve: 64000, dti: 24.8 },
      ];
    } else {
      return [
        { period: '2024', inflow: 72000, existingDebt: 23500, projectedDebt: 22000, safeReserve: 41000, dti: 37.0 },
        { period: '2025', inflow: 80000, existingDebt: 18400, projectedDebt: 18400, safeReserve: 54100, dti: 31.0 },
        { period: '2026', inflow: 88000, existingDebt: 14200, projectedDebt: 13000, safeReserve: 66800, dti: 23.5 },
        { period: '2027', inflow: 96000, existingDebt: 9800, projectedDebt: 8500, safeReserve: 78700, dti: 17.2 },
        { period: '2028', inflow: 105000, existingDebt: 5000, projectedDebt: 4200, safeReserve: 92800, dti: 12.0 },
      ];
    }
  }, [timeframe]);

  // Coordinate mapping for clean responsive SVG line chart
  const width = 680;
  const height = 220;
  const paddingX = 40;
  const paddingY = 25;

  const points = useMemo(() => {
    const minVal = activeMetric === 'cashflow' ? 10000 : 10;
    const maxVal = activeMetric === 'cashflow' ? 95000 : 45;

    return data.map((d, i) => {
      const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
      
      const valPrimary = activeMetric === 'cashflow' ? d.safeReserve : d.dti;
      const valSecondary = activeMetric === 'cashflow' ? d.existingDebt : d.dti * 0.7;

      const yPrimary = height - paddingY - ((valPrimary - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
      const ySecondary = height - paddingY - ((valSecondary - minVal) / (maxVal - minVal)) * (height - paddingY * 2);

      return { x, yPrimary, ySecondary, d };
    });
  }, [data, activeMetric]);

  // Create smooth SVG cubic bezier path
  const primaryPath = useMemo(() => {
    if (!points.length) return '';
    return points.reduce((acc, p, i, arr) => {
      if (i === 0) return `M ${p.x} ${p.yPrimary}`;
      const prev = arr[i - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 2;
      const cpX2 = cpX1;
      return `${acc} C ${cpX1} ${prev.yPrimary}, ${cpX2} ${p.yPrimary}, ${p.x} ${p.yPrimary}`;
    }, '');
  }, [points]);

  const secondaryPath = useMemo(() => {
    if (!points.length) return '';
    return points.reduce((acc, p, i, arr) => {
      if (i === 0) return `M ${p.x} ${p.ySecondary}`;
      const prev = arr[i - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 2;
      const cpX2 = cpX1;
      return `${acc} C ${cpX1} ${prev.ySecondary}, ${cpX2} ${p.ySecondary}, ${p.x} ${p.ySecondary}`;
    }, '');
  }, [points]);

  const areaGradientPath = useMemo(() => {
    if (!points.length) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${primaryPath} L ${last.x} ${height - paddingY} L ${first.x} ${height - paddingY} Z`;
  }, [primaryPath, points]);

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  return (
    <div className="glass-card rounded-2xl p-5 lg:p-6 border border-white/[0.08] relative overflow-hidden">
      {/* Background soft ambient glow */}
      <div className="absolute top-0 right-1/4 w-72 h-36 bg-emerald-500/[0.04] blur-3xl pointer-events-none" />

      {/* Header & Terminal Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400 font-semibold">
              CASHFLOW PROJECTION
            </span>
          </div>
          <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
            {activeMetric === 'cashflow' ? 'Cash Surplus vs Debt Servicing' : 'Debt-to-Income Trajectory'}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => setActiveMetric('cashflow')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeMetric === 'cashflow'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Surplus vs Debt
            </button>
            <button
              onClick={() => setActiveMetric('dti')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeMetric === 'dti'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DTI % Ratio
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
            {(['6M', '1Y', '3Y'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  timeframe === t
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative w-full overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 overflow-visible"
        >
          <defs>
            {/* Soft luminous gradient under primary curve */}
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>

            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Subtle Horizontal Gridlines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => (
            <line
              key={idx}
              x1={paddingX}
              y1={paddingY + ratio * (height - paddingY * 2)}
              x2={width - paddingX}
              y2={paddingY + ratio * (height - paddingY * 2)}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="3 4"
              strokeWidth="1"
            />
          ))}

          {/* Area fill under curve */}
          <path d={areaGradientPath} fill="url(#chartAreaGradient)" />

          {/* Secondary Line (Debt obligation curve) */}
          <path
            d={secondaryPath}
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            opacity="0.85"
          />

          {/* Primary Line (Liquid Surplus / DTI curve) */}
          <path
            d={primaryPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            filter="url(#lineGlow)"
            className="transition-all duration-300"
          />

          {/* Red Danger Ceiling Threshold Line */}
          {activeMetric === 'dti' ? (
            <g>
              <line
                x1={paddingX}
                y1={height - paddingY - ((38 - 10) / (45 - 10)) * (height - paddingY * 2)}
                x2={width - paddingX}
                y2={height - paddingY - ((38 - 10) / (45 - 10)) * (height - paddingY * 2)}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                style={{ filter: 'drop-shadow(0 0 6px #ef4444)' }}
              />
              <rect
                x={width - paddingX - 126}
                y={height - paddingY - ((38 - 10) / (45 - 10)) * (height - paddingY * 2) - 10}
                width={122}
                height={18}
                rx={4}
                fill="#450a0a"
                stroke="#ef4444"
                strokeWidth="1"
              />
              <text
                x={width - paddingX - 65}
                y={height - paddingY - ((38 - 10) / (45 - 10)) * (height - paddingY * 2) + 3}
                textAnchor="middle"
                fill="#fca5a5"
                fontSize="9"
                fontWeight="bold"
                fontFamily="'JetBrains Mono', monospace"
              >
                DANGER CEILING (38%)
              </text>
            </g>
          ) : (
            <g>
              {/* Max Prudent Debt Ceiling line in cashflow mode */}
              <line
                x1={paddingX}
                y1={height - paddingY - ((24000 - 10000) / (95000 - 10000)) * (height - paddingY * 2)}
                x2={width - paddingX}
                y2={height - paddingY - ((24000 - 10000) / (95000 - 10000)) * (height - paddingY * 2)}
                stroke="#ef4444"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                opacity="0.8"
                style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }}
              />
              <text
                x={width - paddingX}
                y={height - paddingY - ((24000 - 10000) / (95000 - 10000)) * (height - paddingY * 2) - 4}
                textAnchor="end"
                fill="#f87171"
                fontSize="8.5"
                fontWeight="600"
                fontFamily="'JetBrains Mono', monospace"
              >
                CRITICAL DEBT DANGER LINE (₹24K)
              </text>
            </g>
          )}

          {/* Interactive Data Points & Vertical Hover Scrubber */}
          {points.map((p, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g key={i} className="cursor-pointer">
                {/* Invisible hover trigger column */}
                <rect
                  x={p.x - 25}
                  y={0}
                  width={50}
                  height={height}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                />

                {/* Vertical cursor guide line */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={height - paddingY}
                    stroke="rgba(16, 185, 129, 0.4)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Data Point Ring */}
                <circle
                  cx={p.x}
                  cy={p.yPrimary}
                  r={isHovered ? 6 : 3.5}
                  fill="#06080d"
                  stroke="#10b981"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 8px #10b981)' : 'none',
                  }}
                />

                {/* X Axis Label */}
                <text
                  x={p.x}
                  y={height - 6}
                  textAnchor="middle"
                  fill={isHovered ? '#34d399' : '#64748b'}
                  fontSize="11"
                  fontFamily="'JetBrains Mono', monospace"
                  className="transition-colors"
                >
                  {p.d.period}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Dark Glass Tooltip */}
        {activePoint && (
          <div className="mt-2 p-3 rounded-xl bg-[#0b0f19]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.7)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white border border-white/10 font-bold">
                {activePoint.d.period}
              </span>
              <span className="text-xs text-slate-300">Terminal Snapshot</span>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                <span className="text-slate-300">Liquid Surplus:</span>
                <span className="text-emerald-300 font-bold">
                  {formatINR(activePoint.d.safeReserve)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="text-slate-300">Monthly Debt:</span>
                <span className="text-teal-300 font-bold">
                  {formatINR(activePoint.d.existingDebt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-300">DTI:</span>
                <span className={`font-bold px-1.5 py-0.5 rounded border ${
                  activePoint.d.dti > 35 
                    ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.3)]' 
                    : 'bg-emerald-500/15 text-white border-emerald-500/30'
                }`}>
                  {activePoint.d.dti}%
                  {activePoint.d.dti > 35 && ' ⚠️'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Footer Indicator */}
      <div className="mt-3 pt-3 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-300">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-400" /> Safe Surplus Runway
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-teal-400 border-b border-dashed border-teal-400" /> Fixed Debt Service
          </span>
          <span className="flex items-center gap-1.5 text-red-400 font-semibold">
            <span className="w-2.5 h-0.5 bg-red-500 shadow-[0_0_6px_#ef4444]" /> &gt;38% Danger Ceiling
          </span>
        </div>
      </div>
    </div>
  );
};

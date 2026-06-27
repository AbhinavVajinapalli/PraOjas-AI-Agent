import React, { useState, useMemo } from 'react';
import { Timeframe, HistoricalBar } from '../types';
import { generateHistoricalData } from '../data/niftyData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Activity, Clock, BarChart3, TrendingUp } from 'lucide-react';

interface MainChartProps {
  selectedName: string;
  selectedSymbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export default function MainChart({
  selectedName,
  selectedSymbol,
  currentPrice,
  change,
  changePercent,
  prevClose,
  open,
  high,
  low,
  volume,
}: MainChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');

  // Generate historical points based on selected stock/index and timeframe
  const chartData = useMemo(() => {
    return generateHistoricalData(selectedSymbol, currentPrice, timeframe);
  }, [selectedSymbol, currentPrice, timeframe]);

  const isPositive = change >= 0;
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)';

  // Calculate day's percentage progress from Low to High
  const dayProgressPercent = useMemo(() => {
    const range = high - low;
    if (range <= 0) return 50;
    const progress = ((currentPrice - low) / range) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, [currentPrice, low, high]);

  const timeframes: Timeframe[] = ['1D', '1W', '1M', '1Y', '5Y'];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col h-full" id="main-chart-card">
      {/* Chart Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-100 font-sans">{selectedName}</h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md font-mono">
              {selectedSymbol}
            </span>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`text-sm font-semibold font-mono ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {change.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isPositive ? '+' : ''}
              {changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Timeframe & Display selectors */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-slate-950/80 p-1 rounded-xl flex border border-slate-800/80" id="timeframe-selectors">
            {timeframes.map((tf) => (
              <button
                key={tf}
                id={`tf-btn-${tf}`}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                  timeframe === tf
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="bg-slate-950/80 p-1 rounded-xl flex border border-slate-800/80" id="chart-type-selectors">
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                chartType === 'area' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Area Chart"
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                chartType === 'line' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Line Chart"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-80 min-h-[320px] mb-6 select-none relative" id="chart-canvas-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="chartColorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.4} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-5}
              domain={['auto', 'auto']}
              tickFormatter={(value) =>
                value.toLocaleString('en-IN', {
                  maximumFractionDigits: 0,
                })
              }
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as HistoricalBar;
                  return (
                    <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-2xl">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        {timeframe === '1D' ? `Time: ${data.time}` : `Date: ${data.time}`}
                      </div>
                      <div className="flex flex-col gap-1 font-mono">
                        <div className="flex justify-between gap-6 text-sm text-slate-200">
                          <span className="text-slate-400">Close:</span>
                          <span className="font-bold text-slate-100">
                            ₹{data.close.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {timeframe !== '1D' && (
                          <>
                            <div className="flex justify-between gap-6 text-xs text-slate-400">
                              <span>Open:</span>
                              <span>₹{data.open.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between gap-6 text-xs text-slate-400">
                              <span>High:</span>
                              <span className="text-emerald-400">₹{data.high.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between gap-6 text-xs text-slate-400">
                              <span>Low:</span>
                              <span className="text-rose-400">₹{data.low.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between gap-6 text-xs text-slate-400 border-t border-slate-900 pt-1 mt-1">
                          <span>Volume:</span>
                          <span>{data.volume.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {chartType === 'area' ? (
              <Area
                type="monotone"
                dataKey="close"
                stroke={strokeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#chartColorGrad)"
                isAnimationActive={false}
              />
            ) : (
              <Area
                type="monotone"
                dataKey="close"
                stroke={strokeColor}
                strokeWidth={2}
                fill="none"
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key Stats and Day's Range bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800" id="statistics-panels">
        {/* Day Range bar */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-bold text-slate-400 mb-2 font-sans flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            TODAY'S RANGE
          </span>
          <div className="flex items-center justify-between gap-4 font-mono text-xs text-slate-400 mb-1">
            <div className="text-left">
              <span className="block text-[10px] text-slate-500 font-sans uppercase font-bold">Low</span>
              <span>₹{low.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-slate-500 font-sans uppercase font-bold">High</span>
              <span>₹{high.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          {/* Custom Slider Indicator */}
          <div className="relative w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-rose-500 via-yellow-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${dayProgressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-sans font-medium text-right">
            Current is {dayProgressPercent.toFixed(0)}% of today's range
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-sans">
          <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
            <span className="text-xs text-slate-400 font-medium">Open</span>
            <span className="text-xs font-bold font-mono text-slate-200">
              ₹{open.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
            <span className="text-xs text-slate-400 font-medium">Prev Close</span>
            <span className="text-xs font-bold font-mono text-slate-200">
              ₹{prevClose.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
            <span className="text-xs text-slate-400 font-medium">Volume</span>
            <span className="text-xs font-bold font-mono text-slate-200">
              {(volume / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
            <span className="text-xs text-slate-400 font-medium">Trend</span>
            <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? 'Bullish' : 'Bearish'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

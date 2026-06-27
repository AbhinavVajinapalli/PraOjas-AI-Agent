import React from 'react';
import { IndexData } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface IndexSummaryProps {
  indices: IndexData[];
  selectedIndexId: string;
  onSelectIndex: (id: string) => void;
}

export default function IndexSummary({ indices, selectedIndexId, onSelectIndex }: IndexSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="indices-summary-section">
      {indices.map((index) => {
        const isSelected = index.id === selectedIndexId;
        const isPositive = index.change >= 0;
        
        // Format sparkline data for Recharts
        const chartData = index.sparkline.map((val, idx) => ({ value: val, id: idx }));

        return (
          <button
            key={index.id}
            id={`index-card-${index.id}`}
            onClick={() => onSelectIndex(index.id)}
            className={`flex flex-col p-4 rounded-2xl border text-left transition-all duration-300 ${
              isSelected
                ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-semibold text-slate-400 tracking-wider font-sans uppercase">
                {index.name}
              </span>
              <span
                className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {index.changePercent.toFixed(2)}%
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
                {index.price.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span
                className={`text-xs font-medium font-mono ${
                  isPositive ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {isPositive ? '▲' : '▼'}{' '}
                {Math.abs(index.change).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Sparkline Visualizer */}
            <div className="w-full h-10 mt-auto opacity-85">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={isPositive ? '#10b981' : '#f43f5e'}
                    strokeWidth={1.75}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </button>
        );
      })}
    </div>
  );
}

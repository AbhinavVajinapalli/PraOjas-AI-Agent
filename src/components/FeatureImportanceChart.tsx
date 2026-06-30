import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

export interface FeatureImportanceData {
  feature: string;
  importance: number;
}

interface FeatureImportanceChartProps {
  data: FeatureImportanceData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const isPositive = value > 0;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-200 text-sm font-medium mb-1">{label}</p>
        <p className={`text-xs font-bold ${isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
          Attribution Score: {value > 0 ? '+' : ''}{value.toFixed(3)}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          {isPositive ? 'Increases risk prediction' : 'Decreases risk prediction'}
        </p>
      </div>
    );
  }
  return null;
};

export default function FeatureImportanceChart({ data }: FeatureImportanceChartProps) {
  // Sort data by absolute importance to show the most impactful features at the top
  const sortedData = [...data].sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
          <XAxis 
            type="number" 
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            axisLine={{ stroke: '#475569' }}
            tickLine={{ stroke: '#475569' }}
            domain={['dataMin - 0.1', 'dataMax + 0.1']}
          />
          <YAxis 
            type="category" 
            dataKey="feature" 
            tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }}
            axisLine={{ stroke: '#475569' }}
            tickLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
          <ReferenceLine x={0} stroke="#64748b" strokeDasharray="3 3" />
          <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={16}>
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.importance > 0 ? '#f43f5e' : '#10b981'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

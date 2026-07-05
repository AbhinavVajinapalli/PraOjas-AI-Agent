import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { Patient } from '../types';
import { ArrowDown, ArrowUp, Heart, Activity, Wind, Thermometer } from 'lucide-react';

interface VitalsSummaryDashboardProps {
  patient: Patient;
}

// Generate 24-hour mock data for sparkline
function generateSparklineData(baseValue: number, volatility: number) {
  const data = [];
  let currentValue = baseValue;
  for (let i = 24; i >= 0; i--) {
    const noise = (Math.random() - 0.5) * volatility;
    currentValue = currentValue + noise;
    data.push({ value: currentValue });
  }
  // Ensure the last value is exactly the baseValue to match current vital
  data[data.length - 1].value = baseValue;
  return data;
}

const Sparkline = ({ data, color }: { data: any[], color: string }) => (
  <div className="h-10 w-24">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <YAxis domain={['dataMin', 'dataMax']} hide />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2} 
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const MetricCard = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  colorClass, 
  hexColor, 
  baseValue, 
  volatility,
  isAbnormal
}: any) => {
  const data = useMemo(() => generateSparklineData(baseValue, volatility), [baseValue, volatility]);
  
  // Calculate fake percentage change
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const percentChange = ((lastValue - firstValue) / firstValue) * 100;
  const isPositive = percentChange >= 0;

  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between ${isAbnormal ? 'bg-red-950/40 border-red-500/50' : 'bg-slate-950 border-slate-800/80'}`}>
      <div>
        <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-bold text-slate-500">
          <Icon className={`w-3 h-3 ${isAbnormal ? 'text-red-400' : colorClass}`} />
          {title}
        </div>
        <div className="flex items-end gap-2">
          <div className={`text-xl font-bold font-mono ${isAbnormal ? 'text-red-400' : 'text-slate-200'}`}>
            {value} <span className={`text-xs ${isAbnormal ? 'text-red-500/70' : 'text-slate-500'}`}>{unit}</span>
          </div>
          <div className={`flex items-center text-xs font-medium mb-0.5 ${isPositive ? (isAbnormal ? 'text-red-400' : 'text-rose-400') : (isAbnormal ? 'text-red-400' : 'text-emerald-400')}`}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(percentChange).toFixed(1)}%
          </div>
        </div>
      </div>
      <Sparkline data={data} color={isAbnormal ? '#f87171' : hexColor} />
    </div>
  );
};

export default function VitalsSummaryDashboard({ patient }: VitalsSummaryDashboardProps) {
  // We parse the BP string to get systolic for the sparkline base value
  const sysBp = parseInt(patient.vitals.bp.split('/')[0]) || 120;
  const diaBp = parseInt(patient.vitals.bp.split('/')[1]) || 80;

  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">24-Hour Vitals Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Heart Rate" 
          value={patient.vitals.hr} 
          unit="bpm" 
          icon={Heart} 
          colorClass="text-rose-400" 
          hexColor="#f43f5e"
          baseValue={patient.vitals.hr}
          volatility={15}
          isAbnormal={patient.vitals.hr < 60 || patient.vitals.hr > 100}
        />
        <MetricCard 
          title="Blood Pressure" 
          value={patient.vitals.bp} 
          unit="mmHg" 
          icon={Activity} 
          colorClass="text-blue-400" 
          hexColor="#3b82f6"
          baseValue={sysBp}
          volatility={10}
          isAbnormal={sysBp > 130 || sysBp < 90 || diaBp > 85 || diaBp < 60}
        />
        <MetricCard 
          title="SpO2" 
          value={patient.vitals.spo2} 
          unit="%" 
          icon={Wind} 
          colorClass="text-emerald-400" 
          hexColor="#10b981"
          baseValue={patient.vitals.spo2}
          volatility={2}
          isAbnormal={patient.vitals.spo2 < 95}
        />
        <MetricCard 
          title="Temperature" 
          value={patient.vitals.temp} 
          unit="°C" 
          icon={Thermometer} 
          colorClass="text-amber-400" 
          hexColor="#f59e0b"
          baseValue={patient.vitals.temp}
          volatility={0.5}
          isAbnormal={patient.vitals.temp < 36.0 || patient.vitals.temp > 38.0}
        />
      </div>
    </div>
  );
}

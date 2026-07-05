import React, { useMemo } from 'react';
import { Patient } from '../types';

interface VitalsHeatmapProps {
  patient: Patient;
  thresholds?: {
    hrMax: number;
    hrMin: number;
    spo2Min: number;
    sysMax: number;
    sysMin: number;
  };
}

// Generate 24 hours of mock data
const generateHeatmapData = (patient: Patient) => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    // Add some random variance based on current vitals
    const hrBase = patient.vitals.hr;
    const sysBpBase = parseInt(patient.vitals.bp.split('/')[0]);
    const spo2Base = patient.vitals.spo2;
    const tempBase = patient.vitals.temp;

    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hr: Math.round(hrBase + (Math.random() * 20 - 10)),
      sysBp: Math.round(sysBpBase + (Math.random() * 30 - 15)),
      spo2: Math.min(100, Math.max(85, Math.round(spo2Base + (Math.random() * 6 - 3)))),
      temp: parseFloat((tempBase + (Math.random() * 1.5 - 0.7)).toFixed(1))
    });
  }
  return data;
};

export default function VitalsHeatmap({ patient, thresholds }: VitalsHeatmapProps) {
  const data = useMemo(() => generateHeatmapData(patient), [patient.id, patient.vitals]);

  const defaultThresholds = thresholds || {
    hrMax: 100, hrMin: 60, spo2Min: 95, sysMax: 130, sysMin: 90
  };

  const tempThresholds = { max: 37.8, min: 36.1 };

  const getIntensity = (type: 'hr' | 'sysBp' | 'spo2' | 'temp', value: number) => {
    switch (type) {
      case 'hr':
        if (value > defaultThresholds.hrMax + 15 || value < defaultThresholds.hrMin - 10) return 'bg-rose-500/60 border-rose-500/50';
        if (value > defaultThresholds.hrMax || value < defaultThresholds.hrMin) return 'bg-amber-500/60 border-amber-500/50';
        return 'bg-emerald-500/20 border-emerald-500/10';
      case 'sysBp':
        if (value > defaultThresholds.sysMax + 20 || value < defaultThresholds.sysMin - 15) return 'bg-rose-500/60 border-rose-500/50';
        if (value > defaultThresholds.sysMax || value < defaultThresholds.sysMin) return 'bg-amber-500/60 border-amber-500/50';
        return 'bg-emerald-500/20 border-emerald-500/10';
      case 'spo2':
        if (value < defaultThresholds.spo2Min - 4) return 'bg-rose-500/60 border-rose-500/50';
        if (value < defaultThresholds.spo2Min) return 'bg-amber-500/60 border-amber-500/50';
        return 'bg-emerald-500/20 border-emerald-500/10';
      case 'temp':
        if (value > tempThresholds.max + 0.7 || value < tempThresholds.min - 0.5) return 'bg-rose-500/60 border-rose-500/50';
        if (value > tempThresholds.max || value < tempThresholds.min) return 'bg-amber-500/60 border-amber-500/50';
        return 'bg-emerald-500/20 border-emerald-500/10';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <h3 className="text-lg font-bold text-slate-200 mb-4 font-sans flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        24h Vitals Stability Heatmap
      </h3>
      <div className="overflow-x-auto custom-scrollbar pb-2">
        <div className="min-w-[600px]">
          <div className="flex mb-1">
            <div className="w-16 shrink-0"></div>
            <div className="flex-1 flex justify-between text-[9px] text-slate-500 px-1">
              {data.filter((_, i) => i % 4 === 0).map((d, i) => (
                <span key={i}>{d.time}</span>
              ))}
              <span>Now</span>
            </div>
          </div>
          
          <div className="space-y-1.5">
            {[
              { label: 'HR', key: 'hr' as const },
              { label: 'SysBP', key: 'sysBp' as const },
              { label: 'SpO2', key: 'spo2' as const },
              { label: 'Temp', key: 'temp' as const }
            ].map(row => (
              <div key={row.key} className="flex items-center gap-2">
                <div className="w-14 text-xs text-slate-400 font-medium text-right shrink-0">{row.label}</div>
                <div className="flex-1 flex gap-1 h-6">
                  {data.map((col, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-sm border transition-colors group relative ${getIntensity(row.key, col[row.key] as number)}`}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 w-max bg-slate-800 text-slate-200 text-[10px] py-1 px-2 rounded shadow-lg border border-slate-700 pointer-events-none">
                        <div className="font-bold text-slate-300">{col.time}</div>
                        <div>{row.label}: {col[row.key]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end gap-4 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/10"></div> Normal</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-500/60 border border-amber-500/50"></div> Warning</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-rose-500/60 border border-rose-500/50"></div> Critical</div>
          </div>
        </div>
      </div>
    </div>
  );
}

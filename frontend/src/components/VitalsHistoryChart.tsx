import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea
} from 'recharts';
import { Patient } from '../types';
import { Download } from 'lucide-react';

interface VitalsHistoryChartProps {
  patient: Patient;
  thresholds?: {
    hrMax: number;
    hrMin: number;
    spo2Min: number;
    sysMax: number;
    sysMin: number;
  };
}

// Generate mock historical data leading up to the current vitals
function generateMockHistory(currentHr: number, currentSpo2: number) {
  const data = [];
  const now = new Date();
  
  // Create 6 data points, one for each of the last 6 hours
  for (let i = 5; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    // Add some random noise to make it look realistic, converging on the actual current values
    const hrNoise = i === 0 ? 0 : Math.floor(Math.random() * 10) - 5;
    const spo2Noise = i === 0 ? 0 : Math.floor(Math.random() * 3) - 1;
    
    // Generate some baseline data (48 hour average)
    const baselineHr = Math.max(40, Math.min(200, currentHr - 5 + Math.floor(Math.random() * 4)));
    const baselineSpo2 = Math.max(70, Math.min(100, currentSpo2 + 1 - Math.floor(Math.random() * 2)));

    const mockHr = Math.max(40, Math.min(200, currentHr + hrNoise));
    const mockSpo2 = Math.max(70, Math.min(100, currentSpo2 + spo2Noise));
    
    const hrDeviation = Math.abs(mockHr - 80) / 40;
    const spo2Deviation = Math.max(0, 98 - mockSpo2) / 10;
    const sepsisRisk = Math.min(100, Math.floor((hrDeviation + spo2Deviation) * 20 + Math.random() * 10));

    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hr: mockHr,
      spo2: mockSpo2,
      baselineHr,
      baselineSpo2,
      sepsisRisk
    });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 p-3 rounded-xl shadow-2xl text-xs">
        <p className="text-slate-300 font-bold mb-2 pb-2 border-b border-slate-700/50">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-bold font-mono flex justify-between gap-6 items-center">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span>{entry.value} <span className="text-[10px] opacity-70">{entry.name.includes('Heart Rate') ? 'bpm' : '%'}</span></span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function VitalsHistoryChart({ patient, thresholds }: VitalsHistoryChartProps) {
  const [showBaseline, setShowBaseline] = useState(false);
  const [hiddenLines, setHiddenLines] = useState<Record<string, boolean>>({});

  const handleLegendClick = (e: any) => {
    const { dataKey } = e;
    if (dataKey) {
      setHiddenLines(prev => ({
        ...prev,
        [dataKey]: !prev[dataKey]
      }));
    }
  };

  const data = useMemo(() => {
    return generateMockHistory(patient.vitals.hr, patient.vitals.spo2);
  }, [patient.id, patient.vitals.hr, patient.vitals.spo2]);

  const breachSegments = useMemo(() => {
    if (!thresholds) return [];
    const segments: Array<{ start: string; end: string; type: string }> = [];
    let currentHrBreach: { start: string; end: string } | null = null;
    let currentSpo2Breach: { start: string; end: string } | null = null;

    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      const isHrBreach = point.hr > thresholds.hrMax || point.hr < thresholds.hrMin;
      const isSpo2Breach = point.spo2 < thresholds.spo2Min;

      // Heart Rate breaches
      if (isHrBreach && !currentHrBreach) {
        currentHrBreach = { start: i > 0 ? data[i-1].time : point.time, end: point.time };
      } else if (isHrBreach && currentHrBreach) {
        currentHrBreach.end = point.time;
      } else if (!isHrBreach && currentHrBreach) {
        segments.push({ ...currentHrBreach, type: 'hr' });
        currentHrBreach = null;
      }

      // SpO2 breaches
      if (isSpo2Breach && !currentSpo2Breach) {
        currentSpo2Breach = { start: i > 0 ? data[i-1].time : point.time, end: point.time };
      } else if (isSpo2Breach && currentSpo2Breach) {
        currentSpo2Breach.end = point.time;
      } else if (!isSpo2Breach && currentSpo2Breach) {
        segments.push({ ...currentSpo2Breach, type: 'spo2' });
        currentSpo2Breach = null;
      }
    }

    if (currentHrBreach) {
      if (currentHrBreach.start === currentHrBreach.end && data.length > 1) {
        currentHrBreach.start = data[data.length - 2].time; // Ensure segment has width if it's only the last point
      }
      segments.push({ ...currentHrBreach, type: 'hr' });
    }
    if (currentSpo2Breach) {
      if (currentSpo2Breach.start === currentSpo2Breach.end && data.length > 1) {
         currentSpo2Breach.start = data[data.length - 2].time;
      }
      segments.push({ ...currentSpo2Breach, type: 'spo2' });
    }

    return segments;
  }, [data, thresholds]);

  const handleExportCSV = () => {
    const headers = ['Time', 'Heart Rate', 'SpO2'];
    if (showBaseline) {
      headers.push('Baseline Heart Rate', 'Baseline SpO2');
    }

    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = [
        row.time,
        row.hr,
        row.spo2,
      ];
      if (showBaseline) {
        values.push(row.baselineHr, row.baselineSpo2);
      }
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `vitals_history_${patient.name.replace(/\s+/g, '_')}.csv`);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-64 bg-slate-950 p-3 rounded-xl border border-slate-800/80 mt-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-[10px] text-slate-500 uppercase font-bold">Vitals Trend (Last 6 Hours)</h5>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showBaseline} 
              onChange={(e) => setShowBaseline(e.target.checked)}
              className="w-3 h-3 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-950"
            />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Compare with Baseline (48h)</span>
          </label>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-md transition-colors"
          >
            <Download className="w-3 h-3" />
            Export CSV
          </button>
        </div>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={false}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: '#f43f5e', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#34d399', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[85, 100]}
            />
            <YAxis 
              yAxisId="sepsis"
              orientation="right"
              domain={[0, 100]}
              hide={true}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '10px', cursor: 'pointer' }} 
              iconType="circle" 
              iconSize={6} 
              onClick={handleLegendClick}
            />
            
            {breachSegments.map((segment, index) => {
              if (segment.type === 'hr' && hiddenLines.hr) return null;
              if (segment.type === 'spo2' && hiddenLines.spo2) return null;
              return (
                <ReferenceArea
                  key={`breach-${index}`}
                  x1={segment.start}
                  x2={segment.end}
                  yAxisId={segment.type === 'hr' ? 'left' : 'right'}
                  strokeOpacity={0}
                  fill={segment.type === 'hr' ? '#f43f5e' : '#34d399'}
                  fillOpacity={0.15}
                />
              );
            })}

            <Line 
              yAxisId="left"
              type="monotone" 
              name="Heart Rate"
              dataKey="hr" 
              hide={hiddenLines.hr}
              stroke="#f43f5e" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              name="SpO2"
              dataKey="spo2" 
              hide={hiddenLines.spo2}
              stroke="#34d399" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#34d399', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            {showBaseline && (
              <>
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  name="Baseline Heart Rate"
                  dataKey="baselineHr" 
                  hide={hiddenLines.baselineHr}
                  stroke="#fb7185" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#fb7185', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  name="Baseline SpO2"
                  dataKey="baselineSpo2" 
                  hide={hiddenLines.baselineSpo2}
                  stroke="#6ee7b7" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#6ee7b7', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </>
            )}
            <Line 
              yAxisId="sepsis"
              type="monotone" 
              name="Sepsis Risk Score"
              dataKey="sepsisRisk" 
              hide={hiddenLines.sepsisRisk}
              stroke="#a855f7" 
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

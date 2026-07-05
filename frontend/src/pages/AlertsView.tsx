import React from 'react';
import { Bell, CheckSquare } from 'lucide-react';

export default function AlertsView() {
  const alerts = [
    {
      id: 1,
      level: 'CRITICAL',
      patient: 'John Doe (P-10001)',
      time: '11:47:23 AM',
      description: 'Sepsis deterioration detected. Lactate has risen to 3.8 mmol/L (was 3.1). qSOFA score 3/3.',
      action: 'URGENT — Activate sepsis response team immediately.',
    },
    {
      id: 2,
      level: 'WARNING',
      patient: 'Sarah Kim (P-10002)',
      time: '11:45:12 AM',
      description: 'Tachycardia worsening: HR 98 bpm (threshold: 90). Temperature rising: 38.6°C.',
      action: 'Reassess antibiotics coverage and recheck cultures.',
    },
    {
      id: 3,
      level: 'WARNING',
      patient: 'Robert Chen (P-10003)',
      time: '11:30:08 AM',
      description: 'Respiratory rate elevated: 30/min (threshold: 18). SpO2 dropped to 95%.',
      action: 'Check airway patency and consider supplemental oxygen.',
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] p-8">
      {/* Header section */}
      <div className="mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-yellow-400">🔔</span> Live Monitoring Alerts
        </h1>
        <div className="text-slate-400 text-sm mt-1.5 flex items-center gap-2">
          <span>MonitoringAgent — Checking every 5 minutes</span>
          <span className="text-slate-600">|</span>
          <span>4 patients registered</span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1">
            SSE Connected <span className="text-green-500">✅</span>
          </span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4 max-w-5xl">
        {alerts.map(alert => {
          const isCritical = alert.level === 'CRITICAL';
          const indicatorColor = isCritical ? 'bg-red-500' : 'bg-orange-500';
          const textColor = isCritical ? 'text-red-500' : 'text-orange-500';
          
          return (
            <div 
              key={alert.id} 
              className="relative bg-[#1E293B] rounded-lg overflow-hidden border border-slate-700 p-4 pl-6"
            >
              {/* Left Color Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${indicatorColor}`} />
              
              <div className="flex items-center gap-2 mb-2">
                {/* Dot indicator */}
                <div className={`w-3 h-3 rounded-full ${indicatorColor} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} style={{ boxShadow: `0 0 10px ${isCritical ? '#ef4444' : '#f97316'}` }} />
                
                <span className={`font-bold text-sm ${textColor}`}>
                  {alert.level}
                </span>
                <span className="text-slate-400 text-sm">—</span>
                <span className="font-semibold text-slate-200 text-sm">Patient: {alert.patient}</span>
                <span className="text-slate-500 text-sm ml-1">| {alert.time}</span>
              </div>
              
              <p className="text-slate-300 text-sm leading-relaxed mb-1">
                {alert.description}
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                <strong className="text-slate-200">Action:</strong> {alert.action}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

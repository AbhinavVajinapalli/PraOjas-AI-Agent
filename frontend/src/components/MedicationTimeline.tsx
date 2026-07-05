import React, { useMemo } from 'react';
import { Patient } from '../types';
import { Pill, Syringe, Clock, AlertCircle } from 'lucide-react';

interface MedicationTimelineProps {
  patient: Patient;
}

// Generate some mock medication data relative to the current time to simulate doses given alongside vitals.
function generateMockMedications() {
  const now = new Date();
  const times = [
    new Date(now.getTime() - 5.5 * 60 * 60 * 1000), // 5.5 hours ago
    new Date(now.getTime() - 4 * 60 * 60 * 1000),   // 4 hours ago
    new Date(now.getTime() - 2.5 * 60 * 60 * 1000), // 2.5 hours ago
    new Date(now.getTime() - 1 * 60 * 60 * 1000),   // 1 hour ago
  ];

  return [
    {
      id: 1,
      time: times[0],
      medication: 'Ceftriaxone',
      dose: '1g',
      route: 'IV',
      type: 'antibiotic',
      notes: 'Initial broad-spectrum coverage'
    },
    {
      id: 2,
      time: times[1],
      medication: 'Normal Saline',
      dose: '500ml',
      route: 'IV',
      type: 'fluid',
      notes: 'Bolus for hypotension'
    },
    {
      id: 3,
      time: times[2],
      medication: 'Acetaminophen',
      dose: '650mg',
      route: 'PO',
      type: 'antipyretic',
      notes: 'For fever reduction'
    },
    {
      id: 4,
      time: times[3],
      medication: 'Norepinephrine',
      dose: '0.05 mcg/kg/min',
      route: 'IV',
      type: 'vasopressor',
      notes: 'Titrated to maintain MAP > 65'
    }
  ]; // Removed .reverse() to show left-to-right chronological flow
}

export default function MedicationTimeline({ patient }: MedicationTimelineProps) {
  const medications = useMemo(() => generateMockMedications(), [patient.id]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'antibiotic':
      case 'antipyretic':
        return <Pill className="w-4 h-4 text-purple-400" />;
      case 'fluid':
      case 'vasopressor':
        return <Syringe className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'antibiotic': return 'border-purple-500/50 bg-purple-950/20';
      case 'fluid': return 'border-blue-500/50 bg-blue-950/20';
      case 'antipyretic': return 'border-emerald-500/50 bg-emerald-950/20';
      case 'vasopressor': return 'border-rose-500/50 bg-rose-950/20';
      default: return 'border-slate-500/50 bg-slate-950/20';
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        Medication Administration History (Last 6 Hours)
      </h4>
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 overflow-x-auto custom-scrollbar">
        <div className="relative min-w-max flex items-center h-48 px-8">
          {/* Horizontal timeline line */}
          <div className="absolute top-[50%] left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2" />
          
          <div className="flex gap-12 relative z-10 w-full items-center">
            {medications.map((med, index) => {
              const isTop = index % 2 === 0;
              return (
                <div key={med.id} className="relative flex flex-col items-center group shrink-0 w-48">
                  
                  {/* Card content - positioned above or below */}
                  <div className={`absolute w-full flex justify-center ${isTop ? 'bottom-full mb-5' : 'top-full mt-5'}`}>
                    <div className={`p-3 w-full rounded-xl border ${getColor(med.type)} flex flex-col gap-1.5 shadow-lg bg-slate-900/90 backdrop-blur-sm z-20 transition-transform group-hover:scale-105`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          {getIcon(med.type)}
                          <span className="font-bold text-xs truncate" title={med.medication}>{med.medication}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{med.route}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">{med.dose}</span>
                        <span className="font-mono text-slate-400">
                          {med.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {med.notes && (
                        <p className="text-[9px] text-slate-400 italic border-t border-slate-800/50 pt-1.5 mt-0.5 line-clamp-2" title={med.notes}>
                          {med.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Connector line */}
                  <div className={`absolute w-px bg-slate-700 ${isTop ? 'bottom-2.5 h-2.5' : 'top-2.5 h-2.5'}`} />

                  {/* Timeline dot */}
                  <div className="w-5 h-5 bg-slate-950 border-2 border-slate-700 rounded-full flex items-center justify-center shrink-0 z-10">
                     <div className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-indigo-400 transition-colors" />
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

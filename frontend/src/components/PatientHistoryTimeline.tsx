import React from 'react';
import { Patient } from '../types';
import { Activity, Clock, Droplet, Stethoscope, Thermometer, Wind, CheckCircle2, AlertTriangle, Hospital } from 'lucide-react';
import { motion } from 'motion/react';

interface PatientHistoryTimelineProps {
  patient: Patient;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'admission' | 'vitals' | 'labs' | 'note' | 'status_change';
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export default function PatientHistoryTimeline({ patient }: PatientHistoryTimelineProps) {
  // Generate some deterministic mock history based on the patient data
  const generateHistory = (p: Patient): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const admitDate = new Date(p.admissionDate);
    
    // Admission
    events.push({
      id: `evt-${p.id}-1`,
      timestamp: admitDate.toISOString(),
      type: 'admission',
      title: 'Patient Admitted',
      description: `Admitted to ${p.department}`,
      icon: Hospital,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    });

    // Initial Vitals (1 hour after admission)
    const initVitalsDate = new Date(admitDate.getTime() + 60 * 60 * 1000);
    events.push({
      id: `evt-${p.id}-2`,
      timestamp: initVitalsDate.toISOString(),
      type: 'vitals',
      title: 'Initial Vitals Recorded',
      description: `HR: ${Math.max(60, p.vitals.hr - 10)} bpm, BP: ${p.vitals.bp}, Temp: 37.0°C`,
      icon: Activity,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    });

    // Initial Labs (2 hours after admission)
    const initLabsDate = new Date(admitDate.getTime() + 2 * 60 * 60 * 1000);
    events.push({
      id: `evt-${p.id}-3`,
      timestamp: initLabsDate.toISOString(),
      type: 'labs',
      title: 'Laboratory Results',
      description: `WBC: ${p.labs.wbc}, Lactate: ${p.labs.lactate} mmol/L`,
      icon: Droplet,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    });

    // Clinical Note (4 hours after admission)
    const noteDate = new Date(admitDate.getTime() + 4 * 60 * 60 * 1000);
    events.push({
      id: `evt-${p.id}-4`,
      timestamp: noteDate.toISOString(),
      type: 'note',
      title: 'Clinical Assessment',
      description: p.clinicalNotes.length > 50 ? p.clinicalNotes.substring(0, 50) + '...' : p.clinicalNotes,
      icon: Stethoscope,
      color: 'text-slate-400 bg-slate-500/10 border-slate-500/20'
    });

    // Current Status (Current time or recent)
    // We'll set this to slightly after the note
    const recentDate = new Date(admitDate.getTime() + 12 * 60 * 60 * 1000);
    
    let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    let statusIcon = CheckCircle2;
    if (p.status === 'Critical') {
      statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      statusIcon = AlertTriangle;
    } else if (p.status === 'Warning') {
      statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      statusIcon = AlertTriangle;
    }

    events.push({
      id: `evt-${p.id}-5`,
      timestamp: recentDate.toISOString(),
      type: 'status_change',
      title: `Status: ${p.status}`,
      description: `Current vitals - HR: ${p.vitals.hr}, SpO2: ${p.vitals.spo2}%`,
      icon: statusIcon,
      color: statusColor
    });

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const events = generateHistory(patient);

  return (
    <div className="space-y-4 mt-6">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-4">
        <Clock className="w-3.5 h-3.5" />
        Clinical History
      </h4>
      <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-800">
        {events.map((event, index) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            {/* Timeline Icon */}
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 ${event.color}`}>
              <event.icon className="w-4 h-4" />
            </div>
            
            {/* Content */}
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1 sm:gap-0">
                <span className="font-bold text-sm text-slate-200">{event.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(event.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-400">{event.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

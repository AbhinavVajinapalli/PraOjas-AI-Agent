import React from 'react';
import { Patient, DecisionLogEntry } from '../types';
import { Activity, Brain, User, AlertCircle, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DecisionLogTimelineProps {
  patient: Patient;
}

export default function DecisionLogTimeline({ patient }: DecisionLogTimelineProps) {
  const logs = patient.decisionLogs || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'AI_PREDICTION':
        return <Cpu className="w-4 h-4 text-indigo-400" />;
      case 'AI_EXPLANATION':
        return <Brain className="w-4 h-4 text-emerald-400" />;
      case 'CLINICIAN_INTERVENTION':
        return <User className="w-4 h-4 text-amber-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'AI_PREDICTION':
        return 'border-indigo-500/30 bg-indigo-500/5';
      case 'AI_EXPLANATION':
        return 'border-emerald-500/30 bg-emerald-500/5';
      case 'CLINICIAN_INTERVENTION':
        return 'border-amber-500/30 bg-amber-500/5';
      default:
        return 'border-slate-800 bg-slate-900/50';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-5">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
            Clinical Decision Log
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Timestamped history of AI interactions and clinician interventions
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
            <AlertCircle className="w-8 h-8 opacity-50" />
            <p className="text-sm">No recorded decisions yet.</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-800 ml-4 space-y-6">
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-6"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[11px] top-2 bg-slate-950 border-2 border-slate-700 rounded-full w-5 h-5 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${
                      log.type === 'AI_PREDICTION' ? 'bg-indigo-400' :
                      log.type === 'AI_EXPLANATION' ? 'bg-emerald-400' :
                      'bg-amber-400'
                    }`} />
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${getColor(log.type)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getIcon(log.type)}
                        <span className="font-bold text-sm text-slate-200">{log.action}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {log.details && (
                      <div className="text-sm text-slate-400 mt-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        {log.details}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

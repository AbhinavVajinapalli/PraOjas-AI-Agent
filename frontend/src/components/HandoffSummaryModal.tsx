import React from 'react';
import { Patient, PredictionResult } from '../types';
import { X, ClipboardList, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface HandoffSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  prediction?: PredictionResult | null;
}

export default function HandoffSummaryModal({ isOpen, onClose, patient, prediction }: HandoffSummaryModalProps) {
  if (!isOpen) return null;

  const logs = patient.decisionLogs || [];
  const recentLogs = logs.slice(0, 5);

  const summaryText = `SHIFT HANDOFF REPORT - ${new Date().toLocaleDateString()}
----------------------------------------
PATIENT: ${patient.name} (ID: ${patient.id})
AGE/GENDER: ${patient.age}y ${patient.gender}
DEPT: ${patient.department}
STATUS: ${patient.status.toUpperCase()}

CURRENT VITALS:
- HR: ${patient.vitals.hr} bpm
- BP: ${patient.vitals.bp} mmHg
- SpO2: ${patient.vitals.spo2}%
- Temp: ${patient.vitals.temp} °C

AI RISK ASSESSMENT:
- Sepsis Risk: ${prediction ? Math.round(prediction.sepsisProbability * 100) + '%' : 'N/A'}
- 30-Day Mortality: ${prediction ? Math.round(prediction.mortalityProbability * 100) + '%' : 'N/A'}

RECENT DECISIONS & INTERVENTIONS:
${recentLogs.length > 0 ? recentLogs.map(l => `- [${new Date(l.timestamp).toLocaleTimeString()}] ${l.action}${l.details ? `: ${l.details}` : ''}`).join('\n') : '- No recent interventions recorded.'}

ACTIVE ISSUES / ALERTS:
- ${patient.status === 'Critical' ? 'Patient is currently in CRITICAL condition. Immediate attention required.' : patient.status === 'Warning' ? 'Patient shows WARNING signs. Monitor closely.' : 'Patient is stable.'}
----------------------------------------`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summaryText).then(() => {
      toast.success('Handoff summary copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy text');
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-sans tracking-tight">Clinical Handoff Summary</h2>
              <p className="text-xs text-slate-400 font-sans">Structured shift-change report for {patient.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-950/50">
          <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
            {summaryText}
          </pre>
        </div>

        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
          <button 
            onClick={copyToClipboard}
            className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Copy to Clipboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}

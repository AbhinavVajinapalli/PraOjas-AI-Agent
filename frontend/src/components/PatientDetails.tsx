import React, { useState, useEffect, useRef } from 'react';
import { Patient, PredictionResult, ExplainabilityResult } from '../types';
import { Activity, Droplet, Heart, Wind, Stethoscope, Thermometer, Loader2, CheckCircle, User, FileText, Table, List, Settings2, Bell, X, Save, AlertTriangle, Syringe, ClipboardList, ClipboardCopy, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import VitalsHistoryChart from './VitalsHistoryChart';
import VitalsHeatmap from './VitalsHeatmap';
import VitalsSummaryDashboard from './VitalsSummaryDashboard';
import MedicationTimeline from './MedicationTimeline';
import PatientHistoryTimeline from './PatientHistoryTimeline';
import DecisionLogTimeline from './DecisionLogTimeline';
import HandoffSummaryModal from './HandoffSummaryModal';
import { motion, AnimatePresence } from 'motion/react';

import ClinicalNotesEditor from './ClinicalNotesEditor';

interface PatientDetailsProps {
  patient: Patient | null;
  onUpdatePatient?: (patient: Patient) => void;
  prediction?: PredictionResult | null;
  explainability?: ExplainabilityResult | null;
}

export default function PatientDetails({ patient, onUpdatePatient, prediction, explainability }: PatientDetailsProps) {
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'success'>('idle');
  const [vitalsView, setVitalsView] = useState<'stream' | 'table'>('stream');
  const [isHandoffOpen, setIsHandoffOpen] = useState(false);
  const [isSuggestingVitals, setIsSuggestingVitals] = useState(false);
  
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const isRiskActive = patient?.status === 'Warning' || patient?.status === 'Critical';

  const handleSmartVitals = async () => {
    if (!patient || !onUpdatePatient) return;
    
    setIsSuggestingVitals(true);
    toast.info('Analyzing patient history with AI to suggest current vitals...', { id: 'smart-vitals' });
    
    try {
      const response = await fetch('/api/smart-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patient }),
      });
      
      if (!response.ok) throw new Error('Failed to generate smart vitals');
      
      const suggestedVitals = await response.json();
      
      onUpdatePatient({
        ...patient,
        vitals: suggestedVitals
      });
      
      toast.success('Vitals updated via AI projection', { id: 'smart-vitals' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to suggest smart vitals', { id: 'smart-vitals' });
    } finally {
      setIsSuggestingVitals(false);
    }
  };

  const handleQuickAction = (action: string) => {
    toast.success(`${action} action logged`);
    setIsQuickActionsOpen(false);
    
    const newLog = {
      id: crypto.randomUUID(),
      type: 'CLINICIAN_INTERVENTION' as const,
      action: action,
      timestamp: new Date().toISOString(),
      details: `Quick action triggered during ${patient.status} state.`
    };

    onUpdatePatient({
      ...patient,
      decisionLogs: [newLog, ...(patient.decisionLogs || [])]
    });
  };
  
  const [isAlertConfigOpen, setIsAlertConfigOpen] = useState(false);
  const [thresholds, setThresholds] = useState({
    hrMax: 100,
    hrMin: 60,
    spo2Min: 95,
    sysMax: 130,
    sysMin: 90
  });

  const prevPatientIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!patient) return;
    
    // Only check alerts if the patient is already loaded (avoid alert storm on first click)
    // Or check always if we want real-time even on first load
    const checkVitals = () => {
      const { hr, spo2, bp } = patient.vitals;
      const sysBp = parseInt(bp.split('/')[0]);

      if (hr > thresholds.hrMax) {
        toast.error(`High Heart Rate Alert: ${hr} bpm (Threshold: ${thresholds.hrMax})`, { id: `hr-high-${patient.id}` });
      }
      if (hr < thresholds.hrMin) {
        toast.error(`Low Heart Rate Alert: ${hr} bpm (Threshold: ${thresholds.hrMin})`, { id: `hr-low-${patient.id}` });
      }
      if (spo2 < thresholds.spo2Min) {
        toast.error(`Low SpO2 Alert: ${spo2}% (Threshold: ${thresholds.spo2Min}%)`, { id: `spo2-low-${patient.id}` });
      }
      if (sysBp > thresholds.sysMax) {
        toast.error(`High Systolic BP Alert: ${sysBp} mmHg (Threshold: ${thresholds.sysMax})`, { id: `sysbp-high-${patient.id}` });
      }
      if (sysBp < thresholds.sysMin) {
        toast.error(`Low Systolic BP Alert: ${sysBp} mmHg (Threshold: ${thresholds.sysMin})`, { id: `sysbp-low-${patient.id}` });
      }
    };

    if (prevPatientIdRef.current === patient.id) {
      // Patient updated while viewing
      checkVitals();
    }
    
    prevPatientIdRef.current = patient.id;
  }, [patient, thresholds]);

  if (!patient) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex items-center justify-center text-slate-500 text-sm">
        Select a patient to view clinical details.
      </div>
    );
  }

  const handleDownloadPdf = () => {
    if (downloadState !== 'idle') return;
    setDownloadState('downloading');
    
    import('../utils/pdfGenerator').then(module => {
      // Small artificial delay to show animation
      setTimeout(() => {
        module.generatePatientReport(patient, prediction, explainability);
        setDownloadState('success');
        setTimeout(() => setDownloadState('idle'), 2500);
      }, 800);
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-full overflow-y-auto">
      <div className="flex items-start justify-between border-b border-slate-800 pb-5 mb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-sans tracking-tight mb-2">
            {patient.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-sans">
            <span className="font-mono text-slate-300 px-2 py-0.5 bg-slate-800 rounded">ID: {patient.id}</span>
            <span className="px-2 py-0.5 bg-slate-800/50 rounded-full border border-slate-700/50 flex items-center gap-1">
              <User className="w-3 h-3" /> {patient.age} yrs
            </span>
            <span className="px-2 py-0.5 bg-slate-800/50 rounded-full border border-slate-700/50">
              {patient.gender}
            </span>
            <span className="px-2 py-0.5 bg-slate-800/50 rounded-full border border-slate-700/50">
              Admitted: {new Date(patient.admissionDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {prediction && (
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-slate-800"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={100.5}
                    strokeDashoffset={100.5 - (prediction.sepsisProbability * 100.5)}
                    className={`${
                      prediction.sepsisProbability > 0.5 ? 'text-rose-500' :
                      prediction.sepsisProbability > 0.3 ? 'text-amber-500' :
                      'text-emerald-500'
                    } transition-all duration-1000 ease-out`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold font-mono text-slate-300">
                    {Math.round(prediction.sepsisProbability * 100)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase font-bold text-slate-500">Sepsis Risk</span>
                <span className={`text-xs font-bold ${
                  prediction.sepsisProbability > 0.5 ? 'text-rose-400' :
                  prediction.sepsisProbability > 0.3 ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {prediction.sepsisProbability > 0.5 ? 'High' : prediction.sepsisProbability > 0.3 ? 'Elevated' : 'Low'}
                </span>
              </div>
            </div>
          )}
          <div className="text-right flex flex-col items-end gap-2">
             <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-300">
               {patient.department}
             </span>
             <motion.button
               whileTap={{ scale: 0.95 }}
               onClick={() => setIsHandoffOpen(true)}
               className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 relative overflow-hidden"
             >
               <ClipboardCopy className="w-3.5 h-3.5" />
               Auto-Generate Handoff
             </motion.button>
             <motion.button 
               whileTap={{ scale: 0.95 }}
               onClick={handleDownloadPdf}
               disabled={downloadState !== 'idle'}
               className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-80 disabled:cursor-wait text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 relative overflow-hidden"
             >
               <AnimatePresence mode="wait">
               {downloadState === 'idle' && (
                 <motion.div key="idle" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-1.5">
                   <FileText className="w-3.5 h-3.5" />
                   <span>Export Patient Report</span>
                 </motion.div>
               )}
               {downloadState === 'downloading' && (
                 <motion.div key="downloading" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-1.5">
                   <Loader2 className="w-3.5 h-3.5 animate-spin" />
                   <span>Generating...</span>
                 </motion.div>
               )}
               {downloadState === 'success' && (
                 <motion.div key="success" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-1.5">
                   <CheckCircle className="w-3.5 h-3.5 text-blue-200" />
                   <span>Downloaded</span>
                 </motion.div>
               )}
             </AnimatePresence>
           </motion.button>
        </div>
        </div>
      </div>

      <VitalsSummaryDashboard patient={patient} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Vitals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Latest Vitals
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSmartVitals}
                disabled={isSuggestingVitals}
                className="flex items-center gap-1.5 px-3 py-1 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-400 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50 disabled:cursor-wait"
                title="AI Smart Vitals"
              >
                {isSuggestingVitals ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                Smart Vitals
              </button>
              <button 
                onClick={() => setIsAlertConfigOpen(!isAlertConfigOpen)} 
                className={`p-1 rounded-lg border transition-colors ${isAlertConfigOpen ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                title="Alert Thresholds"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button onClick={() => setVitalsView('stream')} className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${vitalsView === 'stream' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}>
                  <Activity className="w-3 h-3" /> Live
                </button>
                <button onClick={() => setVitalsView('table')} className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${vitalsView === 'table' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}>
                  <Table className="w-3 h-3" /> 24h
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isAlertConfigOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <Settings2 className="w-3 h-3" /> Alert Thresholds
                  </span>
                  <button onClick={() => setIsAlertConfigOpen(false)} className="text-slate-500 hover:text-slate-300">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-medium">HR Max (bpm)</label>
                    <input 
                      type="number" 
                      value={thresholds.hrMax} 
                      onChange={e => setThresholds(prev => ({ ...prev, hrMax: Number(e.target.value) }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-medium">HR Min (bpm)</label>
                    <input 
                      type="number" 
                      value={thresholds.hrMin} 
                      onChange={e => setThresholds(prev => ({ ...prev, hrMin: Number(e.target.value) }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-medium">SpO2 Min (%)</label>
                    <input 
                      type="number" 
                      value={thresholds.spo2Min} 
                      onChange={e => setThresholds(prev => ({ ...prev, spo2Min: Number(e.target.value) }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-medium">Sys BP Max (mmHg)</label>
                    <input 
                      type="number" 
                      value={thresholds.sysMax} 
                      onChange={e => setThresholds(prev => ({ ...prev, sysMax: Number(e.target.value) }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {vitalsView === 'stream' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${patient.vitals.hr < 60 || patient.vitals.hr > 100 ? 'bg-red-950/40 border-red-500/50' : 'bg-slate-950 border-slate-800/80'}`}>
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                    <Heart className={`w-3 h-3 ${patient.vitals.hr < 60 || patient.vitals.hr > 100 ? 'text-red-400' : 'text-rose-400'}`} /> Heart Rate
                  </span>
                  <span className={`text-lg font-bold font-mono ${patient.vitals.hr < 60 || patient.vitals.hr > 100 ? 'text-red-400' : 'text-slate-200'}`}>{patient.vitals.hr} <span className={`text-[10px] ${patient.vitals.hr < 60 || patient.vitals.hr > 100 ? 'text-red-500/70' : 'text-slate-500'}`}>bpm</span></span>
                </div>
                <div className={`p-3 rounded-xl border ${
                  (parseInt(patient.vitals.bp.split('/')[0]) > 130 || parseInt(patient.vitals.bp.split('/')[0]) < 90 || parseInt(patient.vitals.bp.split('/')[1]) > 85 || parseInt(patient.vitals.bp.split('/')[1]) < 60) 
                  ? 'bg-red-950/40 border-red-500/50' : 'bg-slate-950 border-slate-800/80'}`}>
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                    <Activity className={`w-3 h-3 ${
                      (parseInt(patient.vitals.bp.split('/')[0]) > 130 || parseInt(patient.vitals.bp.split('/')[0]) < 90 || parseInt(patient.vitals.bp.split('/')[1]) > 85 || parseInt(patient.vitals.bp.split('/')[1]) < 60) 
                      ? 'text-red-400' : 'text-blue-400'}`} /> Blood Pressure
                  </span>
                  <span className={`text-lg font-bold font-mono ${
                    (parseInt(patient.vitals.bp.split('/')[0]) > 130 || parseInt(patient.vitals.bp.split('/')[0]) < 90 || parseInt(patient.vitals.bp.split('/')[1]) > 85 || parseInt(patient.vitals.bp.split('/')[1]) < 60) 
                    ? 'text-red-400' : 'text-slate-200'}`}>{patient.vitals.bp} <span className={`text-[10px] ${
                      (parseInt(patient.vitals.bp.split('/')[0]) > 130 || parseInt(patient.vitals.bp.split('/')[0]) < 90 || parseInt(patient.vitals.bp.split('/')[1]) > 85 || parseInt(patient.vitals.bp.split('/')[1]) < 60) 
                      ? 'text-red-500/70' : 'text-slate-500'}`}>mmHg</span></span>
                </div>
                <div className={`p-3 rounded-xl border ${patient.vitals.spo2 < 95 ? 'bg-red-950/40 border-red-500/50' : 'bg-slate-950 border-slate-800/80'}`}>
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                    <Wind className={`w-3 h-3 ${patient.vitals.spo2 < 95 ? 'text-red-400' : 'text-emerald-400'}`} /> SpO2
                  </span>
                  <span className={`text-lg font-bold font-mono ${patient.vitals.spo2 < 95 ? 'text-red-400' : 'text-slate-200'}`}>{patient.vitals.spo2} <span className={`text-[10px] ${patient.vitals.spo2 < 95 ? 'text-red-500/70' : 'text-slate-500'}`}>%</span></span>
                </div>
                <div className={`p-3 rounded-xl border ${patient.vitals.temp > 38.0 || patient.vitals.temp < 36.0 ? 'bg-red-950/40 border-red-500/50' : 'bg-slate-950 border-slate-800/80'}`}>
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                    <Thermometer className={`w-3 h-3 ${patient.vitals.temp > 38.0 || patient.vitals.temp < 36.0 ? 'text-red-400' : 'text-amber-400'}`} /> Temp
                  </span>
                  <span className={`text-lg font-bold font-mono ${patient.vitals.temp > 38.0 || patient.vitals.temp < 36.0 ? 'text-red-400' : 'text-slate-200'}`}>{patient.vitals.temp} <span className={`text-[10px] ${patient.vitals.temp > 38.0 || patient.vitals.temp < 36.0 ? 'text-red-500/70' : 'text-slate-500'}`}>°C</span></span>
                </div>
              </div>
              
              <VitalsHeatmap patient={patient} thresholds={thresholds} />
              
              <VitalsHistoryChart patient={patient} thresholds={thresholds} />
            </>
          ) : (
            <div className="bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 backdrop-blur-sm text-slate-400 font-mono text-[10px] uppercase sticky top-0 z-10 border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2 font-medium">Time</th>
                      <th className="px-3 py-2 font-medium">HR</th>
                      <th className="px-3 py-2 font-medium">BP</th>
                      <th className="px-3 py-2 font-medium">SpO2</th>
                      <th className="px-3 py-2 font-medium">Temp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 font-mono text-slate-300">
                    {/* Mock 24h data generated deterministically based on current vitals */}
                    {Array.from({ length: 12 }).map((_, i) => {
                       const time = new Date(Date.now() - (i * 2 * 60 * 60 * 1000));
                       
                       // Create deterministic but noisy data points centered around the current patient vitals
                       const noiseSeed = patient.id.charCodeAt(0) + i;
                       const getNoise = (scale: number) => ((noiseSeed % 100) / 100 - 0.5) * scale;
                       
                       const hr = Math.round(patient.vitals.hr + getNoise(15));
                       const sys = parseInt(patient.vitals.bp.split('/')[0]) + Math.round(getNoise(20));
                       const dia = parseInt(patient.vitals.bp.split('/')[1]) + Math.round(getNoise(10));
                       const spo2 = Math.min(100, Math.max(90, patient.vitals.spo2 + Math.round(getNoise(5))));
                       const temp = (patient.vitals.temp + getNoise(1)).toFixed(1);
                       
                       return (
                         <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                           <td className="px-3 py-2.5 text-slate-500">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                           <td className={`px-3 py-2.5 ${hr > 100 || hr < 60 ? 'text-red-400' : ''}`}>{hr}</td>
                           <td className="px-3 py-2.5">{sys}/{dia}</td>
                           <td className={`px-3 py-2.5 ${spo2 < 95 ? 'text-red-400' : ''}`}>{spo2}%</td>
                           <td className={`px-3 py-2.5 ${parseFloat(temp) > 38 || parseFloat(temp) < 36 ? 'text-red-400' : ''}`}>{temp}°C</td>
                         </tr>
                       );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Labs & History */}
        <div className="space-y-6">
          <div className="space-y-4">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5" />
              Recent Labs
            </h4>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3 font-mono text-sm">
               <div className="flex justify-between items-center">
                 <span className="text-slate-400">Lactate</span>
                 <span className={`font-bold ${patient.labs.lactate > 2 ? 'text-rose-400' : 'text-slate-200'}`}>{patient.labs.lactate} mmol/L</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400">WBC Count</span>
                 <span className={`font-bold ${patient.labs.wbc > 12 ? 'text-rose-400' : 'text-slate-200'}`}>{patient.labs.wbc} 10^9/L</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400">Creatinine</span>
                 <span className="font-bold text-slate-200">{patient.labs.creatinine} mg/dL</span>
               </div>
            </div>
          </div>

          <ClinicalNotesEditor patient={patient} onUpdatePatient={onUpdatePatient} />
          
          <MedicationTimeline patient={patient} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PatientHistoryTimeline patient={patient} />
            <DecisionLogTimeline patient={patient} />
          </div>
        </div>
      </div>

      {/* Quick Action Floating Menu for High Risk Patients */}
      <AnimatePresence>
        {isRiskActive && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-6 right-6 z-50 flex flex-col items-end gap-3"
          >
            <AnimatePresence>
              {isQuickActionsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="flex flex-col gap-2 mb-2 w-48"
                >
                  <button 
                    onClick={() => handleQuickAction('Update Medication Log')}
                    className="flex items-center gap-2 p-3 bg-slate-900 border border-indigo-500/50 rounded-xl shadow-lg shadow-indigo-500/10 text-slate-200 hover:bg-slate-800 transition-colors w-full text-left font-medium text-sm group"
                  >
                    <div className="bg-indigo-500/20 p-1.5 rounded-lg text-indigo-400 group-hover:text-indigo-300 transition-colors">
                      <Syringe className="w-4 h-4" />
                    </div>
                    Medication Update
                  </button>
                  <button 
                    onClick={() => handleQuickAction('Request Bedside Assessment')}
                    className="flex items-center gap-2 p-3 bg-slate-900 border border-rose-500/50 rounded-xl shadow-lg shadow-rose-500/10 text-slate-200 hover:bg-slate-800 transition-colors w-full text-left font-medium text-sm group"
                  >
                    <div className="bg-rose-500/20 p-1.5 rounded-lg text-rose-400 group-hover:text-rose-300 transition-colors">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    Bedside Assessment
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
              className={`flex items-center gap-2 px-4 py-3 rounded-full font-bold shadow-xl transition-all ${
                isQuickActionsOpen 
                  ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/25 border border-rose-500 hover:shadow-rose-500/40 hover:-translate-y-1'
              }`}
            >
              {isQuickActionsOpen ? (
                <>
                  <X className="w-5 h-5" /> Close
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  Quick Actions
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isHandoffOpen && (
          <HandoffSummaryModal 
            isOpen={isHandoffOpen} 
            onClose={() => setIsHandoffOpen(false)} 
            patient={patient} 
            prediction={prediction} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

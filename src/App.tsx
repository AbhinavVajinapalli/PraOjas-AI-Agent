import React, { useState, useEffect } from 'react';
import { Patient, PredictionResult, ExplainabilityResult, DecisionLogEntry } from './types';
import { mockPatients } from './data';
import PatientList from './components/PatientList';
import PatientDetails from './components/PatientDetails';
import PredictionPanel from './components/PredictionPanel';
import ExplainabilityPanel from './components/ExplainabilityPanel';
import PatientEntryForm from './components/PatientEntryForm';
import AgentWorkflowDialog from './components/AgentWorkflowDialog';
import PopulationHealthPanel from './components/PopulationHealthPanel';
import AlertsDrawer from './components/AlertsDrawer';
import ThemeSwitcher from './components/ThemeSwitcher';
import { Toaster } from 'sonner';
import { Activity, ShieldCheck, HeartPulse, User, Network, Database, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const [explainability, setExplainability] = useState<ExplainabilityResult | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const [showWorkflow, setShowWorkflow] = useState(false);
  const [isNewPatientMode, setIsNewPatientMode] = useState(false);
  const [loadingNewPatient, setLoadingNewPatient] = useState(false);

  useEffect(() => {
    // Local patient list initialization
    setLoadingPatients(false);
  }, []);

  useEffect(() => {
    // Disabled auto vitals update as requested by user
  }, []);

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    setIsNewPatientMode(false);
    setPrediction(null);
    setExplainability(null);
  };

  const handleNewPatientStart = () => {
    setIsNewPatientMode(true);
    setSelectedPatientId(null);
    setPrediction(null);
    setExplainability(null);
  };

  const handleNewPatientSubmit = async (data: any) => {
    setLoadingNewPatient(true);
    try {
      const newPatient = {
        ...data,
        id: `P-${10500 + patients.length}`,
        admissionDate: new Date().toISOString(),
        status: 'Stable'
      };
      
      // Basic status heuristic for new entries to demonstrate reactivity
      if (newPatient.vitals.hr > 100 || newPatient.labs.lactate > 2.0) {
        newPatient.status = 'Warning';
      }
      if (newPatient.vitals.hr > 120 && newPatient.labs.lactate > 4.0) {
        newPatient.status = 'Critical';
      }

      setPatients(prev => [...prev, newPatient]);
      setSelectedPatientId(newPatient.id);
      setIsNewPatientMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNewPatient(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

  const handleRunPrediction = async () => {
    if (!selectedPatient) return;
    setLoadingPrediction(true);
    setExplainability(null);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: selectedPatient })
      });
      const data = await res.json();
      setPrediction(data);
      
      const newLog: DecisionLogEntry = {
        id: crypto.randomUUID(),
        type: 'AI_PREDICTION',
        action: 'Sepsis Risk Prediction Generated',
        timestamp: new Date().toISOString(),
        details: `Risk: ${Math.round(data.sepsisProbability * 100)}%, Confidence: ${Math.round(data.confidenceScore * 100)}%`
      };
      handleUpdatePatient({
        ...selectedPatient,
        decisionLogs: [newLog, ...(selectedPatient.decisionLogs || [])]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const handleGenerateExplanation = async () => {
    if (!selectedPatient || !prediction) return;
    setLoadingExplanation(true);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: selectedPatient, prediction })
      });
      const data = await res.json();
      setExplainability(data);
      
      const newLog: DecisionLogEntry = {
        id: crypto.randomUUID(),
        type: 'AI_EXPLANATION',
        action: 'Prediction Explanation Generated',
        timestamp: new Date().toISOString(),
        details: `Explanation retrieved based on latest prediction.`
      };
      handleUpdatePatient({
        ...selectedPatient,
        decisionLogs: [newLog, ...(selectedPatient.decisionLogs || [])]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
                PraOjas AI
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-sans font-medium">
                Clinical Decision Support System
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowWorkflow(true)}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/20 text-xs font-sans font-bold transition-colors"
             >
               <Network className="w-4 h-4" />
               View Model Architecture
             </button>
             <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 font-sans font-semibold">
               <ShieldCheck className="w-4 h-4 text-emerald-400" />
               Secure Enclave
             </span>
             <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 font-sans font-semibold">
               <User className="w-4 h-4 text-indigo-400" />
               Dr. Smith
             </span>
             <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Patient List */}
        <div className="lg:col-span-3">
          {loadingPatients ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 h-full flex items-center justify-center text-slate-500">
               Loading ICU Roster...
            </div>
          ) : (
            <PatientList 
              patients={patients} 
              selectedPatientId={selectedPatientId} 
              onSelectPatient={handleSelectPatient} 
              onNewPatient={handleNewPatientStart}
            />
          )}
        </div>

        {/* Center/Right Columns: Clinical Data & AI Agents */}
        <div className="lg:col-span-9 flex flex-col gap-6 relative">
          <AnimatePresence mode="wait">
            {isNewPatientMode ? (
              <motion.div 
                key="new-patient"
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-full"
              >
                <PatientEntryForm 
                  onSubmit={handleNewPatientSubmit} 
                  onCancel={() => setIsNewPatientMode(false)}
                  loading={loadingNewPatient}
                />
              </motion.div>
            ) : !selectedPatient ? (
              <motion.div 
                key="population"
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-full"
              >
                <PopulationHealthPanel patients={patients} />
              </motion.div>
            ) : (
              <motion.div 
                key="patient-details"
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col gap-6 h-full"
              >
                {/* Top Row: Patient Details */}
                <motion.div layout className="h-64 shrink-0 card-3d">
                   <PatientDetails 
                     patient={selectedPatient} 
                     onUpdatePatient={handleUpdatePatient} 
                     prediction={prediction}
                     explainability={explainability}
                   />
                </motion.div>

                {/* Bottom Row: AI Agents (Split 50/50) */}
                <motion.div layout className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[350px]">
                   <div className="card-3d">
                     <PredictionPanel 
                        prediction={prediction} 
                        loading={loadingPrediction} 
                        onRunPrediction={handleRunPrediction} 
                        patientSelected={!!selectedPatient}
                     />
                   </div>
                   
                   <div className="card-3d">
                     <ExplainabilityPanel 
                        explainability={explainability} 
                        loading={loadingExplanation} 
                        onGenerateExplanation={handleGenerateExplanation} 
                        predictionAvailable={!!prediction}
                     />
                   </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-6 py-5 text-center text-xs text-slate-500 font-sans">
        <p className="max-w-7xl mx-auto">
          PraOjas AI • Developed for Kaggle AI Agents Capstone • For demonstration purposes only. Not for actual clinical diagnosis.
        </p>
      </footer>
      
      <AlertsDrawer patients={patients} onSelectPatient={handleSelectPatient} />
      <Toaster theme="dark" position="top-right" richColors />

      <AnimatePresence>
        {showWorkflow && (
          <AgentWorkflowDialog key="agent-workflow-dialog" onClose={() => setShowWorkflow(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

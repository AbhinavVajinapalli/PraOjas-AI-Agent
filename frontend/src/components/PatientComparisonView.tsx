import React, { useState, useEffect } from 'react';
import { Patient, PredictionResult } from '../types';
import { Users, GitCompare, Activity, FileText } from 'lucide-react';
import MedicationTimeline from './MedicationTimeline';
import VitalsSummaryDashboard from './VitalsSummaryDashboard';

interface PatientComparisonViewProps {
  patients: Patient[];
}

export default function PatientComparisonView({ patients }: PatientComparisonViewProps) {
  const [patient1Id, setPatient1Id] = useState<string>(patients[0]?.id || '');
  const [patient2Id, setPatient2Id] = useState<string>(patients[1]?.id || '');
  
  const [prediction1, setPrediction1] = useState<PredictionResult | null>(null);
  const [prediction2, setPrediction2] = useState<PredictionResult | null>(null);
  
  const p1 = patients.find(p => p.id === patient1Id);
  const p2 = patients.find(p => p.id === patient2Id);

  useEffect(() => {
    if (p1) {
      fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: p1 })
      }).then(res => res.json()).then(data => setPrediction1(data)).catch(() => {});
    }
  }, [p1?.id]);

  useEffect(() => {
    if (p2) {
      fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: p2 })
      }).then(res => res.json()).then(data => setPrediction2(data)).catch(() => {});
    }
  }, [p2?.id]);

  const renderPatientColumn = (
    patient: Patient | undefined, 
    prediction: PredictionResult | null,
    selectedId: string, 
    onSelect: (id: string) => void
  ) => {
    return (
      <div className="flex-1 flex flex-col gap-4 border border-slate-800 rounded-2xl p-4 bg-slate-950/50 overflow-y-auto custom-scrollbar">
        <select 
          value={selectedId} 
          onChange={(e) => onSelect(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 outline-none focus:border-indigo-500"
        >
          <option value="" disabled>Select Patient</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
          ))}
        </select>
        
        {patient ? (
          <div className="flex flex-col gap-4 h-full">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{patient.name}</h3>
                <p className="text-xs text-slate-400">{patient.age}y {patient.gender} • {patient.department}</p>
              </div>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                patient.status === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                patient.status === 'Warning' ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {patient.status}
              </span>
            </div>

            {prediction && (
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">AI Sepsis Risk</span>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                      <circle 
                        cx="24" cy="24" r="20" 
                        stroke="currentColor" strokeWidth="4" fill="transparent" 
                        strokeDasharray={125.6} 
                        strokeDashoffset={125.6 - (prediction.sepsisProbability * 125.6)}
                        className={`${
                          prediction.sepsisProbability > 0.5 ? 'text-rose-500' :
                          prediction.sepsisProbability > 0.3 ? 'text-amber-500' : 'text-emerald-500'
                        } transition-all duration-1000`} 
                      />
                    </svg>
                    <span className="absolute text-xs font-bold font-mono text-slate-200">
                      {Math.round(prediction.sepsisProbability * 100)}
                    </span>
                  </div>
                  <div>
                    <span className={`text-sm font-bold ${
                      prediction.sepsisProbability > 0.5 ? 'text-rose-400' :
                      prediction.sepsisProbability > 0.3 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {prediction.sepsisProbability > 0.5 ? 'High Risk' : prediction.sepsisProbability > 0.3 ? 'Elevated Risk' : 'Low Risk'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Current Vitals</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">HR</span>
                  <div className="text-sm font-mono font-bold text-slate-200">{patient.vitals.hr}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">BP</span>
                  <div className="text-sm font-mono font-bold text-slate-200">{patient.vitals.bp}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">SpO2</span>
                  <div className="text-sm font-mono font-bold text-slate-200">{patient.vitals.spo2}%</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">Temp</span>
                  <div className="text-sm font-mono font-bold text-slate-200">{patient.vitals.temp}°C</div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <MedicationTimeline patient={patient} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Select a patient to view details
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100%-80px)] gap-4">
      {renderPatientColumn(p1, prediction1, patient1Id, setPatient1Id)}
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
          <GitCompare className="w-4 h-4 text-slate-400" />
        </div>
      </div>
      {renderPatientColumn(p2, prediction2, patient2Id, setPatient2Id)}
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, UserPlus, FileText } from 'lucide-react';

export default function AddPatientModal({ 
  isOpen, 
  onClose, 
  onAdd 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (data: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  
  // Manual Entry States
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [dept, setDept] = useState('Medical ICU');
  
  // Vitals
  const [hr, setHr] = useState('');
  const [bp, setBp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [temp, setTemp] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `P-${Math.floor(Math.random() * 90000) + 10000}`,
      name,
      age: Number(age),
      gender,
      department: dept,
      status: "Warning",
      admissionDate: new Date().toISOString().split('T')[0],
      vitals: { hr: Number(hr), bp, spo2: Number(spo2), temp: Number(temp), rr: 18, lactate: 2.0 },
      labs: { lactate: 2.0, wbc: 10.0, creatinine: 1.0, glucose: 100, sodium: 140, platelets: 200 },
      sepsisRisk: 25,
      mortalityRisk: 10,
      clinicalNotes: "Patient admitted manually.",
      medications: [],
      decisionLogs: []
    });
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload and parse
    setTimeout(() => {
      onAdd({
        id: `P-${Math.floor(Math.random() * 90000) + 10000}`,
        name: "Auto Parsed Patient",
        age: 65,
        gender: "Female",
        department: "Neuro ICU",
        status: "Critical",
        admissionDate: new Date().toISOString().split('T')[0],
        vitals: { hr: 110, bp: "90/60", spo2: 92, temp: 39.0, rr: 24, lactate: 4.5 },
        labs: { lactate: 4.5, wbc: 18.0, creatinine: 1.5, glucose: 180, sodium: 138, platelets: 120 },
        sepsisRisk: 85,
        mortalityRisk: 40,
        clinicalNotes: "Auto-parsed from uploaded document.",
        medications: [],
        decisionLogs: []
      });
      setIsUploading(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1E293B] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-[#0F172A]">
          <div>
            <h2 className="text-lg font-bold text-white">Admit New Patient</h2>
            <p className="text-sm text-slate-400">Fill details or upload clinical document</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-[#0F172A]">
          <button 
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'manual' ? 'border-[#06b6d4] text-[#06b6d4]' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}
          >
            <UserPlus className="w-4 h-4" /> Manual Entry
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'upload' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}
          >
            <FileText className="w-4 h-4" /> Upload Document
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#06b6d4]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Age</label>
                  <input type="number" required value={age} onChange={e => setAge(e.target.value)} placeholder="45" className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#06b6d4]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#06b6d4]">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-700 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Heart Rate</label>
                  <input type="number" required value={hr} onChange={e => setHr(e.target.value)} placeholder="bpm" className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#06b6d4]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Blood Pressure</label>
                  <input type="text" required value={bp} onChange={e => setBp(e.target.value)} placeholder="120/80" className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#06b6d4]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">SpO2 (%)</label>
                  <input type="number" required value={spo2} onChange={e => setSpo2(e.target.value)} placeholder="98" className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#06b6d4]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Temp (°C)</label>
                  <input type="number" step="0.1" required value={temp} onChange={e => setTemp(e.target.value)} placeholder="37.0" className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#06b6d4]" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#06b6d4] hover:bg-[#0891b2] text-white font-semibold rounded-lg transition-colors mt-6">
                Admit Patient
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-white mb-2">Upload Clinical Document</h3>
              <p className="text-sm text-center text-slate-400 mb-6">
                Upload a text or PDF file containing the latest labs/vitals. Our agent will parse and update the dashboard automatically.
              </p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".txt,.pdf"
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-semibold rounded-lg transition-colors"
              >
                {isUploading ? 'Parsing Document...' : 'Select File'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { UserPlus, Activity, Droplet, FileUp, Loader2 } from 'lucide-react';

interface PatientEntryFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function PatientEntryForm({ onSubmit, onCancel, loading }: PatientEntryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    department: 'Emergency',
    vitals: { hr: '', bp: '', temp: '', rr: '', spo2: '' },
    labs: { wbc: '', lactate: '', creatinine: '' },
    clinicalNotes: ''
  });
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      setFormData({
        name: data.name || '',
        age: data.age?.toString() || '',
        gender: data.gender || 'Male',
        department: data.department || 'Emergency',
        vitals: {
          hr: data.vitals?.hr?.toString() || '',
          bp: data.vitals?.bp || '',
          temp: data.vitals?.temp?.toString() || '',
          rr: data.vitals?.rr?.toString() || '',
          spo2: data.vitals?.spo2?.toString() || ''
        },
        labs: {
          wbc: data.labs?.wbc?.toString() || '',
          lactate: data.labs?.lactate?.toString() || '',
          creatinine: data.labs?.creatinine?.toString() || ''
        },
        clinicalNotes: data.clinicalNotes || ''
      });
    } catch (err) {
      console.error(err);
      alert('Failed to parse document. Please try entering data manually.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse form data
    const payload = {
      name: formData.name || 'Unknown Patient',
      age: parseInt(formData.age) || 50,
      gender: formData.gender,
      department: formData.department,
      vitals: {
        hr: parseInt(formData.vitals.hr) || 80,
        bp: formData.vitals.bp || '120/80',
        temp: parseFloat(formData.vitals.temp) || 37.0,
        rr: parseInt(formData.vitals.rr) || 16,
        spo2: parseInt(formData.vitals.spo2) || 98
      },
      labs: {
        wbc: parseFloat(formData.labs.wbc) || 8.0,
        lactate: parseFloat(formData.labs.lactate) || 1.0,
        creatinine: parseFloat(formData.labs.creatinine) || 1.0
      },
      clinicalNotes: formData.clinicalNotes || 'No notes provided.'
    };

    onSubmit(payload);
  };

  const updateVitals = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, vitals: { ...prev.vitals, [key]: value } }));
  };

  const updateLabs = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, labs: { ...prev.labs, [key]: value } }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Patient Entry</h2>
            <p className="text-xs text-slate-400">Upload a clinical document or enter data manually.</p>
          </div>
        </div>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.txt,.csv,.json" 
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing || loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-bold text-slate-200 transition-colors disabled:opacity-50"
          >
            {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4 text-indigo-400" />}
            {isParsing ? 'Extracting Data...' : 'Upload Document'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Patient Name</label>
            <input type="text" placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" required />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Age</label>
            <input type="number" placeholder="Years" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" required />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Gender</label>
            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        {/* Vitals */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
            <Activity className="w-4 h-4 text-rose-400" /> Vitals
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">HR (bpm)</label>
              <input type="number" placeholder="80" value={formData.vitals.hr} onChange={e => updateVitals('hr', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">BP (mmHg)</label>
              <input type="text" placeholder="120/80" value={formData.vitals.bp} onChange={e => updateVitals('bp', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Temp (°C)</label>
              <input type="number" step="0.1" placeholder="37.0" value={formData.vitals.temp} onChange={e => updateVitals('temp', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">RR</label>
              <input type="number" placeholder="16" value={formData.vitals.rr} onChange={e => updateVitals('rr', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">SpO2 (%)</label>
              <input type="number" placeholder="98" value={formData.vitals.spo2} onChange={e => updateVitals('spo2', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" required />
            </div>
          </div>
        </div>

        {/* Labs */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
            <Droplet className="w-4 h-4 text-emerald-400" /> Labs
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Lactate (mmol/L)</label>
              <input type="number" step="0.1" placeholder="1.0" value={formData.labs.lactate} onChange={e => updateLabs('lactate', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">WBC (10^9/L)</label>
              <input type="number" step="0.1" placeholder="8.0" value={formData.labs.wbc} onChange={e => updateLabs('wbc', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Creatinine (mg/dL)</label>
              <input type="number" step="0.1" placeholder="1.0" value={formData.labs.creatinine} onChange={e => updateLabs('creatinine', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" required />
            </div>
          </div>
        </div>

        {/* Clinical Notes */}
        <div>
          <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Clinical Notes (Unstructured Data)</label>
          <textarea placeholder="Enter triage notes, history of present illness, or observations..." value={formData.clinicalNotes} onChange={e => setFormData({...formData, clinicalNotes: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 h-24 resize-none" />
        </div>

        <div className="flex items-center gap-3 justify-end pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-200 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50">
            {loading ? 'Processing...' : 'Run Analysis'}
          </button>
        </div>
      </form>
    </div>
  );
}

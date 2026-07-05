import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Activity, FileText } from 'lucide-react';

export default function ManualEntryModal({ 
  isOpen, 
  onClose, 
  onUpdate, 
  patientName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onUpdate: (data: any) => void;
  patientName: string;
}) {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  
  // Manual Entry States
  const [hr, setHr] = useState('');
  const [bp, setBp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [temp, setTemp] = useState('');
  
  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      vitals: {
        hr: Number(hr),
        bp,
        spo2: Number(spo2),
        temp: Number(temp)
      }
    });
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      // Assume the backend returns parsed vitals/labs
      // In a real scenario, map this exactly to the Patient type
      if (data && data.vitals) {
        onUpdate({ vitals: data.vitals, labs: data.labs });
      }
      onClose();
    } catch (error) {
      console.error("Failed to parse document:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/30">
          <div>
            <h2 className="text-lg font-bold text-foreground">Update Patient Data</h2>
            <p className="text-sm text-muted-foreground">{patientName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button 
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'manual' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-muted-foreground hover:bg-secondary/50'}`}
          >
            <Activity className="w-4 h-4" /> Manual Entry
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'upload' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-muted-foreground hover:bg-secondary/50'}`}
          >
            <FileText className="w-4 h-4" /> Upload Document
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Heart Rate</label>
                  <input type="number" required value={hr} onChange={e => setHr(e.target.value)} placeholder="bpm" className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Blood Pressure</label>
                  <input type="text" required value={bp} onChange={e => setBp(e.target.value)} placeholder="120/80" className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">SpO2 (%)</label>
                  <input type="number" required value={spo2} onChange={e => setSpo2(e.target.value)} placeholder="98" className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Temp (°C)</label>
                  <input type="number" step="0.1" required value={temp} onChange={e => setTemp(e.target.value)} placeholder="37.0" className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors mt-6">
                Update Vitals
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Upload Clinical Document</h3>
              <p className="text-sm text-center text-muted-foreground mb-6">
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

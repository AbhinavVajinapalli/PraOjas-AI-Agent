import React, { useState } from 'react';
import { Patient, Observation, DecisionLogEntry } from '../types';
import { Clock, Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClinicalNotesEditorProps {
  patient: Patient;
  onUpdatePatient?: (patient: Patient) => void;
}

export default function ClinicalNotesEditor({ patient, onUpdatePatient }: ClinicalNotesEditorProps) {
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const observations = patient.observations || [];

  const handleAddNote = () => {
    if (!newNote.trim() || !onUpdatePatient) return;
    
    const newObservation: Observation = {
      id: Math.random().toString(36).substring(2, 9),
      text: newNote.trim(),
      timestamp: new Date().toISOString()
    };

    const newLog: DecisionLogEntry = {
      id: crypto.randomUUID(),
      type: 'CLINICIAN_INTERVENTION',
      action: 'Added Clinical Observation',
      timestamp: new Date().toISOString(),
      details: newNote.trim()
    };

    onUpdatePatient({
      ...patient,
      observations: [newObservation, ...observations],
      decisionLogs: [newLog, ...(patient.decisionLogs || [])]
    });
    setNewNote('');
  };

  const handleUpdateNote = (id: string) => {
    if (!editText.trim() || !onUpdatePatient) return;

    onUpdatePatient({
      ...patient,
      observations: observations.map(obs => 
        obs.id === id ? { ...obs, text: editText.trim() } : obs
      )
    });
    setEditingId(null);
    setEditText('');
  };

  const handleDeleteNote = (id: string) => {
    if (!onUpdatePatient) return;

    onUpdatePatient({
      ...patient,
      observations: observations.filter(obs => obs.id !== id)
    });
  };

  const startEditing = (obs: Observation) => {
    setEditingId(obs.id);
    setEditText(obs.text);
  };

  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mt-4">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Edit2 className="w-3.5 h-3.5" />
        Clinical Observations
      </h4>
      
      {/* New Note Form */}
      {onUpdatePatient && (
        <div className="mb-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a new observation..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-indigo-500 resize-none h-20 mb-2 transition-colors"
          />
          <div className="flex justify-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Observation
            </motion.button>
          </div>
        </div>
      )}

      {/* Legacy clinicalNotes fallback */}
      {!observations.length && patient.clinicalNotes && (
        <div className="text-sm text-slate-300 leading-relaxed font-sans italic border-l-2 border-slate-700 pl-3 mb-4">
          "{patient.clinicalNotes}"
        </div>
      )}

      {/* Observations List */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {observations.map(obs => (
            <motion.div
              key={obs.id}
              initial={{ opacity: 0, height: 0, scale: 0.95, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', scale: 1, marginBottom: 12 }}
              exit={{ opacity: 0, height: 0, scale: 0.95, marginBottom: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-slate-900 rounded-lg p-3 border border-slate-800 relative group overflow-hidden"
            >
              {editingId === obs.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-slate-950 border border-indigo-500 rounded-lg p-2 text-sm text-slate-200 outline-none resize-none h-20"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleUpdateNote(obs.id)} className="p-1.5 text-emerald-400 hover:text-emerald-300 transition-colors">
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(obs.timestamp).toLocaleString()}
                    </div>
                    {onUpdatePatient && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditing(obs)} className="p-1 text-slate-400 hover:text-indigo-400 transition-colors">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteNote(obs.id)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{obs.text}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

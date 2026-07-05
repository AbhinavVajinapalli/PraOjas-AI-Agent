import React, { useState, useMemo } from 'react';
import { Patient } from '../types';
import { AlertTriangle, CheckCircle2, Plus, Search, Activity, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PatientListProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (id: string) => void;
  onNewPatient: () => void;
}

const STATUS_CONFIG = {
  Critical: { icon: AlertTriangle,   color: '#f43f5e', glow: 'rgba(244,63,94,0.18)',   bg: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.25)',   label: 'status-critical' },
  Warning:  { icon: Activity,        color: '#f59e0b', glow: 'rgba(245,158,11,0.15)',  bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  label: 'status-warning' },
  Stable:   { icon: CheckCircle2,    color: '#10b981', glow: 'rgba(16,185,129,0.12)',  bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.20)',  label: 'status-stable' },
} as const;

const FILTERS = ['All', 'Critical', 'Warning', 'Stable'] as const;

export default function PatientList({ patients, selectedPatientId, onSelectPatient, onNewPatient }: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'risk'>('default');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Stable' | 'Warning' | 'Critical'>('All');

  const counts = useMemo(() => ({
    Critical: patients.filter(p => p.status === 'Critical').length,
    Warning:  patients.filter(p => p.status === 'Warning').length,
    Stable:   patients.filter(p => p.status === 'Stable').length,
  }), [patients]);

  const filteredAndSortedPatients = useMemo(() => {
    let result = [...patients];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') result = result.filter(p => p.status === statusFilter);
    if (sortBy === 'risk') {
      const rank: Record<string, number> = { Critical: 3, Warning: 2, Stable: 1 };
      result.sort((a, b) => (rank[b.status] || 0) - (rank[a.status] || 0));
    }
    return result;
  }, [patients, searchQuery, sortBy, statusFilter]);

  return (
    <div className="card flex flex-col h-full overflow-hidden">

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-800/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="section-header">Active ICU Roster</h3>
          <button
            onClick={onNewPatient}
            title="Add new patient"
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
            style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.20)', color: '#818cf8' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.20)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.10)'; }}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Patient count chips */}
        <div className="flex gap-1.5">
          {(['Critical', 'Warning', 'Stable'] as const).map(s => (
            <div key={s} className={`status-pill status-${s.toLowerCase()} flex-1 justify-center cursor-pointer`}
              onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}>
              <span>{counts[s]}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search name or ID…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-7 pr-3 py-1.5 rounded-lg outline-none"
              style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(30,41,59,0.8)',
                color: 'var(--theme-slate-200)',
              }}
            />
          </div>
          <button
            onClick={() => setSortBy(s => s === 'risk' ? 'default' : 'risk')}
            title="Sort by risk"
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
            style={{
              background: sortBy === 'risk' ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.8)',
              border: `1px solid ${sortBy === 'risk' ? 'rgba(99,102,241,0.35)' : 'rgba(30,41,59,0.8)'}`,
              color: sortBy === 'risk' ? '#818cf8' : 'var(--theme-slate-500)',
            }}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Risk
          </button>
        </div>
      </div>

      {/* ── Patient Cards ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedPatients.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-slate-600 text-xs py-8"
            >
              No patients match your filter.
            </motion.div>
          )}
          {filteredAndSortedPatients.map(patient => {
            const isSelected = patient.id === selectedPatientId;
            const cfg = STATUS_CONFIG[patient.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Stable;
            const Icon = cfg.icon;

            return (
              <motion.button
                layout
                key={patient.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onSelectPatient(patient.id)}
                className="w-full text-left rounded-2xl p-3.5 transition-all group"
                style={{
                  background: isSelected
                    ? 'rgba(99,102,241,0.10)'
                    : 'rgba(15,23,42,0.60)',
                  border: `1px solid ${isSelected ? 'rgba(99,102,241,0.35)' : 'rgba(30,41,59,0.8)'}`,
                  boxShadow: isSelected ? '0 0 20px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-slate-100 truncate">{patient.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-900/60 px-1.5 py-0.5 rounded shrink-0">
                        {patient.id}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {patient.age}y {patient.gender} · {patient.department}
                    </div>
                  </div>

                  {/* Right: status icon */}
                  <div
                    className="relative w-8 h-8 shrink-0 rounded-xl flex items-center justify-center"
                    style={{
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      boxShadow: patient.status !== 'Stable' ? `0 0 12px ${cfg.glow}` : 'none',
                    }}
                  >
                    {/* Pulse ring for critical/warning */}
                    {patient.status !== 'Stable' && (
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{ background: cfg.glow }}
                        animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.25, 1] }}
                        transition={{ duration: patient.status === 'Critical' ? 1.4 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 relative z-10" style={{ color: cfg.color }} />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Footer count ── */}
      <div className="px-4 py-2.5 border-t border-slate-800/40 text-[10px] text-slate-600 font-medium">
        {filteredAndSortedPatients.length} of {patients.length} patients shown
      </div>
    </div>
  );
}

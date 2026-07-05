import React from 'react';
import { Patient } from '../types';
import PatientDetails from './PatientDetails';
import {
  FlaskConical, Activity, Heart, Thermometer, Wind, Droplet,
  Building2, Calendar, BadgeInfo, ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface PatientDashboardProps {
  patient: Patient;
  onUpdatePatient: (p: Patient) => void;
  onInitiateAnalysis: () => void;
}

function VitalBadge({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color: string }) {
  return (
    <div className="vitals-card">
      <span className="section-header">{label}</span>
      <div className="flex items-end gap-1 mt-1">
        <span className="metric-value" style={{ color }}>{value}</span>
        {unit && <span className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{unit}</span>}
      </div>
    </div>
  );
}

export default function PatientDashboard({ patient, onUpdatePatient, onInitiateAnalysis }: PatientDashboardProps) {
  const admittedDate = new Date(patient.admissionDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  const [sbp, dbp] = patient.vitals.bp.split('/');

  const statusConfig = {
    Critical: { pill: 'status-pill status-critical', dot: '#f43f5e' },
    Warning:  { pill: 'status-pill status-warning',  dot: '#f59e0b' },
    Stable:   { pill: 'status-pill status-stable',   dot: '#10b981' },
  };
  const cfg = statusConfig[patient.status] || statusConfig['Stable'];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Patient Identity Banner ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="card p-5"
        style={{ background: 'var(--surface-card)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: identity */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.20)' }}>
              <span className="text-xl font-black text-indigo-400">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-black text-white">{patient.name}</h2>
                <span className={cfg.pill}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                  {patient.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <BadgeInfo className="w-3.5 h-3.5" />
                  {patient.id}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {patient.age} yrs · {patient.gender}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Building2 className="w-3.5 h-3.5" />
                  {patient.department}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="w-3.5 h-3.5" />
                  Admitted {admittedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Right: CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onInitiateAnalysis}
            className="btn-primary !py-3 !px-6 !text-sm !rounded-xl shrink-0 self-start md:self-center"
            style={{ boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}
          >
            <FlaskConical className="w-4 h-4" />
            Initiate AI Risk Analysis
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* ── Quick Vitals Strip ──────────────────────────────────────────────── */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
          <span className="section-header mb-3 block">Live Vitals</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <VitalBadge label="Heart Rate" value={patient.vitals.hr} unit="bpm"
              color={patient.vitals.hr > 100 ? '#fb7185' : '#34d399'} />
            <VitalBadge label="Systolic BP" value={sbp} unit="mmHg"
              color={parseInt(sbp) < 90 ? '#fb7185' : parseInt(sbp) > 140 ? '#fbbf24' : '#34d399'} />
            <VitalBadge label="SpO₂" value={patient.vitals.spo2} unit="%"
              color={patient.vitals.spo2 < 90 ? '#fb7185' : patient.vitals.spo2 < 94 ? '#fbbf24' : '#34d399'} />
            <VitalBadge label="Temperature" value={patient.vitals.temp} unit="°C"
              color={patient.vitals.temp > 38.3 ? '#fbbf24' : patient.vitals.temp > 39 ? '#fb7185' : '#34d399'} />
            <VitalBadge label="Resp Rate" value={patient.vitals.rr} unit="/min"
              color={patient.vitals.rr >= 22 ? '#fbbf24' : '#34d399'} />
            <VitalBadge label="Lactate" value={patient.labs.lactate} unit="mmol/L"
              color={patient.labs.lactate > 4.0 ? '#fb7185' : patient.labs.lactate > 2.0 ? '#fbbf24' : '#34d399'} />
          </div>
        </div>
      </motion.div>

      {/* ── Full Patient Details (existing rich component) ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <PatientDetails
          patient={patient}
          onUpdatePatient={onUpdatePatient}
          prediction={null}
          explainability={null}
        />
      </motion.div>
    </div>
  );
}

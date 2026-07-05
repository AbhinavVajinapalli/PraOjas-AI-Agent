import React from 'react';
import { PredictionResult } from '../types';
import { BrainCircuit, AlertTriangle, ShieldCheck, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface PredictionPanelProps {
  prediction: PredictionResult | null;
  loading: boolean;
  onRunPrediction: () => void;
  patientSelected: boolean;
}

/** Circular gauge with colour-coded glow ring */
const RiskGauge = ({ value, label, color, glowColor }: { value: number; label: string; color: string; glowColor: string }) => {
  const pct = Math.round(value * 100);
  const data = [{ name: label, value: pct, fill: color }];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="flex flex-col items-center gap-1"
    >
      <div className="relative h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="68%" innerRadius="68%" outerRadius="100%" barSize={10} data={data} startAngle={180} endAngle={0}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: 'rgba(30,41,59,0.6)' }} dataKey="value" cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Centre value */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <motion.span
            key={pct}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold font-mono leading-none"
            style={{ color, textShadow: `0 0 18px ${glowColor}` }}
          >
            {pct}%
          </motion.span>
        </div>
      </div>

      {/* Label pill */}
      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
        style={{ color, borderColor: `${glowColor}40`, background: `${glowColor}12` }}>
        {label}
      </span>
    </motion.div>
  );
};

export default function PredictionPanel({ prediction, loading, onRunPrediction, patientSelected }: PredictionPanelProps) {

  if (!patientSelected) {
    return (
      <div className="card h-full flex flex-col items-center justify-center text-center p-8 gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <BrainCircuit className="w-6 h-6" style={{ color: 'rgba(99,102,241,0.4)' }} />
        </div>
        <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
          Select a patient from the roster to run the AI prediction engine.
        </p>
      </div>
    );
  }

  const sepsisColor   = prediction ? (prediction.sepsisProbability > 0.5 ? '#f43f5e' : prediction.sepsisProbability > 0.3 ? '#f59e0b' : '#10b981') : '#6366f1';
  const mortalityColor = prediction ? (prediction.mortalityProbability > 0.3 ? '#f59e0b' : '#3b82f6') : '#6366f1';

  return (
    <div className="card h-full flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          AI Prediction Agent
        </h3>
        <button
          onClick={onRunPrediction}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Inferring...
            </span>
          ) : (
            <>
              <Zap className="w-3 h-3" />
              Run Inference
            </>
          )}
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto custom-scrollbar">

        {!prediction && !loading && (
          <div className="flex-1 flex items-center justify-center text-slate-600 text-xs text-center leading-relaxed">
            Click <span className="mx-1 font-bold text-indigo-400">Run Inference</span> to generate sepsis & mortality risk scores using PraOjas Clinical Engine.
          </div>
        )}

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            {/* Spinning gradient ring */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full animate-spin"
                style={{ background: 'conic-gradient(from 0deg, transparent 0%, #6366f1 60%, transparent 100%)', padding: '3px' }}>
                <div className="w-full h-full rounded-full" style={{ background: 'var(--theme-slate-950)' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 animate-pulse">Running clinical analysis on patient data...</p>
          </div>
        )}

        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Gauge row */}
            <div className="grid grid-cols-2 gap-3">
              <RiskGauge
                value={prediction.sepsisProbability}
                label="Sepsis Risk"
                color={sepsisColor}
                glowColor={sepsisColor}
              />
              <RiskGauge
                value={prediction.mortalityProbability}
                label="Mortality Risk"
                color={mortalityColor}
                glowColor={mortalityColor}
              />
            </div>

            {/* Metadata card */}
            <div className="rounded-xl p-3.5 flex flex-col gap-3"
              style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(30,41,59,0.8)' }}>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60">
                <div>
                  <div className="section-header mb-1">Inference Engine</div>
                  <div className="text-xs font-semibold text-slate-200 truncate max-w-[160px]">
                    {prediction.modelMetadata?.name || 'PraOjas Clinical Engine'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="section-header mb-1">Confidence</div>
                  <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm justify-end">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {(prediction.confidenceScore * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className="text-slate-500">Sepsis AUROC: <span className="text-slate-300">{prediction.modelMetadata?.sepsisAuroc}</span></div>
                <div className="text-slate-500">Mortality AUROC: <span className="text-slate-300">{prediction.modelMetadata?.mortalityAuroc}</span></div>
                <div className="text-slate-500">Sepsis ECE: <span className="text-slate-300">{prediction.modelMetadata?.sepsisEce}</span></div>
                <div className="text-slate-500">Mortality ECE: <span className="text-slate-300">{prediction.modelMetadata?.mortalityEce}</span></div>
              </div>
            </div>

            {/* Alert banners */}
            {prediction.sepsisProbability > 0.5 && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl p-3.5 flex flex-col gap-2.5"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', boxShadow: '0 0 20px rgba(244,63,94,0.08)' }}
              >
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  CRITICAL — High Sepsis Risk Detected
                </div>
                <ul className="pl-5 space-y-1 text-[11px] text-rose-300/80 list-disc">
                  <li>Initiate 1-hour sepsis bundle protocol.</li>
                  <li>Obtain blood cultures before antibiotic administration.</li>
                  <li>Administer broad-spectrum antibiotics.</li>
                  <li>Prepare for rapid fluid resuscitation (30 mL/kg) if hypotensive.</li>
                </ul>
              </motion.div>
            )}

            {prediction.sepsisProbability > 0.3 && prediction.sepsisProbability <= 0.5 && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl p-3.5 flex flex-col gap-2.5"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  WARNING — Elevated Sepsis Risk
                </div>
                <ul className="pl-5 space-y-1 text-[11px] text-amber-300/80 list-disc">
                  <li>Increase frequency of vitals monitoring (q1–2 hrs).</li>
                  <li>Monitor urine output and fluid balance closely.</li>
                  <li>Assess for new signs of infection or mental status changes.</li>
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

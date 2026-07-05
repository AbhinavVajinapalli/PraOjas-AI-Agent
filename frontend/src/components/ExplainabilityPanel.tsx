import React from 'react';
import { ExplainabilityResult } from '../types';
import { Sparkles, FileText, Bot, ListChecks, Tags, Network, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import FeatureImportanceChart from './FeatureImportanceChart';
import { motion, AnimatePresence } from 'motion/react';

interface ExplainabilityPanelProps {
  explainability: ExplainabilityResult | null;
  loading: boolean;
  onGenerateExplanation: () => void;
  predictionAvailable: boolean;
}

const AGENT_STEPS = [
  { label: 'Coordinator Agent routing request…',              icon: Network },
  { label: 'Clinical NLP Agent extracting entities…',         icon: Tags },
  { label: 'Medical Knowledge Agent cross-referencing…',      icon: Sparkles },
  { label: 'Reporting Agent formatting clinical summary…',    icon: FileText },
];

export default function ExplainabilityPanel({
  explainability,
  loading,
  onGenerateExplanation,
  predictionAvailable,
}: ExplainabilityPanelProps) {

  const [stepIdx, setStepIdx] = React.useState(0);

  React.useEffect(() => {
    if (!loading) { setStepIdx(0); return; }
    setStepIdx(0);
    const timers = [
      setTimeout(() => setStepIdx(1), 900),
      setTimeout(() => setStepIdx(2), 2200),
      setTimeout(() => setStepIdx(3), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  if (!predictionAvailable) {
    return (
      <div className="card h-full flex flex-col items-center justify-center text-center p-8 gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.14)' }}>
          <Bot className="w-6 h-6" style={{ color: 'rgba(52,211,153,0.35)' }} />
        </div>
        <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
          Run the prediction first to unlock the full multi-agent clinical explanation.
        </p>
      </div>
    );
  }

  return (
    <div className="card h-full flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          Clinical Decision Support
        </h3>
        <button
          onClick={onGenerateExplanation}
          disabled={loading || !!explainability}
          className="btn-success"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing…
            </span>
          ) : explainability ? (
            '✓ Report Ready'
          ) : (
            <>
              <Sparkles className="w-3 h-3" />
              Generate Report
            </>
          )}
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">

          {/* Empty state */}
          {!explainability && !loading && (
            <motion.div key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center text-slate-600 text-xs text-center p-6 leading-relaxed"
            >
              Click <span className="mx-1 font-bold text-emerald-500">Generate Report</span> to run the NLP, Medical Knowledge, and Reporting agents in sequence.
            </motion.div>
          )}

          {/* Loading state — multi-agent trace */}
          {loading && (
            <motion.div key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-6 p-6"
            >
              {/* Spinning orb */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full animate-spin"
                  style={{ background: 'conic-gradient(from 0deg, transparent 0%, #10b981 50%, transparent 100%)', padding: '3px' }}>
                  <div className="w-full h-full rounded-full" style={{ background: 'var(--theme-slate-950)' }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              {/* Agent step trace */}
              <div className="w-full rounded-xl p-4 flex flex-col gap-2"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Network className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="section-header">Multi-Agent Trace</span>
                </div>
                {AGENT_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const done = i < stepIdx;
                  const active = i === stepIdx;
                  return (
                    <div key={i} className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                      active ? 'text-emerald-400' : done ? 'text-slate-500' : 'text-slate-700'
                    }`}>
                      <Icon className="w-3 h-3 shrink-0" />
                      <span className="font-mono">{step.label}</span>
                      {active && <span className="ml-auto w-1.5 h-3 bg-emerald-400 animate-pulse rounded-sm" />}
                      {done && <ChevronRight className="ml-auto w-3 h-3 text-emerald-600" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Results */}
          {explainability && (
            <motion.div key="results"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-5 space-y-4"
            >
              {/* Executive summary */}
              {explainability.report && (
                <div className="rounded-xl p-4"
                  style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <div className="section-header mb-2">Executive Summary</div>
                  <p className="text-xs text-slate-200 leading-relaxed">{explainability.report.executiveSummary}</p>
                </div>
              )}

              {/* AI Explanation prose */}
              <div className="text-xs text-slate-300 leading-relaxed prose prose-invert prose-xs max-w-none
                [&_strong]:text-slate-100 [&_p]:text-slate-300 [&_ul]:text-slate-400">
                <ReactMarkdown>{explainability.explanation}</ReactMarkdown>
              </div>

              {/* Feature importance chart */}
              {explainability.featureImportance?.length > 0 && (
                <div className="rounded-xl p-4"
                  style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(30,41,59,0.8)' }}>
                  <div className="section-header mb-3">Clinical Risk Factor Analysis</div>
                  <FeatureImportanceChart data={explainability.featureImportance} />
                </div>
              )}

              {/* Risk factors + next steps grid */}
              {explainability.report && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl p-3.5"
                    style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ListChecks className="w-3 h-3 text-rose-400" />
                      <span className="section-header text-rose-500/80">Key Risk Factors</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-rose-300/80">
                      {explainability.report.keyRiskFactors.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="mt-1 w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl p-3.5"
                    style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ListChecks className="w-3 h-3 text-emerald-400" />
                      <span className="section-header text-emerald-500/80">Recommended Steps</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-emerald-300/80">
                      {explainability.report.recommendedNextSteps.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="mt-1 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* NLP entity tags */}
              {explainability.nlpEntities && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tags className="w-3 h-3 text-slate-500" />
                    <span className="section-header">Extracted NLP Entities</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {explainability.nlpEntities.diagnoses.map((d, i) => (
                      <span key={`d-${i}`} className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                        style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.22)', color: '#c4b5fd' }}>
                        DX: {d}
                      </span>
                    ))}
                    {explainability.nlpEntities.medications.map((m, i) => (
                      <span key={`m-${i}`} className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                        style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.22)', color: '#93c5fd' }}>
                        RX: {m}
                      </span>
                    ))}
                    {explainability.nlpEntities.symptoms.map((s, i) => (
                      <span key={`s-${i}`} className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                        style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.22)', color: '#fdba74' }}>
                        SX: {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="flex gap-2 text-[10px] text-slate-600 pt-2 border-t border-slate-800/50">
                <FileText className="w-3 h-3 shrink-0 mt-0.5" />
                AI-generated clinical decision support. Not a substitute for professional medical judgement.
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

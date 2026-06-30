import React from 'react';
import { ExplainabilityResult } from '../types';
import { Sparkles, FileText, Bot, ListChecks, Tags, Network } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import FeatureImportanceChart from './FeatureImportanceChart';

interface ExplainabilityPanelProps {
  explainability: ExplainabilityResult | null;
  loading: boolean;
  onGenerateExplanation: () => void;
  predictionAvailable: boolean;
}

export default function ExplainabilityPanel({ 
  explainability, 
  loading, 
  onGenerateExplanation, 
  predictionAvailable 
}: ExplainabilityPanelProps) {
  
  const [agentTrace, setAgentTrace] = React.useState<string>('');
  
  React.useEffect(() => {
    if (loading) {
      setAgentTrace('Coordinator Agent routing request...');
      const timers = [
        setTimeout(() => setAgentTrace('Retrieval Agent analyzing patient history...'), 800),
        setTimeout(() => setAgentTrace('Medical Knowledge Agent cross-referencing guidelines...'), 2000),
        setTimeout(() => setAgentTrace('Prediction Agent generating risk scores...'), 3500),
        setTimeout(() => setAgentTrace('Reporting Agent formatting clinical summary...'), 5000),
      ];
      return () => timers.forEach(clearTimeout);
    } else {
      setAgentTrace('');
    }
  }, [loading]);

  if (!predictionAvailable) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center">
        <Bot className="w-10 h-10 text-slate-700 mb-3" />
        <p className="text-slate-500 text-sm">Run prediction first to generate a clinical explanation.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-full">
       <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Clinical Decision Support
        </h3>
        <button
          onClick={onGenerateExplanation}
          disabled={loading || !!explainability}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
             <span className="flex items-center gap-2">
               <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
               Analyzing...
             </span>
          ) : (
            explainability ? 'Report Generated' : 'Generate Full Report'
          )}
        </button>
      </div>

      {!explainability && !loading && (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm text-center">
           Click to run the Validation, NLP, Medical Knowledge, and Reporting Agents to generate a comprehensive clinical summary.
        </div>
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
           <div className="relative">
             <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
             <Bot className="w-6 h-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
           </div>
           
           <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-inner">
             <div className="flex items-center gap-2 mb-2">
                <Network className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Multi-Agent Trace</span>
             </div>
             <p className="text-sm font-mono text-emerald-400 h-10 flex items-center">
               <span className="mr-2 opacity-50">&gt;</span> {agentTrace}
               <span className="animate-pulse ml-1 inline-block w-1.5 h-4 bg-emerald-400"></span>
             </p>
           </div>
        </div>
      )}

      {explainability && (
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          
          {/* Executive Summary */}
          {explainability.report && (
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Executive Summary</h4>
              <p className="text-sm text-slate-200">{explainability.report.executiveSummary}</p>
            </div>
          )}

          {/* AI Explanation (Mimicking Feature Importance) */}
          <div className="text-sm text-slate-300 leading-relaxed font-sans prose prose-invert max-w-none">
            <ReactMarkdown>
              {explainability.explanation}
            </ReactMarkdown>
          </div>

          {/* Feature Importance */}
          {explainability.featureImportance && explainability.featureImportance.length > 0 && (
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Clinical Risk Factor Analysis (LLM Attribution)</h4>
              <FeatureImportanceChart data={explainability.featureImportance} />
            </div>
          )}

          {/* Risk Factors & Next Steps */}
          {explainability.report && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5"/> Key Risk Factors</h4>
                 <ul className="list-disc list-inside text-xs text-rose-400 space-y-1">
                   {explainability.report.keyRiskFactors.map((f, i) => <li key={i}>{f}</li>)}
                 </ul>
              </div>
              <div>
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5"/> Recommended Next Steps</h4>
                 <ul className="list-disc list-inside text-xs text-emerald-400 space-y-1">
                   {explainability.report.recommendedNextSteps.map((s, i) => <li key={i}>{s}</li>)}
                 </ul>
              </div>
            </div>
          )}
          
          {/* NLP Entities */}
          {explainability.nlpEntities && (
            <div>
               <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5"><Tags className="w-3.5 h-3.5"/> Extracted NLP Entities</h4>
               <div className="flex flex-wrap gap-2">
                 {explainability.nlpEntities.diagnoses.map((d, i) => (
                   <span key={`d-${i}`} className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-[10px] font-mono">DX: {d}</span>
                 ))}
                 {explainability.nlpEntities.medications.map((m, i) => (
                   <span key={`m-${i}`} className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-mono">RX: {m}</span>
                 ))}
                 {explainability.nlpEntities.symptoms.map((s, i) => (
                   <span key={`s-${i}`} className="px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-md text-[10px] font-mono">SX: {s}</span>
                 ))}
               </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-500 flex gap-2">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <p>
              This is an AI-generated explanation for decision support. 
              Do not use as a substitute for professional medical judgement.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

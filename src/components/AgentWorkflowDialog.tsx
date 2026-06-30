import React from 'react';
import { motion } from 'motion/react';
import { Network, Database, BrainCircuit, FileText, CheckCircle2, Bot, ArrowRight } from 'lucide-react';

interface AgentWorkflowDialogProps {
  onClose: () => void;
}

export default function AgentWorkflowDialog({ onClose }: AgentWorkflowDialogProps) {
  
  const agents = [
    {
      name: "Coordinator Agent",
      icon: Network,
      color: "text-indigo-400 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/10",
      desc: "Orchestrates workflow, routes user requests, and delegates tasks to specialized Gemini sub-agents."
    },
    {
      name: "Document Understanding Agent",
      icon: Database,
      color: "text-blue-400 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/10",
      desc: "Uses Gemini to parse and extract patient history and clinical data from uploaded medical documents (PDFs)."
    },
    {
      name: "Prediction Agent",
      icon: BrainCircuit,
      color: "text-rose-400 dark:text-rose-400",
      bg: "bg-rose-500/10 dark:bg-rose-500/10",
      desc: "Uses Gemini as a predictive LLM agent for zero/few-shot sepsis and mortality forecasting based on clinical context."
    },
    {
      name: "Medical Knowledge Agent",
      icon: Bot,
      color: "text-emerald-400 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/10",
      desc: "Uses Gemini to cross-reference predictions with clinical guidelines (e.g., Sepsis Bundles) for actionable insights."
    },
    {
      name: "Clinical Report Agent",
      icon: FileText,
      color: "text-amber-400 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/10",
      desc: "Synthesizes data into clinical decision support summaries and generates natural language explanations of model predictions."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl max-w-3xl w-full shadow-2xl flex flex-col font-sans"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            PraOjas AI Multi-Agent Architecture
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
           {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                  <div className={`p-3 rounded-xl ${agent.bg}`}>
                     <Icon className={`w-6 h-6 ${agent.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
                      {agent.name}
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {agent.desc}
                    </p>
                  </div>
                </div>
              )
           })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
           <p className="text-xs text-slate-500">
             This modular Multi-Agent System (MAS) pattern ensures scalability, error isolation, and 
             explainability for clinical deployments.
           </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

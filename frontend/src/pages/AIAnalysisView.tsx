import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, BrainCircuit, FileText, AlertTriangle, Check, Droplet, Thermometer, Wind, Zap, Activity, HeartPulse } from "lucide-react";
import { Patient } from "../App";
import { StatusPill, getInitials, extractDiagnoses, extractSymptoms, PredictionPanel, ExplainabilityPanel } from "../App";

export default function AIAnalysisView({ patient, onBack }: { patient: Patient; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="px-8 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={onBack}>
              ICU Roster
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={onBack}>
              {patient.name}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold text-foreground">AI Risk Analysis</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <StatusPill status={patient.status} />
            <span className="text-xs font-mono text-muted-foreground">{patient.id}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 py-6">
        <div className="mb-5">
          <h1 className="text-lg font-bold text-foreground">AI Risk Analysis</h1>
          <p className="text-xs text-muted-foreground mt-1">
            PraOjas Clinical Intelligence · {patient.name} · {patient.department}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
          <PredictionPanel patient={patient} />
          <ExplainabilityPanel patient={patient} />
        </div>
      </div>
    </div>
  );
}
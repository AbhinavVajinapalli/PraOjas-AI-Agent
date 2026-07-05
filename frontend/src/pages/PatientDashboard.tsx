import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, BrainCircuit, ArrowRight, Download, Activity, Droplets, Wind, Thermometer, FlaskConical, Pill, ChevronDown, CheckCircle2, TestTube, Stethoscope, ClipboardList, Syringe, Bell, Clock } from "lucide-react";
import { Patient } from "../App";
import { useTheme, StatusPill, RadialGauge, Sparkline, generateVitalsHistory, getInitials, getVitalStatus, formatTs, VitalsBadge, DecisionLogEntry } from "../App";
import ManualEntryModal from "../components/ManualEntryModal";

export default function PatientDashboard({
  patient,
  onAnalysis,
  onBack,
  onUpdatePatient,
}: {
  patient: Patient;
  onAnalysis: () => void;
  onBack: () => void;
  onUpdatePatient: (data: Partial<Patient>) => void;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const { effectiveTheme } = useTheme();
  const history = generateVitalsHistory(patient);

  const vitalsCards = [
    {
      label: "Heart Rate",
      icon: Activity,
      value: patient.vitals.hr,
      unit: "bpm",
      type: "hr",
      sparkValues: history.map((h) => h.HR),
      color: "#f43f5e",
    },
    {
      label: "Systolic BP",
      icon: Droplets,
      value: parseInt(patient.vitals.bp),
      unit: "mmHg",
      type: "sbp",
      sparkValues: history.map((h) => h.SBP),
      color: "#6366f1",
    },
    {
      label: "SpO₂",
      icon: Wind,
      value: patient.vitals.spo2,
      unit: "%",
      type: "spo2",
      sparkValues: history.map((h) => h.SpO2),
      color: "#22d3ee",
    },
    {
      label: "Temperature",
      icon: Thermometer,
      value: patient.vitals.temp,
      unit: "°C",
      type: "temp",
      sparkValues: history.map((h) => h.Temp),
      color: "#f59e0b",
    },
    {
      label: "Resp Rate",
      icon: Wind,
      value: patient.vitals.rr,
      unit: "/min",
      type: "rr",
      sparkValues: history.map((h) => h.RR),
      color: "#10b981",
    },
    {
      label: "Lactate",
      icon: FlaskConical,
      value: patient.vitals.lactate,
      unit: "mmol/L",
      type: "lactate",
      sparkValues: history.map(() => patient.vitals.lactate + (Math.random() - 0.5) * 0.4),
      color: "#a78bfa",
    },
  ];

  const tabs = [
    { label: "Vitals History", icon: Activity },
    { label: "Lab Results", icon: TestTube },
    { label: "Medications", icon: Pill },
    { label: "Clinical Notes", icon: Stethoscope },
    { label: "Decision Log", icon: ClipboardList },
  ];

  const labRows = [
    { name: "Lactate", value: patient.labs.lactate, unit: "mmol/L", ref: "0.5–2.0", low: 0.5, high: 2.0 },
    { name: "WBC", value: patient.labs.wbc, unit: "×10³/μL", ref: "4.5–11.0", low: 4.5, high: 11.0 },
    { name: "Creatinine", value: patient.labs.creatinine, unit: "mg/dL", ref: "0.7–1.3", low: 0.7, high: 1.3 },
    { name: "Glucose", value: patient.labs.glucose, unit: "mg/dL", ref: "70–99", low: 70, high: 99 },
    { name: "Sodium", value: patient.labs.sodium, unit: "mEq/L", ref: "136–145", low: 136, high: 145 },
    { name: "Platelets", value: patient.labs.platelets, unit: "×10³/μL", ref: "150–400", low: 150, high: 400 },
  ];

  const logTypeConfig: Record<DecisionLogEntry["type"], { label: string; color: string }> = {
    AI_PREDICTION: { label: "AI", color: "bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border-indigo-500/30" },
    CLINICIAN_NOTE: { label: "Note", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
    LAB_ALERT: { label: "Lab", color: "bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30" },
    MED_CHANGE: { label: "Med", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  };

  const lineColors = effectiveTheme === "dark"
    ? { grid: "#1e293b", text: "#64748b", tooltip: "#0f172a" }
    : { grid: "#e2e8f0", text: "#94a3b8", tooltip: "#ffffff" };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left: back + patient info */}
            <div className="flex items-start gap-4">
              <button
                onClick={onBack}
                className="mt-1 p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-base font-bold text-white flex-shrink-0">
                  {getInitials(patient.name)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold text-foreground">{patient.name}</h1>
                    <StatusPill status={patient.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="font-mono">{patient.id}</span>
                    <span className="text-border">·</span>
                    <span>{patient.age}y {patient.gender}</span>
                    <span className="text-border">·</span>
                    <span>{patient.department}</span>
                    <span className="text-border">·</span>
                    <span>Admitted {new Date(patient.admissionDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Right: action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  const reportText = `PraOjas AI — Patient Report\n\nPatient: ${patient.name} (${patient.id})\nAge: ${patient.age} | Gender: ${patient.gender} | Dept: ${patient.department}\nStatus: ${patient.status}\nAdmitted: ${patient.admissionDate}\n\n--- Vitals ---\nHR: ${patient.vitals.hr} bpm\nBP: ${patient.vitals.bp} mmHg\nTemp: ${patient.vitals.temp}°C\nRR: ${patient.vitals.rr}/min\nSpO2: ${patient.vitals.spo2}%\nLactate: ${patient.vitals.lactate} mmol/L\n\n--- Labs ---\nWBC: ${patient.labs.wbc}\nLactate: ${patient.labs.lactate}\nCreatinine: ${patient.labs.creatinine}\nGlucose: ${patient.labs.glucose}\nSodium: ${patient.labs.sodium}\nPlatelets: ${patient.labs.platelets}\n\n--- Risk Scores ---\nSepsis Risk: ${patient.sepsisRisk}%\nMortality Risk: ${patient.mortalityRisk}%\n\n--- Clinical Notes ---\n${patient.clinicalNotes}\n\n--- Medications ---\n${patient.medications.map(m => `${m.name} ${m.dose} ${m.freq} (${m.status})`).join('\n')}\n\nGenerated by PraOjas AI · ${new Date().toISOString()}`;
                  const blob = new Blob([reportText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${patient.id}_report_${new Date().toISOString().slice(0,10)}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground border border-border rounded-lg hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export Report
              </button>
              <button
                onClick={() => setIsManualEntryOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground border border-border rounded-lg hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Activity className="w-3.5 h-3.5" />
                Update Vitals/Labs
              </button>
              <button
                onClick={onAnalysis}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-500/20"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                Initiate AI Risk Analysis
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {/* Quick actions */}
          <div className="flex items-center gap-2 mt-3 pl-16">
            {[
              { label: "Order Labs", icon: TestTube },
              { label: "Adjust Meds", icon: Syringe },
              { label: "Alert Team", icon: Bell },
              { label: "Smart Vitals", icon: Activity },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Vitals strip */}
        <div className="grid grid-cols-6 gap-3">
          {vitalsCards.map((v) => {
            const status = getVitalStatus(v.type, v.value);
            const borderAccent =
              status === "critical" ? "border-rose-500/40" : status === "warning" ? "border-amber-500/40" : "border-border";
            return (
              <div key={v.label} className={`bg-card border ${borderAccent} rounded-xl p-4 transition-colors`}>
                <div className="flex items-center justify-between mb-2">
                  <v.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <Sparkline values={v.sparkValues} color={v.color} />
                </div>
                <div className="text-xs text-muted-foreground mb-1">{v.label}</div>
                <VitalsBadge value={v.value} unit={v.unit} status={status} />
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex border-b border-border overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {tabs.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === i
                    ? "border-indigo-500 text-indigo-500 dark:text-indigo-400 bg-indigo-500/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Tab 0: Vitals History */}
            {activeTab === 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">12-Hour Vitals Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={lineColors.grid} />
                    <XAxis dataKey="time" tick={{ fill: lineColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: lineColors.text, fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip
                      contentStyle={{ background: lineColors.tooltip, border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px", color: "var(--foreground)" }}
                    />
                    <Line type="monotone" dataKey="HR" stroke="#f43f5e" strokeWidth={2} dot={false} name="HR (bpm)" />
                    <Line type="monotone" dataKey="SpO2" stroke="#22d3ee" strokeWidth={2} dot={false} name="SpO₂ (%)" />
                    <Line type="monotone" dataKey="SBP" stroke="#6366f1" strokeWidth={2} dot={false} name="SBP (mmHg)" />
                    <Line type="monotone" dataKey="RR" stroke="#10b981" strokeWidth={2} dot={false} name="RR (/min)" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-6 mt-3 justify-center flex-wrap">
                  {[["HR (bpm)", "#f43f5e"], ["SpO₂ (%)", "#22d3ee"], ["SBP (mmHg)", "#6366f1"], ["RR (/min)", "#10b981"]].map(([l, c]) => (
                    <div key={l} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: c }} />
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 1: Lab Results */}
            {activeTab === 1 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Laboratory Results</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Test", "Value", "Reference Range", "Status"].map((h) => (
                        <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {labRows.map((row) => {
                      const abnormal = row.value < row.low || row.value > row.high;
                      const critical = row.value < row.low * 0.7 || row.value > row.high * 1.5;
                      const badge = critical
                        ? "bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30"
                        : abnormal
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
                      const badgeLabel = critical ? "Critical" : abnormal ? "Abnormal" : "Normal";
                      return (
                        <tr key={row.name} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                          <td className="py-3 px-3 font-medium text-foreground text-sm">{row.name}</td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-semibold text-foreground">{row.value}</span>
                            <span className="text-xs text-muted-foreground ml-1">{row.unit}</span>
                          </td>
                          <td className="py-3 px-3 text-xs text-muted-foreground font-mono">{row.ref} {row.unit}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${badge}`}>{badgeLabel}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Medications */}
            {activeTab === 2 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Active Medication Orders</h3>
                <div className="space-y-3">
                  {patient.medications.map((med, i) => {
                    const statusCfg = {
                      Active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
                      Scheduled: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
                      Discontinued: "bg-slate-500/15 text-muted-foreground border-border",
                    }[med.status];
                    return (
                      <div key={i} className="flex items-center gap-4 p-4 bg-secondary/40 rounded-xl border border-border">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                          <Syringe className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground text-sm">{med.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {med.dose} · {med.freq}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Last given</div>
                            <div className="text-xs font-mono font-semibold text-foreground">{med.lastGiven}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusCfg}`}>{med.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Clinical Notes */}
            {activeTab === 3 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Clinical Notes</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-secondary/40 rounded-xl border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(patient.admissionDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · Attending Note
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{patient.clinicalNotes}</p>
                  </div>
                  <div className="p-4 bg-secondary/40 rounded-xl border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Prior shift · RN Assessment</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      Patient remains hemodynamically monitored. Foley in place, urine output {">"}0.5 mL/kg/h. Skin integrity intact, repositioning Q2H protocol maintained. Family at bedside, updated on plan of care.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Decision Log */}
            {activeTab === 4 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Clinical Decision Log</h3>
                <div className="space-y-3">
                  {patient.decisionLogs.map((log, i) => {
                    const cfg = logTypeConfig[log.type];
                    return (
                      <div key={i} className="flex gap-4 p-4 bg-secondary/40 rounded-xl border border-border">
                        <span className={`px-2 py-0.5 h-fit rounded-full text-xs font-semibold border whitespace-nowrap ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground text-sm">{log.action}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{log.details}</div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-mono">{formatTs(log.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ManualEntryModal 
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        patientName={patient.name}
        onUpdate={(data) => {
          console.log("Updated vitals/labs:", data);
          setIsManualEntryOpen(false);
          // Normally this would dispatch an action or API call to update the backend
        }}
      />
    </div>
  );
}
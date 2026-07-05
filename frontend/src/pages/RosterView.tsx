import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowDown, ArrowUp, Activity, FlaskConical, Clock, HeartPulse, Stethoscope, TrendingUp, Filter } from "lucide-react";
import { Patient, Theme } from "../App";
import { StatusPill, VitalsBadge, RadialGauge, Sparkline, getVitalStatus, getInitials } from "../App";

export default function RosterView({ patients, onSelectPatient }: { patients: Patient[]; onSelectPatient: (p: Patient) => void }) {
  const [statusFilter, setStatusFilter] = useState<"All" | "Critical" | "Warning" | "Stable">("All");
  const [deptFilter, setDeptFilter] = useState<string>("All");

  const departments = ["All", ...Array.from(new Set(patients.map(p => p.department)))];
  const filtered = patients.filter(p => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (deptFilter !== "All" && p.department !== deptFilter) return false;
    return true;
  });

  const critical = patients.filter((p) => p.status === "Critical").length;
  const warning = patients.filter((p) => p.status === "Warning").length;
  const stable = patients.filter((p) => p.status === "Stable").length;
  const avgSepsis = Math.round(patients.reduce((s, p) => s + p.sepsisRisk, 0) / patients.length);

  const stats = [
    { label: "Total Patients", value: patients.length, sub: "Active admissions", color: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Critical", value: critical, sub: "Require immediate attention", color: "text-rose-500 dark:text-rose-400", bg: "bg-rose-500/10" },
    { label: "Avg Sepsis Risk", value: `${avgSepsis}%`, sub: "Across all patients", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
    { label: "Alerts Today", value: 7, sub: "Lab & AI notifications", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="sticky top-0 z-20 px-8 py-4 bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">ICU Roster Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · Medical Center Floor 4
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-500 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
            Critical {critical}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
            Warning {warning}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            Stable {stable}
          </span>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 hover:border-indigo-500/30 transition-colors">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                <TrendingUp className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-sm font-semibold text-foreground mt-0.5">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Patient table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Patient Registry</h2>
            <div className="flex items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="text-xs bg-secondary border border-border rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Status</option>
                  <option value="Critical">Critical</option>
                  <option value="Warning">Warning</option>
                  <option value="Stable">Stable</option>
                </select>
              </div>
              {/* Dept Filter */}
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="text-xs bg-secondary border border-border rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {departments.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
              </select>
              <span className="text-xs text-muted-foreground">{filtered.length} patients</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Patient", "Status", "Department", "HR", "BP", "SpO₂", "Sepsis Risk", "Admitted", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const hrS = getVitalStatus("hr", p.vitals.hr);
                  const sbp = parseInt(p.vitals.bp);
                  const sbpS = getVitalStatus("sbp", sbp);
                  const spo2S = getVitalStatus("spo2", p.vitals.spo2);
                  const sepsisColor =
                    p.sepsisRisk >= 60 ? "text-rose-500 dark:text-rose-400" : p.sepsisRisk >= 30 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
                  return (
                    <tr
                      key={p.id}
                      onClick={() => onSelectPatient(p)}
                      className="border-b border-border last:border-0 hover:bg-accent/20 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center text-xs font-bold text-indigo-500 dark:text-indigo-400 flex-shrink-0">
                            {getInitials(p.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-sm">{p.name}</div>
                            <div className="text-xs font-mono text-muted-foreground">{p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusPill status={p.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-muted-foreground">{p.department}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <VitalsBadge value={p.vitals.hr} unit="bpm" status={hrS} />
                      </td>
                      <td className="px-5 py-3.5">
                        <VitalsBadge value={p.vitals.bp} unit="mmHg" status={sbpS} />
                      </td>
                      <td className="px-5 py-3.5">
                        <VitalsBadge value={p.vitals.spo2} unit="%" status={spo2S} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${p.sepsisRisk >= 60 ? "bg-rose-500" : p.sepsisRisk >= 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                              style={{ width: `${p.sepsisRisk}%` }}
                            />
                          </div>
                          <span className={`text-xs font-mono font-semibold ${sepsisColor}`}>{p.sepsisRisk}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {new Date(p.admissionDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectPatient(p); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 text-xs text-indigo-500 dark:text-indigo-400 font-semibold border border-indigo-500/30 rounded-lg hover:bg-indigo-500/10 transition-colors"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
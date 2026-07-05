import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { 
  HeartPulse, Activity, AlertCircle, FileText, CheckCircle2, History, ChevronRight, X, ArrowRight, Zap, 
  Settings, User, Menu, Bell, Search, Filter, Plus, FilePlus, Play, StopCircle, RefreshCw, Eye, Flame, ShieldAlert,
  BrainCircuit, FlaskConical, Stethoscope, Droplet, Pill, Thermometer, ArrowDown, ArrowUp, Clock, ShieldCheck, Download,
  Syringe, AlertTriangle, Check, ClipboardList, TestTube, TrendingUp, Sun, Moon, Monitor, ChevronLeft, Droplets, Wind,
  Mail, Phone, MapPin, Shield, Users, Globe, ChevronDown
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ManualEntryModal from "./components/ManualEntryModal";
import AddPatientModal from "./components/AddPatientModal";
import LandingPage from "./pages/LandingPage";
import RosterView from "./pages/RosterView";
import PatientDashboard from "./pages/PatientDashboard";
import AIAnalysisView from "./pages/AIAnalysisView";
import AlertsView from "./pages/AlertsView";
import Sidebar from "./components/Sidebar";

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

interface Medication {
  name: string;
  dose: string;
  freq: string;
  lastGiven: string;
  status: "Active" | "Scheduled" | "Discontinued";
}

export interface DecisionLogEntry {
  type: "AI_PREDICTION" | "CLINICIAN_NOTE" | "LAB_ALERT" | "MED_CHANGE";
  action: string;
  timestamp: string;
  details: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  department: string;
  status: "Critical" | "Warning" | "Stable";
  admissionDate: string;
  vitals: { hr: number; bp: string; temp: number; rr: number; spo2: number; lactate: number };
  labs: { lactate: number; wbc: number; creatinine: number; glucose: number; sodium: number; platelets: number };
  sepsisRisk: number;
  mortalityRisk: number;
  clinicalNotes: string;
  medications: Medication[];
  decisionLogs: DecisionLogEntry[];
}

type View = "landing" | "roster" | "dashboard" | "analysis" | "auth";
export type Theme = "light" | "dark" | "system";

// ─────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────

const MOCK_PATIENTS: Patient[] = [
  {
    id: "P-10495",
    name: "John Doe",
    age: 67,
    gender: "Male",
    department: "Medical ICU",
    status: "Critical",
    admissionDate: "2024-01-10",
    vitals: { hr: 118, bp: "95/60", temp: 38.9, rr: 24, spo2: 92, lactate: 4.2 },
    labs: { lactate: 4.2, wbc: 18.4, creatinine: 1.8, glucose: 187, sodium: 138, platelets: 89 },
    sepsisRisk: 87,
    mortalityRisk: 42,
    clinicalNotes:
      "67M with septic shock secondary to community-acquired pneumonia. On vasopressors. Blood cultures × 2 pending. Started broad-spectrum antibiotics at 08:30. Fluid resuscitation ongoing — 30 mL/kg crystalloid administered. MAP target >65 mmHg maintained on norepinephrine. Procalcitonin markedly elevated at 38 ng/mL. Chest X-ray: bilateral infiltrates consistent with ARDS. Intubated at 11:15 for hypoxic respiratory failure.",
    medications: [
      { name: "Norepinephrine", dose: "0.2 mcg/kg/min", freq: "Continuous", lastGiven: "2h ago", status: "Active" },
      { name: "Piperacillin-Tazobactam", dose: "4.5g IV", freq: "Q6H", lastGiven: "4h ago", status: "Active" },
      { name: "Vancomycin", dose: "1.5g IV", freq: "Q12H", lastGiven: "6h ago", status: "Active" },
      { name: "Heparin", dose: "5000 units SQ", freq: "Q8H", lastGiven: "3h ago", status: "Active" },
    ],
    decisionLogs: [
      { type: "AI_PREDICTION", action: "Sepsis Risk Score Generated", timestamp: "2024-01-10T10:30:00Z", details: "Sepsis: 87%, Confidence: 92%" },
      { type: "CLINICIAN_NOTE", action: "Vasopressor escalation documented", timestamp: "2024-01-10T09:15:00Z", details: "Norepinephrine increased to 0.2 mcg/kg/min" },
      { type: "LAB_ALERT", action: "Lactate critically elevated", timestamp: "2024-01-10T08:45:00Z", details: "Lactate: 4.2 mmol/L (Ref: <2.0)" },
      { type: "MED_CHANGE", action: "Antibiotic regimen initiated", timestamp: "2024-01-10T08:30:00Z", details: "Pip-Tazo 4.5g IV Q6H + Vancomycin 1.5g IV Q12H" },
    ],
  },
  {
    id: "P-10496",
    name: "Sarah Chen",
    age: 54,
    gender: "Female",
    department: "Surgical ICU",
    status: "Warning",
    admissionDate: "2024-01-09",
    vitals: { hr: 98, bp: "108/70", temp: 38.1, rr: 20, spo2: 95, lactate: 2.1 },
    labs: { lactate: 2.1, wbc: 13.2, creatinine: 1.2, glucose: 142, sodium: 141, platelets: 148 },
    sepsisRisk: 38,
    mortalityRisk: 18,
    clinicalNotes:
      "54F s/p emergency laparotomy for perforated viscus. Post-op day 2. Hemodynamically improving on reduced vasopressor support. Wound care ongoing. Nutrition via NGT initiated. Follow-up CT abdomen ordered for tomorrow. Pain controlled on fentanyl infusion.",
    medications: [
      { name: "Metronidazole", dose: "500mg IV", freq: "Q8H", lastGiven: "1h ago", status: "Active" },
      { name: "Cefazolin", dose: "2g IV", freq: "Q8H", lastGiven: "2h ago", status: "Active" },
      { name: "Fentanyl", dose: "25 mcg/h", freq: "Continuous", lastGiven: "30m ago", status: "Active" },
    ],
    decisionLogs: [
      { type: "AI_PREDICTION", action: "Risk Stratification Updated", timestamp: "2024-01-09T14:00:00Z", details: "Sepsis: 38%, Trending down" },
      { type: "CLINICIAN_NOTE", action: "Vasopressor wean initiated", timestamp: "2024-01-09T12:30:00Z", details: "Phenylephrine reduced, tolerating well" },
    ],
  },
  {
    id: "P-10497",
    name: "Michael Torres",
    age: 72,
    gender: "Male",
    department: "Medical ICU",
    status: "Stable",
    admissionDate: "2024-01-08",
    vitals: { hr: 78, bp: "128/82", temp: 37.1, rr: 16, spo2: 97, lactate: 1.2 },
    labs: { lactate: 1.2, wbc: 9.8, creatinine: 1.1, glucose: 118, sodium: 139, platelets: 224 },
    sepsisRisk: 12,
    mortalityRisk: 8,
    clinicalNotes:
      "72M admitted for COPD exacerbation, now improving on day 3. Successfully weaning from BiPAP. Saturation stable on 2L NC. Mobilizing with PT twice daily. Oral steroids being considered for transition. Outpatient pulmonology follow-up arranged.",
    medications: [
      { name: "Ipratropium/Albuterol", dose: "2.5mg nebulized", freq: "Q4H", lastGiven: "3h ago", status: "Active" },
      { name: "Methylprednisolone", dose: "40mg IV", freq: "Q12H", lastGiven: "5h ago", status: "Active" },
    ],
    decisionLogs: [
      { type: "CLINICIAN_NOTE", action: "BiPAP settings adjusted", timestamp: "2024-01-08T16:00:00Z", details: "IPAP 12, EPAP 6, FiO2 35%" },
    ],
  },
  {
    id: "P-10498",
    name: "Emma Wilson",
    age: 45,
    gender: "Female",
    department: "Neuro ICU",
    status: "Critical",
    admissionDate: "2024-01-10",
    vitals: { hr: 105, bp: "168/94", temp: 38.5, rr: 22, spo2: 94, lactate: 2.8 },
    labs: { lactate: 2.8, wbc: 15.1, creatinine: 0.9, glucose: 201, sodium: 136, platelets: 312 },
    sepsisRisk: 61,
    mortalityRisk: 35,
    clinicalNotes:
      "45F with large MCA infarct, malignant cerebral edema. ICP monitoring in place — pressures intermittently elevated to 28 mmHg. On osmotic therapy with mannitol. Neurosurgery consulted for potential decompressive craniectomy. Family meeting scheduled at 14:00.",
    medications: [
      { name: "Mannitol 20%", dose: "1 g/kg IV", freq: "Q6H PRN ICP>20", lastGiven: "1h ago", status: "Active" },
      { name: "Levetiracetam", dose: "1000mg IV", freq: "Q12H", lastGiven: "6h ago", status: "Active" },
      { name: "Nicardipine", dose: "5 mg/h IV", freq: "Continuous", lastGiven: "20m ago", status: "Active" },
    ],
    decisionLogs: [
      { type: "AI_PREDICTION", action: "Neurological Deterioration Risk", timestamp: "2024-01-10T11:00:00Z", details: "Sepsis: 61%, Mortality: 35%" },
      { type: "LAB_ALERT", action: "Glucose critically elevated", timestamp: "2024-01-10T09:30:00Z", details: "Glucose: 201 mg/dL — sliding scale initiated" },
    ],
  },
  {
    id: "P-10499",
    name: "Robert Kim",
    age: 61,
    gender: "Male",
    department: "Cardiac ICU",
    status: "Warning",
    admissionDate: "2024-01-07",
    vitals: { hr: 92, bp: "104/68", temp: 37.4, rr: 18, spo2: 96, lactate: 1.9 },
    labs: { lactate: 1.9, wbc: 11.5, creatinine: 1.6, glucose: 156, sodium: 140, platelets: 178 },
    sepsisRisk: 29,
    mortalityRisk: 22,
    clinicalNotes:
      "61M with cardiogenic shock s/p anterior STEMI. IABP in situ, augmentation at 1:1. Improving cardiac output on dobutamine infusion. Echo shows EF 25%. Cardiology following for potential LV assist device. Troponin trending down.",
    medications: [
      { name: "Dobutamine", dose: "5 mcg/kg/min", freq: "Continuous", lastGiven: "1h ago", status: "Active" },
      { name: "Furosemide", dose: "40mg IV", freq: "Q8H", lastGiven: "4h ago", status: "Active" },
      { name: "Aspirin", dose: "81mg PO", freq: "Daily", lastGiven: "8h ago", status: "Active" },
    ],
    decisionLogs: [
      { type: "AI_PREDICTION", action: "Cardiac Risk Updated", timestamp: "2024-01-07T15:00:00Z", details: "Mortality risk 22%, trending stable" },
    ],
  },
  {
    id: "P-10500",
    name: "Lisa Martinez",
    age: 38,
    gender: "Female",
    department: "Medical ICU",
    status: "Stable",
    admissionDate: "2024-01-06",
    vitals: { hr: 74, bp: "118/76", temp: 37.0, rr: 15, spo2: 98, lactate: 1.0 },
    labs: { lactate: 1.0, wbc: 8.2, creatinine: 0.8, glucose: 98, sodium: 142, platelets: 289 },
    sepsisRisk: 8,
    mortalityRisk: 4,
    clinicalNotes:
      "38F recovering from DKA. Anion gap closed at 12:00. On insulin drip transitioning to SQ insulin. Diet advancing to regular. Endocrinology consulted and reviewing. Considering step-down to intermediate care unit tomorrow pending stable overnight course.",
    medications: [
      { name: "Regular Insulin", dose: "2 units/h IV", freq: "Continuous", lastGiven: "30m ago", status: "Active" },
      { name: "Potassium Chloride", dose: "40 mEq IV", freq: "PRN K<3.5", lastGiven: "2h ago", status: "Scheduled" },
    ],
    decisionLogs: [
      { type: "CLINICIAN_NOTE", action: "DKA protocol completed", timestamp: "2024-01-06T18:00:00Z", details: "Anion gap closed, ketones negative" },
    ],
  },
];

// ─────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────

export function generateVitalsHistory(patient: Patient) {
  const base = patient.vitals;
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${String((8 + i) % 24).padStart(2, "0")}:00`,
    HR: Math.max(40, base.hr + Math.round(Math.sin(i * 0.9 + 1) * 14)),
    SpO2: Math.min(100, Math.max(86, base.spo2 + Math.round(Math.sin(i * 0.5 + 2) * 3))),
    SBP: Math.max(55, parseInt(base.bp) + Math.round(Math.sin(i * 0.7 + 0.5) * 12)),
    RR: Math.max(8, base.rr + Math.round(Math.sin(i * 0.6 + 1.5) * 3)),
    Temp: parseFloat((base.temp + Math.sin(i * 0.4) * 0.35).toFixed(1)),
  }));
}

export function getVitalStatus(type: string, val: number): "normal" | "warning" | "critical" {
  if (type === "hr") return val > 130 || val < 40 ? "critical" : val > 100 || val < 50 ? "warning" : "normal";
  if (type === "sbp") return val > 180 || val < 65 ? "critical" : val > 140 || val < 90 ? "warning" : "normal";
  if (type === "spo2") return val < 88 ? "critical" : val < 94 ? "warning" : "normal";
  if (type === "temp") return val > 39.5 || val < 35.0 ? "critical" : val > 38.0 ? "warning" : "normal";
  if (type === "rr") return val > 30 ? "critical" : val > 20 ? "warning" : "normal";
  if (type === "lactate") return val > 4 ? "critical" : val > 2 ? "warning" : "normal";
  return "normal";
}

export function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

export function formatTs(ts: string) {
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─────────────────────────────────────────────────────────
// SPARKLINE
// ─────────────────────────────────────────────────────────

export function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 64, H = 24;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * W},${H - 2 - ((v - min) / range) * (H - 4)}`)
    .join(" ");
  return (
    <svg width={W} height={H} className="overflow-visible opacity-80">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────
// RADIAL GAUGE
// ─────────────────────────────────────────────────────────

export function RadialGauge({
  value,
  label,
  riskColor,
  bgColor,
}: {
  value: number;
  label: string;
  riskColor: string;
  bgColor: string;
}) {
  const data = [{ v: value }, { v: 100 - value }];
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <PieChart width={140} height={140}>
          <Pie
            data={data}
            dataKey="v"
            cx={70}
            cy={70}
            startAngle={90}
            endAngle={-270}
            innerRadius={46}
            outerRadius={62}
            strokeWidth={0}
          >
            <Cell fill={riskColor} />
            <Cell fill={bgColor} />
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono leading-none" style={{ color: riskColor }}>
            {value}%
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-1 font-medium">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// THEME PROVIDER + HOOK
// ─────────────────────────────────────────────────────────

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  effectiveTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeCtx>({ theme: "dark", setTheme: () => {}, effectiveTheme: "dark" });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");

  const resolve = useCallback((t: Theme): "light" | "dark" => {
    if (t === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return t;
  }, []);

  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const eff = resolve(theme);
    setEffectiveTheme(eff);
    if (eff === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme, resolve]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const eff = mq.matches ? "dark" : "light";
      setEffectiveTheme(eff);
      if (eff === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

// ─────────────────────────────────────────────────────────
// STATUS PILL
// ─────────────────────────────────────────────────────────

export function StatusPill({ status }: { status: "Critical" | "Warning" | "Stable" }) {
  const cfg = {
    Critical: "bg-rose-500/15 text-rose-500 border-rose-500/30 dark:text-rose-400",
    Warning: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
    Stable: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
  }[status];
  const dot = { Critical: "bg-rose-500", Warning: "bg-amber-500", Stable: "bg-emerald-500" }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse flex-shrink-0`} />
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// VITALS BADGE
// ─────────────────────────────────────────────────────────

export function VitalsBadge({
  value,
  unit,
  status,
}: {
  value: string | number;
  unit: string;
  status: "normal" | "warning" | "critical";
}) {
  const color = {
    normal: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    critical: "text-rose-600 dark:text-rose-400",
  }[status];
  return (
    <span className={`font-mono font-semibold ${color}`}>
      {value}
      <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// PATIENT LIST (SIDEBAR)
// ─────────────────────────────────────────────────────────

export function PatientList({
  patients,
  selectedId,
  onSelect,
  onAddPatient,
  theme,
  setTheme,
}: {
  patients: Patient[];
  selectedId: string | null;
  onSelect: (p: Patient) => void;
  onAddPatient?: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-72 flex-shrink-0 flex flex-col h-screen bg-card border-r border-border">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
            <HeartPulse className="w-4.5 h-4.5 text-white" strokeWidth={2} />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground tracking-tight">PraOjas AI</div>
            <div className="text-xs text-muted-foreground leading-tight">Clinical Decision Support</div>
          </div>
        </div>
      </div>

      {/* Search + Add */}
      <div className="px-4 py-3 border-b border-border space-y-2.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <button onClick={onAddPatient} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          Add Patient
        </button>
      </div>

      {/* Count strip */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="font-medium text-rose-500 dark:text-rose-400">
            {patients.filter((p) => p.status === "Critical").length} Critical
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="font-medium text-amber-600 dark:text-amber-400">
            {patients.filter((p) => p.status === "Warning").length} Warning
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {patients.filter((p) => p.status === "Stable").length} Stable
          </span>
        </span>
      </div>

      {/* Patient list */}
      <div className="flex-1 overflow-y-auto py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">No patients found</div>
        )}
        {filtered.map((p) => {
          const isSelected = p.id === selectedId;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className={`w-full text-left px-4 py-3 hover:bg-accent/30 transition-all duration-150 border-l-2 ${
                isSelected ? "border-indigo-500 bg-indigo-500/8" : "border-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-semibold text-sm text-foreground leading-snug">{p.name}</span>
                <StatusPill status={p.status} />
              </div>
              <div className="text-xs text-muted-foreground font-mono mb-1.5">{p.id}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {p.age}y {p.gender.charAt(0)}
                </span>
                <span className="px-1.5 py-0.5 bg-secondary rounded text-xs text-secondary-foreground font-medium">
                  {p.department.replace(" ICU", "")}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Theme switcher */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          {(
            [
              ["light", Sun],
              ["dark", Moon],
              ["system", Monitor],
            ] as const
          ).map(([t, Icon]) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              title={`${t} theme`}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all duration-150 ${
                theme === t
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2 leading-tight">
          PraOjas AI v2.4 · HIPAA Compliant
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ROSTER VIEW (VIEW 1 MAIN AREA)
// ─────────────────────────────────────────────────────────

// Extracted RosterView


// ─────────────────────────────────────────────────────────
// PATIENT DASHBOARD (VIEW 2)
// ─────────────────────────────────────────────────────────

// Extracted PatientDashboard


// ─────────────────────────────────────────────────────────
// PREDICTION PANEL
// ─────────────────────────────────────────────────────────

export function PredictionPanel({ patient }: { patient: Patient }) {
  const { effectiveTheme } = useTheme();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [prediction, setPrediction] = useState<any>(null);
  
  const gaugeBg = effectiveTheme === "dark" ? "#1e293b" : "#e2e8f0";

  // Use the live prediction if available, otherwise fallback to mock values for demo
  const sepsisRiskVal = prediction ? (prediction.sepsisProbability * 100) : patient.sepsisRisk;
  const mortalityRiskVal = prediction ? (prediction.mortalityProbability * 100) : patient.mortalityRisk;
  const confidenceVal = prediction ? (prediction.confidenceScore * 100).toFixed(1) : "92.4";
  const modelNameVal = prediction ? prediction.modelMetadata.name : "PraOjas Clinical Engine · v3.1";

  const sepsisColor = sepsisRiskVal >= 50 ? "#f43f5e" : sepsisRiskVal >= 30 ? "#f59e0b" : "#10b981";
  const mortalityColor = mortalityRiskVal >= 30 ? "#f59e0b" : "#6366f1";

  const sscBundle = [
    "Obtain blood cultures × 2 before initiating antibiotics",
    "Administer broad-spectrum IV antibiotics within 1 hour",
    "Measure lactate — repeat if initial lactate >2 mmol/L",
    "Begin crystalloid resuscitation 30 mL/kg IV for hypotension / lactate ≥4",
    "Apply vasopressors if MAP <65 mmHg despite resuscitation",
    "Re-assess fluid responsiveness with passive leg raise or dynamic measures",
  ];

  async function handleRunInference() {
    setState("loading");
    setPrediction(null);
    setErrorMessage("");
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Prediction failed');
      
      setPrediction(data);
      setState("done");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Unknown error occurred");
      setState("error");
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-full">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">AI Prediction Agent</h2>
            <p className="text-xs text-muted-foreground">{modelNameVal}</p>
          </div>
        </div>
        <button
          onClick={handleRunInference}
          disabled={state === "loading"}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
        >
          {state === "loading" ? (
            <>
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Inferring...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              Run Inference
            </>
          )}
        </button>
      </div>

      <div className="flex-1 p-6">
        {state === "idle" && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3">
              <BrainCircuit className="w-6 h-6 text-indigo-500/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No prediction generated yet</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Run Inference" to analyze patient data</p>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-sm font-semibold text-rose-500">Inference Failed</p>
            <p className="text-xs text-muted-foreground mt-1">Check the server logs or ensure your API key is valid.</p>
          </div>
        )}

        {state === "loading" && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-6">
            <div className="relative w-20 h-20">
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  background: "conic-gradient(from 0deg, #6366f1, #22d3ee, transparent)",
                  WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
                  mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
                }}
              />
              <div className="absolute inset-2 rounded-full bg-card flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Running Clinical Analysis...</p>
              <p className="text-xs text-muted-foreground mt-1">Processing {Object.keys(patient.vitals).length + Object.keys(patient.labs).length} clinical parameters</p>
            </div>
          </div>
        )}

        {state === "done" && (
          <div className="space-y-6">
            {/* Gauges */}
            <div className="flex items-center justify-around">
              <RadialGauge
                value={sepsisRiskVal}
                label="Sepsis Risk"
                riskColor={sepsisColor}
                bgColor={gaugeBg}
              />
              <div className="w-px h-24 bg-border" />
              <RadialGauge
                value={mortalityRiskVal}
                label="Mortality Risk"
                riskColor={mortalityColor}
                bgColor={gaugeBg}
              />
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                <div className="text-xs text-muted-foreground mb-1">Inference Engine</div>
                <div className="text-sm font-semibold text-foreground font-mono">{modelNameVal}</div>
              </div>
              <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                <div className="text-xs text-muted-foreground mb-1">Confidence Score</div>
                <div className="text-sm font-semibold text-foreground font-mono">{confidenceVal}%</div>
              </div>
            </div>

            {/* SSC Alert */}
            {sepsisRiskVal >= 50 && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
                  <span className="text-sm font-bold text-rose-500 dark:text-rose-400">SSC Hour-1 Bundle Indicated</span>
                </div>
                <ul className="space-y-1.5">
                  {sscBundle.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-rose-600 dark:text-rose-300">
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center text-[10px] font-bold text-rose-500 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// EXPLAINABILITY PANEL
// ─────────────────────────────────────────────────────────

export function ExplainabilityPanel({ patient }: { patient: Patient }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [traceStep, setTraceStep] = useState(0);

  const steps = ["NLP Extraction", "Knowledge Analysis", "Report Generation"];

  function handleGenerateReport() {
    setState("loading");
    setTraceStep(0);
    let s = 0;
    const iv = setInterval(() => {
      s++;
      setTraceStep(s);
      if (s >= steps.length - 1) {
        clearInterval(iv);
        setTimeout(() => setState("done"), 600);
      }
    }, 900);
  }

  const riskFactors = [
    { text: `Lactate ${patient.labs.lactate} mmol/L — tissue hypoperfusion marker`, severity: "critical" as const },
    { text: `WBC ${patient.labs.wbc} ×10³/μL — systemic inflammatory response`, severity: "critical" as const },
    { text: `Heart rate ${patient.vitals.hr} bpm — persistent tachycardia`, severity: "warning" as const },
    { text: `SpO₂ ${patient.vitals.spo2}% — impaired gas exchange`, severity: patient.vitals.spo2 < 93 ? "critical" as const : "warning" as const },
    { text: `Creatinine ${patient.labs.creatinine} mg/dL — AKI risk`, severity: "warning" as const },
  ];

  // Generate patient-specific next steps based on their actual clinical data
  const nextSteps: string[] = [];
  if (patient.labs.lactate > 2) nextSteps.push(`Repeat lactate measurement in 2–4 hours (current: ${patient.labs.lactate} mmol/L)`);
  if (patient.sepsisRisk >= 50) nextSteps.push("Obtain blood cultures × 2 and reassess antibiotic coverage");
  if (parseInt(patient.vitals.bp) < 90) nextSteps.push("Reassess vasopressor requirements and titrate to MAP >65 mmHg");
  if (patient.labs.creatinine > 1.3) nextSteps.push(`Nephrology consult for AKI monitoring (Creatinine: ${patient.labs.creatinine} mg/dL)`);
  if (patient.vitals.spo2 < 94) nextSteps.push(`Evaluate oxygenation strategy — current SpO₂ ${patient.vitals.spo2}%`);
  if (patient.vitals.hr > 100) nextSteps.push(`Monitor persistent tachycardia (HR ${patient.vitals.hr} bpm) — rule out dehydration, pain, or cardiac event`);
  if (patient.labs.wbc > 12) nextSteps.push("Initiate daily SOFA scoring for organ dysfunction tracking");
  if (nextSteps.length === 0) nextSteps.push("Continue current management and monitor for clinical changes", "Plan for step-down to intermediate care if stable overnight");

  // Generate patient-specific NLP entities from their actual clinical notes and medications
  const nlpEntities = {
    diagnoses: extractDiagnoses(patient),
    medications: patient.medications.map(m => m.name),
    symptoms: extractSymptoms(patient),
  };

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-full">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Clinical Decision Support</h2>
            <p className="text-xs text-muted-foreground">Evidence-based recommendations</p>
          </div>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={state === "loading"}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          Generate Report
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {state === "idle" && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
              <FlaskConical className="w-6 h-6 text-emerald-500/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No report generated yet</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Generate Report" for clinical recommendations</p>
          </div>
        )}

        {state === "loading" && (
          <div className="flex flex-col justify-center h-full min-h-[300px] space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Agent Trace</p>
            {steps.map((step, i) => {
              const done = i < traceStep;
              const active = i === traceStep;
              return (
                <div key={step} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                  done ? "bg-emerald-500/10 border-emerald-500/30" : active ? "bg-indigo-500/10 border-indigo-500/30" : "bg-secondary/40 border-border opacity-40"
                }`}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    ) : active ? (
                      <RefreshCw className="w-4 h-4 text-indigo-500 dark:text-indigo-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-border" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${done ? "text-emerald-600 dark:text-emerald-400" : active ? "text-indigo-500 dark:text-indigo-400" : "text-muted-foreground"}`}>
                    {step}
                  </span>
                  {done && <Check className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                </div>
              );
            })}
          </div>
        )}

        {state === "done" && (
          <div className="space-y-5">
            {/* Executive Summary */}
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Executive Summary</h3>
              <p className="text-sm text-foreground leading-relaxed p-3 bg-secondary/50 rounded-xl border border-border">
                {patient.name} ({patient.age}y {patient.gender}) presents with high-acuity septic physiology. Elevated lactate ({patient.labs.lactate} mmol/L), leukocytosis ({patient.labs.wbc} ×10³/μL), and hemodynamic instability indicate organ hypoperfusion. Composite sepsis risk score is <span className={`font-bold ${patient.sepsisRisk >= 60 ? "text-rose-500 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}>{patient.sepsisRisk}%</span>. Immediate resuscitation and source control are priority interventions.
              </p>
            </div>

            {/* Risk Factors */}
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Key Risk Factors</h3>
              <ol className="space-y-1.5">
                {riskFactors.map((rf, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                      rf.severity === "critical" ? "bg-rose-500/20 text-rose-500 dark:text-rose-400" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    }`}>{i + 1}</span>
                    <span className={rf.severity === "critical" ? "text-rose-600 dark:text-rose-300" : "text-amber-600 dark:text-amber-300"}>{rf.text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Next Steps */}
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Recommended Next Steps</h3>
              <ol className="space-y-1.5">
                {nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* NLP Entities */}
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">NLP Entities Extracted</h3>
              <div className="space-y-2">
                {(Object.entries(nlpEntities) as [string, string[]][]).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="text-xs text-muted-foreground capitalize mb-1.5">{cat}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((item) => {
                        const color = cat === "diagnoses" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                          : cat === "medications" ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
                        return (
                          <span key={item} className={`px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
                            {item}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// AI ANALYSIS VIEW (VIEW 3)
// ─────────────────────────────────────────────────────────

// Extracted AIAnalysisView


// ─────────────────────────────────────────────────────────
// LANDING PAGE & THEME SWITCHER
// ─────────────────────────────────────────────────────────

export function ThemeSwitcher({ theme, setTheme }: { theme: Theme, setTheme: (t: Theme) => void }) {
  const [open, setOpen] = useState(false);
  const CurrentIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const labels = { light: "Light Mode", dark: "Dark Mode", system: "System" };

  // Close dropdown on click outside
  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = () => setOpen(false);
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [open]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2.5 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-full transition-all border border-border shadow-sm"
        title="Toggle Theme"
      >
        <CurrentIcon className="w-4 h-4" />
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-36 bg-card border border-border rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1"
          >
            {(["light", "dark", "system"] as const).map((t) => {
              const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
              return (
                <button
                  key={t}
                  onClick={() => { setTheme(t); setOpen(false); }}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                    theme === t
                      ? "bg-indigo-500/10 text-indigo-500 font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {labels[t]}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper: extract diagnoses from clinical notes
export function extractDiagnoses(patient: Patient): string[] {
  const notes = patient.clinicalNotes.toLowerCase();
  const map: Record<string, string> = {
    "septic shock": "Septic Shock", "sepsis": "Sepsis", "pneumonia": "Pneumonia",
    "ards": "ARDS", "aki": "AKI", "dka": "DKA", "copd": "COPD Exacerbation",
    "stemi": "STEMI", "cardiogenic shock": "Cardiogenic Shock",
    "cerebral edema": "Malignant Cerebral Edema", "mca infarct": "MCA Infarct",
    "perforated": "Perforated Viscus",
  };
  const found: string[] = [];
  for (const [key, label] of Object.entries(map)) {
    if (notes.includes(key)) found.push(label);
  }
  if (patient.labs.creatinine > 1.5) found.push("AKI Stage 1");
  return found.length > 0 ? found : ["Under Evaluation"];
}

// Helper: extract symptoms from vitals/labs
export function extractSymptoms(patient: Patient): string[] {
  const symptoms: string[] = [];
  if (patient.vitals.hr > 100) symptoms.push("Tachycardia");
  if (parseInt(patient.vitals.bp) < 90) symptoms.push("Hypotension");
  if (patient.vitals.spo2 < 94) symptoms.push("Hypoxemia");
  if (patient.vitals.temp > 38.0) symptoms.push("Fever");
  if (patient.vitals.temp < 36.0) symptoms.push("Hypothermia");
  if (patient.labs.lactate > 2) symptoms.push("Lactic Acidosis");
  if (patient.labs.wbc > 12) symptoms.push("Leukocytosis");
  if (patient.labs.platelets < 150) symptoms.push("Thrombocytopenia");
  if (patient.vitals.rr > 22) symptoms.push("Tachypnea");
  return symptoms.length > 0 ? symptoms : ["Clinically Stable"];
}

// Extracted LandingPage


// ─────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("praojas_auth") === "true";
  });
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [showAddPatient, setShowAddPatient] = useState(false);

  const login = () => {
    localStorage.setItem("praojas_auth", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("praojas_auth");
    setIsAuthenticated(false);
  };

  function handleAddPatient(data: any) {
    setPatients([data, ...patients]);
    setShowAddPatient(false);
  }

  // A layout wrapper that includes the sidebar for authenticated routes
  const AppLayout = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) return <Navigate to="/auth" />;
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600 z-50" />
        <Sidebar />
        <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative">
          {children}
        </main>
        <AddPatientModal 
          isOpen={showAddPatient} 
          onClose={() => setShowAddPatient(false)} 
          onAdd={handleAddPatient} 
        />
        {/* Floating add button for convenience across views */}
        <button 
          onClick={() => setShowAddPatient(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center transition-transform hover:scale-105 z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    );
  };

  // Wrapper for Patient Dashboard to pass the selected patient
  const PatientDashboardWrapper = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const patientId = location.pathname.split('/').pop();
    const patient = patients.find(p => p.id === patientId) || patients[0];

    const handleUpdatePatient = (updatedData: any) => {
      const newPatient = {
        ...patient,
        ...updatedData,
        vitals: { ...patient.vitals, ...(updatedData.vitals || {}) },
        labs: { ...patient.labs, ...(updatedData.labs || {}) }
      };
      setPatients(patients.map(p => p.id === newPatient.id ? newPatient : p));
    };

    return (
      <PatientDashboard 
        patient={patient} 
        onAnalysis={() => navigate(`/patient/${patient.id}/analysis`)}
        onBack={() => navigate('/dashboard')}
        onUpdatePatient={handleUpdatePatient}
      />
    );
  };

  // Wrapper for Analysis View
  const AnalysisWrapper = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const segments = location.pathname.split('/');
    const patientId = segments[segments.length - 2];
    const patient = patients.find(p => p.id === patientId) || patients[0];
    return <AIAnalysisView patient={patient} onBack={() => navigate(-1)} />;
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage onEnter={() => isAuthenticated ? window.location.href = '/dashboard' : window.location.href = '/auth'} />} />
      <Route path="/auth" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage onLogin={() => { login(); window.location.href = '/dashboard'; }} />
      } />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<AppLayout><RosterView patients={patients} onSelectPatient={(p) => window.location.href = `/patient/${p.id}`} /></AppLayout>} />
      <Route path="/patients" element={<AppLayout><RosterView patients={patients} onSelectPatient={(p) => window.location.href = `/patient/${p.id}`} /></AppLayout>} />
      <Route path="/patient/:id" element={<AppLayout><PatientDashboardWrapper /></AppLayout>} />
      <Route path="/patient/:id/analysis" element={<AppLayout><AnalysisWrapper /></AppLayout>} />
      <Route path="/alerts" element={<AppLayout><AlertsView /></AppLayout>} />
      <Route path="/reports" element={<AppLayout><div className="p-8 text-center text-muted-foreground">Reports View (Coming Soon)</div></AppLayout>} />
      <Route path="/settings" element={<AppLayout><div className="p-8 text-center text-muted-foreground">Settings View (Coming Soon)</div></AppLayout>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

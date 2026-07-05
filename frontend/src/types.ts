export interface Vitals {
  hr: number;
  bp: string;
  temp: number;
  rr: number;
  spo2: number;
}

export interface Labs {
  wbc: number;
  lactate: number;
  creatinine: number;
}

export interface Observation {
  id: string;
  text: string;
  timestamp: string;
}

export interface DecisionLogEntry {
  id: string;
  type: 'AI_PREDICTION' | 'AI_EXPLANATION' | 'CLINICIAN_INTERVENTION';
  action: string;
  timestamp: string;
  details?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  admissionDate: string;
  department: string;
  vitals: Vitals;
  labs: Labs;
  clinicalNotes: string;
  observations?: Observation[];
  decisionLogs?: DecisionLogEntry[];
  status: 'Stable' | 'Warning' | 'Critical';
}

export interface PredictionResult {
  sepsisProbability: number;
  mortalityProbability: number;
  confidenceScore: number;
  timestamp: string;
  modelMetadata: {
    name: string;
    sepsisAuroc: number;
    mortalityAuroc: number;
    sepsisEce: number;
    mortalityEce: number;
  };
}

export interface ExplainabilityResult {
  explanation: string;
  featureImportance?: {
    feature: string;
    importance: number;
  }[];
  nlpEntities?: {
    diagnoses: string[];
    medications: string[];
    symptoms: string[];
    procedures: string[];
  };
  report?: {
    executiveSummary: string;
    keyRiskFactors: string[];
    recommendedNextSteps: string[];
  };
}

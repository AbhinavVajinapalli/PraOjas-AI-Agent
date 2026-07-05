import { Patient } from './types';

export const mockPatients: Patient[] = [
  {
    id: "P-10495",
    name: "John Doe",
    age: 68,
    gender: "Male",
    admissionDate: "2023-10-12T08:30:00Z",
    department: "Medical ICU",
    vitals: { hr: 112, bp: "90/58", temp: 38.9, rr: 24, spo2: 92 },
    labs: { wbc: 18.4, lactate: 4.2, creatinine: 1.8 },
    clinicalNotes: "Patient has a history of Type 2 Diabetes and Hypertension. Recently admitted for worsening shortness of breath and suspected COPD exacerbation.",
    status: "Critical"
  },
  {
    id: "P-10496",
    name: "Jane Smith",
    age: 54,
    gender: "Female",
    admissionDate: "2023-10-14T14:15:00Z",
    department: "Surgical ICU",
    vitals: { hr: 88, bp: "110/70", temp: 37.2, rr: 16, spo2: 98 },
    labs: { wbc: 9.1, lactate: 1.2, creatinine: 0.9 },
    clinicalNotes: "Patient recovering from a recent appendectomy. Currently stable and alert, no signs of acute distress.",
    status: "Stable"
  },
  {
    id: "P-10497",
    name: "Robert Chen",
    age: 72,
    gender: "Male",
    admissionDate: "2023-10-15T02:45:00Z",
    department: "Cardiac ICU",
    vitals: { hr: 95, bp: "105/65", temp: 37.8, rr: 20, spo2: 95 },
    labs: { wbc: 12.5, lactate: 2.1, creatinine: 1.4 },
    clinicalNotes: "Patient admitted with acute heart failure and atrial fibrillation. Requires close monitoring of fluid balance.",
    status: "Warning"
  }
];

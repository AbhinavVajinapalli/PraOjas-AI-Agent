import { pgTable, text, timestamp, jsonb, real } from "drizzle-orm/pg-core";

// Snapshot of vitals sent over time (timeseries data)
export const patientHistory = pgTable("patient_history", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  vitals: jsonb("vitals").notNull(),
  status: text("status").notNull(),
});

// Logs of what the AI predicted and the confidence score
export const aiPredictions = pgTable("ai_predictions", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  predictedAt: timestamp("predicted_at").defaultNow().notNull(),
  sepsisProbability: real("sepsis_probability").notNull(),
  mortalityProbability: real("mortality_probability").notNull(),
  confidenceScore: real("confidence_score").notNull(),
  modelUsed: text("model_used").notNull(),
  explanation: text("explanation"), // Stored markdown explanation
});

// Full audit trail of agent interactions and corrections
export const agentDecisions = pgTable("agent_decisions", {
  id: text("id").primaryKey(),
  patientId: text("patient_id"), // Can be null if it's a global action
  agentName: text("agent_name").notNull(), // e.g., 'PredictionAgent', 'MonitoringAgent'
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
});

// Historical Reference Cases (for Few-Shot RAG)
export const clinicalRecords = pgTable("clinical_records", {
  id: text("id").primaryKey(),
  age: real("age").notNull(),
  gender: text("gender").notNull(),
  vitals: jsonb("vitals").notNull(),
  labs: jsonb("labs").notNull(),
  didDevelopSepsis: text("did_develop_sepsis").notNull(), // "YES" or "NO"
  mortalityOutcome: text("mortality_outcome").notNull(), // "SURVIVED" or "DIED"
});

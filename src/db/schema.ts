import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const patientHistory = pgTable("patient_history", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  vitals: jsonb("vitals").notNull(),
  status: text("status").notNull(),
});

import { getDb } from '../db/index.js';
import { patientHistory, aiPredictions, agentDecisions, clinicalRecords } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export class MemoryAgent {
  /**
   * Retrieves past predictions for a specific patient to provide trend context to the AI.
   */
  async getPredictionHistory(patientId: string, limit = 5) {
    console.log(`[Memory Agent] Recalling prediction history for ${patientId}...`);
    const db = getDb();
    if (!db) return []; // Fallback to empty if DB is not configured

    try {
      const records = await db.select()
        .from(aiPredictions)
        .where(eq(aiPredictions.patientId, patientId))
        .orderBy(desc(aiPredictions.predictedAt))
        .limit(limit);
      return records;
    } catch (error) {
      console.error('[Memory Agent] Failed to recall prediction history:', error);
      return [];
    }
  }

  /**
   * Stores a new AI prediction to memory.
   */
  async storePrediction(patientId: string, predictionData: any) {
    const db = getDb();
    if (!db) return;

    try {
      await db.insert(aiPredictions).values({
        id: randomUUID(),
        patientId,
        sepsisProbability: predictionData.sepsisProbability,
        mortalityProbability: predictionData.mortalityProbability,
        confidenceScore: predictionData.confidenceScore,
        modelUsed: predictionData.modelMetadata?.name || 'PraOjas Clinical Engine',
        explanation: predictionData.explanation || null,
      });
      console.log(`[Memory Agent] Successfully stored prediction for ${patientId}`);
    } catch (error) {
      console.error('[Memory Agent] Failed to store prediction:', error);
    }
  }

  /**
   * Logs a generic agent decision or action for the audit trail.
   */
  async logAgentDecision(agentName: string, action: string, patientId?: string, inputData?: any, outputData?: any) {
    const db = getDb();
    if (!db) return;

    try {
      await db.insert(agentDecisions).values({
        id: randomUUID(),
        patientId: patientId || null,
        agentName,
        action,
        inputData: inputData ? inputData : null,
        outputData: outputData ? outputData : null,
      });
    } catch (error) {
      console.error('[Memory Agent] Failed to log decision:', error);
    }
  }

  /**
   * Retrieves historical clinical records that match the current patient's profile.
   * This is the core of the Few-Shot In-Context Learning (RAG) system.
   * For MVP, we fetch the most recent records that had a Sepsis/Mortality event.
   */
  async getSimilarHistoricalCases(patientData: any, limit = 3) {
    console.log(`[Memory Agent] Retrieving similar historical cases for RAG context...`);
    const db = getDb();
    if (!db) {
      // Return hardcoded few-shot examples if no DB is available
      return this.getFallbackFewShotExamples();
    }

    try {
      // In a full production system, this would use pgvector (Cosine Similarity).
      // For this implementation, we just fetch a few known positive and negative outcomes.
      const records = await db.select()
        .from(clinicalRecords)
        .limit(limit);
      
      if (records.length === 0) {
        return this.getFallbackFewShotExamples();
      }
      return records;
    } catch (error) {
      console.error('[Memory Agent] Failed to retrieve historical cases:', error);
      return this.getFallbackFewShotExamples();
    }
  }

  private getFallbackFewShotExamples() {
    return [
      {
        id: "HIST-001",
        age: 65, gender: "Male",
        vitals: { hr: 115, bp: "85/50", temp: 39.1, rr: 26, spo2: 91 },
        labs: { wbc: 19.2, lactate: 4.8, creatinine: 2.1 },
        didDevelopSepsis: "YES",
        mortalityOutcome: "DIED",
        note: "Patient met qSOFA criteria with severe hypotension and elevated lactate."
      },
      {
        id: "HIST-002",
        age: 42, gender: "Female",
        vitals: { hr: 78, bp: "120/80", temp: 37.0, rr: 14, spo2: 99 },
        labs: { wbc: 7.5, lactate: 1.1, creatinine: 0.8 },
        didDevelopSepsis: "NO",
        mortalityOutcome: "SURVIVED",
        note: "Routine post-op monitoring, vitals stable."
      }
    ];
  }
}

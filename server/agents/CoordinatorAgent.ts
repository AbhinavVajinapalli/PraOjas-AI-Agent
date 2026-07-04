import { PredictionAgent } from './PredictionAgent';
import { MedicalKnowledgeAgent } from './MedicalKnowledgeAgent';
import { DocumentUnderstandingAgent } from './DocumentUnderstandingAgent';
import { ValidationAgent } from './ValidationAgent';
import { ClinicalNLPAgent } from './ClinicalNLPAgent';
import { ClinicalReportAgent } from './ClinicalReportAgent';
import { MemoryAgent } from './MemoryAgent';
import { RetryOrchestrator } from './RetryOrchestrator';

export class CoordinatorAgent {
  private predictionAgent: PredictionAgent;
  private medicalKnowledgeAgent: MedicalKnowledgeAgent;
  private documentUnderstandingAgent: DocumentUnderstandingAgent;
  private validationAgent: ValidationAgent;
  private clinicalNLPAgent: ClinicalNLPAgent;
  private clinicalReportAgent: ClinicalReportAgent;
  private memoryAgent: MemoryAgent;

  /**
   * Purpose: Orchestrates the full agentic workflow.
   * - Routes requests to specialized sub-agents
   * - Injects memory context for trend-aware reasoning
   * - Applies self-correction via RetryOrchestrator
   * - Logs all agent decisions to persistent memory
   */
  constructor(apiKey: string) {
    this.predictionAgent    = new PredictionAgent(apiKey);
    this.medicalKnowledgeAgent = new MedicalKnowledgeAgent(apiKey);
    this.documentUnderstandingAgent = new DocumentUnderstandingAgent(apiKey);
    this.validationAgent    = new ValidationAgent(apiKey);
    this.clinicalNLPAgent   = new ClinicalNLPAgent(apiKey);
    this.clinicalReportAgent = new ClinicalReportAgent(apiKey);
    this.memoryAgent        = new MemoryAgent();
  }

  /**
   * Handles a sepsis/mortality prediction request.
   * 1. Retrieves memory (historical predictions + similar cases for few-shot RAG)
   * 2. Runs prediction with retry/self-correction
   * 3. Persists result to memory
   */
  async handlePredictionRequest(patient: any) {
    console.log(`[Coordinator] → Handling prediction for patient ${patient.id}`);

    // Step 1: Recall memory for this patient + get few-shot historical cases
    const [predictionHistory, similarCases] = await Promise.all([
      this.memoryAgent.getPredictionHistory(patient.id),
      this.memoryAgent.getSimilarHistoricalCases(patient)
    ]);

    if (predictionHistory.length > 0) {
      console.log(`[Coordinator] Memory: Found ${predictionHistory.length} prior predictions for ${patient.id}`);
    }

    // Step 2: Run prediction with self-correction loop
    const prediction = await RetryOrchestrator.withRetry(
      (feedback) => this.predictionAgent.predict(patient, similarCases, feedback),
      (result) => {
        if (typeof result.sepsisProbability !== 'number' || result.sepsisProbability < 0 || result.sepsisProbability > 1) {
          return { isValid: false, error: 'sepsisProbability out of range [0, 1]' };
        }
        if (typeof result.mortalityProbability !== 'number' || result.mortalityProbability < 0 || result.mortalityProbability > 1) {
          return { isValid: false, error: 'mortalityProbability out of range [0, 1]' };
        }
        if (typeof result.confidenceScore !== 'number' || result.confidenceScore < 0 || result.confidenceScore > 1) {
          return { isValid: false, error: 'confidenceScore out of range [0, 1]' };
        }
        return { isValid: true };
      },
      3
    );

    // Step 3: Persist to memory
    await Promise.all([
      this.memoryAgent.storePrediction(patient.id, prediction),
      this.memoryAgent.logAgentDecision(
        'PredictionAgent',
        'SEPSIS_MORTALITY_PREDICTION',
        patient.id,
        { vitals: patient.vitals, labs: patient.labs },
        { sepsisProbability: prediction.sepsisProbability, mortalityProbability: prediction.mortalityProbability }
      )
    ]);

    return prediction;
  }

  /**
   * Handles a clinical explanation + report request.
   * NLP → Explanation → Report, with self-correction on each step.
   */
  async handleExplanationRequest(patient: any, prediction: any) {
    console.log(`[Coordinator] → Handling explanation for patient ${patient.id}`);

    // Step 1: NLP entity extraction with self-correction
    const nlpEntities = await RetryOrchestrator.withRetry(
      (feedback) => this.clinicalNLPAgent.extractEntities(patient.clinicalNotes, feedback),
      (result) => {
        if (!Array.isArray(result.diagnoses)) return { isValid: false, error: 'diagnoses must be an array' };
        return { isValid: true };
      }
    );

    // Step 2: Generate explanation with self-correction
    const explainabilityData = await RetryOrchestrator.withRetry(
      (feedback) => this.medicalKnowledgeAgent.generateExplanation(patient, prediction, feedback),
      (result) => {
        if (!result.explanation || result.explanation.length < 20) {
          return { isValid: false, error: 'Explanation is too short or empty' };
        }
        if (!Array.isArray(result.featureImportance)) {
          return { isValid: false, error: 'featureImportance must be an array' };
        }
        return { isValid: true };
      }
    );

    // Step 3: Generate final report with self-correction
    const report = await RetryOrchestrator.withRetry(
      (feedback) => this.clinicalReportAgent.generateReport(
        patient, prediction, explainabilityData.explanation, nlpEntities, feedback
      ),
      (result) => {
        if (!result.executiveSummary || result.executiveSummary.length < 10) {
          return { isValid: false, error: 'Executive summary is too short or missing' };
        }
        if (!Array.isArray(result.keyRiskFactors) || result.keyRiskFactors.length === 0) {
          return { isValid: false, error: 'keyRiskFactors must be a non-empty array' };
        }
        return { isValid: true };
      }
    );

    // Log the explanation decision
    await this.memoryAgent.logAgentDecision(
      'CoordinatorAgent',
      'FULL_EXPLANATION_PIPELINE',
      patient.id,
      { predictionSepsis: prediction.sepsisProbability },
      { reportGenerated: true, nlpDiagnoses: nlpEntities.diagnoses }
    );

    return {
      explanation: explainabilityData.explanation,
      featureImportance: explainabilityData.featureImportance,
      nlpEntities,
      report
    };
  }

  async handleDocumentUpload(documentText: string) {
    console.log(`[Coordinator] → Delegating document parsing...`);
    const structuredData = await this.documentUnderstandingAgent.parseDocument(documentText);

    const validationResult = await RetryOrchestrator.withRetry(
      (feedback) => this.validationAgent.validateData(structuredData, feedback),
      (result) => {
        if (result.correctedData === null || result.correctedData === undefined) {
          return { isValid: false, error: 'correctedData is null' };
        }
        return { isValid: true };
      }
    );

    return {
      ...validationResult.correctedData,
      _validationWarnings: validationResult.warnings
    };
  }

  async handleSmartVitalsRequest(patient: any) {
    console.log(`[Coordinator] → Delegating smart vitals for patient ${patient.id}...`);
    return this.medicalKnowledgeAgent.suggestSmartVitals(patient);
  }

  /**
   * Exposes the MemoryAgent for use by the MonitoringAgent.
   */
  getMemoryAgent(): MemoryAgent {
    return this.memoryAgent;
  }
}

import { PredictionAgent } from './PredictionAgent';
import { MedicalKnowledgeAgent } from './MedicalKnowledgeAgent';
import { DocumentUnderstandingAgent } from './DocumentUnderstandingAgent';
import { ValidationAgent } from './ValidationAgent';
import { ClinicalNLPAgent } from './ClinicalNLPAgent';
import { ClinicalReportAgent } from './ClinicalReportAgent';

export class CoordinatorAgent {
  private predictionAgent: PredictionAgent;
  private medicalKnowledgeAgent: MedicalKnowledgeAgent;
  private documentUnderstandingAgent: DocumentUnderstandingAgent;
  private validationAgent: ValidationAgent;
  private clinicalNLPAgent: ClinicalNLPAgent;
  private clinicalReportAgent: ClinicalReportAgent;

  /**
   * Purpose: Orchestrates workflow, routes user requests, and delegates tasks to sub-agents.
   * Acts as the primary interface between the API endpoints and the Multi-Agent System (MAS).
   */
  constructor(apiKey: string) {
    this.predictionAgent = new PredictionAgent(apiKey);
    this.medicalKnowledgeAgent = new MedicalKnowledgeAgent(apiKey);
    this.documentUnderstandingAgent = new DocumentUnderstandingAgent(apiKey);
    this.validationAgent = new ValidationAgent(apiKey);
    this.clinicalNLPAgent = new ClinicalNLPAgent(apiKey);
    this.clinicalReportAgent = new ClinicalReportAgent(apiKey);
  }

  async handlePredictionRequest(patient: any) {
    console.log(`[Coordinator Agent] Delegating prediction for patient ${patient.id} to PredictionAgent...`);
    const prediction = await this.predictionAgent.predict(patient);
    return prediction;
  }

  async handleExplanationRequest(patient: any, prediction: any) {
    console.log(`[Coordinator Agent] Delegating explanation for patient ${patient.id} to MedicalKnowledgeAgent...`);
    
    // 1. Extract NLP entities from clinical notes (if any)
    const nlpEntities = await this.clinicalNLPAgent.extractEntities(patient.clinicalNotes);
    
    // 2. Generate Explainability
    const explainabilityData = await this.medicalKnowledgeAgent.generateExplanation(patient, prediction);
    
    // 3. Generate Final Report
    const report = await this.clinicalReportAgent.generateReport(patient, prediction, explainabilityData.explanation, nlpEntities);
    
    return { 
      explanation: explainabilityData.explanation,
      featureImportance: explainabilityData.featureImportance,
      nlpEntities,
      report
    };
  }
  
  async handleDocumentUpload(documentText: string) {
    console.log(`[Coordinator Agent] Delegating document parsing to DocumentUnderstandingAgent...`);
    
    // 1. Extract unstructured data to structured JSON
    const structuredData = await this.documentUnderstandingAgent.parseDocument(documentText);
    
    // 2. Validate the extracted data
    const validationResult = await this.validationAgent.validateData(structuredData);
    
    return {
       ...validationResult.correctedData,
       _validationWarnings: validationResult.warnings
    };
  }

  async handleSmartVitalsRequest(patient: any) {
    console.log(`[Coordinator Agent] Delegating smart vitals request for patient ${patient.id} to MedicalKnowledgeAgent...`);
    const suggestedVitals = await this.medicalKnowledgeAgent.suggestSmartVitals(patient);
    return suggestedVitals;
  }
}


import { GoogleGenAI } from '@google/genai';

export class ClinicalReportAgent {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Purpose: Generates a final clinician-friendly summary combining patient data, 
   * predictions, and explanations.
   */
  async generateReport(patientData: any, prediction: any, explanation: string, nlpEntities: any) {
    console.log(`[Clinical Report Agent] Generating final summary report...`);
    
    const prompt = `
      You are the PraOjas AI Clinical Report Agent.
      Generate a concise, professional Clinical Decision Support Summary Report for the doctor.
      
      Patient: ${patientData.name || 'Unknown'}, ${patientData.age || 'Unknown'} yr old ${patientData.gender || 'Unknown'}
      Diagnoses: ${nlpEntities.diagnoses?.join(', ') || 'None noted'}
      Vitals: HR ${patientData.vitals.hr}, BP ${patientData.vitals.bp}, Temp ${patientData.vitals.temp}C
      Labs: Lactate ${patientData.labs.lactate}, WBC ${patientData.labs.wbc}
      
      Model Predictions (PraOjas Multimodal Transformer):
      Sepsis Risk: ${(prediction.sepsisProbability * 100).toFixed(1)}%
      Mortality Risk: ${(prediction.mortalityProbability * 100).toFixed(1)}%
      
      AI Medical Knowledge Explanation:
      ${explanation}
      
      Task: Provide a JSON object ONLY with the following structure:
      {
        "executiveSummary": "1-2 sentence high-level summary of patient status and risk",
        "keyRiskFactors": ["Bullet 1", "Bullet 2"],
        "recommendedNextSteps": ["Step 1", "Step 2", "Step 3"]
      }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: prompt,
        config: {
            temperature: 0.2
        }
      });

      let responseText = response.text || "{}";
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      return JSON.parse(responseText);
    } catch (error) {
      console.error("[Clinical Report Agent] Error generating report:", error);
      return { 
        executiveSummary: "Report generation failed.", 
        keyRiskFactors: [], 
        recommendedNextSteps: ["Review raw data manually."] 
      };
    }
  }
}

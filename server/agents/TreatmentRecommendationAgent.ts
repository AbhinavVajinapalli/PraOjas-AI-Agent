import { Type } from '@google/genai';
import { ModelRouter } from './ModelRouter.js';

export class TreatmentRecommendationAgent {
  private router: ModelRouter;

  constructor(apiKey: string) {
    this.router = new ModelRouter(apiKey, false); // Use base model for recommendations
  }

  async recommendInterventions(patient: any, sepsisProbability: number, errorFeedback?: string) {
    console.log(`[TreatmentRecommendation Agent] Generating care plan based on sepsis risk: ${sepsisProbability}`);

    const correctionNote = errorFeedback
      ? `\nSELF-CORRECTION: A previous attempt failed: "${errorFeedback}". Ensure output is valid JSON.`
      : '';

    const prompt = `
      You are an expert ICU clinician. A patient has a sepsis probability of ${(sepsisProbability * 100).toFixed(1)}%.
      Patient Vitals: HR ${patient.vitals?.hr}, BP ${patient.vitals?.bp}, Temp ${patient.vitals?.temp}, RR ${patient.vitals?.rr}.
      Labs: Lactate ${patient.labs?.lactate}, WBC ${patient.labs?.wbc}.

      Based on the Surviving Sepsis Campaign guidelines, suggest an immediate 1-hour bundle care plan for this patient.
      If the risk is low, suggest routine monitoring.

      ${correctionNote}
    `;

    const schema = {
      type: Type.OBJECT,
      properties: {
        riskLevel: { type: Type.STRING, description: "High, Medium, or Low" },
        immediateInterventions: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "List of immediate clinical actions (e.g., 'Administer 30ml/kg crystalloid', 'Draw blood cultures')" 
        },
        monitoringFrequency: { type: Type.STRING, description: "How often to check vitals" },
        rationale: { type: Type.STRING, description: "Brief explanation of the plan" }
      },
      required: ["riskLevel", "immediateInterventions", "monitoringFrequency", "rationale"]
    };

    try {
      const response = await this.router.generateContent({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.2
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e: any) {
      console.error("[TreatmentRecommendation Agent] Error:", e);
      throw e;
    }
  }
}

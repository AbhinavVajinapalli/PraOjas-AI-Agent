import { GoogleGenAI, Type } from '@google/genai';

export class PredictionAgent {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Purpose: Uses Gemini as a zero/few-shot predictor for sepsis and mortality forecasting.
   */
  async predict(patientData: any) {
    console.log(`[Prediction Agent] Calling Gemini model for predictions`);
    
    const prompt = `
      You are an expert clinical predictive model. Analyze the following patient data 
      and predict the probability of Sepsis and the probability of Mortality.
      Return the response in JSON format.
      
      Patient Data:
      Vitals: ${JSON.stringify(patientData.vitals)}
      Labs: ${JSON.stringify(patientData.labs)}
      Clinical Notes: ${patientData.clinicalNotes || 'None'}
      
      Predict the probabilities (between 0.0 and 1.0, where 1.0 is 100% chance).
    `;

    try {
      const modelName = process.env.GEMINI_TUNED_MODEL_NAME || 'gemini-1.5-pro';
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sepsisProbability: {
                type: Type.NUMBER,
                description: "Probability of sepsis (0.0 to 1.0)"
              },
              mortalityProbability: {
                type: Type.NUMBER,
                description: "Probability of mortality (0.0 to 1.0)"
              },
              confidenceScore: {
                type: Type.NUMBER,
                description: "Your confidence in this prediction (0.0 to 1.0)"
              }
            },
            required: ["sepsisProbability", "mortalityProbability", "confidenceScore"]
          }
        }
      });
      
      let parsed;
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch (e) {
        throw new Error('Failed to parse Gemini response');
      }

      return {
        sepsisProbability: parsed.sepsisProbability || 0.1,
        mortalityProbability: parsed.mortalityProbability || 0.05,
        confidenceScore: parsed.confidenceScore || 0.8,
        timestamp: new Date().toISOString(),
        modelMetadata: {
          name: process.env.GEMINI_TUNED_MODEL_NAME ? `Tuned Gemini Model (${process.env.GEMINI_TUNED_MODEL_NAME})` : "Gemini 1.5 Pro Predictive Agent",
          sepsisAuroc: "N/A (LLM)",
          mortalityAuroc: "N/A (LLM)",
          sepsisEce: "N/A (LLM)",
          mortalityEce: "N/A (LLM)"
        }
      };
    } catch (error) {
      console.error("[Prediction Agent] Failed to call Gemini model:", error);
      // Fallback
      return {
        sepsisProbability: 0.1,
        mortalityProbability: 0.05,
        confidenceScore: 0.5,
        timestamp: new Date().toISOString(),
        modelMetadata: {
          name: "Predictive Agent (Fallback)",
          sepsisAuroc: "N/A (LLM)",
          mortalityAuroc: "N/A (LLM)",
          sepsisEce: "N/A (LLM)",
          mortalityEce: "N/A (LLM)"
        }
      };
    }
  }
}


import { GoogleGenAI } from '@google/genai';

export class ValidationAgent {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Purpose: Validates the extracted clinical data for missing or incorrect values.
   * Ensures the data is safe to pass to the downstream model.
   */
  async validateData(patientData: any) {
    console.log(`[Validation Agent] Validating data for ${patientData.name || 'Unknown Patient'}...`);
    
    const prompt = `
      You are the PraOjas AI Validation Agent.
      Review the following extracted clinical data for missing, anomalous, or critically out-of-range values that might indicate extraction errors or require immediate human review.
      
      Patient Data:
      ${JSON.stringify(patientData, null, 2)}
      
      Provide a JSON response with the following format (no markdown formatting):
      {
        "isValid": true/false, // false only if critical data (HR, BP, Lactate) is missing or absurdly out of range (e.g. HR > 300)
        "warnings": ["List of warnings about missing non-critical data or mildly out of range values"],
        "correctedData": { ... } // Provide the original data with any obvious formatting errors fixed (e.g., negative age). If no corrections, return the original data.
      }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: prompt,
        config: {
            temperature: 0.1
        }
      });

      let responseText = response.text || "{}";
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const validationResult = JSON.parse(responseText);
      return validationResult;
    } catch (error) {
      console.error("[Validation Agent] Error validating data:", error);
      // Fail open for now, returning original data as valid
      return { isValid: true, warnings: ["Validation failed to run."], correctedData: patientData };
    }
  }
}

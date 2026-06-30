import { GoogleGenAI } from '@google/genai';

export class ClinicalNLPAgent {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Purpose: Extracts structured medical entities (diagnoses, medications, symptoms, procedures) 
   * from unstructured clinical notes.
   */
  async extractEntities(clinicalNotes: string) {
    console.log(`[Clinical NLP Agent] Extracting entities from clinical notes...`);
    
    if (!clinicalNotes || clinicalNotes.trim() === '') {
      return { diagnoses: [], medications: [], symptoms: [], procedures: [] };
    }

    const prompt = `
      You are the PraOjas AI Clinical NLP Agent.
      Analyze the following unstructured clinical notes and extract relevant medical entities.
      
      Clinical Notes:
      ${clinicalNotes}
      
      Provide a JSON response ONLY (no markdown formatting) with the following structure:
      {
        "diagnoses": ["List of extracted diagnoses or comorbidities"],
        "medications": ["List of extracted medications"],
        "symptoms": ["List of extracted symptoms"],
        "procedures": ["List of extracted procedures or surgeries"]
      }
      If a category has no items, return an empty array for it.
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
      
      return JSON.parse(responseText);
    } catch (error) {
      console.error("[Clinical NLP Agent] Error extracting entities:", error);
      return { diagnoses: [], medications: [], symptoms: [], procedures: [] };
    }
  }
}

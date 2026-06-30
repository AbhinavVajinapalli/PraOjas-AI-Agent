import { GoogleGenAI } from '@google/genai';

export class DocumentUnderstandingAgent {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async parseDocument(documentText: string) {
    const prompt = `
      You are the PraOjas AI Document Understanding Agent.
      Your task is to extract patient information from the following clinical document (PDF, CSV, or Text).
      Extract the data into a structured JSON format.
      
      Document Content:
      ${documentText}

      Please extract the following information and return ONLY a valid JSON object matching this structure:
      {
        "name": "Extracted name or 'Unknown Patient'",
        "age": 50, // integer
        "gender": "Male" or "Female" or "Other",
        "department": "Extracted department or 'ICU'",
        "vitals": {
          "hr": 80, // integer (Heart Rate in bpm)
          "bp": "120/80", // string (Blood Pressure in mmHg)
          "temp": 37.0, // float (Temperature in Celsius)
          "rr": 16, // integer (Respiratory Rate)
          "spo2": 98 // integer (SpO2 %)
        },
        "labs": {
          "wbc": 8.0, // float (WBC 10^9/L)
          "lactate": 1.0, // float (Lactate mmol/L)
          "creatinine": 1.0 // float (Creatinine mg/dL)
        },
        "clinicalNotes": "Extract any relevant clinical notes, triage notes, history of present illness, diagnoses, symptoms, current medications, or observations."
      }
      
      If any value is missing in the text, use reasonable clinical defaults or leave as a safe default (like 'Unknown' or an average value for vitals/labs).
      Ensure the output is ONLY valid JSON, without any markdown formatting like \`\`\`json or \`\`\`.
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
      // Clean markdown if present
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const parsedData = JSON.parse(responseText);
      return parsedData;
    } catch (error) {
      console.error("[Document Understanding Agent] Error parsing document:", error);
      throw new Error("Failed to parse document using Gemini.");
    }
  }
}

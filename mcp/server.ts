import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { PredictionAgent } from '../server/agents/PredictionAgent.js';
import { MedicalKnowledgeAgent } from '../server/agents/MedicalKnowledgeAgent.js';
import dotenv from 'dotenv';
dotenv.config();

const server = new McpServer({
  name: "PraOjas-MCP",
  version: "1.0.0"
});

// Mock database for FHIRMCP
const patients = {
  "P123": {
    id: "P123",
    name: "John Doe",
    age: 65,
    gender: "M",
    history: ["Hypertension", "Type 2 Diabetes"],
    vitals: { hr: 110, bp: "90/60", temp: 38.5, rr: 24, spo2: 92 },
    labs: { wbc: 18.5, lactate: 4.2 }
  }
};

server.tool(
  "get_patient_observations",
  "Fetch patient vitals and labs from the FHIR database",
  {
    patientId: z.string().describe("The patient ID to query (e.g. P123)")
  },
  async ({ patientId }) => {
    const patient = patients[patientId as keyof typeof patients];
    if (!patient) {
      return {
        content: [{ type: "text", text: `Patient ${patientId} not found.` }]
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(patient, null, 2) }]
    };
  }
);

server.tool(
  "predict_sepsis_risk",
  "Run AI sepsis and mortality prediction based on patient clinical data",
  {
    patientJson: z.string().describe("JSON string of patient object including vitals and labs")
  },
  async ({ patientJson }) => {
    try {
      const patient = JSON.parse(patientJson);
      const apiKey = process.env.GEMINI_API_KEY || '';
      if (!apiKey) throw new Error("GEMINI_API_KEY not found in environment");
      
      const predictionAgent = new PredictionAgent(apiKey);
      const prediction = await predictionAgent.predict(patient, [], '');
      return {
        content: [{ type: "text", text: JSON.stringify(prediction, null, 2) }]
      };
    } catch (e: any) {
      return {
        content: [{ type: "text", text: `Error: ${e.message}` }]
      };
    }
  }
);

server.tool(
  "generate_explanation",
  "Generate a clinical explanation for the given prediction",
  {
    patientJson: z.string(),
    predictionJson: z.string()
  },
  async ({ patientJson, predictionJson }) => {
    try {
      const patient = JSON.parse(patientJson);
      const prediction = JSON.parse(predictionJson);
      const apiKey = process.env.GEMINI_API_KEY || '';
      
      const kbAgent = new MedicalKnowledgeAgent(apiKey);
      const explanation = await kbAgent.generateExplanation(patient, prediction);
      return {
        content: [{ type: "text", text: JSON.stringify(explanation, null, 2) }]
      };
    } catch (e: any) {
      return {
        content: [{ type: "text", text: `Error: ${e.message}` }]
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PraOjas MCP Server running on stdio");
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { server };

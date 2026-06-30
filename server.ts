import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { CoordinatorAgent } from './server/agents/CoordinatorAgent';

dotenv.config();

const app = express();
const PORT = 3000;

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());


// Init Coordinator Agent
const coordinatorAgent = new CoordinatorAgent(process.env.GEMINI_API_KEY || '');

// Coordinator Agent APIs
app.post('/api/predict', async (req, res) => {
  const { patient } = req.body;
  if (!patient) return res.status(400).json({ error: 'Patient data is required' });

  try {
    const prediction = await coordinatorAgent.handlePredictionRequest(patient);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to run prediction.' });
  }
});

// Explainability API (Delegates to Coordinator Agent)
app.post('/api/explain', async (req, res) => {
  const { patient, prediction } = req.body;
  
  try {
    const explanationData = await coordinatorAgent.handleExplanationRequest(patient, prediction);
    res.json(explanationData);
  } catch (error: any) {
    console.error('Error generating explanation:', error);
    res.status(500).json({ error: 'Failed to generate explanation.' });
  }
});

// Smart Vitals API (Delegates to Coordinator Agent)
app.post('/api/smart-vitals', async (req, res) => {
  const { patient } = req.body;
  if (!patient) return res.status(400).json({ error: 'Patient data is required' });

  try {
    const suggestedVitals = await coordinatorAgent.handleSmartVitalsRequest(patient);
    res.json(suggestedVitals);
  } catch (error: any) {
    console.error('Error generating smart vitals:', error);
    res.status(500).json({ error: 'Failed to generate smart vitals.' });
  }
});

// Document Upload API
app.post('/api/parse-document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let documentText = '';
    const fileMimeType = req.file.mimetype;
    
    if (fileMimeType === 'application/pdf') {
      const parser = new PDFParse({ data: req.file.buffer });
      const data = await parser.getText();
      documentText = data.text;
    } else {
      documentText = req.file.buffer.toString('utf-8');
    }

    const structuredData = await coordinatorAgent.handleDocumentUpload(documentText);
    res.json(structuredData);
  } catch (error: any) {
    console.error('Error parsing document:', error);
    res.status(500).json({ error: 'Failed to parse document.' });
  }
});

import { db } from './src/db';
import { patientHistory } from './src/db/schema';
import crypto from 'crypto';

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PraOjas AI Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

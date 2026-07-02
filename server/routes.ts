import { Router } from 'express';
import multer from 'multer';
import { CoordinatorAgent } from './agents/CoordinatorAgent';
import { MonitoringAgent, PatientAlert } from './agents/MonitoringAgent';
import { logger } from './utils/logger';
import { requireAuth } from './middleware/auth';

export function createRouter(
  coordinatorAgent: CoordinatorAgent, 
  monitoringAgent: MonitoringAgent,
  sseClients: Set<any>
) {
  const router = Router();
  const upload = multer({ storage: multer.memoryStorage() });

  /**
   * GET /api/alerts/stream
   * Server-Sent Events endpoint for real-time autonomous monitoring alerts.
   */
  router.get('/alerts/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30_000);

    sseClients.add(res);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  /**
   * POST /api/patients/register
   * Registers a patient with the autonomous MonitoringAgent.
   */
  router.post('/patients/register', requireAuth, (req, res) => {
    const { patient } = req.body;
    if (!patient) return res.status(400).json({ error: 'Patient data required' });
    monitoringAgent.registerPatient(patient);
    res.json({ registered: true, patientId: patient.id });
  });

  /**
   * POST /api/patients/update
   * Updates a patient's vitals in the MonitoringAgent registry.
   */
  router.post('/patients/update', requireAuth, (req, res) => {
    const { patient } = req.body;
    if (!patient) return res.status(400).json({ error: 'Patient data required' });
    monitoringAgent.updatePatient(patient);
    res.json({ updated: true });
  });

  /**
   * DELETE /api/patients/:id/deregister
   * Removes a patient from the autonomous monitoring registry.
   */
  router.delete('/patients/:id/deregister', requireAuth, (req, res) => {
    monitoringAgent.deregisterPatient(req.params.id);
    res.json({ deregistered: true });
  });

  /**
   * POST /api/memory
   * Returns the persistent prediction history for a patient.
   */
  router.post('/memory', requireAuth, async (req, res) => {
    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ error: 'patientId is required' });
    try {
      const memory = coordinatorAgent.getMemoryAgent();
      const history = await memory.getPredictionHistory(patientId);
      res.json({ patientId, history });
    } catch (error) {
      logger.error({ error }, '[/api/memory] Error retrieving memory');
      res.status(500).json({ error: 'Failed to retrieve memory' });
    }
  });

  /**
   * POST /api/predict
   * Runs sepsis & mortality prediction via CoordinatorAgent (with Memory + Retry).
   */
  router.post('/predict', requireAuth, async (req, res) => {
    const { patient } = req.body;
    if (!patient) return res.status(400).json({ error: 'Patient data is required' });
    try {
      const prediction = await coordinatorAgent.handlePredictionRequest(patient);
      res.json(prediction);
    } catch (error: any) {
      logger.error({ error: error.message }, '[/api/predict] Error running prediction');
      res.status(500).json({ error: error.message || 'Failed to run prediction.' });
    }
  });

  /**
   * POST /api/explain
   * Runs the full NLP → Explanation → Report pipeline via CoordinatorAgent.
   */
  router.post('/explain', requireAuth, async (req, res) => {
    const { patient, prediction } = req.body;
    try {
      const result = await coordinatorAgent.handleExplanationRequest(patient, prediction);
      res.json(result);
    } catch (error: any) {
      logger.error({ error }, '[/api/explain] Error generating explanation');
      res.status(500).json({ error: 'Failed to generate explanation.' });
    }
  });

  /**
   * POST /api/smart-vitals
   * Suggests next vitals reading via MedicalKnowledgeAgent.
   */
  router.post('/smart-vitals', requireAuth, async (req, res) => {
    const { patient } = req.body;
    if (!patient) return res.status(400).json({ error: 'Patient data is required' });
    try {
      const suggestedVitals = await coordinatorAgent.handleSmartVitalsRequest(patient);
      res.json(suggestedVitals);
    } catch (error: any) {
      logger.error({ error }, '[/api/smart-vitals] Error suggesting vitals');
      res.status(500).json({ error: 'Failed to generate smart vitals.' });
    }
  });

  /**
   * POST /api/parse-document
   * Parses an uploaded PDF/text using DocumentUnderstandingAgent + ValidationAgent.
   */
  router.post('/parse-document', requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      let documentText = '';
      if (req.file.mimetype === 'application/pdf') {
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: req.file.buffer });
        const data = await parser.getText();
        documentText = data.text;
      } else {
        documentText = req.file.buffer.toString('utf-8');
      }

      const structuredData = await coordinatorAgent.handleDocumentUpload(documentText);
      res.json(structuredData);
    } catch (error: any) {
      logger.error({ error }, '[/api/parse-document] Error parsing document');
      res.status(500).json({ error: 'Failed to parse document.' });
    }
  });

  return router;
}

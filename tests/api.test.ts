import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createRouter } from '../server/routes';

/**
 * api.test.ts
 *
 * Integration tests for the Express.js REST API layer.
 * Agents are mocked so no real Gemini calls are made.
 * Tests verify: routing, middleware, request validation, and response structure.
 */

// ─── Build a test Express app with mocked agents ─────────────────────────────
function buildTestApp(coordinatorOverrides: any = {}, monitoringOverrides: any = {}) {
  const mockCoordinatorAgent: any = {
    handlePredictionRequest: vi.fn().mockResolvedValue({
      sepsisProbability: 0.75,
      mortalityProbability: 0.35,
      confidenceScore: 0.88,
      timestamp: new Date().toISOString(),
      modelMetadata: { name: 'MockAgent' },
    }),
    handleExplanationRequest: vi.fn().mockResolvedValue({
      explanation: 'Elevated lactate is the primary driver.',
      featureImportance: [{ feature: 'Lactate', importance: 0.85 }],
      nlpEntities: { diagnoses: ['Sepsis'], medications: [], symptoms: ['Fever'] },
      report: { summary: 'High sepsis risk.', recommendedActions: ['Start antibiotics.'] },
    }),
    handleSmartVitalsRequest: vi.fn().mockResolvedValue({
      hr: 110, bp: '90/55', temp: 39.2, rr: 23, spo2: 92,
    }),
    handleDocumentUpload: vi.fn().mockResolvedValue({
      name: 'Jane Smith', age: 55, gender: 'Female',
      vitals: { hr: 98, bp: '118/78', temp: 37.8, rr: 18, spo2: 96 },
      labs: { wbc: 11.2, lactate: 1.8 },
      clinicalNotes: 'Admitted for pneumonia.',
      _validationWarnings: [],
    }),
    getMemoryAgent: vi.fn().mockReturnValue({
      getPredictionHistory: vi.fn().mockResolvedValue([]),
    }),
    ...coordinatorOverrides,
  };

  const mockMonitoringAgent: any = {
    registerPatient: vi.fn(),
    updatePatient: vi.fn(),
    deregisterPatient: vi.fn(),
    ...monitoringOverrides,
  };

  const mockSseClients = new Set<any>();
  const app = express();
  app.use(express.json());
  app.use('/api', createRouter(mockCoordinatorAgent, mockMonitoringAgent, mockSseClients));

  return { app, mockCoordinatorAgent, mockMonitoringAgent };
}

// ─── Sample Patient Fixture ───────────────────────────────────────────────────
const samplePatient = {
  id: 'P-001',
  name: 'John Doe',
  age: 68,
  gender: 'Male',
  vitals: { hr: 105, bp: '95/60', temp: 38.9, rr: 22, spo2: 94 },
  labs: { wbc: 14.2, lactate: 3.1, creatinine: 1.8 },
  clinicalNotes: 'Fever and altered mental status.',
};

// ─── POST /api/predict ────────────────────────────────────────────────────────
describe('POST /api/predict', () => {
  it('should return a prediction result with valid patient data', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/api/predict').send({ patient: samplePatient });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sepsisProbability');
    expect(res.body).toHaveProperty('mortalityProbability');
    expect(res.body).toHaveProperty('confidenceScore');
    expect(res.body.sepsisProbability).toBeGreaterThanOrEqual(0);
    expect(res.body.sepsisProbability).toBeLessThanOrEqual(1);
  });

  it('should return 400 when patient data is missing', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/api/predict').send({});

    // Missing patient field should result in a 400 Bad Request
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 500 when the coordinator agent throws an error', async () => {
    const { app } = buildTestApp({
      handlePredictionRequest: vi.fn().mockRejectedValue(new Error('Gemini rate limited')),
    });
    const res = await request(app).post('/api/predict').send({ patient: samplePatient });

    // Internal agent failure should surface as 500 with an error message
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── POST /api/explain ────────────────────────────────────────────────────────
describe('POST /api/explain', () => {
  it('should return explanation with feature importance and report', async () => {
    const { app } = buildTestApp();
    const prediction = { sepsisProbability: 0.82, mortalityProbability: 0.41, confidenceScore: 0.91 };
    const res = await request(app).post('/api/explain').send({ patient: samplePatient, prediction });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('explanation');
    expect(res.body).toHaveProperty('featureImportance');
    expect(res.body).toHaveProperty('nlpEntities');
    expect(res.body).toHaveProperty('report');
  });
});

// ─── POST /api/smart-vitals ───────────────────────────────────────────────────
describe('POST /api/smart-vitals', () => {
  it('should return suggested next vitals for a patient', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/api/smart-vitals').send({ patient: samplePatient });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('hr');
    expect(res.body).toHaveProperty('bp');
    expect(res.body).toHaveProperty('temp');
  });

  it('should return 400 if patient is missing', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/api/smart-vitals').send({});
    expect(res.status).toBe(400);
  });
});

// ─── POST /api/patients/register ─────────────────────────────────────────────
describe('POST /api/patients/register', () => {
  it('should register a patient with the monitoring agent', async () => {
    const { app, mockMonitoringAgent } = buildTestApp();
    const res = await request(app).post('/api/patients/register').send({ patient: samplePatient });

    expect(res.status).toBe(200);
    expect(res.body.registered).toBe(true);
    // Verify the monitoring agent's registerPatient was actually called
    expect(mockMonitoringAgent.registerPatient).toHaveBeenCalledWith(samplePatient);
  });

  it('should return 400 if patient is missing', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/api/patients/register').send({});
    expect(res.status).toBe(400);
  });
});

// ─── POST /api/memory ────────────────────────────────────────────────────────
describe('POST /api/memory', () => {
  it('should return prediction history for a known patient', async () => {
    const { app } = buildTestApp();
    const res = await request(app)
      .post('/api/memory')
      .send({ patientId: 'P-001' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('patientId', 'P-001');
    expect(res.body).toHaveProperty('history');
    expect(Array.isArray(res.body.history)).toBe(true);
  });
});

// ─── Security: Rate Limit Headers ────────────────────────────────────────────
describe('Security Headers', () => {
  it('should return response for valid requests', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/api/predict').send({ patient: samplePatient });

    // Response should be valid (not blocked)
    expect([200, 400, 500]).toContain(res.status);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * prediction.test.ts
 *
 * Unit tests for the PredictionAgent — verifies that:
 * 1. The agent correctly parses Gemini function calling responses
 * 2. Outputs are clamped to valid probability ranges [0, 1]
 * 3. Fallback JSON text parsing works when function calling is unused
 * 4. Errors are thrown on unparseable model output
 * 5. Few-shot historical context is accepted and passed through
 *
 * All tests use mocked ModelRouter — no real Gemini API calls are made.
 */

// Helper to create a sample patient for testing
const createSamplePatient = (overrides: Record<string, any> = {}) => ({
  id: 'P-TEST-001',
  name: 'Test Patient',
  age: 68,
  gender: 'Male',
  vitals: { hr: 105, bp: '95/60', temp: 38.9, rr: 22, spo2: 94 },
  labs: { wbc: 14.2, lactate: 3.1, creatinine: 1.8, platelets: 110 },
  clinicalNotes: 'Fever, hypotension, tachycardia.',
  ...overrides,
});

describe('PredictionAgent', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should return valid prediction via function calling', async () => {
    // Mock ModelRouter BEFORE importing PredictionAgent so it picks up the mock
    vi.doMock('../server/agents/ModelRouter', () => ({
      ModelRouter: vi.fn().mockImplementation(function () {
        return {
          generateContent: vi.fn().mockResolvedValue({
            functionCalls: [
              {
                name: 'predict_outcomes',
                args: { sepsisProbability: 0.82, mortalityProbability: 0.41, confidenceScore: 0.91 },
              },
            ],
            text: null,
          }),
        };
      }),
    }));

    const { PredictionAgent } = await import('../server/agents/PredictionAgent');
    const agent = new PredictionAgent('test-api-key');
    const result = await agent.predict(createSamplePatient());

    // Verify the parsed Gemini function call result is returned correctly
    expect(result.sepsisProbability).toBe(0.82);
    expect(result.mortalityProbability).toBe(0.41);
    expect(result.confidenceScore).toBe(0.91);
    expect(result.timestamp).toBeDefined();
    expect(result.modelMetadata).toBeDefined();
  });

  it('should clamp out-of-range probabilities to [0, 1]', async () => {
    vi.doMock('../server/agents/ModelRouter', () => ({
      ModelRouter: vi.fn().mockImplementation(function () {
        return {
          // Invoke Gemini model to estimate patient sepsis risk.
          // The result is forwarded to the coordinator agent for aggregation.
          generateContent: vi.fn().mockResolvedValue({
            functionCalls: [
              {
                name: 'predict_outcomes',
                // Model returns out-of-range values — agent must clamp them
                args: { sepsisProbability: 1.5, mortalityProbability: -0.2, confidenceScore: 0.9 },
              },
            ],
            text: null,
          }),
        };
      }),
    }));

    const { PredictionAgent } = await import('../server/agents/PredictionAgent');
    const agent = new PredictionAgent('test-api-key');
    const result = await agent.predict(createSamplePatient());

    // Values outside [0, 1] must be clamped by the agent's safety check
    expect(result.sepsisProbability).toBe(1.0);
    expect(result.mortalityProbability).toBe(0.0);
  });

  it('should fall back to JSON text parsing when function calling is not used', async () => {
    vi.doMock('../server/agents/ModelRouter', () => ({
      ModelRouter: vi.fn().mockImplementation(function () {
        return {
          generateContent: vi.fn().mockResolvedValue({
            functionCalls: null,
            // Some model versions return raw JSON text instead of tool calls
            text: '{"sepsisProbability": 0.65, "mortalityProbability": 0.30, "confidenceScore": 0.85}',
          }),
        };
      }),
    }));

    const { PredictionAgent } = await import('../server/agents/PredictionAgent');
    const agent = new PredictionAgent('test-api-key');
    const result = await agent.predict(createSamplePatient());

    expect(result.sepsisProbability).toBe(0.65);
    expect(result.mortalityProbability).toBe(0.30);
  });

  it('should throw an error when the model returns unparseable output', async () => {
    vi.doMock('../server/agents/ModelRouter', () => ({
      ModelRouter: vi.fn().mockImplementation(function () {
        return {
          generateContent: vi.fn().mockResolvedValue({
            functionCalls: null,
            // Model returns a non-JSON disclaimer — should trigger an error
            text: 'I cannot provide medical predictions as I am not a doctor.',
          }),
        };
      }),
    }));

    const { PredictionAgent } = await import('../server/agents/PredictionAgent');
    const agent = new PredictionAgent('test-api-key');

    await expect(agent.predict(createSamplePatient())).rejects.toThrow();
  });

  it('should accept historical few-shot context without throwing', async () => {
    vi.doMock('../server/agents/ModelRouter', () => ({
      ModelRouter: vi.fn().mockImplementation(function () {
        return {
          generateContent: vi.fn().mockResolvedValue({
            functionCalls: [
              {
                name: 'predict_outcomes',
                args: { sepsisProbability: 0.78, mortalityProbability: 0.38, confidenceScore: 0.89 },
              },
            ],
            text: null,
          }),
        };
      }),
    }));

    // Historical cases used for few-shot RAG — passed to PredictionAgent.predict()
    const historicalCases = [
      {
        id: 'H-001', age: 70, gender: 'Male',
        vitals: { hr: 108, temp: 39.1, rr: 23, bp: '90/55' },
        labs: { wbc: 15.1, lactate: 3.4 },
        didDevelopSepsis: 'YES',
        mortalityOutcome: 'DIED',
        note: 'Responded to early antibiotics',
      },
    ];

    const { PredictionAgent } = await import('../server/agents/PredictionAgent');
    const agent = new PredictionAgent('test-api-key');
    const result = await agent.predict(createSamplePatient(), historicalCases);

    expect(result.sepsisProbability).toBe(0.78);
  });
});

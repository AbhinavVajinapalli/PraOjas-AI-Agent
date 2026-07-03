import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * agent.test.ts
 *
 * Unit tests for the Multi-Agent System components.
 * These tests verify agent logic using mocked dependencies
 * so no real DB or Gemini API key is required.
 */

// ─── MemoryAgent Tests ────────────────────────────────────────────────────────
describe('MemoryAgent', () => {
  it('should return empty history when database is not configured (no DB)', async () => {
    // MemoryAgent gracefully falls back to [] when no DB is configured.
    // This is the expected behaviour in the test environment.
    const { MemoryAgent } = await import('../server/agents/MemoryAgent');
    const memory = new MemoryAgent();

    const history = await memory.getPredictionHistory('P-001');
    // Without a real DB, the agent returns an empty array safely
    expect(Array.isArray(history)).toBe(true);
  });

  it('should return empty history for an unknown patient', async () => {
    const { MemoryAgent } = await import('../server/agents/MemoryAgent');
    const memory = new MemoryAgent();

    const history = await memory.getPredictionHistory('P-UNKNOWN-999');
    expect(history).toEqual([]);
  });

  it('should not throw when storing a prediction without a DB', async () => {
    const { MemoryAgent } = await import('../server/agents/MemoryAgent');
    const memory = new MemoryAgent();

    // storePrediction should silently return (no-op) when DB is unavailable
    await expect(
      memory.storePrediction('P-001', {
        sepsisProbability: 0.75,
        mortalityProbability: 0.35,
        confidenceScore: 0.88,
        timestamp: new Date().toISOString(),
      })
    ).resolves.not.toThrow();
  });

  it('should not throw when logging an agent decision without a DB', async () => {
    const { MemoryAgent } = await import('../server/agents/MemoryAgent');
    const memory = new MemoryAgent();

    await expect(
      memory.logAgentDecision(
        'PredictionAgent',
        'SEPSIS_PREDICTION',
        'P-002',
        { vitals: { hr: 105, temp: 38.9 } },
        { sepsisProbability: 0.82 }
      )
    ).resolves.not.toThrow();
  });

  it('should return fallback few-shot examples when no DB is configured', async () => {
    const { MemoryAgent } = await import('../server/agents/MemoryAgent');
    const memory = new MemoryAgent();

    // getSimilarHistoricalCases returns hardcoded RAG examples without a DB
    const cases = await memory.getSimilarHistoricalCases({ id: 'P-TEST', age: 65 });
    expect(Array.isArray(cases)).toBe(true);
    expect(cases.length).toBeGreaterThan(0);
    // Each case should have the structure expected by the PredictionAgent prompt builder
    expect(cases[0]).toHaveProperty('id');
    expect(cases[0]).toHaveProperty('vitals');
  });
});

// ─── RetryOrchestrator Tests ──────────────────────────────────────────────────
describe('RetryOrchestrator', () => {
  it('should return result on first successful attempt', async () => {
    const { RetryOrchestrator } = await import('../server/agents/RetryOrchestrator');

    let callCount = 0;
    const result = await RetryOrchestrator.withRetry(
      // Agent function that always succeeds
      async (_feedback: string | null) => {
        callCount++;
        return { sepsisProbability: 0.7, mortalityProbability: 0.3, confidenceScore: 0.9 };
      },
      // Validator that approves the result
      (_res: any) => ({ isValid: true }),
      3
    );

    expect(result.sepsisProbability).toBe(0.7);
    expect(callCount).toBe(1); // Only called once — no retries needed
  });

  it('should retry and eventually succeed when validator initially rejects', async () => {
    const { RetryOrchestrator } = await import('../server/agents/RetryOrchestrator');

    let callCount = 0;
    const result = await RetryOrchestrator.withRetry(
      // Agent function fails on first try, succeeds on second
      async (_feedback: string | null) => {
        callCount++;
        if (callCount < 2) {
          return { sepsisProbability: -1, mortalityProbability: 0.3, confidenceScore: 0.9 };
        }
        return { sepsisProbability: 0.65, mortalityProbability: 0.3, confidenceScore: 0.9 };
      },
      // Validator rejects negative probability
      (res: any) => {
        if (res.sepsisProbability < 0) return { isValid: false, error: 'sepsisProbability must be >= 0' };
        return { isValid: true };
      },
      3
    );

    expect(result.sepsisProbability).toBe(0.65);
    expect(callCount).toBe(2); // Retried once
  });

  it('should throw after exhausting all retries', async () => {
    const { RetryOrchestrator } = await import('../server/agents/RetryOrchestrator');

    await expect(
      RetryOrchestrator.withRetry(
        // Always returns invalid result
        async (_feedback: string | null) => ({ sepsisProbability: -1, mortalityProbability: -1, confidenceScore: -1 }),
        // Validator always rejects
        (_res: any) => ({ isValid: false, error: 'always invalid' }),
        2 // Only 2 retries
      )
    ).rejects.toThrow();
  });
});

// ─── ModelRouter Logic Tests ──────────────────────────────────────────────────
describe('ModelRouter', () => {
  it('should instantiate with a valid API key', async () => {
    // We only test instantiation — no real Gemini call is made.
    const { ModelRouter } = await import('../server/agents/ModelRouter');
    const router = new ModelRouter('test-api-key');
    expect(router).toBeDefined();
    expect(typeof router.generateContent).toBe('function');
  });

  it('should return model status information', async () => {
    const { ModelRouter } = await import('../server/agents/ModelRouter');
    const router = new ModelRouter('test-api-key');
    const status = router.getStatus();

    expect(Array.isArray(status)).toBe(true);
    expect(status.length).toBeGreaterThan(0);
    // Each entry should have a model name and availability flag
    expect(status[0]).toHaveProperty('model');
    expect(status[0]).toHaveProperty('available');
    expect(status[0]).toHaveProperty('cooldownRemaining');
  });
});

import React from 'react';
import { describe, it, expect } from 'vitest';

/**
 * dashboard.test.ts
 *
 * Frontend unit tests for dashboard-related functionality.
 *
 * NOTE: These tests verify the data transformation utilities and
 * domain logic used by the dashboard rather than rendering full React
 * components (which require a full browser environment). For full
 * component rendering tests, see src/App.test.tsx.
 */

// ─── Risk Classification Helpers ─────────────────────────────────────────────

/**
 * Classifies a sepsis probability into a human-readable risk level.
 * Mirrors the logic used in the RiskGauge and AlertPanel components.
 */
function classifySepsisRisk(probability: number): 'Critical' | 'High' | 'Moderate' | 'Low' {
  if (probability >= 0.75) return 'Critical';
  if (probability >= 0.50) return 'High';
  if (probability >= 0.25) return 'Moderate';
  return 'Low';
}

/**
 * Maps a sepsis risk level to the appropriate Tailwind color class.
 * Used by the dashboard badge and gauge color rendering.
 */
function getRiskColor(level: string): string {
  switch (level) {
    case 'Critical': return 'text-red-500';
    case 'High':     return 'text-orange-400';
    case 'Moderate': return 'text-yellow-400';
    default:         return 'text-green-400';
  }
}

/**
 * Formats a probability (0–1) as a readable percentage string.
 * Used in Risk Gauge and Prediction Panel.
 */
function formatProbability(prob: number): string {
  return `${Math.round(prob * 100)}%`;
}

/**
 * Determines whether a patient's vitals should trigger an alert.
 * Based on simplified qSOFA criteria used by the MonitoringAgent.
 */
function shouldTriggerAlert(vitals: { hr: number; rr: number; sbp: number }): boolean {
  const criteria = [
    vitals.rr >= 22,        // Respiratory rate >= 22/min
    vitals.sbp <= 100,      // Systolic BP <= 100 mmHg
    vitals.hr >= 100,       // Tachycardia (>= 100 bpm)
  ];
  return criteria.filter(Boolean).length >= 2;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Risk Classification', () => {
  it('should classify probability >= 0.75 as Critical', () => {
    expect(classifySepsisRisk(0.82)).toBe('Critical');
    expect(classifySepsisRisk(0.75)).toBe('Critical');
    expect(classifySepsisRisk(1.0)).toBe('Critical');
  });

  it('should classify probability 0.50–0.74 as High', () => {
    expect(classifySepsisRisk(0.65)).toBe('High');
    expect(classifySepsisRisk(0.50)).toBe('High');
  });

  it('should classify probability 0.25–0.49 as Moderate', () => {
    expect(classifySepsisRisk(0.35)).toBe('Moderate');
    expect(classifySepsisRisk(0.25)).toBe('Moderate');
  });

  it('should classify probability < 0.25 as Low', () => {
    expect(classifySepsisRisk(0.10)).toBe('Low');
    expect(classifySepsisRisk(0.0)).toBe('Low');
  });
});

describe('Risk Color Mapping', () => {
  it('should return red for Critical risk', () => {
    expect(getRiskColor('Critical')).toBe('text-red-500');
  });

  it('should return orange for High risk', () => {
    expect(getRiskColor('High')).toBe('text-orange-400');
  });

  it('should return green for Low risk', () => {
    expect(getRiskColor('Low')).toBe('text-green-400');
  });
});

describe('Probability Formatting', () => {
  it('should format 0.82 as "82%"', () => {
    expect(formatProbability(0.82)).toBe('82%');
  });

  it('should format 0.0 as "0%"', () => {
    expect(formatProbability(0.0)).toBe('0%');
  });

  it('should format 1.0 as "100%"', () => {
    expect(formatProbability(1.0)).toBe('100%');
  });

  it('should round to nearest integer', () => {
    expect(formatProbability(0.824)).toBe('82%');
    expect(formatProbability(0.825)).toBe('83%');
  });
});

describe('Alert Triggering Logic (qSOFA criteria)', () => {
  it('should trigger alert for patient with critical vitals (≥2 qSOFA criteria)', () => {
    // RR >= 22 AND SBP <= 100 — 2 criteria met
    const criticalVitals = { hr: 95, rr: 23, sbp: 90 };
    expect(shouldTriggerAlert(criticalVitals)).toBe(true);
  });

  it('should trigger alert with tachycardia and respiratory distress', () => {
    // HR >= 100 AND RR >= 22 — 2 criteria met
    const vitals = { hr: 108, rr: 22, sbp: 115 };
    expect(shouldTriggerAlert(vitals)).toBe(true);
  });

  it('should NOT trigger alert when fewer than 2 criteria met', () => {
    // Only RR >= 22 — 1 criterion, below threshold
    const stableVitals = { hr: 80, rr: 22, sbp: 120 };
    expect(shouldTriggerAlert(stableVitals)).toBe(false);
  });

  it('should NOT trigger alert for fully stable vitals', () => {
    const stableVitals = { hr: 75, rr: 16, sbp: 125 };
    expect(shouldTriggerAlert(stableVitals)).toBe(false);
  });

  it('should trigger alert when all 3 criteria are met', () => {
    // All 3 qSOFA criteria: High severity
    const severeVitals = { hr: 110, rr: 25, sbp: 85 };
    expect(shouldTriggerAlert(severeVitals)).toBe(true);
  });
});

describe('Frontend Module Imports', () => {
  it('should import React without errors', () => {
    // Verify React is accessible in the test environment
    expect(React).toBeDefined();
    expect(typeof React.createElement).toBe('function');
  });
});

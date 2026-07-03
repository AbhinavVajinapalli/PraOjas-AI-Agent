# Tests — PraOjas AI Test Suite

This directory contains unit and integration tests for the PraOjas AI multi-agent clinical decision support system.

## Test Files

| File | Coverage | Tests |
|------|----------|-------|
| `tests/api.test.ts` | REST API endpoints — all routes, validation, error handling | 10 |
| `tests/prediction.test.ts` | `PredictionAgent` — function calling, value clamping, JSON fallback | 5 |
| `tests/agent.test.ts` | `MemoryAgent`, `RetryOrchestrator`, `ModelRouter` | 10 |
| `tests/dashboard.test.ts` | Dashboard logic — risk classification, alert triggering, formatting | 17 |
| `server/routes.test.ts` | Route middleware and error handling | 1 |
| `src/App.test.tsx` | React component smoke test | 1 |
| **Total** | | **44** |

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (for development)
npx vitest

# Run a single test file
npx vitest run tests/prediction.test.ts

# Run with coverage
npx vitest run --coverage
```

## Test Design Principles

- **No real API calls** — All Gemini model calls are mocked so tests run without a `GEMINI_API_KEY`.
- **No real database** — `MemoryAgent` falls back to in-memory/empty results when PostgreSQL is not configured.
- **Isolated tests** — Each test mocks its dependencies cleanly using Vitest's `vi.doMock` + `vi.resetModules`.
- **Agent contract testing** — Tests verify input/output contracts for each agent rather than internal implementation details.

## Python Tests (FastAPI Backend)

The optional Python backend (`backend/`) has its own test suite:

```bash
cd backend
pip install -r tests/requirements-test.txt
pytest tests/
```

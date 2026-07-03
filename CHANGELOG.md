# Changelog

All notable changes to **PraOjas AI** are documented here.

This project adheres to [Semantic Versioning](https://semver.org/) and [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.

---

## [1.2.0] — 2026-07-03

### Added
- **MCP (Model Context Protocol) Layer** — Standardized agent communication via MCP servers for Sepsis Risk, Patient Data, and Medical Knowledge tools
- **Fine-tuned Gemini Model Support** — `ModelRouter` now prioritises a user-configured tuned model (`GEMINI_TUNED_MODEL_NAME`) for clinical prediction
- **Gemini Tuning Dataset** — `gemini-tuning-dataset.jsonl` with 100+ clinical cases for fine-tuning the prediction agent
- **Automatic Model Failover** — `ModelRouter` cycles through `gemini-2.0-flash → gemini-2.5-flash → gemini-1.5-flash` on rate-limit (429) errors
- **Few-Shot RAG** — `MemoryAgent` retrieves similar historical cases to improve prediction quality with context-aware prompting
- **Self-Correction Loop** — `RetryOrchestrator` validates agent outputs and retries with corrective feedback on schema failures
- **Server-Sent Events (SSE)** — Real-time alert streaming from `MonitoringAgent` to connected browser clients via `/api/alerts/stream`
- `ClinicalReportAgent` — Generates structured handoff summaries and clinical action plans
- `ValidationAgent` — Validates patient data fields for physiological plausibility before agent processing
- `MemoryAgent` — Persistent in-memory prediction history with PostgreSQL fallback
- `RetryOrchestrator` — Generic retry wrapper with schema validation and corrective feedback injection

### Changed
- `CoordinatorAgent` now orchestrates all agents with memory injection and retry logic
- `PredictionAgent` upgraded to use Gemini native function calling (`predict_outcomes` tool) for structured output
- Dashboard now displays SSE-streamed real-time alerts in a live notification panel

### Fixed
- Race condition in MonitoringAgent subscription list when multiple SSE clients disconnect simultaneously
- JSON parse fallback in `PredictionAgent` for models that ignore function calling and return raw text

---

## [1.1.0] — 2026-06-28

### Added
- **MonitoringAgent** — Autonomous background agent that monitors all registered patients every 5 minutes and generates Gemini-powered alerts for deteriorating vitals
- **DocumentUnderstandingAgent** — Parses uploaded PDF, CSV, and plain-text clinical documents into structured patient records using Gemini multimodal capabilities
- **ClinicalNLPAgent** — Extracts clinical entities (diagnoses, medications, symptoms) from free-text clinical notes
- **MedicalKnowledgeAgent** — Cross-references Sepsis-3 and SIRS criteria; generates next-vitals suggestions and clinical recommendations
- **Smart Vitals endpoint** (`POST /api/smart-vitals`) — AI-powered next vitals suggestion based on physiological trend
- **Document Parsing endpoint** (`POST /api/parse-document`) — Multipart file upload, supports PDF and text
- **Explainability Panel** in the dashboard — SHAP-style feature importance visualization for sepsis predictions
- **Rate Limiting** — `express-rate-limit` applied globally (100 requests per 15 minutes per IP)
- **Helmet** security headers applied to all responses
- **Pino** structured JSON logging replacing raw `console.log`
- PostgreSQL schema via Drizzle ORM for persistent patient history and prediction logs

### Changed
- `CoordinatorAgent` refactored to delegate to specialized sub-agents instead of handling all tasks internally
- Risk gauge component upgraded to display real-time probability values from API
- Alert panel redesigned with severity color coding (Critical / Warning / Info)

### Fixed
- Incorrect TypeScript types on patient vitals causing runtime failures in certain edge cases
- Rate limiter was incorrectly blocking the SSE `/api/alerts/stream` endpoint

---

## [1.0.0] — 2026-06-20

### Added
- **Initial Release** — First public version of PraOjas AI
- **React + Vite frontend** with Tailwind CSS, Framer Motion animations, and dark-mode dashboard
- **CoordinatorAgent** — Central orchestrator routing clinical requests to specialized sub-agents
- **PredictionAgent** — Gemini-powered sepsis and mortality risk prediction using qSOFA and Sepsis-3 criteria
- **REST API** with Express.js:
  - `POST /api/predict` — Sepsis and mortality risk prediction
  - `POST /api/explain` — Clinical explanation and report generation
  - `GET /api/alerts/stream` — SSE endpoint for real-time monitoring alerts
- **ICU Dashboard** — Real-time risk gauges, patient vitals display, and handoff summary panel
- **Multi-patient management** — Register, update, and monitor multiple ICU patients simultaneously
- **Docker Compose** configuration for PostgreSQL database
- **TypeScript** throughout — strict type checking on both frontend and backend
- **Vitest** test suite — unit tests for API routes and React components
- **Python/FastAPI backend** (`backend/`) — Optional alternative backend with Pydantic schemas and SQLAlchemy
- **Architecture and deployment documentation** in `docs/` and `deployment/`

---

## [Unreleased]

### Planned
- Google Cloud Run deployment with automated CI/CD pipeline
- Firebase Authentication integration for multi-user access
- Voice-to-clinical-notes transcription agent
- FHIR R4 patient data format support
- WebSocket-based real-time vitals streaming (replacing polling)
- Integration with BigQuery for large-scale retrospective analysis

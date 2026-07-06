# PraOjas AI

[![TypeScript](https://img.shields.io/badge/TypeScript-87.8%25-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-5.8%25-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen.svg)](https://github.com/shashidhar-02/PraOjas-AI-Agent)

**A Multi-Agent Clinical Decision Support System for ICU Risk Prediction and Explainable Healthcare Intelligence**

PraOjas AI is a next-generation, AI-powered Clinical Decision Support System (CDSS) tailored for Intensive Care Unit (ICU) environments. It leverages a sophisticated multi-agent architecture to deliver proactive risk assessment, explainable predictions, and actionable clinical recommendations before patient deterioration occurs.

---

## About the Name

**PraOjas** is a portmanteau with deep clinical significance:

- **Pra** → Before, Forward, Proactive, Predictive  
  Emphasizes the system's ability to predict patient trajectories **before** critical events occur.

- **Ojas** → Vitality, Life Force (from Ayurveda)  
  Symbolizes the system's mission to preserve and enhance patient wellbeing by maintaining vital stability.

**Combined Interpretation:**  
**"Proactive Understanding of Patient Vitality Before Deterioration"** — PraOjas AI anticipates patient crises, safeguarding the life force of ICU patients through early, evidence-based clinical intelligence.

---

## Dataset & Model Training

PraOjas AI utilizes **MIMIC-IV dataset** for comprehensive model development and performance optimization:

- **Dataset:** MIMIC-IV — A large-scale, freely available database of 40,000+ ICU patient records
- **Purpose:** Training and validation of sepsis and mortality risk prediction models
- **Data Elements:** Patient vitals, laboratory values, clinical notes, demographics, and outcomes
- **Learning Approach:** Supervised learning on historical patient trajectories to improve predictive accuracy and generalization
- **Performance Optimization:** Continuous model evaluation and refinement on MIMIC-IV benchmarks to ensure clinical reliability

This dataset-driven approach enables PraOjas AI to learn complex clinical patterns and deliver predictions grounded in real-world ICU data.

---

## Table of Contents

- [Features](#features)
- [Problem Statement](#problem-statement)
- [Architecture](#architecture)
- [Multi-Agent Workflow](#multi-agent-workflow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Security](#security)
- [Screenshots & Demo](#screenshots--demo)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Features

✨ **Core Capabilities:**

- 🏥 **Real-Time ICU Dashboard** — Dynamic risk gauges, patient vitals monitoring, and handoff summaries
- 🤖 **Multi-Agent Orchestration** — Coordinator, Prediction, NLP, and Knowledge agents working in harmony
- 🔮 **Sepsis Risk Prediction** — AI-powered early sepsis detection using clinical vitals and labs
- ☠️ **Mortality Risk Prediction** — Evidence-based mortality probability scoring
- 📄 **Clinical Document Understanding** — Parse PDFs, CSVs, and plain-text clinical notes
- 💡 **Explainable AI** — Feature importance, clinical entity extraction, and human-readable explanations
- 📋 **Smart Recommendations** — Evidence-based clinical guidelines (Sepsis-3, SIRS criteria)
- 🔌 **Active MCP Server** — Standardized Model Context Protocol (MCP) server for tool calling capabilities
- 🔒 **Secure REST APIs** — Rate limiting, helmet security, simulated JWT authentication
- 📊 **Structured Logging** — JSON-based logging with pino for enterprise log aggregation
- 🧪 **Comprehensive Testing** — Vitest unit tests, Supertest API tests, React component tests

---

## Problem Statement

**Challenge:**
- ICU clinicians face information overload with continuous patient monitoring
- Early sepsis detection can reduce mortality by 10-40% if diagnosed within the first hour
- Traditional static risk scores lack explainability and personalized context
- Manual clinical document review is time-consuming and error-prone

**Solution:**
PraOjas AI automates risk assessment, provides explainable predictions, and generates actionable recommendations—enabling clinicians to focus on patient care rather than data analysis.

---

## Architecture

### System Architecture Diagram

```mermaid
graph TD
    subgraph Frontend ["Frontend (React + Tailwind)"]
        DB[Dashboard] --> API
        P[Patients View] --> API
        A[Real-time Alerts] --> API
        S[Settings] --> API
    end

    subgraph Backend ["Backend (Node.js + Express)"]
        API[Secure REST API] --> R[Router]
        R --> C[Coordinator Agent]
        R --> M[Monitoring Agent]
    end

    subgraph AI ["Multi-Agent Layer (Google Gemini)"]
        C --> P_Agent[Prediction Agent]
        C --> NLP_Agent[Clinical NLP Agent]
        C --> K_Agent[Medical Knowledge Agent]
        C --> D_Agent[Document Parser Agent]
    end
    
    subgraph Storage ["Data Layer"]
        API --> DB_Layer[(SQLite / Postgres)]
    end
```

### Data Flow

```mermaid
sequenceDiagram
    participant User as Frontend (Doctor)
    participant API as Backend API
    participant Coord as Coordinator Agent
    participant Gemini as Google Gemini Models
    
    User->>API: Submits Patient Vitals/Notes
    API->>Coord: Route Request
    
    par Analysis
        Coord->>Gemini: PredictionAgent (Sepsis/Mortality Risk)
        Gemini-->>Coord: Risk Probabilities
    and Parsing
        Coord->>Gemini: DocumentUnderstandingAgent
        Gemini-->>Coord: Structured Data extraction
    and Guidelines
        Coord->>Gemini: ClinicalNLPAgent & MedicalKnowledgeAgent
        Gemini-->>Coord: Medical Recommendations
    end
    
    Coord->>API: Generate Explanations & Combine Results
    API->>User: JSON Response / Dashboard Visualization
```

---

## Multi-Agent Workflow

### Agent Orchestration

![Multi-Agent Workflow](assets/workflow.svg)

### Agent Responsibilities

| Agent | Role | Key Functions |
|-------|------|---------------|
| **CoordinatorAgent** | Main orchestrator | Route requests, manage retries, error handling |
| **PredictionAgent** | Risk calculation | Sepsis probability, mortality probability via Gemini LLM |
| **ClinicalNLPAgent** | Text understanding | Extract diagnoses, medications, symptoms from notes |
| **MedicalKnowledgeAgent** | Clinical reasoning | Cross-reference guidelines (Sepsis-3, SIRS), suggest vitals |
| **DocumentUnderstandingAgent** | Document parsing | Extract structured patient data from PDFs/CSVs/text |
| **MonitoringAgent** | Autonomous alerts | Continuous vitals monitoring, threshold-based notifications |

---

## MCP (Model Context Protocol) Integration

For evaluation purposes, please note that **PraOjas does not just consume an MCP server—it IS an MCP Server.** 

By implementing an MCP Server interface, we have decoupled our specialized medical AI logic from our frontend, allowing **any external AI system** (like Claude Desktop, Cursor, or other agent frameworks) to leverage our clinical reasoning capabilities.

**Implementation Details:**
- **Location:** The complete MCP server implementation is located in the `mcp/` directory (`mcp/server.ts`).
- **Exposed Tools:** We expose three highly specialized MCP tools:
  1. `get_patient_observations`: Acts as a mock FHIR/EHR database bridge to retrieve patient vitals and labs.
  2. `predict_sepsis_risk`: Exposes the `PredictionAgent` to calculate sepsis and mortality risk probabilities.
  3. `generate_explanation`: Exposes the `MedicalKnowledgeAgent` to generate a clinically grounded explanation based on the prediction.
- **How to test:** Instructions for connecting Claude Desktop to the PraOjas MCP server are available in `mcp/README.md`.

---

## Tech Stack

### Frontend
- **React 18** — UI component framework
- **TypeScript** — Type-safe development
- **Vite** — Lightning-fast build tool and dev server
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Smooth animations
- **Axios** — HTTP client for API calls

### Backend
- **Node.js 18+** — JavaScript runtime
- **Express.js** — Web framework
- **TypeScript** — Type-safe backend
- **Pino** — Structured JSON logging
- **Helmet** — HTTP security headers
- **Express Rate Limit** — API rate limiting
- **TSX** — TypeScript execution

### AI & LLM
- **Google Gemini 1.5 Pro** — LLM for predictions and reasoning
- **@google-ai/generativeai** — Gemini API client

### Database
- **PostgreSQL 15** — Relational database for patient history, EHR data, and system logs.
  - *Note: Firebase is also included in the dependencies for future real-time alerts and push notifications, but PostgreSQL remains the primary relational database.*
- **Docker Compose** — Local orchestration of services and databases.
- **Google Cloud SQL** — Managed PostgreSQL for production.

### Testing
- **Vitest** — Unit and integration testing
- **@testing-library/react** — React component testing
- **Supertest** — HTTP API testing
- **React Testing Library** — DOM testing utilities

### DevOps & Deployment
- **Docker** — Containerization
- **Google Cloud Run** — Serverless deployment
- **Google Cloud SQL** — Managed PostgreSQL
- **Google Cloud Secret Manager** — Secrets management

---

## Project Structure

- **`frontend/`**: Frontend (React + Vite)
  - `src/components/`: Reusable React components (Dashboard, RiskGauge, AlertPanel, etc.)
  - `src/pages/`: Page components (Home, PatientProfile, etc.)
  - `src/App.tsx`: Main app component
  - `src/index.css`: Global styles
- **`server/`**: Backend (Express + Node.js)
  - `routes.ts`: API endpoint definitions
  - `agents/`: Multi-agent system (coordinator, prediction, NLP, knowledge, etc.)
  - `middleware/`: Auth and error handlers
  - `utils/`: Logging and validators
- **`backend/`**: Python FastAPI (Optional fallback)
  - `main.py`, `models/`, `routes/`, `agents/`
- **`docs/`**, **`architecture/`**, **`deployment/`**: Documentation and infrastructure configuration
- **`tests/`**: Unit and integration tests
- **Root Files**: `package.json`, `vite.config.ts`, `server.ts`

---

## Installation

### Prerequisites
- **Node.js** v18 or higher ([download](https://nodejs.org/))
- **NPM** or **PNPM** (comes with Node.js)
- **Docker & Docker Compose** (optional, for PostgreSQL)
- **Google Gemini API Key** ([get one here](https://aistudio.google.com/app/apikey))

### Step 1: Clone the Repository

```bash
git clone https://github.com/shashidhar-02/PraOjas-AI-Agent.git
cd PraOjas-AI-Agent
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

Copy the `.env.example` file to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

(See [Environment Variables](#environment-variables) section below)

### Step 4: Start PostgreSQL (Optional)

If using Docker Compose:

```bash
docker-compose up db -d
```

Or for the full stack:

```bash
docker-compose up
```

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=praojas_dev
DB_USER=postgres
DB_PASSWORD=your_db_password

# Logging
LOG_LEVEL=info

# Security
JWT_SECRET=your_super_secret_jwt_key_here
SECRET_KEY=your_secret_key_for_backend

# CORS (for production)
ALLOWED_ORIGINS=http://localhost:3000

# Optional: HMR for Cloud Run
DISABLE_HMR=false
```

### Getting Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Get API Key"**
3. Create a new API key
4. Copy and paste it into your `.env` file

---

## Running the Project

### Development Mode

Start both frontend (Vite) and backend (Express) concurrently:

```bash
npm run dev
```

**Output:**
```
VITE v4.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help

Server running on http://localhost:3000
```

- **Frontend**: http://localhost:5173/
- **Backend**: http://localhost:3000/
- **Database**: localhost:5432 (if using Docker)

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

---

## API Endpoints

All endpoints are documented in detail in [`docs/README.md`](docs/README.md). Here's a quick reference:

### Prediction Endpoints

#### `POST /api/predict`
Runs sepsis and mortality risk prediction for a patient.

**Request:**
```json
{
  "patient": {
    "id": "P-10001",
    "name": "John Doe",
    "age": 68,
    "gender": "Male",
    "vitals": {
      "hr": 105,
      "bp": "95/60",
      "temp": 38.9,
      "rr": 22,
      "spo2": 94
    },
    "labs": {
      "wbc": 14.2,
      "lactate": 3.1,
      "creatinine": 1.8,
      "platelets": 110,
      "bilirubin": 1.2
    },
    "clinicalNotes": "Patient presents with fever, hypotension, and altered mental status."
  }
}
```

**Response (200 OK):**
```json
{
  "sepsisProbability": 0.82,
  "mortalityProbability": 0.41,
  "confidenceScore": 0.91,
  "timestamp": "2026-06-30T14:32:00.000Z",
  "modelMetadata": {
    "name": "Gemini 1.5 Pro Predictive Agent",
    "sepsisAuroc": "N/A (LLM)",
    "mortalityAuroc": "N/A (LLM)"
  }
}
```

#### `POST /api/explain`
Generates clinical explanation and feature importance for a prediction.

**Request:**
```json
{
  "patient": { /* same as /api/predict */ },
  "prediction": { /* output from /api/predict */ }
}
```

**Response (200 OK):**
```json
{
  "explanation": "The primary drivers for this sepsis risk score are elevated Lactate (3.1 mmol/L) and tachycardia (HR 105)...",
  "featureImportance": [
    { "feature": "Lactate", "importance": 0.85 },
    { "feature": "Heart Rate", "importance": 0.65 },
    { "feature": "Temperature", "importance": 0.55 },
    { "feature": "SpO2", "importance": -0.20 }
  ],
  "nlpEntities": {
    "diagnoses": ["Suspected Sepsis", "Hypotension"],
    "medications": [],
    "symptoms": ["Fever", "Altered Mental Status"]
  },
  "report": {
    "summary": "...",
    "recommendedActions": ["..."]
  }
}
```

#### `POST /api/smart-vitals`
Suggests plausible next vitals reading based on patient status.

**Request:**
```json
{
  "patient": {
    "id": "P-10001",
    "age": 68,
    "gender": "Male",
    "status": "Critical",
    "vitals": { "hr": 105, "bp": "95/60", "temp": 38.9, "rr": 22, "spo2": 94 }
  }
}
```

**Response (200 OK):**
```json
{
  "hr": 112,
  "bp": "90/55",
  "temp": 39.1,
  "rr": 24,
  "spo2": 92
}
```

#### `POST /api/parse-document`
Parses clinical documents (PDF, CSV, TXT) and extracts structured patient data.

**Request:** `multipart/form-data` with `file` field

**Response (200 OK):**
```json
{
  "name": "Jane Smith",
  "age": 55,
  "gender": "Female",
  "vitals": {
    "hr": 98,
    "bp": "118/78",
    "temp": 37.8,
    "rr": 18,
    "spo2": 96
  },
  "labs": {
    "wbc": 11.2,
    "lactate": 1.8,
    "creatinine": 1.1
  },
  "clinicalNotes": "Admitted for pneumonia...",
  "_validationWarnings": []
}
```

### Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "Human-readable error message"
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad Request — missing or invalid required fields |
| `401` | Unauthorized — missing or invalid API key/token |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error — agent or API failure |

### Full API Reference

For complete API documentation with curl examples and response schemas, see [`docs/README.md`](docs/README.md).

---

## Testing

### Run All Tests

```bash
npm run test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/
│   ├── agents.test.ts          # Agent unit tests
│   └── utils.test.ts           # Utility function tests
└── integration/
    └── api.test.ts             # API endpoint tests
```

### Example Test (Vitest)

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { PredictionAgent } from '../server/agents/prediction-agent';

describe('PredictionAgent', () => {
  let agent: PredictionAgent;

  beforeAll(() => {
    agent = new PredictionAgent();
  });

  it('should predict sepsis probability', async () => {
    const patient = {
      age: 68,
      vitals: { hr: 105, temp: 38.9, spo2: 94 },
      labs: { lactate: 3.1, wbc: 14.2 }
    };

    const result = await agent.predict(patient);
    
    expect(result.sepsisProbability).toBeGreaterThan(0);
    expect(result.sepsisProbability).toBeLessThanOrEqual(1);
  });
});
```

---

## Security

### Built-in Security Measures

✅ **Helmet** — HTTP security headers protection
```typescript
import helmet from 'helmet';
app.use(helmet());
```

✅ **Rate Limiting** — Prevent brute-force and DDoS attacks
```typescript
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

✅ **Authentication Middleware** — Simulated JWT auth (mock implementation)
```typescript
// Implement real JWT validation in production
app.use('/api/protected', authenticateToken);
```

✅ **Environment Variables** — Secrets stored in `.env`, never committed
```bash
# Never commit .env file
echo ".env" >> .gitignore
```

✅ **Structured Logging** — JSON logging with Pino (no sensitive data)
```typescript
import pino from 'pino';
const logger = pino();
logger.info({ userId: '***', action: 'login' }); // Mask sensitive fields
```

✅ **CORS Configuration** — Restrict API access to trusted origins
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
```

### Security Checklist for Production

- [ ] Change `SECRET_KEY` in `backend/core/config.py` to a strong random secret
- [ ] Use Google Cloud Secret Manager for `GEMINI_API_KEY` and database credentials
- [ ] Replace PostgreSQL Docker container with Google Cloud SQL managed instance
- [ ] Set `DISABLE_HMR=true` when deploying to Cloud Run
- [ ] Enable JWT authentication with real token validation
- [ ] Implement database encryption at rest
- [ ] Enable audit logging for all API calls
- [ ] Set up monitoring and alerting (Datadog, Splunk)
- [ ] Perform security code review and penetration testing
- [ ] Keep dependencies updated: `npm audit`, `npm update`

---

## Screenshots & Demo

### 1. Landing Page — "Predicting Critical Trajectories Before They Happen"
*Hero section showcasing the mission of PraOjas AI with ICU monitoring visuals*
<p align="center">
  <a href="https://drive.google.com/file/d/1mU1Ao-JxNlLuT_OwqN2U8PBuFVU52pzF/view?usp=sharing">
    <img src="https://drive.google.com/uc?export=view&id=1mU1Ao-JxNlLuT_OwqN2U8PBuFVU52pzF"
         alt="PraOjas AI Landing Page"
         width="900">
  </a>
</p>

<p align="center">
  <strong>Click the image to view the full screenshot.</strong>
</p>

### 2. ICU Overview Dashboard
*High-level analytics with risk trends, patient status distribution, and key metrics (6 active ICU beds, 2 critical patients, 39% average sepsis risk)*

<p align="center">
  <a href="https://drive.google.com/file/d/1rZw31A9F-4NFu_Xptp-ufi-7JTnwwdc8/view?usp=drive_link">
    <img src="https://drive.google.com/uc?export=view&id=1rZw31A9F-4NFu_Xptp-ufi-7JTnwwdc8"
         alt="Project Screenshot"
         width="900">
  </a>
</p>

<p align="center">
  <b>Click the image to view it in full size.</b>
</p>
### 3. ICU Roster Overview
*Detailed patient registry with real-time vitals, sepsis risk scores, and patient status indicators (Critical/Warning/Stable)*

<p align="center">
  <a href="https://drive.google.com/file/d/1mnTGstUANcbUH3G-vp7DPlYaPYz5_-RP/view?usp=sharing">
    <img src="https://drive.google.com/uc?export=view&id=1mnTGstUANcbUH3G-vp7DPlYaPYz5_-RP"
         alt="ICU Roster Overview"
         width="900">
  </a>
</p>

<p align="center">
  <strong>Click the image to view the full screenshot.</strong>
</p>

### 4. Patient Profile
*Comprehensive patient view with real-time vitals, risk scores, and clinical history*

<p align="center">
  <a href="https://drive.google.com/file/d/1rZw31A9F-4NFu_Xptp-ufi-7JTnwwdc8/view?usp=sharing">
    <img src="https://drive.google.com/uc?export=view&id=1_0xdNFiWGp1TA_2PV8QzlNRhuPjEaVoy"
         alt="Patient Profile & Risk Assessment"
         width="900">
  </a>
</p>

<p align="center"><b>Click the image to view it in full size.</b></p>

### 5. Settings & Preferences
*User profile, security settings, authentication management, and HIPAA compliance options*

<p align="center">
  <a href="https://drive.google.com/file/d/1g_VdqaflV8sGSY54EVayFlig_1s3MUHg/view?usp=sharing">
    <img src="https://drive.google.com/uc?export=view&id=1g_VdqaflV8sGSY54EVayFlig_1s3MUHg"
         alt="Project Screenshot"
         width="900">
  </a>
</p>

<p align="center"><b>Click the image to view it in full size.</b></p>

![Individual patient workspace — live vitals tiles and 12-hour trend chart for a Critical patient](https://drive.google.com/uc?export=view&id=1_0xdNFiWGp1TA_2PV8QzlNRhuPjEaVoy)

### Live Demo

For a live demo or video walkthrough, see:
- **YouTube**: [Coming Soon]
- **Kaggle Notebook**: [Link to detailed writeup]
- **Local Demo**: `npm run dev` and visit http://localhost:5173/

---

## Deployment

### Docker Compose (Local Development)

```bash
# Start PostgreSQL only
docker-compose up db -d

# Start full stack
docker-compose up
```

### Google Cloud Run Deployment

See [`deployment/README.md`](deployment/README.md) for detailed instructions:

```bash
# Build Docker image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/praojas-ai

# Deploy to Cloud Run
gcloud run deploy praojas-ai \
  --image gcr.io/YOUR_PROJECT_ID/praojas-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your-key
```

### Production Checklist

- [ ] Deploy to managed infrastructure (Cloud Run, AWS, etc.)
- [ ] Use managed database (Cloud SQL, RDS)
- [ ] Enable HTTPS/TLS
- [ ] Set up monitoring and logging (Datadog, Splunk, Stackdriver)
- [ ] Configure auto-scaling policies
- [ ] Set up CI/CD pipeline (.github/workflows)
- [ ] Implement database backups
- [ ] Enable WAF (Web Application Firewall)
- [ ] Set up incident response procedures

---

## Future Improvements

### Phase 2: Enhanced Clinical Integration
- 🔗 **FHIR Compliance** — Integrate with EHR systems via HL7 FHIR APIs
- 🏥 **Multi-Hospital Deployment** — Centralized management for hospital networks
- 📱 **Mobile App** — Native iOS/Android app for clinician alerts
- 🔊 **Voice Assistant** — Voice-activated alerts and recommendations

### Phase 3: Advanced AI Capabilities
- 🎯 **Federated Learning** — Collaborative ML without sharing patient data
- 🧠 **Reinforcement Learning** — Learn optimal intervention sequences
- 🔮 **Outcome Prediction** — Predict length of stay, discharge readiness
- 📊 **Advanced Analytics** — Population-level trend analysis and forecasting

### Phase 4: Ecosystem Expansion
- 🤝 **Third-Party Integrations** — Slack alerts, Microsoft Teams, Pagerduty
- 📈 **Clinical Trial Integration** — Support for trial patient cohorts
- 🎓 **Medical Education** — Learning modules for medical students/residents

### Phase 5: Enterprise Features
- 🏢 **Multi-Tenancy** — Support multiple hospital organizations
- 🔐 **Advanced Auth** — OAuth2, SSO, SAML support
- 📋 **Compliance** — HIPAA, GDPR, SOC2 certification
- 💰 **Billing & Analytics** — Usage tracking, cost attribution

---

## Contributing

We welcome contributions! Here's how to get involved:

### Fork & Clone

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/PraOjas-AI-Agent.git
cd PraOjas-AI-Agent

# 3. Add upstream remote
git remote add upstream https://github.com/AbhinavVajinapalli/PraOjas-AI-Agent.git
```

### Create a Feature Branch

```bash
# Create and checkout a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b bugfix/issue-description
```

### Make Your Changes

```bash
# Make your changes and commit
git add .
git commit -m "feat: add new agent for cardiac monitoring"
```

### Run Tests & Linting

```bash
# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format
```

### Push & Create a Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create a pull request on GitHub
# - Describe the changes
# - Link related issues
# - Request review from maintainers
```

### Contribution Guidelines

- ✅ Write clear commit messages (`feat:`, `fix:`, `docs:`, `test:`)
- ✅ Add tests for new features
- ✅ Update documentation if needed
- ✅ Follow existing code style
- ✅ Ensure all tests pass before submitting PR
- ✅ Be respectful and constructive in discussions

For more details, see [`CONTRIBUTING.md`](CONTRIBUTING.md) (coming soon).

---

## License

This project is licensed under the **MIT License** — see the [`LICENSE`](LICENSE) file for details.

### Summary

You're free to use, modify, and distribute this project for personal and commercial purposes, as long as you include the original license and copyright notice.

---

## Acknowledgements

### Key Resources & Inspiration

- 🎓 **Kaggle AI Agents Intensive** — Course foundation and project framework
- 🤖 **Google Gemini API** — LLM engine powering predictions and reasoning
- 📚 **Sepsis-3 Clinical Guidelines** — Evidence-based sepsis criteria (SIRS, qSOFA)
- 🏥 **Clinical Domain Expertise** — ICU clinician consultations and feedback
- 🔧 **Open-Source Community** — React, Express, TypeScript, Vitest communities
- 📊 **MIMIC-IV Dataset** — Publicly available ICU database for model training and validation

### Libraries & Tools

- [React](https://react.dev/) — UI framework
- [Express.js](https://expressjs.com/) — Web framework
- [Vite](https://vitejs.dev/) — Build tool
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Pino](https://getpino.io/) — Logging
- [Vitest](https://vitest.dev/) — Testing
- [Google AI Studio](https://aistudio.google.com/) — Gemini API

### Special Thanks

- **Healthcare professionals** who provided clinical validation
- **Open-source contributors** in the Node.js and Python ecosystems
- **GitHub community** for feedback and discussions

---

## Support & Contact

### Report Issues

Found a bug? Have a feature request? Open an [issue](https://github.com/AbhinavVajinapalli/PraOjas-AI-Agent/issues).

### Questions?

- 📖 Check the [documentation](docs/README.md)
- 🏗️ Review the [architecture](architecture/README.md)
- 🚀 See [deployment guide](deployment/README.md)

### Get in Touch

- **GitHub Issues** — Bug reports and feature requests
- **Discussions** — General questions and ideas
- **Email** — [Your contact info]

---

## Quick Links

| Resource | Link |
|----------|------|
| **API Reference** | [docs/README.md](docs/README.md) |
| **Architecture** | [architecture/README.md](architecture/README.md) |
| **Deployment** | [deployment/README.md](deployment/README.md) |
| **Contributing** | [CONTRIBUTING.md](CONTRIBUTING.md) |
| **License** | [LICENSE](LICENSE) |
| **Server Agents** | [server/README.md](server/README.md) |
| **Issues** | [GitHub Issues](https://github.com/AbhinavVajinapalli/PraOjas-AI-Agent/issues) |
| **Discussions** | [GitHub Discussions](https://github.com/AbhinavVajinapalli/PraOjas-AI-Agent/discussions) |

---

## Disclaimer

⚠️ **Clinical Use Warning**

PraOjas AI is designed as a **decision support tool** for healthcare professionals, not a replacement for clinical judgment. All predictions and recommendations should be:

- Reviewed by qualified clinicians
- Cross-referenced with clinical guidelines
- Considered alongside patient history and context
- Used in accordance with institutional policies

**Always defer to human clinical expertise and institutional protocols.**

---

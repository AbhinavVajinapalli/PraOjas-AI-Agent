# Contributing to PraOjas AI

Thank you for your interest in contributing to PraOjas AI — a multi-agent clinical decision support system! This guide will help you get set up quickly and submit high-quality contributions.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

---

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this standard.

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Git**
- A **Google Gemini API key** (get one free at [Google AI Studio](https://aistudio.google.com/app/apikey))
- Optionally: **Docker** and **Python 3.10+** for the full stack

### Clone the Repository

```bash
git clone https://github.com/AbhinavVajinapalli/PraOjas-AI-Agent.git
cd PraOjas-AI-Agent
```

---

## Development Setup

### 1. Install Node.js Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your `GEMINI_API_KEY`. All other values are optional for local development.

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

### 4. (Optional) Start the Python/FastAPI Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 5. (Optional) Start PostgreSQL with Docker

```bash
docker-compose up -d
```

---

## Project Structure

```
PraOjas-AI-Agent/
├── src/                  # React frontend (components, pages, hooks)
├── server/               # Express.js backend + agents
│   ├── agents/           # Multi-agent system (Coordinator, Prediction, NLP, etc.)
│   ├── middleware/       # Auth, error handling middleware
│   ├── routes.ts         # API route definitions
│   └── utils/            # Logger, validators
├── backend/              # Optional Python/FastAPI backend
├── tests/                # Agent and API integration tests
├── docs/                 # Architecture diagrams and API reference
└── scripts/              # Utility scripts
```

---

## Running Tests

### TypeScript/Node.js Tests

```bash
npm run test
```

Tests use **Vitest** + **Supertest**. Test files are co-located in `src/`, `server/`, and `tests/`.

### Python Tests

```bash
cd backend
pip install -r tests/requirements-test.txt
pytest tests/
```

### Type Checking (No Emit)

```bash
npm run lint
```

---

## Submitting a Pull Request

1. **Fork** the repository and create a feature branch:

   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes** with clear, well-commented code.

3. **Add or update tests** for any changed functionality.

4. **Run the test suite** to ensure everything passes:

   ```bash
   npm run test
   npm run lint
   ```

5. **Commit** with a descriptive message following [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   git commit -m "feat(agents): add TriageAgent for emergency prioritization"
   ```

6. **Push** and open a Pull Request against the `main` branch.

7. Fill in the PR template and describe:
   - What the change does
   - Why it is needed
   - How it was tested

---

## Coding Standards

- **TypeScript** for all Node.js/React code. No `any` types unless strictly necessary.
- **ESLint** and **Prettier** rules must pass (`npm run lint`).
- All agent files must include a JSDoc comment block describing:
  - **Purpose** — what the agent does
  - **Inputs** — what data it receives
  - **Outputs** — what data it returns
  - **Gemini usage** — which model and tool calling strategy is used
- Use **Pino** for structured logging (not `console.log`) in server-side code.
- Follow the existing pattern in `server/agents/` when adding new agents.

---

## Reporting Bugs

Please [open a GitHub Issue](https://github.com/AbhinavVajinapalli/PraOjas-AI-Agent/issues/new) and include:

- A clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Node.js version, OS, and browser (if a UI issue)
- Any relevant log output

---

## Feature Requests

We welcome feature ideas! Open a GitHub Issue with the label **`enhancement`** and describe:

- The use case or clinical scenario
- Why this adds value to ICU decision support
- Any relevant research or references

---

Thank you for helping make PraOjas AI better for clinicians everywhere! 🏥

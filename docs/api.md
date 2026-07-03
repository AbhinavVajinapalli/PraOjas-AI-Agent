# Docs — API Reference & Project Documentation

This directory contains API specifications and project documentation for PraOjas AI.

---

## REST API Reference

Base URL (local dev): `http://localhost:3000`

All endpoints accept and return `application/json` unless otherwise noted.

---

### `POST /api/predict`

Runs a sepsis and mortality risk prediction for a patient.

**Delegates to:** `CoordinatorAgent` → `PredictionAgent` (Gemini)

**Request Body:**
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

---

### `POST /api/explain`

Generates a clinical explanation (mimicking SHAP feature importance) and a report for a given prediction.

**Delegates to:** `CoordinatorAgent` → `ClinicalNLPAgent` → `MedicalKnowledgeAgent` → `ClinicalReportAgent`

**Request Body:**
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

---

### `POST /api/smart-vitals`

Suggests the next plausible vitals reading based on the patient's current status and physiological trend.

**Delegates to:** `CoordinatorAgent` → `MedicalKnowledgeAgent`

**Request Body:**
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

---

### `POST /api/parse-document`

Parses an uploaded PDF, CSV, or plain-text clinical document and extracts structured patient data.

**Content-Type:** `multipart/form-data`

**Request:** Form field `file` — the document file (PDF, TXT, CSV)

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

---

## Error Responses

All endpoints return standardized error JSON on failure:

```json
{
  "error": "Human-readable error message"
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad Request — missing required fields |
| `500` | Internal Server Error — agent or API failure |

---

## Python API (FastAPI — `backend/`)

The optional Python/FastAPI backend exposes additional endpoints at `http://localhost:8000`.
See [`../backend/README.md`](../backend/README.md) for the full Python API reference.
Interactive Swagger docs: `http://localhost:8000/docs`

---

## Additional Documentation

- [Architecture Diagrams](../architecture/)
- [Server Agents](../server/README.md)
- [Deployment Guide](../deployment/README.md)
- [MCP Servers](../mcp/README.md)

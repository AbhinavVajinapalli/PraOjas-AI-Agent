# Security Policy

## Overview

The PraOjas AI project takes security seriously. This document outlines our security practices, how secrets are handled, and how to responsibly disclose vulnerabilities.

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ Yes    |
| < 1.0   | ❌ No     |

---

## Security Practices

### 1. No Secrets Committed

**This repository contains NO API keys, passwords, or secrets.**

All sensitive credentials are managed through environment variables:

- **`.env`** — Never committed to version control (listed in `.gitignore`)
- **`.env.example`** — A safe template with placeholder values only

If you accidentally commit a secret, immediately:
1. Revoke the key/token at its source (e.g., Google AI Studio)
2. Force-push to remove it from history: `git filter-branch` or [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
3. Generate a new key and store it only in `.env`

---

### 2. Environment Variables

Required secrets for running this application:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Yes |
| `SQL_PASSWORD` | PostgreSQL password | Only with DB |
| `SQL_ADMIN_PASSWORD` | PostgreSQL admin password | Only with DB |

See [`.env.example`](.env.example) for the full list and instructions.

**In production**, use a secrets manager instead of `.env` files:
- [Google Cloud Secret Manager](https://cloud.google.com/secret-manager)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [HashiCorp Vault](https://www.vaultproject.io/)

---

### 3. HTTP Security Headers (Helmet)

The Express.js server uses [Helmet](https://helmetjs.github.io/) to set security-related HTTP headers:

```typescript
app.use(helmet({ contentSecurityPolicy: false }));
```

This sets headers such as `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, and more.

---

### 4. Rate Limiting

All API endpoints are protected by rate limiting via [express-rate-limit](https://www.npmjs.com/package/express-rate-limit):

```typescript
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.'
}));
```

This protects the Gemini API quota and prevents denial-of-service attacks.

---

### 5. Authentication

API endpoints use middleware-based authentication (`server/middleware/auth.ts`). The current implementation simulates JWT validation for demonstration purposes.

In a production deployment, replace the stub with a real JWT verification library:

```typescript
// Production-grade auth (replace the stub with):
import jwt from 'jsonwebtoken';
const token = authHeader.split(' ')[1];
jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => { ... });
```

---

### 6. Input Validation

All patient data submitted to API endpoints is validated before being passed to AI agents:

- `ValidationAgent` checks that required vitals fields are present and within physiological ranges
- Malformed or incomplete requests return `400 Bad Request` before reaching the AI layer

---

### 7. File Upload Security

The `/api/parse-document` endpoint accepts file uploads via `multer` with `memoryStorage()`. Files are:

- **Never written to disk** — processed entirely in memory
- Limited to PDF and text formats (validated by MIME type)
- Not persisted after the request completes

---

### 8. Dependency Security

Known vulnerabilities in dependencies are tracked via `npm audit`. Run:

```bash
npm audit
npm audit fix
```

before any production deployment.

---

## Responsible Disclosure

If you discover a security vulnerability in PraOjas AI, please **do not** open a public GitHub issue. Instead:

1. **Email the maintainers** at the address listed in the repository's profile, or
2. **Open a private security advisory** on GitHub via the [Security tab](https://github.com/AbhinavVajinapalli/PraOjas-AI-Agent/security/advisories/new).

Please include:
- A description of the vulnerability
- Steps to reproduce it
- Potential impact
- Any suggested remediation

We will acknowledge your report within **48 hours** and aim to release a fix within **7 days** for critical issues.

---

## Clinical Disclaimer

PraOjas AI is a **research and demonstration project** built for educational purposes (Kaggle Capstone). It is **NOT** intended for use in real clinical environments or to replace qualified medical judgment. All predictions are AI-generated and must be reviewed by licensed healthcare professionals before any clinical decisions are made.

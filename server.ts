import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import multer from 'multer';
import { CoordinatorAgent } from './server/agents/CoordinatorAgent';
import { MonitoringAgent, PatientAlert } from './server/agents/MonitoringAgent';
import { isDbConfigured } from './server/db';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './server/utils/logger';
import { createRouter } from './server/routes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const upload = multer({ storage: multer.memoryStorage() });

// ── Security & Middleware ──────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
} else {
  // Keep CSP enabled in development while allowing tooling compatibility (e.g., Vite HMR)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
        },
      },
    })
  );
}
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
}));

app.use(express.json());

// ── Startup Diagnostics ────────────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY) {
  logger.warn('⚠️ GEMINI_API_KEY is not set. AI agents will fail.');
} else {
  logger.info('✅ GEMINI_API_KEY is configured.');
}

if (!isDbConfigured()) {
  logger.warn('⚠️ Database not configured. Using in-memory agent memory.');
} else {
  logger.info('✅ Database configured. Persistent memory enabled.');
}

// ── Init Agents ────────────────────────────────────────────────────────────
const coordinatorAgent = new CoordinatorAgent(process.env.GEMINI_API_KEY || '');
const monitoringAgent = new MonitoringAgent(process.env.GEMINI_API_KEY || '');

// ── SSE Alert Subscribers ──────────────────────────────────────────────────
// Each connected browser client is stored here for SSE push
const sseClients: Set<express.Response> = new Set();

// When monitoring agent fires an alert, push it to all connected SSE clients
monitoringAgent.subscribe((alert: PatientAlert) => {
  const data = `data: ${JSON.stringify(alert)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(data);
    } catch {
      sseClients.delete(client);
    }
  });
});

// ── Start Autonomous Monitoring ────────────────────────────────────────────
monitoringAgent.start();

// ── API Routes ─────────────────────────────────────────────────────────────
const apiRouter = createRouter(coordinatorAgent, monitoringAgent, sseClients);
app.use('/api', apiRouter);

// ── Server Startup ─────────────────────────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: path.resolve(process.cwd(), 'frontend'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, _res) => {
      _res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 PraOjas AI is running at http://localhost:${PORT}`);
    logger.info(`   Autonomous Monitoring Agent: ACTIVE (60s interval)`);
    logger.info(`   SSE Alerts endpoint: http://localhost:${PORT}/api/alerts/stream`);
  });
}

startServer().catch((err) => {
  logger.error(err, 'Fatal startup error');
  process.exit(1);
});

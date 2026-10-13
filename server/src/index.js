import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { runCommand } from './commands.js';
import { listEnquiries } from './enquiry.js';
import { aiConfigured } from './ai.js';
import { SCOPE } from './policy.js';
import { HttpError } from './errors.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = express();
if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ['https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameSrc: ["'self'", 'about:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null,
    },
  },
}));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1.5mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, aiConfigured: aiConfigured() }));
app.get('/api/scope', (_req, res) => res.json(SCOPE));

// The single entry point for everything the client asks the server to do.
app.post('/api/command', async (req, res, next) => {
  try {
    const { command, payload } = req.body || {};
    res.json(await runCommand(command, payload, req.ip));
  } catch (err) { next(err); }
});

app.get('/api/admin/enquiries', async (req, res, next) => {
  try {
    const token = process.env.ADMIN_TOKEN;
    if (!token) return res.status(404).json({ error: { code: 'not_found', message: 'Not found.' } });
    const given = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const a = Buffer.from(given), b = Buffer.from(token);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ error: { code: 'unauthorized', message: 'Invalid token.' } });
    }
    res.json({ enquiries: await listEnquiries() });
  } catch (err) { next(err); }
});

app.use('/api', (_req, res) => res.status(404).json({ error: { code: 'not_found', message: 'Not found.' } }));

// Serve the built React app in production.
const dist = path.join(here, '..', '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) {
    if (err.retryAfter) res.set('Retry-After', String(err.retryAfter));
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'invalid_json', message: 'The request was not valid JSON.' } });
  }
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'too_large', message: 'The request is too large.' } });
  }
  console.error('[server]', err);
  res.status(500).json({ error: { code: 'server_error', message: 'Something went wrong on our side. Please try again.' } });
});

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`TheBytely server running on http://localhost:${port}`);
  console.log(
    aiConfigured()
      ? 'AI: Gemini connected'
      : 'AI: no GEMINI_API_KEY set, using built-in templates'
  );
});


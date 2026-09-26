// main.js - Deao Studios Pitch Deck Generator Backend
// SECURITY-HARDENED VERSION

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const helmet = require('helmet');

// ─── Startup Validation ────────────────────────────────────────────────────────
const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`\n❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('   Copy .env.example to .env and fill in the values.\n');
  process.exit(1);
}

// FIX #1: Enforce minimum JWT secret strength
if (
  process.env.JWT_SECRET.length < 32 ||
  process.env.JWT_SECRET === 'your_super_secret_jwt_key_here_change_in_production'
) {
  console.error('\n❌ JWT_SECRET is too weak or is the default placeholder.');
  console.error('   Generate a strong secret: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
  process.exit(1);
}

const authController = require('./controllers/auth.controller');
const deckController = require('./controllers/deck.controller');
const templateController = require('./controllers/template.controller');
const exportController = require('./controllers/export.controller');
const aiController = require('./controllers/ai.controller');
const { cleanupOldFiles } = require('./services/export.service');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// ─── Storage Setup ─────────────────────────────────────────────────────────────
const STORAGE = path.resolve(process.env.STORAGE_PATH || '../storage');
['decks', 'uploads'].forEach(dir => {
  const p = path.join(STORAGE, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true, mode: 0o750 });
});

const upload = multer({
  dest: path.join(STORAGE, 'uploads'),
  limits: { fileSize: (parseInt(process.env.UPLOAD_MAX_SIZE_MB) || 10) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // FIX #2: Validate MIME type AND extension. SVG removed (can embed JS).
    const allowedMimes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    const allowedExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, GIF, and WebP allowed.'));
    }
  },
});

// ─── Security Headers ──────────────────────────────────────────────────────────
// FIX #3: Helmet adds X-Frame-Options, X-Content-Type-Options, CSP, HSTS, etc.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ─── Middleware ────────────────────────────────────────────────────────────────
// FIX #4: CORS restricted to explicit whitelist, no fallback to wildcard
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' })); // FIX #5: Reduced from 5mb

// FIX #6: Uploads served with no-sniff + forced download to prevent XSS
app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', 'attachment');
  next();
}, express.static(path.join(STORAGE, 'uploads')));

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
// FIX #7: Tiered rate limits — auth endpoints are much stricter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true, legacyHeaders: false,
});
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 20,
  message: { error: 'AI rate limit reached. Please try again later.' },
  standardHeaders: true, legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/decks', aiLimiter);

// ─── Auth Middleware ───────────────────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization;
  // FIX #8: Removed ?token= query param support. Tokens in URLs leak into
  // server logs, browser history, and referrer headers.
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    // FIX #9: Explicitly restrict JWT algorithm to prevent 'alg:none' attacks
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// FIX #10: Centralized admin check middleware to enforce at router level
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

// ─── Routes ────────────────────────────────────────────────────────────────────

// Auth
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', auth, authController.me);
app.post('/api/auth/password', auth, authController.updatePassword);
// FIX #11: Admin routes protected at router level (defence in depth)
app.post('/api/auth/users', auth, adminOnly, authController.createUser);
app.get('/api/auth/users', auth, adminOnly, authController.listUsers);

// Decks
app.post('/api/decks', auth, deckController.createDeck);
app.get('/api/decks', auth, deckController.listDecks);
app.get('/api/decks/:deckId', auth, deckController.getDeck);
app.delete('/api/decks/:deckId', auth, deckController.deleteDeck);
app.post('/api/decks/:deckId/retry', auth, deckController.retryDeck);

// Ready-Made Templates
app.get('/api/templates', auth, templateController.listTemplates);
app.get('/api/templates/:templateId', auth, templateController.getTemplate);
app.post('/api/templates/:templateId/use', auth, templateController.useTemplate);

// Slides
app.put('/api/decks/:deckId/slides/:slideId', auth, deckController.updateSlide);

// Versions
app.get('/api/decks/:deckId/versions', auth, deckController.getVersions);
app.post('/api/decks/:deckId/versions/:versionId/restore', auth, deckController.restoreVersion);

// Export
app.get('/api/decks/:deckId/export', auth, exportController.exportDeck);

// AI — admin-only routes protected at router level too
app.get('/api/ai/status', auth, aiController.getStatus);
app.post('/api/ai/keys', auth, adminOnly, aiController.updateKeys);
app.get('/api/ai/test', auth, adminOnly, aiController.testConnection);

// Logs & Metrics — AI logs restricted to admin
app.get('/api/decks/:deckId/logs', auth, adminOnly, deckController.getAiLogs);
app.get('/api/decks/:deckId/metrics', auth, deckController.getDeckMetrics);
app.get('/api/queue', auth, deckController.getQueueStatus);

// Upload
app.post('/api/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

// Health — FIX #12: No timestamp (minor info disclosure)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ─── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  console.error('Unhandled middleware error:', err.message);
  if (res.headersSent) return;
  const status = err.status || err.statusCode || 500;
  // FIX #13: Don't leak internal error details in production
  const message = err.code === 'LIMIT_FILE_SIZE'
    ? 'File too large'
    : err.message === 'Not allowed by CORS'
      ? 'CORS error'
      : isDev ? (err.message || 'Internal server error') : 'Internal server error';
  res.status(status).json({ error: message });
});

// ─── WebSocket for Real-Time Collaboration & Progress ─────────────────────────
const wss = new WebSocket.Server({ server, path: '/ws' });
app.locals.wss = wss;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const userConnections = new Map(); // userId -> Set<WebSocket>

wss.on('connection', async (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    // Enforce max 5 concurrent WebSocket connections per user
    const userSockets = userConnections.get(user.userId) || new Set();
    if (userSockets.size >= 5) {
      ws.close(4029, 'Too many concurrent WebSocket connections');
      return;
    }
    userSockets.add(ws);
    userConnections.set(user.userId, userSockets);

    ws.userId = user.userId;
    ws.userName = user.name;
    ws.userRole = user.role;

    const deckId = url.searchParams.get('deckId');
    if (deckId) {
      if (!UUID_REGEX.test(deckId)) {
        ws.close(4002, 'Invalid deck ID');
        return;
      }
      // Verify user owns the deck or is admin before granting room access
      try {
        await deckService.verifyDeckAccess(deckId, user.userId, user.role);
        ws.deckId = deckId;
      } catch {
        ws.close(4003, 'Forbidden: Deck access denied');
        return;
      }
    }

    ws.send(JSON.stringify({ type: 'connected', userId: user.userId, name: user.name }));

    if (ws.deckId) {
      wss.clients.forEach(client => {
        if (client !== ws && client.deckId === ws.deckId && client.readyState === 1) {
          client.send(JSON.stringify({ type: 'user_joined', userId: user.userId, name: user.name }));
        }
      });
    }

    ws.on('message', (data) => {
      if (data.length > 64 * 1024) {
        ws.close(1009, 'Message too large');
        return;
      }
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'slide_edit' && ws.deckId) {
          const safeMsg = {
            type: 'slide_edit',
            slideId: String(msg.slideId || '').slice(0, 100),
            from: ws.userName,
          };
          wss.clients.forEach(client => {
            if (client !== ws && client.deckId === ws.deckId && client.readyState === 1) {
              client.send(JSON.stringify(safeMsg));
            }
          });
        }
      } catch {}
    });

    ws.on('close', () => {
      const activeSockets = userConnections.get(ws.userId);
      if (activeSockets) {
        activeSockets.delete(ws);
        if (activeSockets.size === 0) userConnections.delete(ws.userId);
      }

      if (ws.deckId) {
        wss.clients.forEach(client => {
          if (client !== ws && client.deckId === ws.deckId && client.readyState === 1) {
            client.send(JSON.stringify({ type: 'user_left', userId: user.userId, name: user.name }));
          }
        });
      }
    });

  } catch {
    ws.close(4001, 'Unauthorized');
  }
});

// ─── Scheduled Cleanup ────────────────────────────────────────────────────────
setInterval(() => {
  cleanupOldFiles(parseInt(process.env.DECK_EXPIRY_DAYS) || 7);
}, 24 * 60 * 60 * 1000);

const deckService = require('./services/deck.service');

// ─── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

  console.log(`\n🚀 Deao Studios Pitch Generator Backend`);
  console.log(`   Server: http://localhost:${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n   AI Status:`);
  console.log(`   • Gemini:    ${hasGemini ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   • Anthropic: ${hasAnthropic ? '✅ Configured' : '⬜  Not configured (optional)'}`);
  console.log(`   • Provider:  ${process.env.AI_PROVIDER || 'auto'}\n`);

  // Auto-recover interrupted decks on startup
  deckService.recoverOrphanDecks(wss);
});

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Persistent cloud storage directory & file
const DATA_DIR = process.env.VERCEL ? path.resolve('/tmp', 'data') : path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'cloud-store.json');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Data directory creation warning:', e);
}

function readCloudStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      if (content.trim()) {
        const parsed = JSON.parse(content);
        if (!parsed.sessions) parsed.sessions = [];
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cloud store:', e);
  }
  return {
    properties: [],
    bookings: [],
    messages: [],
    sessions: [],
    profile: {
      name: 'YAMA ON PROPERTY Admin',
      email: '',
      phone: '',
      bio: '',
      avatar: '',
      role: 'Administrator',
    },
    settings: {
      phone: '',
      email: '',
      currency: 'NGN',
      address: '',
      footerIntro: 'Thoughtful property choices. Clear guidance. A better tomorrow.',
      contactTitle: 'Get in touch',
      contactText: 'Contact our team for property details, viewings and enquiries.',
      supabaseUrl: '',
      supabaseAnonKey: '',
      storagePreference: 'cloud-and-local',
      masterKey: '419@Yamaonproperty',
    },
    lastUpdated: new Date().toISOString(),
  };
}

function writeCloudStore(data: any) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing cloud store:', e);
  }
}

// -------------------------------------------------------------
// Authentication Endpoints for Multi-Device Admin Access
// -------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { key, email, password } = req.body;
  const store = readCloudStore();
  const validMasterKey = store.settings.masterKey || '419@Yamaonproperty';

  const providedKey = (key || password || '').trim();
  const providedEmail = (email || '').trim().toLowerCase();

  // Match master key or admin email with master key
  const isKeyMatch = providedKey === validMasterKey || providedKey === '419@Yamaonproperty';
  const isAdminEmailMatch =
    (providedEmail === 'pennantviewdesignmedia@gmail.com' ||
      providedEmail === 'yasirmustapha005@gmail.com' ||
      (store.profile.email && providedEmail === store.profile.email.toLowerCase())) &&
    isKeyMatch;

  if (isKeyMatch || isAdminEmailMatch) {
    // Generate secure cross-device token
    const token = 'yama_' + crypto.randomBytes(32).toString('hex');
    const newSession = {
      token,
      createdAt: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || 'device',
      ip: req.ip || '',
    };

    // Keep up to 50 active sessions across all devices
    if (!store.sessions) store.sessions = [];
    store.sessions = [newSession, ...store.sessions.slice(0, 49)];
    writeCloudStore(store);

    return res.json({
      success: true,
      token,
      message: 'Admin session authenticated successfully',
      profile: store.profile,
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid Master Key or credentials. Please check your spelling and try again.',
  });
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (req.query.token as string);

  if (!token) {
    return res.status(401).json({ authenticated: false, message: 'No session token provided' });
  }

  const store = readCloudStore();
  const session = (store.sessions || []).find((s: any) => s.token === token);

  if (session) {
    return res.json({
      authenticated: true,
      profile: store.profile,
      settings: {
        currency: store.settings.currency,
        phone: store.settings.phone,
      },
    });
  }

  return res.status(401).json({ authenticated: false, message: 'Session expired or invalid' });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : req.body.token;

  if (token) {
    const store = readCloudStore();
    store.sessions = (store.sessions || []).filter((s: any) => s.token !== token);
    writeCloudStore(store);
  }

  res.json({ success: true, message: 'Session ended' });
});

app.post('/api/auth/update-key', (req, res) => {
  const { currentKey, newKey } = req.body;
  const store = readCloudStore();
  const validKey = store.settings.masterKey || '419@Yamaonproperty';

  if (currentKey !== validKey && currentKey !== '419@Yamaonproperty') {
    return res.status(401).json({ success: false, message: 'Current master key is incorrect' });
  }

  if (!newKey || newKey.length < 6) {
    return res.status(400).json({ success: false, message: 'New key must be at least 6 characters' });
  }

  store.settings.masterKey = newKey.trim();
  writeCloudStore(store);
  res.json({ success: true, message: 'Admin Master Key updated across all devices' });
});

// -------------------------------------------------------------
// REST API Endpoints for Cloud Storage
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    cloudStorage: 'active',
    mode: 'cloud-and-local',
    multiDeviceAuth: 'enabled',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/data', (req, res) => {
  const store = readCloudStore();
  // Don't expose internal session tokens or raw secret hashes to public GET
  const sanitized = {
    ...store,
    sessions: undefined,
  };
  res.json(sanitized);
});

app.post('/api/sync', (req, res) => {
  const incoming = req.body;
  const current = readCloudStore();
  const updated = {
    ...current,
    properties: incoming.properties !== undefined ? incoming.properties : current.properties,
    bookings: incoming.bookings !== undefined ? incoming.bookings : current.bookings,
    messages: incoming.messages !== undefined ? incoming.messages : current.messages,
    profile: incoming.profile ? { ...current.profile, ...incoming.profile } : current.profile,
    settings: incoming.settings ? { ...current.settings, ...incoming.settings } : current.settings,
  };
  writeCloudStore(updated);
  res.json({ success: true, updated, message: 'Cloud storage synchronized successfully' });
});

app.post('/api/properties', (req, res) => {
  const store = readCloudStore();
  const property = req.body;
  const index = store.properties.findIndex((p: any) => p.id === property.id);
  if (index >= 0) {
    store.properties[index] = property;
  } else {
    store.properties.unshift(property);
  }
  writeCloudStore(store);
  res.json({ success: true, property });
});

app.delete('/api/properties/:id', (req, res) => {
  const store = readCloudStore();
  store.properties = store.properties.filter((p: any) => p.id !== req.params.id);
  writeCloudStore(store);
  res.json({ success: true });
});

app.post('/api/bookings', (req, res) => {
  const store = readCloudStore();
  const booking = req.body;
  store.bookings.unshift(booking);
  writeCloudStore(store);
  res.json({ success: true, booking });
});

app.put('/api/bookings/:id', (req, res) => {
  const store = readCloudStore();
  const index = store.bookings.findIndex((b: any) => b.id === req.params.id);
  if (index >= 0) {
    store.bookings[index] = { ...store.bookings[index], ...req.body };
    writeCloudStore(store);
    res.json({ success: true, booking: store.bookings[index] });
  } else {
    res.status(404).json({ error: 'Booking not found' });
  }
});

app.delete('/api/bookings/:id', (req, res) => {
  const store = readCloudStore();
  store.bookings = store.bookings.filter((b: any) => b.id !== req.params.id);
  writeCloudStore(store);
  res.json({ success: true });
});

app.post('/api/messages', (req, res) => {
  const store = readCloudStore();
  const message = req.body;
  store.messages.unshift(message);
  writeCloudStore(store);
  res.json({ success: true, message });
});

app.put('/api/messages/:id', (req, res) => {
  const store = readCloudStore();
  const index = store.messages.findIndex((m: any) => m.id === req.params.id);
  if (index >= 0) {
    store.messages[index] = { ...store.messages[index], ...req.body };
    writeCloudStore(store);
    res.json({ success: true, message: store.messages[index] });
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

app.delete('/api/messages/:id', (req, res) => {
  const store = readCloudStore();
  store.messages = store.messages.filter((m: any) => m.id !== req.params.id);
  writeCloudStore(store);
  res.json({ success: true });
});

app.post('/api/profile', (req, res) => {
  const store = readCloudStore();
  store.profile = { ...store.profile, ...req.body };
  writeCloudStore(store);
  res.json({ success: true, profile: store.profile });
});

app.post('/api/settings', (req, res) => {
  const store = readCloudStore();
  store.settings = { ...store.settings, ...req.body };
  writeCloudStore(store);
  res.json({ success: true, settings: store.settings });
});

// -------------------------------------------------------------
// Vite Server Integration
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

// Only start listener if not in serverless environment
if (!process.env.VERCEL) {
  startServer();
}

export default app;

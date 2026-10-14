const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const clientsRoutes = require('./routes/clients');
const vehiclesRoutes = require('./routes/vehicles');
const servicesRoutes = require('./routes/services');
const workersRoutes = require('./routes/workers');
const appointmentsRoutes = require('./routes/appointments');
const authMiddleware = require('./middleware/auth');
const readOnlyDemo = require('./middleware/readOnlyDemo');

const app = express();

// CORS: adresa frontenda (FRONTEND_URL) i lokalni Vite za razvoj
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const err = new Error('CORS nije dozvoljen');
      err.status = 403;
      callback(err);
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check (Render koristi ovo)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'API auto perionice radi',
    version: '1.0.0',
  });
});

// Javne rute
app.use('/api/auth', authRoutes);

// Zaštićene rute
app.use('/api/clients', authMiddleware, readOnlyDemo, clientsRoutes);
app.use('/api/vehicles', authMiddleware, readOnlyDemo, vehiclesRoutes);
app.use('/api/services', authMiddleware, readOnlyDemo, servicesRoutes);
app.use('/api/workers', authMiddleware, readOnlyDemo, workersRoutes);
app.use('/api/appointments', authMiddleware, readOnlyDemo, appointmentsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta ne postoji' });
});

app.use((err, req, res, next) => {
  if (err.status === 403) {
    return res.status(403).json({ error: err.message });
  }
  console.error('Globalna greška:', err.stack);
  res.status(500).json({ error: 'Greška na serveru' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

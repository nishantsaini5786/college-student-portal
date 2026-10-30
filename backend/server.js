require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const { rateLimit } = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');
const { authenticate, csrfProtection } = require('./middleware/auth');

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET','POST','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','X-CSRF-Token']
}));
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));
app.use('/api', (req, res, next) => {
  if (['GET','HEAD','OPTIONS'].includes(req.method) || req.path.startsWith('/auth')) return next();
  return authenticate(req, res, () => csrfProtection(req, res, next));
});
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'college-student-portal-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: 'A record with this information already exists.' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: 'Please check the submitted information.' });
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`API running on port ${port}`)))
  .catch(err => { console.error('Startup failed:', err.message); process.exit(1); });

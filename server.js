// =============================================
//  PassForge – server.js
//  Main Express Server Entry Point
// =============================================

const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

const connectDB         = require('./db');
const passwordRoutes    = require('./routes/passwordRoutes');

// Load environment variables from .env
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ---------- Connect to MongoDB ----------
connectDB();

// ---------- Middleware ----------
app.use(cors({
  origin: '*', // Allow all origins (restrict in production)
  methods: ['GET', 'POST', 'DELETE']
}));

app.use(express.json()); // Parse incoming JSON bodies

// ---------- Routes ----------
app.use('/api/password', passwordRoutes);

// ---------- Health Check Route ----------
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'PassForge API is running 🔐',
    version: '1.0.0'
  });
});

// ---------- 404 Handler ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`✅ PassForge server running at http://localhost:${PORT}`);
});
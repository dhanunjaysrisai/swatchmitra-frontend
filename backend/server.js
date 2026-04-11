const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'NOT LOADED');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'NOT LOADED');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const missionCaptureRoutes = require('./routes/missionCapture');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Reflect request origin so LAN/mobile dev works (e.g. http://192.168.x.x:5173 → API on :5000)
app.use(cors({
  origin: true,
  credentials: true
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Teachable Machine / TF.js models live in frontend/public/models/ and are served by Vite (dev)
// or your static host / CDN — not Express. Do not point the React app at :5000 for model files.

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/mission-captures', missionCaptureRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'SwachhMitra Backend API is running!' });
});

// Debug route
app.get('/debug', (req, res) => {
  res.json({ 
    message: 'Debug endpoint',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

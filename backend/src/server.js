require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { startAutomationEngine } = require('./automation/engine');

// Route imports
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const ngoRoutes = require('./routes/ngos');
const volunteerRoutes = require('./routes/volunteers');
const donationRoutes = require('./routes/donations');
const notificationRoutes = require('./routes/notifications');
const certificateRoutes = require('./routes/certificates');
const aiRoutes = require('./routes/ai');
const mapRoutes = require('./routes/maps');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from Vercel, localhost, or FRONTEND_URL
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost') || origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'FoodLink AI Backend' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FoodLink AI Backend running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  // Start automation engine
  startAutomationEngine();
});

module.exports = app;

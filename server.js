const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Configuration
const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

// Middleware
app.use(cors()); // Allow all origins by default for now to avoid CORS issues
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Database Connection
// MongoDB connection removed in favor of Supabase.
// Supabase is initialized in services/db.js via config/supabase.js
console.log('✅ Supabase client initialized (lazy loading)');

// Import Routes
const authRoute = require('./routes/auth');
const contentRoute = require('./routes/content');

// Use Routes
app.use('/api', authRoute);
app.use('/api', contentRoute);

// Basic Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API endpoint not found' });
    } else {
        res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Global Error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`👉 http://localhost:${PORT}`);
    });
}

module.exports = app;

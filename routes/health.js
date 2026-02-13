const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * GET /health
 * Health check endpoint for monitoring
 */
router.get('/health', (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        mongodb: {
            connected: mongoose.connection.readyState === 1,
            state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
        },
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        }
    };

    // Return 503 if database is not connected
    if (!health.mongodb.connected) {
        health.status = 'degraded';
        return res.status(503).json(health);
    }

    res.json(health);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const config = require('../config');

/**
 * GET /api/debug/env
 * Debug endpoint to check environment variables (REMOVE IN PRODUCTION!)
 */
router.get('/debug/env', (req, res) => {
    res.json({
        environment: config.NODE_ENV,
        adminAccessIdSet: !!config.ADMIN_ACCESS_ID,
        jwtSecretSet: !!config.JWT_SECRET,
        mongoUriSet: !!config.MONGODB_URI,
        isNetlify: !!process.env.NETLIFY,
        envVars: {
            ADMIN_ACCESS_ID: process.env.ADMIN_ACCESS_ID ? 'SET (length: ' + process.env.ADMIN_ACCESS_ID.length + ')' : 'NOT SET',
            JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
            MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET'
        }
    });
});

module.exports = router;

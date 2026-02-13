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
        adminUserSet: !!config.ADMIN_USER,
        adminUserValue: config.ADMIN_USER, // TEMPORARY - for debugging only
        adminPassSet: !!config.ADMIN_PASS,
        adminPassLength: config.ADMIN_PASS ? config.ADMIN_PASS.length : 0,
        jwtSecretSet: !!config.JWT_SECRET,
        mongoUriSet: !!config.MONGODB_URI,
        isNetlify: !!process.env.NETLIFY,
        envVars: {
            ADMIN_USER: process.env.ADMIN_USER || 'NOT SET',
            ADMIN_PASS: process.env.ADMIN_PASS ? 'SET (length: ' + process.env.ADMIN_PASS.length + ')' : 'NOT SET',
            JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
            MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET'
        }
    });
});

module.exports = router;

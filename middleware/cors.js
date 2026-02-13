const config = require('../config');

/**
 * Manual CORS middleware (Express 5 compatible)
 */
const corsMiddleware = (req, res, next) => {
    const allowedOrigins = config.ALLOWED_ORIGINS.split(',');
    const origin = req.headers.origin;

    if (config.ALLOWED_ORIGINS === '*' || allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin || '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
};

module.exports = corsMiddleware;

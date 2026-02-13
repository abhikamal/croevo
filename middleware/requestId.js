const crypto = require('crypto');

/**
 * Request ID middleware
 * Adds a unique ID to each request for better log tracing
 */
const requestId = (req, res, next) => {
    // Generate unique request ID
    req.id = crypto.randomBytes(8).toString('hex');

    // Add to response headers for client tracking
    res.setHeader('X-Request-ID', req.id);

    next();
};

module.exports = requestId;

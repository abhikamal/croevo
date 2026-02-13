const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const { logger } = require('../middleware/logger');
const { validateLogin, validateRefreshToken, handleValidationErrors } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Refresh token storage with expiration tracking
const refreshTokens = new Map(); // Map<token, expiryTimestamp>

// Cleanup expired tokens every hour
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;

    for (const [token, expiry] of refreshTokens.entries()) {
        if (now > expiry) {
            refreshTokens.delete(token);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        logger.info('Cleaned up expired refresh tokens', { count: cleaned });
    }
}, 60 * 60 * 1000); // Run every hour

/**
 * POST /api/login
 * Authenticate user and return access + refresh tokens
 */
router.post('/login', validateLogin, handleValidationErrors, asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Debug logging (REMOVE IN PRODUCTION!)
    console.log('[LOGIN] Attempt:', {
        receivedUsername: username,
        receivedPasswordLength: password ? password.length : 0,
        expectedUsername: config.ADMIN_USER,
        expectedPasswordLength: config.ADMIN_PASS ? config.ADMIN_PASS.length : 0,
        usernameMatch: username === config.ADMIN_USER,
        passwordMatch: password === config.ADMIN_PASS
    });

    // Check credentials
    const usernameMatch = username === config.ADMIN_USER;

    // For now, using plain text comparison
    // TODO: Implement bcrypt hashing for stored passwords
    const passwordMatch = password === config.ADMIN_PASS;

    if (usernameMatch && passwordMatch) {
        // Generate access token
        const accessToken = jwt.sign(
            { username: config.ADMIN_USER },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        // Generate refresh token
        const refreshToken = jwt.sign(
            { username: config.ADMIN_USER, type: 'refresh' },
            config.JWT_SECRET,
            { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
        );

        // Store refresh token with expiration (7 days)
        const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
        refreshTokens.set(refreshToken, expiryTime);

        logger.info('Login successful', { username });

        res.json({
            success: true,
            token: accessToken,
            refreshToken: refreshToken
        });
    } else {
        logger.warn('Login failed - invalid credentials', { username });
        res.status(401).json({
            success: false,
            error: 'Invalid credentials',
            message: 'Username or password is incorrect'
        });
    }
}));

/**
 * POST /api/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', validateRefreshToken, handleValidationErrors, asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    // Check if token exists and is not expired
    const expiry = refreshTokens.get(refreshToken);
    if (!expiry) {
        return res.status(403).json({
            error: 'Invalid token',
            message: 'Refresh token not found or already used'
        });
    }

    if (Date.now() > expiry) {
        refreshTokens.delete(refreshToken);
        return res.status(403).json({
            error: 'Token expired',
            message: 'Refresh token has expired'
        });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    if (decoded.type !== 'refresh') {
        return res.status(403).json({
            error: 'Invalid token type',
            message: 'Token is not a refresh token'
        });
    }

    // Generate new access token
    const accessToken = jwt.sign(
        { username: decoded.username },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
    );

    logger.info('Access token refreshed', { username: decoded.username });

    res.json({
        success: true,
        token: accessToken
    });
}));

/**
 * POST /api/logout
 * Invalidate refresh token
 */
router.post('/logout', (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        refreshTokens.delete(refreshToken);
        logger.info('User logged out', { tokenRemoved: true });
    }

    res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * Middleware to verify JWT access token
 */
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({
            error: 'No token provided',
            message: 'Authorization header is required'
        });
    }

    // Validate Bearer token format
    if (!token.startsWith('Bearer ') || token.split(' ').length !== 2) {
        return res.status(401).json({
            error: 'Invalid token format',
            message: 'Authorization header must be in format: Bearer <token>'
        });
    }

    const bearerToken = token.split(' ')[1];

    jwt.verify(bearerToken, config.JWT_SECRET, (err, decoded) => {
        if (err) {
            logger.error('Token verification error', { error: err.message });
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Token is invalid or expired'
            });
        }
        req.user = decoded;
        next();
    });
};

module.exports = { router, verifyToken };

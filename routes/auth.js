const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Configuration
const ADMIN_ACCESS_ID = process.env.ADMIN_ACCESS_ID || 'admin-secret-key';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_123';

console.log('🔒 Auth Config Loaded');
console.log(`   - Admin ID configured: ${!!process.env.ADMIN_ACCESS_ID}`);

/**
 * POST /api/login
 * Simple login with Access ID
 */
router.post('/login', (req, res) => {
    try {
        const { accessId } = req.body;

        if (!accessId) {
            return res.status(400).json({ error: 'Access ID is required' });
        }

        // Direct comparison
        if (accessId === ADMIN_ACCESS_ID) {
            // Generate token (valid for 24 hours)
            const token = jwt.sign(
                { role: 'admin' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('✅ Login successful');
            return res.json({
                success: true,
                token: token,
                message: 'Logged in successfully'
            });
        } else {
            console.warn('⚠️  Invalid login attempt');
            return res.status(401).json({ error: 'Invalid Access ID' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

/**
 * Middleware: Verify Token
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

module.exports = router;
module.exports.verifyToken = verifyToken;

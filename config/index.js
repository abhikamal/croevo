// Load environment variables
require('dotenv').config({ debug: process.env.NODE_ENV !== 'production' });

// Debug logging for Netlify (will show in function logs)
if (process.env.NETLIFY) {
    console.log('[CONFIG] Running on Netlify');
    console.log('[CONFIG] ADMIN_USER:', process.env.ADMIN_USER ? 'SET' : 'NOT SET');
    console.log('[CONFIG] ADMIN_PASS:', process.env.ADMIN_PASS ? 'SET' : 'NOT SET');
    console.log('[CONFIG] JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
}

module.exports = {
    // Server
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database
    MONGODB_URI: process.env.MONGODB_URI,

    // Authentication
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_123',
    JWT_EXPIRES_IN: '1h',
    JWT_REFRESH_EXPIRES_IN: '7d',
    ADMIN_USER: process.env.ADMIN_USER || 'admin',
    ADMIN_PASS: process.env.ADMIN_PASS || 'password123',

    // Security
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX: 100,
    REQUEST_BODY_LIMIT: '10mb',

    // CORS
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '*',

    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,

    // Caching
    CACHE_TTL: 5 * 60 * 1000 // 5 minutes
};

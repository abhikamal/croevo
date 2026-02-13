const express = require('express');
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { logger, requestLogger } = require('./middleware/logger');
const corsMiddleware = require('./middleware/cors');
const requestId = require('./middleware/requestId');

// Import routes
const { router: authRouter } = require('./routes/auth');
const contentRouter = require('./routes/content');
const seedRouter = require('./routes/seed');
const healthRouter = require('./routes/health');
const debugRouter = require('./routes/debug');

const { errorHandler, notFoundHandler, handleUncaughtException, handleUnhandledRejection } = require('./middleware/errorHandler');

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

const app = express();

// Middleware
app.use(requestId); // Add unique ID to each request
app.use(requestLogger); // Winston request logging
app.use(express.json({ limit: config.REQUEST_BODY_LIMIT })); // Body parser with size limit
app.use(express.static('public')); // Static files
app.use(compression()); // Response compression

// Security Middleware
app.use(helmet()); // Security headers
app.use(corsMiddleware); // CORS (Express 5 compatible)

// Rate Limiting
const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// MongoDB Connection
if (!config.MONGODB_URI) {
    logger.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
} else {
    mongoose.connect(config.MONGODB_URI)
        .then(() => logger.info('Connected to MongoDB'))
        .catch(err => {
            logger.error('MongoDB connection error', { error: err.message });
            process.exit(1);
        });
}

// Routes
app.use('/api', authRouter);
app.use('/api', contentRouter);
app.use('/api', seedRouter);
app.use('/api', debugRouter);
app.use(healthRouter);

// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

// Start server
if (require.main === module) {
    app.listen(config.PORT, () => {
        logger.info(`Server running on port ${config.PORT}`, {
            environment: config.NODE_ENV,
            port: config.PORT
        });
    });
}

module.exports = app;

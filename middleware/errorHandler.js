const { logger } = require('./logger');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Handle MongoDB/Mongoose errors
 */
const handleMongooseError = (err) => {
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return new AppError(`Validation Error: ${errors.join(', ')}`, 400);
    }

    if (err.name === 'CastError') {
        return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return new AppError(`Duplicate field value: ${field}`, 409);
    }

    return err;
};

/**
 * Handle JWT errors
 */
const handleJWTError = (err) => {
    if (err.name === 'JsonWebTokenError') {
        return new AppError('Invalid token. Please log in again.', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return new AppError('Your token has expired. Please log in again.', 401);
    }

    return err;
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Log error with context
    logger.error('Error occurred', {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        error: {
            message: error.message,
            stack: error.stack,
            statusCode: error.statusCode
        }
    });

    // Handle specific error types
    error = handleMongooseError(error);
    error = handleJWTError(error);

    // Default to 500 if no status code
    const statusCode = error.statusCode || 500;
    const isOperational = error.isOperational !== undefined ? error.isOperational : false;

    // Prepare error response
    const errorResponse = {
        error: error.name || 'Error',
        message: error.message || 'Something went wrong',
        timestamp: error.timestamp || new Date().toISOString(),
        requestId: req.id
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
        errorResponse.details = error;
    }

    // Send error response
    res.status(statusCode).json(errorResponse);

    // If error is not operational, log it as critical
    if (!isOperational) {
        logger.error('CRITICAL: Non-operational error occurred', {
            error: error.message,
            stack: error.stack
        });
    }
};

/**
 * Handle 404 errors
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
    next(error);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = () => {
    process.on('uncaughtException', (err) => {
        logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
            error: err.message,
            stack: err.stack
        });
        process.exit(1);
    });
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = () => {
    process.on('unhandledRejection', (err) => {
        logger.error('UNHANDLED REJECTION! Shutting down...', {
            error: err.message,
            stack: err.stack
        });
        process.exit(1);
    });
};

module.exports = {
    AppError,
    errorHandler,
    notFoundHandler,
    asyncHandler,
    handleUncaughtException,
    handleUnhandledRejection
};

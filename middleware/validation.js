const { body, validationResult } = require('express-validator');

/**
 * Validation middleware for content updates
 */
const validateContent = [
    body('team').optional().isArray().withMessage('Team must be an array'),
    body('team.*.name').optional().trim().notEmpty().withMessage('Team member name is required')
        .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
    body('team.*.role').optional().trim().notEmpty().withMessage('Role is required')
        .isLength({ max: 100 }).withMessage('Role must be less than 100 characters'),
    body('team.*.bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
    body('team.*.image').optional().trim().isURL().withMessage('Image must be a valid URL'),

    body('careers').optional().isArray().withMessage('Careers must be an array'),
    body('careers.*.title').optional().trim().notEmpty().withMessage('Job title is required')
        .isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
    body('careers.*.location').optional().trim().notEmpty().withMessage('Location is required')
        .isLength({ max: 100 }).withMessage('Location must be less than 100 characters'),
    body('careers.*.type').optional().trim().notEmpty().withMessage('Job type is required')
        .isLength({ max: 50 }).withMessage('Type must be less than 50 characters'),
    body('careers.*.description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('careers.*.applyUrl').optional().trim().isURL().withMessage('Apply URL must be valid'),
];

/**
 * Validation middleware for login
 */
const validateLogin = [
    body('accessId').trim().notEmpty().withMessage('Access ID is required')
];

/**
 * Validation middleware for refresh token
 */
const validateRefreshToken = [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
        .isString().withMessage('Refresh token must be a string'),
];

/**
 * Validation middleware for pagination
 */
const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1) {
        return res.status(400).json({ error: 'Page must be greater than 0' });
    }

    if (limit < 1 || limit > 100) {
        return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }

    req.pagination = { page, limit };
    next();
};

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Sanitize HTML to prevent XSS attacks
 */
const sanitizeHtml = (text) => {
    if (!text) return text;
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Middleware to sanitize request body
 */
const sanitizeBody = (req, res, next) => {
    const sanitizeObject = (obj) => {
        if (typeof obj === 'string') {
            return sanitizeHtml(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };

    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    next();
};

module.exports = {
    validateContent,
    validateLogin,
    validateRefreshToken,
    validatePagination,
    handleValidationErrors,
    sanitizeBody,
    sanitizeHtml
};

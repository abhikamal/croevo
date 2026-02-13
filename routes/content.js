const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const JobPosting = require('../models/JobPosting');
const { verifyToken } = require('./auth');
const config = require('../config');
const { logger } = require('../middleware/logger');
const { validateContent, validatePagination, handleValidationErrors, sanitizeBody } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Improved cache with pagination support
const cache = new Map();
const MAX_CACHE_SIZE = 50; // Prevent unlimited cache growth

/**
 * GET /api/content
 * Get team members and job postings with pagination
 */
router.get('/content', validatePagination, asyncHandler(async (req, res) => {
    // Parse and validate pagination parameters
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || config.DEFAULT_PAGE_SIZE;

    // Validation
    if (page < 1) page = 1;
    if (limit < 1) limit = config.DEFAULT_PAGE_SIZE;
    limit = Math.min(limit, config.MAX_PAGE_SIZE);

    const skip = (page - 1) * limit;

    // Create cache key based on pagination params
    const cacheKey = `${page}-${limit}`;
    const now = Date.now();

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp < config.CACHE_TTL)) {
        logger.debug('Serving from cache', { cacheKey });
        return res.json(cached.data);
    }

    // Fetch data with pagination
    const [team, teamTotal, careers, careersTotal] = await Promise.all([
        TeamMember.find().skip(skip).limit(limit).lean(),
        TeamMember.countDocuments(),
        JobPosting.find().skip(skip).limit(limit).lean(),
        JobPosting.countDocuments()
    ]);

    const response = {
        team,
        careers,
        pagination: {
            page,
            limit,
            totalTeam: teamTotal,
            totalCareers: careersTotal,
            totalPagesTeam: Math.ceil(teamTotal / limit),
            totalPagesCareers: Math.ceil(careersTotal / limit)
        }
    };

    // Update cache with size limit
    if (cache.size >= MAX_CACHE_SIZE) {
        // Remove oldest entry
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }

    cache.set(cacheKey, {
        data: response,
        timestamp: now
    });

    logger.info('Content fetched', {
        teamCount: team.length,
        careersCount: careers.length,
        page,
        limit,
        cacheKey
    });

    res.json(response);
}));

/**
 * POST /api/content
 * Update team members and job postings (protected)
 */
router.post('/content', verifyToken, sanitizeBody, validateContent, handleValidationErrors, asyncHandler(async (req, res) => {
    const { team, careers } = req.body;

    // Validation is now handled by validateContent middleware
    if (!team && !careers) {
        return res.status(400).json({
            success: false,
            error: 'No data provided',
            message: 'Either team or careers data must be provided'
        });
    }

    if (team && Array.isArray(team)) {
        await TeamMember.deleteMany({});
        if (team.length > 0) {
            await TeamMember.insertMany(team);
        }
    }

    if (careers && Array.isArray(careers)) {
        await JobPosting.deleteMany({});
        if (careers.length > 0) {
            await JobPosting.insertMany(careers);
        }
    }

    // Clear entire cache when content is updated
    cache.clear();

    logger.info('Content updated', {
        teamCount: team?.length || 0,
        careersCount: careers?.length || 0,
        user: req.user.username
    });

    res.json({ success: true });
}));

module.exports = router;

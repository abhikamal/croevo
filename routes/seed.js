const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const JobPosting = require('../models/JobPosting');
const { logger } = require('../middleware/logger');

/**
 * POST /api/seed
 * Seed database with initial data
 */
router.post('/seed', async (req, res) => {
    try {
        const count = await TeamMember.countDocuments();

        if (count === 0) {
            // Add error handling for missing file
            let initialData;
            try {
                initialData = require('../data/content.json');
            } catch (err) {
                logger.error('Seed data file not found', { error: err.message });
                return res.status(500).json({ error: 'Seed data file not found' });
            }

            if (initialData.team && Array.isArray(initialData.team)) {
                await TeamMember.insertMany(initialData.team);
            }

            if (initialData.careers && Array.isArray(initialData.careers)) {
                await JobPosting.insertMany(initialData.careers);
            }

            logger.info('Database seeded', {
                teamCount: initialData.team?.length || 0,
                careersCount: initialData.careers?.length || 0
            });

            return res.json({ message: 'Database seeded' });
        }

        res.json({ message: 'Database already has data' });
    } catch (err) {
        logger.error('Seed error', { error: err.message });
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

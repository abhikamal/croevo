const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');

// Models
const TeamMember = require('../models/TeamMember');
const JobPosting = require('../models/JobPosting');

/**
 * GET /api/content
 * Public endpoint to fetch team and careers
 */
router.get('/content', async (req, res) => {
    try {
        // Simple pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // Increased default limit
        const skip = (page - 1) * limit;

        const [team, careers] = await Promise.all([
            TeamMember.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            JobPosting.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
        ]);

        res.json({
            success: true,
            team,
            careers,
            pagination: { page, limit }
        });
    } catch (error) {
        console.error('Content Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

/**
 * POST /api/content
 * Protected endpoint to update content
 */
router.post('/content', verifyToken, async (req, res) => {
    try {
        const { team, careers } = req.body;

        // Transaction-like update (delete all and replace)
        // This is simple and effective for this specific use case as per previous logic

        if (team && Array.isArray(team)) {
            await TeamMember.deleteMany({});
            if (team.length > 0) {
                await TeamMember.insertMany(team);
            }
            console.log(`✅ Updated ${team.length} team members`);
        }

        if (careers && Array.isArray(careers)) {
            await JobPosting.deleteMany({});
            if (careers.length > 0) {
                await JobPosting.insertMany(careers);
            }
            console.log(`✅ Updated ${careers.length} job postings`);
        }

        res.json({
            success: true,
            message: 'Content updated successfully'
        });

    } catch (error) {
        console.error('Content Update Error:', error);
        res.status(500).json({ error: 'Failed to update content' });
    }
});

module.exports = router;

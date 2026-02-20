const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const db = require('../services/db');

// --- Public Endpoints ---

/**
 * GET /api/content
 * Retrieve all content (Team & Careers)
 */
router.get('/content', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (page < 1 || limit < 1) {
            return res.status(400).json({ error: 'Invalid pagination parameters' });
        }

        // Fetch data from Supabase via service layer
        // Note: Pagination logic is simplified here; fetching all for now as Supabase
        // pagination would require more complex query building in db.js.
        // For small datasets this is fine.
        const teamMembers = await db.teamMembers.getAll();
        const jobPostings = await db.jobPostings.getAll();

        res.json({
            team: teamMembers,
            careers: jobPostings,
            pagination: {
                page,
                limit,
                totalTeam: teamMembers.length,
                totalCareers: jobPostings.length
            }
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

// --- Protected Endpoints (Admin Only) ---

/**
 * POST /api/content
 * Update content (Add new items)
 * Note: This implementation assumes appending new items, not replacing everything.
 */
router.post('/content', verifyToken, async (req, res) => {
    try {
        const { team, careers } = req.body;

        // Validate basic structure
        if (!team && !careers) {
            return res.status(400).json({ error: 'No content provided to update' });
        }

        const results = {
            team: [],
            careers: []
        };

        // Process Team Members
        if (team && Array.isArray(team)) {
            for (const member of team) {
                // Basic validation
                if (!member.name || !member.role) {
                    continue; // Skip invalid entries or handle error
                }

                // Sanitize (basic)
                const sanitizedMember = {
                    name: member.name.replace(/<[^>]*>/g, ''),
                    role: member.role.replace(/<[^>]*>/g, ''),
                    bio: member.bio ? member.bio.replace(/<[^>]*>/g, '') : '',
                    image: member.image,
                    active: true
                };

                const newMember = await db.teamMembers.create(sanitizedMember);
                results.team.push(newMember);
            }
        }

        // Process Job Postings
        if (careers && Array.isArray(careers)) {
            for (const job of careers) {
                if (!job.title || !job.location) {
                    continue;
                }

                const sanitizedJob = {
                    title: job.title.replace(/<[^>]*>/g, ''),
                    location: job.location.replace(/<[^>]*>/g, ''),
                    type: job.type,
                    description: job.description,
                    apply_url: job.applyUrl, // Mapping camelCase to snake_case for Supabase
                    status: 'active'
                };

                const newJob = await db.jobPostings.create(sanitizedJob);
                results.careers.push(newJob);
            }
        }

        res.json({
            success: true,
            message: 'Content updated successfully',
            updated: results
        });

    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ error: 'Failed to update content' });
    }
});

module.exports = router;

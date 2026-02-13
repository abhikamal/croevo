#!/usr/bin/env node

/**
 * Database Seeding Script
 * Populates the database with sample data for development and testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const TeamMember = require('../models/TeamMember');
const JobPosting = require('../models/JobPosting');
const config = require('../config');
const { logger } = require('../middleware/logger');

// Sample team members
const sampleTeam = [
    {
        name: 'Alex Chen',
        role: 'Founder & CEO',
        bio: 'Visionary leader with 10+ years in AI and Game Development. Former lead at major gaming studios.',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        order: 1,
        active: true
    },
    {
        name: 'Sarah Johnson',
        role: 'CTO',
        bio: 'Expert in machine learning and cloud architecture. PhD in Computer Science from MIT.',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        order: 2,
        active: true
    },
    {
        name: 'Marcus Rodriguez',
        role: 'Lead AI Engineer',
        bio: 'Specializes in generative AI and natural language processing. Published researcher in AI.',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
        order: 3,
        active: true
    }
];

// Sample job postings
const sampleJobs = [
    {
        title: 'Senior AI Engineer',
        location: 'Remote',
        type: 'Full-time',
        description: 'Join our core AI team to build the next generation of game creation tools. You will work on cutting-edge generative AI models and help shape the future of gaming.',
        applyUrl: 'https://forms.google.com/example/ai-engineer',
        status: 'active',
        order: 1
    },
    {
        title: 'Full Stack Developer',
        location: 'San Francisco, CA / Remote',
        type: 'Full-time',
        description: 'Build scalable web applications and APIs. Experience with Node.js, React, and MongoDB required.',
        applyUrl: 'https://forms.google.com/example/fullstack-dev',
        status: 'active',
        order: 2
    },
    {
        title: 'Game Designer',
        location: 'Remote',
        type: 'Contract',
        description: 'Design innovative game mechanics and user experiences. Help define what AI-generated games can be.',
        applyUrl: 'https://forms.google.com/example/game-designer',
        status: 'active',
        order: 3
    },
    {
        title: 'DevOps Engineer',
        location: 'Remote',
        type: 'Full-time',
        description: 'Manage our cloud infrastructure and CI/CD pipelines. Experience with AWS, Docker, and Kubernetes preferred.',
        applyUrl: 'https://forms.google.com/example/devops',
        status: 'active',
        order: 4
    }
];

/**
 * Seed the database with sample data
 */
async function seedDatabase() {
    try {
        // Connect to MongoDB
        logger.info('Connecting to MongoDB...');
        await mongoose.connect(config.MONGODB_URI);
        logger.info('Connected to MongoDB');

        // Check if data already exists
        const teamCount = await TeamMember.countDocuments();
        const jobCount = await JobPosting.countDocuments();

        if (teamCount > 0 || jobCount > 0) {
            logger.warn('Database already contains data');
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            readline.question('Do you want to clear existing data and reseed? (yes/no): ', async (answer) => {
                readline.close();

                if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                    await clearAndSeed();
                } else {
                    logger.info('Seeding cancelled');
                    await mongoose.connection.close();
                    process.exit(0);
                }
            });
        } else {
            await insertSampleData();
        }

    } catch (error) {
        logger.error('Seeding error', { error: error.message });
        process.exit(1);
    }
}

/**
 * Clear existing data and insert sample data
 */
async function clearAndSeed() {
    try {
        logger.info('Clearing existing data...');
        await TeamMember.deleteMany({});
        await JobPosting.deleteMany({});
        logger.info('Existing data cleared');

        await insertSampleData();
    } catch (error) {
        logger.error('Error clearing data', { error: error.message });
        throw error;
    }
}

/**
 * Insert sample data into database
 */
async function insertSampleData() {
    try {
        // Insert team members
        logger.info('Inserting team members...');
        const team = await TeamMember.insertMany(sampleTeam);
        logger.info(`Inserted ${team.length} team members`);

        // Insert job postings
        logger.info('Inserting job postings...');
        const jobs = await JobPosting.insertMany(sampleJobs);
        logger.info(`Inserted ${jobs.length} job postings`);

        logger.info('Database seeded successfully!');
        logger.info('Summary:', {
            teamMembers: team.length,
            jobPostings: jobs.length
        });

        await mongoose.connection.close();
        logger.info('Database connection closed');
        process.exit(0);

    } catch (error) {
        logger.error('Error inserting data', { error: error.message });
        throw error;
    }
}

// Run the seeding script
seedDatabase();

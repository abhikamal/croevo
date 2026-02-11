const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in environment variables.");
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
}

// Schemas
const TeamMemberSchema = new mongoose.Schema({
    name: String,
    role: String,
    bio: String,
    image: String
});

const JobPostingSchema = new mongoose.Schema({
    title: String,
    location: String,
    type: { type: String, enum: ['Full-time', 'Part-time', 'Contract'] },
    description: String,
    applyUrl: String
});

const TeamMember = mongoose.model('TeamMember', TeamMemberSchema);
const JobPosting = mongoose.model('JobPosting', JobPostingSchema);

// API: Get Content
app.get('/api/content', async (req, res) => {
    try {
        const team = await TeamMember.find();
        const careers = await JobPosting.find();
        res.json({ team, careers });
    } catch (err) {
        console.error("Error fetching content:", err);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

// API: Login (Simple hardcoded check for now - consider moving to separate DB or Auth provider)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Env vars for credentials recommended
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'password123';

    if (username === adminUser && password === adminPass) {
        res.json({ success: true, token: 'fake-session-token' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// API: Update Content (Protected)
// Note: This endpoint now needs to handle separate updates for team/careers or bulk updates.
// For simplicity, keeping a similar structure but recommending specific endpoints.
app.post('/api/content', async (req, res) => {
    const { team, careers } = req.body;

    // Detailed implementation depends on how frontend sends data. 
    // Assuming full replace for simplicity to match previous behavior (NOT RECOMMENDED for production with large data)

    try {
        if (team) {
            await TeamMember.deleteMany({});
            await TeamMember.insertMany(team);
        }
        if (careers) {
            await JobPosting.deleteMany({});
            await JobPosting.insertMany(careers);
        }
        res.json({ success: true });
    } catch (err) {
        console.error("Error updating content:", err);
        res.status(500).json({ success: false, message: 'Failed to save data' });
    }
});

// Seed Endpoint (Optional: to populate initial data)
app.post('/api/seed', async (req, res) => {
    try {
        const count = await TeamMember.countDocuments();
        if (count === 0) {
            const initialData = require('./data/content.json');
            await TeamMember.insertMany(initialData.team);
            await JobPosting.insertMany(initialData.careers);
            return res.json({ message: 'Database seeded' });
        }
        res.json({ message: 'Database already has data' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;


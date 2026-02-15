const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const TeamMember = require('../models/TeamMember');
const JobPosting = require('../models/JobPosting');

describe('API Tests', () => {
    let authToken;
    let refreshToken;

    beforeAll(async () => {
        // Connect to test database
        const testDbUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/croevo-test';
        await mongoose.connect(testDbUri);
    });

    afterAll(async () => {
        // Clean up and close connection
        await TeamMember.deleteMany({});
        await JobPosting.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear data before each test
        await TeamMember.deleteMany({});
        await JobPosting.deleteMany({});
    });

    describe('Health Check', () => {
        it('should return server health status', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
            expect(response.body.mongodb).toBeDefined();
            expect(response.body.mongodb.connected).toBe(true);
        });
    });

    describe('Authentication', () => {
        describe('POST /api/login', () => {
            it('should login with valid credentials', async () => {
                const response = await request(app)
                    .post('/api/login')
                    .send({
                        accessId: process.env.ADMIN_ACCESS_ID || 'admin-secret-key'
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.token).toBeDefined();
                expect(response.body.refreshToken).toBeDefined();

                // Save tokens for later tests
                authToken = response.body.token;
                refreshToken = response.body.refreshToken;
            });

            it('should reject invalid credentials', async () => {
                const response = await request(app)
                    .post('/api/login')
                    .send({
                        username: 'admin',
                        password: 'wrongpassword'
                    });

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
            });

            it('should reject missing credentials', async () => {
                const response = await request(app)
                    .post('/api/login')
                    .send({});

                expect(response.status).toBe(400);
            });

            it('should validate input format', async () => {
                const response = await request(app)
                    .post('/api/login')
                    .send({
                        username: 'ab', // Too short
                        password: '123'  // Too short
                    });

                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Validation Error');
            });
        });

        describe('POST /api/refresh', () => {
            beforeEach(async () => {
                // Get tokens first
                const loginResponse = await request(app)
                    .post('/api/login')
                    .send({
                        accessId: process.env.ADMIN_ACCESS_ID || 'admin-secret-key'
                    });
                refreshToken = loginResponse.body.refreshToken;
            });

            it('should refresh access token with valid refresh token', async () => {
                const response = await request(app)
                    .post('/api/refresh')
                    .send({ refreshToken });

                expect(response.status).toBe(200);
                expect(response.body.token).toBeDefined();
            });

            it('should reject invalid refresh token', async () => {
                const response = await request(app)
                    .post('/api/refresh')
                    .send({ refreshToken: 'invalid-token' });

                expect(response.status).toBe(403);
            });
        });

        describe('POST /api/logout', () => {
            it('should logout successfully', async () => {
                const response = await request(app)
                    .post('/api/logout')
                    .send({ refreshToken: 'some-token' });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
            });
        });
    });

    describe('Content API', () => {
        beforeEach(async () => {
            // Get auth token
            const loginResponse = await request(app)
                .post('/api/login')
                .send({
                    accessId: process.env.ADMIN_ACCESS_ID || 'admin-secret-key'
                });
            authToken = loginResponse.body.token;

            // Add sample data
            await TeamMember.create({
                name: 'Test User',
                role: 'Developer',
                bio: 'Test bio',
                image: 'https://example.com/image.jpg'
            });

            await JobPosting.create({
                title: 'Test Job',
                location: 'Remote',
                type: 'Full-time',
                description: 'Test description',
                applyUrl: 'https://example.com/apply'
            });
        });

        describe('GET /api/content', () => {
            it('should get content without authentication', async () => {
                const response = await request(app).get('/api/content');

                expect(response.status).toBe(200);
                expect(response.body.team).toBeDefined();
                expect(response.body.careers).toBeDefined();
                expect(response.body.pagination).toBeDefined();
            });

            it('should support pagination', async () => {
                const response = await request(app)
                    .get('/api/content')
                    .query({ page: 1, limit: 5 });

                expect(response.status).toBe(200);
                expect(response.body.pagination.page).toBe(1);
                expect(response.body.pagination.limit).toBe(5);
            });

            it('should validate pagination parameters', async () => {
                const response = await request(app)
                    .get('/api/content')
                    .query({ page: -1, limit: 1000 });

                expect(response.status).toBe(400);
            });
        });

        describe('POST /api/content', () => {
            it('should update content with valid token', async () => {
                const response = await request(app)
                    .post('/api/content')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        team: [{
                            name: 'New Member',
                            role: 'Engineer',
                            bio: 'Bio',
                            image: 'https://example.com/new.jpg'
                        }],
                        careers: []
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                // Verify data was updated
                const teamCount = await TeamMember.countDocuments();
                expect(teamCount).toBe(1);
            });

            it('should reject update without token', async () => {
                const response = await request(app)
                    .post('/api/content')
                    .send({ team: [], careers: [] });

                expect(response.status).toBe(403);
            });

            it('should reject update with invalid token', async () => {
                const response = await request(app)
                    .post('/api/content')
                    .set('Authorization', 'Bearer invalid-token')
                    .send({ team: [], careers: [] });

                expect(response.status).toBe(401);
            });

            it('should validate input data', async () => {
                const response = await request(app)
                    .post('/api/content')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        team: [{
                            name: '', // Invalid: empty name
                            role: 'Engineer'
                        }]
                    });

                expect(response.status).toBe(400);
            });

            it('should sanitize XSS attempts', async () => {
                const response = await request(app)
                    .post('/api/content')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        team: [{
                            name: '<script>alert("xss")</script>',
                            role: 'Engineer',
                            bio: 'Test',
                            image: 'https://example.com/img.jpg'
                        }]
                    });

                expect(response.status).toBe(200);

                // Verify XSS was sanitized
                const member = await TeamMember.findOne();
                expect(member.name).not.toContain('<script>');
            });
        });
    });

    describe('Seed API', () => {
        it('should seed database when empty', async () => {
            const response = await request(app).post('/api/seed');

            expect(response.status).toBe(200);
            expect(response.body.message).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for unknown routes', async () => {
            const response = await request(app).get('/api/unknown-route');

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it('should handle server errors gracefully', async () => {
            // Close database connection to simulate error
            await mongoose.connection.close();

            const response = await request(app).get('/api/content');

            expect(response.status).toBeGreaterThanOrEqual(500);

            // Reconnect for other tests
            const testDbUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/croevo-test';
            await mongoose.connect(testDbUri);
        });
    });
});

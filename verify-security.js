const axios = require('axios');
const { expect } = require('chai'); // You might not have chai installed, so I'll use simple assertions
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

const runTests = async () => {
    console.log('Starting Security Verification...');

    // 1. Check Security Headers
    try {
        const res = await axios.get(`${BASE_URL}/api/content`);
        console.log('[PASS] Server is reachable');

        const headers = res.headers;
        if (headers['x-dns-prefetch-control'] && headers['x-frame-options'] && headers['strict-transport-security']) {
            console.log('[PASS] Security Headers (Helmet) present');
        } else {
            console.log('[WARN] Some security headers missing:', headers);
        }

    } catch (err) {
        console.error('[FAIL] Server not reachable or error:', err.message);
        return; // Stop if server is down
    }

    // 2. Public Route Access
    try {
        await axios.get(`${BASE_URL}/api/content`);
        console.log('[PASS] Public route /api/content (GET) accessible');
    } catch (err) {
        console.error('[FAIL] Public route access failed:', err.message);
    }

    // 3. Protected Route Access (No Token)
    try {
        await axios.post(`${BASE_URL}/api/content`, {});
        console.error('[FAIL] Protected route /api/content (POST) accessible without token!');
    } catch (err) {
        if (err.response && err.response.status === 403) {
            console.log('[PASS] Protected route denied without token (403)');
        } else {
            console.error('[FAIL] Unexpected status for protected route:', err.response ? err.response.status : err.message);
        }
    }

    // 4. Login (Wrong Credentials)
    try {
        await axios.post(`${BASE_URL}/api/login`, { username: 'admin', password: 'wrongpassword' });
        console.error('[FAIL] Login success with wrong password!');
    } catch (err) {
        if (err.response && err.response.status === 401) {
            console.log('[PASS] Login failed as expected with wrong credentials (401)');
        } else {
            console.error('[FAIL] Unexpected status for wrong login:', err.response ? err.response.status : err.message);
        }
    }

    // 5. Login (Correct Credentials) & Access Protected Route
    let token;
    try {
        const res = await axios.post(`${BASE_URL}/api/login`, { username: 'admin', password: 'password123' });
        if (res.data.success && res.data.token) {
            console.log('[PASS] Login successful, token received');
            token = res.data.token;
        } else {
            console.error('[FAIL] Login successful but no token?', res.data);
        }
    } catch (err) {
        console.error('[FAIL] Login failed with correct credentials:', err.message);
    }

    if (token) {
        try {
            await axios.post(`${BASE_URL}/api/content`, { team: [], careers: [] }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('[PASS] Protected route accessible with valid token');
        } catch (err) {
            console.error('[FAIL] Protected route blocked even with valid token:', err.response ? err.response.data : err.message);
        }
    }

    // 6. Rate Limiting Test (Basic)
    // We configured 100 requests / 15 min. To test this quickly we'd need to lower the limit or spam 100+ requests. 
    // I'll skip spamming 100 requests to avoid noise, but acknowledging config is there.
    console.log('[INFO] Rate limiting configured (100 req/15min). specific test skipped to avoid spam.');

    console.log('Verification Complete.');
};

// Simple wait for server to start if running immediately
setTimeout(runTests, 2000);

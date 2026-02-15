/**
 * Vercel Deployment Test Script
 * 
 * Usage: node test-deployment.js https://your-domain.com
 * 
 * This script tests your Vercel deployment to ensure:
 * 1. Environment variables are set
 * 2. API endpoints are accessible
 * 3. Login functionality works
 */

const https = require('https');
const http = require('http');

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('❌ Error: Please provide your domain');
    console.log('Usage: node test-deployment.js https://your-domain.com');
    process.exit(1);
}

const DOMAIN = args[0].replace(/\/$/, ''); // Remove trailing slash
const ADMIN_ACCESS_ID = args[1] || 'admin-secret-key';

console.log('🚀 Testing Vercel Deployment...\n');
console.log(`Domain: ${DOMAIN}`);
console.log(`Testing with: ${ADMIN_USER} / ${ADMIN_PASS}\n`);

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const req = protocol.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

async function runTests() {
    let passed = 0;
    let failed = 0;

    // Test 1: Health Check
    console.log('1️⃣  Testing Health Endpoint...');
    try {
        const result = await makeRequest(`${DOMAIN}/health`);
        if (result.status === 200 && result.data.status === 'OK') {
            console.log('   ✅ Health check passed');
            console.log(`   Database: ${result.data.database}`);
            passed++;
        } else {
            console.log(`   ❌ Health check failed: ${result.status}`);
            failed++;
        }
    } catch (err) {
        console.log(`   ❌ Health check error: ${err.message}`);
        failed++;
    }
    console.log();

    // Test 2: Environment Variables
    console.log('2️⃣  Testing Environment Variables...');
    try {
        const result = await makeRequest(`${DOMAIN}/api/debug/env`);
        if (result.status === 200) {
            const env = result.data;
            const allSet = env.adminUserSet && env.adminPassSet && env.jwtSecretSet && env.mongoUriSet;

            if (allSet) {
                console.log('   ✅ All environment variables are set');
                console.log(`   Admin User: ${env.envVars.ADMIN_USER}`);
                console.log(`   Admin Pass: ${env.envVars.ADMIN_PASS}`);
                passed++;
            } else {
                console.log('   ❌ Some environment variables are missing:');
                if (!env.adminUserSet) console.log('      - ADMIN_USER not set');
                if (!env.adminPassSet) console.log('      - ADMIN_PASS not set');
                if (!env.jwtSecretSet) console.log('      - JWT_SECRET not set');
                if (!env.mongoUriSet) console.log('      - MONGODB_URI not set');
                failed++;
            }
        } else {
            console.log(`   ❌ Debug endpoint failed: ${result.status}`);
            failed++;
        }
    } catch (err) {
        console.log(`   ❌ Environment check error: ${err.message}`);
        failed++;
    }
    console.log();

    // Test 3: Login API
    console.log('3️⃣  Testing Login API...');
    try {
        const result = await makeRequest(`${DOMAIN}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessId: ADMIN_ACCESS_ID })
        });

        if (result.status === 200 && result.data.success) {
            console.log('   ✅ Login successful');
            console.log(`   Token received: ${result.data.token.substring(0, 20)}...`);
            passed++;
        } else {
            console.log(`   ❌ Login failed: ${result.data.message || result.data.error}`);
            failed++;
        }
    } catch (err) {
        console.log(`   ❌ Login error: ${err.message}`);
        failed++;
    }
    console.log();

    // Summary
    console.log('═══════════════════════════════════════');
    console.log(`Tests Passed: ${passed}/3`);
    console.log(`Tests Failed: ${failed}/3`);
    console.log('═══════════════════════════════════════\n');

    if (failed === 0) {
        console.log('🎉 All tests passed! Your deployment is working correctly.');
        console.log(`\n📝 Next steps:`);
        console.log(`   1. Visit ${DOMAIN}/login.html`);
        console.log(`   2. Login with: ${ADMIN_USER} / ${ADMIN_PASS}`);
        console.log(`   3. Change your password for security!`);
    } else {
        console.log('⚠️  Some tests failed. Please check the errors above.');
        console.log('\n📝 Troubleshooting:');
        console.log('   1. Verify environment variables in Vercel dashboard');
        console.log('   2. Check Vercel function logs for errors');
        console.log('   3. Ensure MongoDB connection is working');
        console.log('   4. Redeploy after adding environment variables');
    }
}

runTests().catch(console.error);

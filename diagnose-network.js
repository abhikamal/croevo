const https = require('https');

const urls = [
    'https://croevo.com/login.html',
    'https://www.croevo.com/login.html',
    'https://croevo.com/api/health', // Assuming there is a health check or 404
];

const checkUrl = (url) => {
    return new Promise((resolve) => {
        const start = Date.now();
        const req = https.get(url, (res) => {
            const duration = Date.now() - start;
            console.log(`[${res.statusCode}] ${url} (${duration}ms)`);
            console.log(`  Headers: ${JSON.stringify(res.headers['location'] || '')}`);

            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                console.log(`  Body length: ${data.length}`);
                if (data.length < 500) console.log(`  Body preview: ${data}`);
                resolve();
            });
        });

        req.on('error', (e) => {
            console.log(`[ERROR] ${url}: ${e.message}`);
            resolve();
        });

        req.setTimeout(10000, () => {
            console.log(`[TIMEOUT] ${url}`);
            req.destroy();
            resolve();
        });
    });
};

const testLogin = () => {
    return new Promise((resolve) => {
        console.log('\n--- Testing API Login ---');
        const data = JSON.stringify({ username: 'admin', password: 'password123' });
        const options = {
            hostname: 'croevo.com',
            path: '/api/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            },
            timeout: 15000
        };

        const start = Date.now();
        const req = https.request(options, (res) => {
            const duration = Date.now() - start;
            console.log(`[${res.statusCode}] API Login (${duration}ms)`);
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                console.log(`  Body: ${body.substring(0, 500)}`);
                resolve();
            });
        });

        req.on('error', e => {
            console.log(`[API ERROR] ${e.message}`);
            resolve();
        });

        req.on('timeout', () => {
            console.log('[API TIMEOUT] Request took longer than 15s');
            req.destroy();
            resolve();
        });

        req.write(data);
        req.end();
    });
};

async function run() {
    console.log('Starting diagnostics...');
    for (const url of urls) {
        await checkUrl(url);
    }
    await testLogin();
    console.log('Diagnostics complete.');
}

run();

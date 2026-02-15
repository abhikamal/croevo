const https = require('https');

const url = 'https://www.croevo.com';

console.log(`Checking ${url}...`);

const req = https.get(url, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        if (body.includes('amazonaws') || body.includes('Forbidden')) {
            console.log('DETECTED: AWS / Forbidden content');
        } else {
            console.log('Content preview:', body.substring(0, 200));
        }
    });
});

req.on('error', e => console.log('Error:', e.message));

const https = require('https');

function post(url, data) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                console.log(`Redirecting to ${res.headers.location}`);
                resolve(post(res.headers.location, data)); // Follow redirect
                return;
            }

            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body }));
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

const data = JSON.stringify({ username: 'admin', password: 'password123' });

console.log('Testing login with redirect following...');
post('https://croevo.com/api/login', data)
    .then(res => {
        console.log(`Final Status: ${res.statusCode}`);
        console.log(`Final Body: ${res.body}`);
    })
    .catch(err => console.error(err));

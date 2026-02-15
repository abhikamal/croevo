const https = require('https');

const url = 'https://www.croevo.com/admin-login.html';

console.log(`Fetching ${url}...`);

const req = https.get(url, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        if (body.includes('form id="loginForm"')) {
            console.log('SUCCESS: Received correct login form HTML');
        } else if (body.includes('index-85480ee0.js') || body.includes('<div id="root">') || body.includes('<body>')) {
            console.log('FAILURE: Received SPA/Index HTML (Service Worker or Rewrite issue)');
            console.log('Preview:', body.substring(0, 500));
        } else {
            console.log('UNKNOWN CONTENT:', body.substring(0, 500));
        }
    });
});

req.on('error', e => console.log('Error:', e.message));

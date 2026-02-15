const https = require('https');

const data = JSON.stringify({
    username: 'admin',
    password: 'password123'
});

const options = {
    hostname: 'croevo.com',
    port: 443,
    path: '/api/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`LOCATION: ${res.headers.location}`);
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();

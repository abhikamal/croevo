const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'content.json');

app.use(bodyParser.json());
app.use(express.static('public'));

// Helper to read data
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data:", err);
        return { team: [], careers: [] };
    }
};

// Helper to write data
const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing data:", err);
        return false;
    }
};

// API: Get Content
app.get('/api/content', (req, res) => {
    const data = readData();
    res.json(data);
});

// API: Login (Simple hardcoded check)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password123') {
        res.json({ success: true, token: 'fake-session-token' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// API: Update Content (Protected - ideally check token)
app.post('/api/content', (req, res) => {
    // In a real app, verify token here
    const newData = req.body;
    if (writeData(newData)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

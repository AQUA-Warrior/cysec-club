const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'cybersec_demo_secret_2024';

app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database(path.join(__dirname, 'users.db'));

db.serialize(() => {
    const initUsers = require('./users.js');
    initUsers(db);
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // VULNERABLE SQL - String linking allows injection
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    console.log('Executing query:', query);

    db.get(query, [], (err, user) => {
        if (err) {
            console.error('SQL Error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (user) {
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({
                success: true,
                token,
                role: user.role,
                username: user.username
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

app.get('/api/member/data', authenticateToken, (req, res) => {
    if (req.user.role !== 'member' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
        username: req.user.username,
        memberSince: '2024-01-15',
        lastLogin: new Date().toISOString(),
        membershipLevel: 'Gold',
        points: 1337,
        achievements: [
            'First Login',
            'Security Enthusiast',
            'Bug Hunter'
        ]
    });
});

app.get('/api/admin/system', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    res.json({
        serverUptime: process.uptime(),
        nodeVersion: process.version,
        platform: os.platform(),
        hostname: os.hostname(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length,
        serverTime: new Date().toISOString()
    });
});

app.get('/api/admin/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    db.all('SELECT id, username, password, role FROM users', [], (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(users);
    });
});

app.get('/api/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
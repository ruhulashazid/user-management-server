const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Updated to use User model
const router = express.Router();
const connection = require('../config/db');

// Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    User.create({ name, email, password: hashedPassword }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'User registered successfully' });
    });
});

// Login user
router.post('/login', (req, res) => {
    const { email, password, date } = req.body;

    User.findByEmail(email, async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = results[0];
        console.log(results[0])
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
        if(isMatch){
        User.updateLoginTime(email, date);
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log({accessToken: token})
        res.json({ accessToken: token });
    });
});

// Get all users
router.get('/', authenticateToken, (req, res) => {
    User.getAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get('/:id', authenticateToken, (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT * FROM users WHERE id = ?';

    connection.execute(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(results[0]);
    });
});


// Block users
router.put('/block/:id', authenticateToken, (req, res) => {
    User.updateStatus(req.params.id, 'blocked', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User blocked successfully' });
    });
});

// Unblock users
router.put('/unblock/:id', authenticateToken, (req, res) => {
    User.updateStatus(req.params.id, 'active', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User unblocked successfully' });
    });
});

// Delete users
router.delete('/:id', authenticateToken, (req, res) => {
    User.delete(req.params.id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted successfully' });
    });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log(authHeader)
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = router;

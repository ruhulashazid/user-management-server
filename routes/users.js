const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password, } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = { name, email, password: hashedPassword, };

  User.create(newUser, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// Login user and update last login time
router.post('/login', (req, res) => {

  const { email, password } = req.body;
  const currentDate = new Date();
  User.findByEmail(email, async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = results[0];

     // Check if the user is blocked
     if (user.status === 'blocked') {
         return res.status(403).json({ error: 'Your account is blocked' });
     }
     
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Update login time
    User.updateLoginTime(email, currentDate, (err) => {
      if (err) return res.status(500).json({ error: err.message });
    });

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

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

// Get user by ID
router.get('/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;

  User.findById(userId, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
});

// Block user
router.put('/block/:id', authenticateToken, (req, res) => {
  User.updateStatus(req.params.id, 'blocked', (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User blocked successfully' });
  });
});

// Unblock user
router.put('/unblock/:id', authenticateToken, (req, res) => {
  User.updateStatus(req.params.id, 'active', (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User unblocked successfully' });
  });
});

// Delete user
router.delete('/:id', authenticateToken, (req, res) => {
  User.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted successfully' });
  });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = router;

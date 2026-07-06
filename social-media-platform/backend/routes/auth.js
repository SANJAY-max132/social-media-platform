// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // ✅ ADDED HERE
const db = require('../db');

const router = express.Router();

// ✅ Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(sql, [username, email, hashedPassword], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Registration failed', error: err });
    }
    res.status(200).json({ message: 'User registered successfully' });
  });
});

// ✅ Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid password' });

    // ✅ Generate token with user.id in payload
    const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

module.exports = router;

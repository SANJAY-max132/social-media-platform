// backend/routes/messages.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// Send message
router.post('/send', (req, res) => {
  const { sender_id, receiver_id, text } = req.body;
  const sql = 'INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)';
  db.query(sql, [sender_id, receiver_id, text], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to send message' });
    res.json({ message: 'Message sent' });
  });
});

// Get chat messages between two users
router.get('/chat/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;
  const sql = `
    SELECT messages.*, sender.username AS sender_name
    FROM messages
    JOIN users AS sender ON messages.sender_id = sender.id
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY timestamp ASC
  `;
  db.query(sql, [user1, user2, user2, user1], (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to load messages' });
    res.json(results);
  });
});

module.exports = router;

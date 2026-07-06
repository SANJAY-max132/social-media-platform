const express = require('express');
const db = require('../db');
const router = express.Router();

// Save a post
router.post('/save', (req, res) => {
  const { user_id, post_id } = req.body;
  const sql = 'INSERT IGNORE INTO bookmarks (user_id, post_id) VALUES (?, ?)';
  db.query(sql, [user_id, post_id], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to save post' });
    res.json({ message: 'Post saved' });
  });
});

// Remove bookmark
router.post('/unsave', (req, res) => {
  const { user_id, post_id } = req.body;
  const sql = 'DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?';
  db.query(sql, [user_id, post_id], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to remove bookmark' });
    res.json({ message: 'Bookmark removed' });
  });
});

// Get saved posts for a user
router.get('/:user_id', (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT posts.*, users.username 
    FROM bookmarks 
    JOIN posts ON bookmarks.post_id = posts.id 
    JOIN users ON posts.user_id = users.id 
    WHERE bookmarks.user_id = ?
    ORDER BY bookmarks.created_at DESC
  `;
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching saved posts' });
    res.json(results);
  });
});

module.exports = router;

// backend/routes/follow.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// Follow user
router.post('/follow', (req, res) => {
  const { follower_id, following_id } = req.body;
  const sql = 'INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)';
  db.query(sql, [follower_id, following_id], (err) => {
    if (err) return res.status(500).json({ message: 'Follow failed' });

    // ✅ Insert follow notification
    const notifSql = `
      INSERT INTO notifications (user_id, type, from_user_id)
      VALUES (?, 'follow', ?)
    `;
    db.query(notifSql, [following_id, follower_id]);

    res.json({ message: 'Followed' });
  });
});

// Unfollow user
router.post('/unfollow', (req, res) => {
  const { follower_id, following_id } = req.body;
  const sql = 'DELETE FROM follows WHERE follower_id = ? AND following_id = ?';
  db.query(sql, [follower_id, following_id], (err) => {
    if (err) return res.status(500).json({ message: 'Unfollow failed' });
    res.json({ message: 'Unfollowed' });
  });
});

// Get followers
router.get('/followers/:user_id', (req, res) => {
  const sql = `
    SELECT users.id, users.username FROM follows
    JOIN users ON follows.follower_id = users.id
    WHERE follows.following_id = ?
  `;
  db.query(sql, [req.params.user_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error fetching followers' });
    res.json(result);
  });
});

// Get following
router.get('/following/:user_id', (req, res) => {
  const sql = `
    SELECT users.id, users.username FROM follows
    JOIN users ON follows.following_id = users.id
    WHERE follows.follower_id = ?
  `;
  db.query(sql, [req.params.user_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error fetching following' });
    res.json(result);
  });
});

module.exports = router;

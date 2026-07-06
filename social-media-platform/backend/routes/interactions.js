// backend/routes/interactions.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// Like a post (toggle like/unlike)
router.post('/like', (req, res) => {
  const { user_id, post_id } = req.body;
  const checkSql = 'SELECT * FROM likes WHERE user_id = ? AND post_id = ?';

  db.query(checkSql, [user_id, post_id], (err, results) => {
    if (results.length > 0) {
      // Already liked, so unlike it
      db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [user_id, post_id], () => {
        res.json({ liked: false });
      });
    } else {
      // Like it
      db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [user_id, post_id], (err) => {
        if (err) return res.status(500).json({ message: 'Like failed' });

        // ✅ Insert like notification
        const notifSql = `
          INSERT INTO notifications (user_id, type, from_user_id, post_id)
          VALUES ((SELECT user_id FROM posts WHERE id = ?), 'like', ?, ?)
        `;
        db.query(notifSql, [post_id, user_id, post_id]);

        res.json({ liked: true });
      });
    }
  });
});

// Comment on post
router.post('/comment', (req, res) => {
  const { user_id, post_id, text } = req.body;
  db.query('INSERT INTO comments (user_id, post_id, text) VALUES (?, ?, ?)', [user_id, post_id, text], (err) => {
    if (err) return res.status(500).json({ message: 'Error adding comment' });

    // ✅ Insert comment notification
    const notifSql = `
      INSERT INTO notifications (user_id, type, from_user_id, post_id)
      VALUES ((SELECT user_id FROM posts WHERE id = ?), 'comment', ?, ?)
    `;
    db.query(notifSql, [post_id, user_id, post_id]);

    res.json({ message: 'Comment added' });
  });
});

// Get comments for a post
router.get('/comments/:post_id', (req, res) => {
  const { post_id } = req.params;
  const sql = `
    SELECT comments.*, users.username 
    FROM comments 
    JOIN users ON comments.user_id = users.id 
    WHERE comments.post_id = ? 
    ORDER BY comments.created_at DESC
  `;
  db.query(sql, [post_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching comments' });
    res.json(results);
  });
});

// Get like count
router.get('/likes/:post_id', (req, res) => {
  db.query('SELECT COUNT(*) AS likes FROM likes WHERE post_id = ?', [req.params.post_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
});

module.exports = router;

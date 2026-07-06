const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateUser = require('../middleware/auth');

// ✅ Create a new post (protected)
router.post('/', authenticateUser, async (req, res) => {
  const { content, image } = req.body;
  const userId = req.user?.id;

  console.log('📝 Creating Post');
  console.log('User ID:', userId);
  console.log('Content:', content);
  console.log('Image:', image);

  if (!userId || !content) {
    return res.status(400).json({ error: 'Missing user ID or content' });
  }

  try {
    await db.query(
      'INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)',
      [userId, content, image || null]
    );
    res.json({ message: 'Post created successfully' });
  } catch (err) {
    console.error('❌ DB Error:', err.message);
    res.status(500).json({ error: 'Failed to create post', details: err.message });
  }
});

// ✅ Get all posts (public)
router.get('/', async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT posts.*, users.username, users.profile_pic
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
    `);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// ✅ Like a post (protected)
router.post('/like/:postId', authenticateUser, async (req, res) => {
  const userId = req.user?.id;
  const postId = req.params.postId;

  try {
    await db.query('INSERT IGNORE INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId]);
    res.json({ message: 'Post liked' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// ✅ Comment on a post (protected)
router.post('/comment/:postId', authenticateUser, async (req, res) => {
  const { comment } = req.body;
  const userId = req.user?.id;
  const postId = req.params.postId;

  if (!comment) return res.status(400).json({ error: 'Comment cannot be empty' });

  try {
    await db.query('INSERT INTO comments (user_id, post_id, comment) VALUES (?, ?, ?)', [userId, postId, comment]);
    res.json({ message: 'Comment added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// ✅ Get comments for a post (public)
router.get('/comments/:postId', async (req, res) => {
  const postId = req.params.postId;

  try {
    const [comments] = await db.query(`
      SELECT comments.*, users.username
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE post_id = ?
      ORDER BY comments.created_at ASC
    `, [postId]);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// ✅ Save post (protected)
router.post('/save/:postId', authenticateUser, async (req, res) => {
  const userId = req.user?.id;
  const postId = req.params.postId;

  try {
    await db.query('INSERT IGNORE INTO saved_posts (user_id, post_id) VALUES (?, ?)', [userId, postId]);
    res.json({ message: 'Post saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save post' });
  }
});

// ✅ Unsave post (protected)
router.delete('/unsave/:postId', authenticateUser, async (req, res) => {
  const userId = req.user?.id;
  const postId = req.params.postId;

  try {
    await db.query('DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?', [userId, postId]);
    res.json({ message: 'Post unsaved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unsave post' });
  }
});

// ✅ Get saved posts (protected)
router.get('/saved', authenticateUser, async (req, res) => {
  const userId = req.user?.id;

  try {
    const [savedPosts] = await db.query(`
      SELECT posts.*, users.username, users.profile_pic
      FROM posts
      JOIN saved_posts ON posts.id = saved_posts.post_id
      JOIN users ON posts.user_id = users.id
      WHERE saved_posts.user_id = ?
      ORDER BY saved_posts.created_at DESC
    `, [userId]);

    res.json(savedPosts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved posts' });
  }
});

module.exports = router;

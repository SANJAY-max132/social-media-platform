const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3000;

// ✅ Middleware first
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.use('/uploads', express.static('public/uploads'));

// ✅ Routes after middleware
app.use('/api/auth', authRoutes);
app.use('/api/user', require('./routes/user'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/follow', require('./routes/follow'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/interactions', require('./routes/interactions'));
app.use('/api/posts', require('./routes/posts'));

// ✅ Other API routes
app.get('/api/search/users', (req, res) => {
  const q = req.query.q;
  db.query('SELECT id, username FROM users WHERE username LIKE ?', [`%${q}%`], (err, result) => {
    if (err) return res.status(500).json({ message: 'Search error' });
    res.json(result);
  });
});

app.get('/api/search/posts', (req, res) => {
  const q = req.query.q;
  const sql = `
    SELECT posts.*, users.username 
    FROM posts JOIN users ON posts.user_id = users.id
    WHERE posts.content LIKE ?
  `;
  db.query(sql, [`%${q}%`], (err, result) => {
    if (err) return res.status(500).json({ message: 'Search error' });
    res.json(result);
  });
});

app.get('/api/users', (req, res) => {
  db.query('SELECT id, username FROM users', (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch users' });
    res.json(result);
  });
});

app.get('/api/posts/user/:user_id', (req, res) => {
  db.query('SELECT * FROM posts WHERE user_id = ?', [req.params.user_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch user posts' });
    res.json(result);
  });
});

app.delete('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  db.query('DELETE FROM posts WHERE id = ?', [postId], (err) => {
    if (err) return res.status(500).json({ message: 'Delete failed' });
    res.json({ message: 'Post deleted' });
  });
});

app.put('/api/posts/:id', (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;
  db.query('UPDATE posts SET content = ? WHERE id = ?', [content, postId], (err) => {
    if (err) return res.status(500).json({ message: 'Update failed' });
    res.json({ message: 'Post updated' });
  });
});

app.get('/api/user/:id/stats', (req, res) => {
  const userId = req.params.id;
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM posts WHERE user_id = ?) AS postCount,
      (SELECT COUNT(*) FROM likes WHERE user_id = ?) AS likeCount,
      (SELECT COUNT(*) FROM comments WHERE user_id = ?) AS commentCount,
      (SELECT COUNT(*) FROM followers WHERE following_id = ?) AS followers,
      (SELECT COUNT(*) FROM followers WHERE follower_id = ?) AS following
  `;
  db.query(sql, [userId, userId, userId, userId, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Stats error' });
    res.json(result[0]);
  });
});

app.get('/api/notifications/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT n.*, u.username AS from_username 
    FROM notifications n 
    JOIN users u ON n.from_user_id = u.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT 20
  `;
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error fetching notifications' });
    res.json(result);
  });
});

app.get('/', (req, res) => {
  res.send('Social Media API is running');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

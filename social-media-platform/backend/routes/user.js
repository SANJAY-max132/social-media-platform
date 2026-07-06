const express = require('express');
const db = require('../db');
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const router = express.Router();
const authenticateUser = require('./auth');


// Image upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_images/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Update username
router.post('/update-name', (req, res) => {
  const { user_id, new_username } = req.body;
  const sql = 'UPDATE users SET username = ? WHERE id = ?';
  db.query(sql, [new_username, user_id], (err) => {
    if (err) return res.status(500).json({ message: 'Update failed' });
    res.json({ message: 'Username updated' });
  });
});

// Update password
router.post('/update-password', async (req, res) => {
  const { user_id, new_password } = req.body;
  const hashed = await bcrypt.hash(new_password, 10);
  const sql = 'UPDATE users SET password = ? WHERE id = ?';
  db.query(sql, [hashed, user_id], (err) => {
    if (err) return res.status(500).json({ message: 'Update failed' });
    res.json({ message: 'Password updated' });
  });
});

// Upload profile image
router.post('/update-profile-image', upload.single('image'), (req, res) => {
  const { user_id } = req.body;
  const imageUrl = req.file.filename;
  const sql = 'UPDATE users SET profile_image = ? WHERE id = ?';
  db.query(sql, [imageUrl, user_id], (err) => {
    if (err) return res.status(500).json({ message: 'Image update failed' });
    res.json({ message: 'Profile image updated', image: imageUrl });
  });
});

// Get single user's profile by ID
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT id, username, profile_image FROM users WHERE id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result[0]);
  });
});

// Update user profile
router.put('/edit', authenticateUser, async (req, res) => {
  const { username, password, profile_pic } = req.body;
  const userId = req.user.id;

  try {
    let updateQuery = 'UPDATE users SET';
    const updateValues = [];

    if (username) {
      updateQuery += ' username = ?,';
      updateValues.push(username);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ' password = ?,';
      updateValues.push(hashedPassword);
    }

    if (profile_pic) {
      updateQuery += ' profile_pic = ?,';
      updateValues.push(profile_pic);
    }

    // remove trailing comma
    updateQuery = updateQuery.replace(/,$/, '');
    updateQuery += ' WHERE id = ?';
    updateValues.push(userId);

    await db.query(updateQuery, updateValues);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;

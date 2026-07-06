const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// ✅ SINGLE UPDATE ROUTE
router.put('/edit/:id', upload.single('profile_pic'), (req, res) => {
  const userId = req.params.id;
  const { username, password } = req.body;
  const profilePic = req.file ? `/uploads/${req.file.filename}` : null;

  const updates = [];
  const values = [];

  if (username) {
    updates.push('username = ?');
    values.push(username);
  }

  if (password) {
    updates.push('password = ?');
    values.push(password);
  }

  if (profilePic) {
    updates.push('profile_img = ?');
    values.push(profilePic);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No data to update' });
  }

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  values.push(userId);

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Profile updated successfully' });
  });
});

module.exports = router;

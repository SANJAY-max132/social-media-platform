const express = require("express");
const db = require("../db");

const router = express.Router();

// Create a comment
router.post("/", (req, res) => {
  const { post_id, user_id, content } = req.body;

  const sql = "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)";
  db.query(sql, [post_id, user_id, content], (err) => {
    if (err) return res.status(500).json({ message: "Failed to post comment" });

    res.json({ message: "Comment added" });
  });
});

// Get comments for a post
router.get("/:postId", (req, res) => {
  const postId = req.params.postId;

  const sql = `
    SELECT comments.*, users.username, users.profile_img
    FROM comments
    JOIN users ON comments.user_id = users.id
    WHERE comments.post_id = ?
    ORDER BY comments.created_at ASC
  `;

  db.query(sql, [postId], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to load comments" });

    res.json(result);
  });
});

module.exports = router;

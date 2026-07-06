// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

 jwt.verify(token, 'secretkey', (err, user) => {
  if (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
console.log("Decoded token:", user); // Should be { id: 1 }

  console.log('🔐 Decoded user:', user); // This should show: { id: 1 }

  if (!user.id) {
    return res.status(401).json({ message: 'Token payload missing user id' });
  }

  req.user = user;
  next();
});

};

module.exports = authenticateUser;

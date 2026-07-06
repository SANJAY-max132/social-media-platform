// backend/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // your MySQL username
  password: 'Sancruzz@56',        // your MySQL password
  database: 'social_media'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err);
  } else {
    console.log('Connected to MySQL database.');
  }
});

module.exports = db;

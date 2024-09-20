// module.exports = User;
const connection = require('../config/db'); // Your MySQL database connection

const User = {
  // Create a new user
  create: (data, callback) => {
    const query = 'INSERT INTO users SET ?';
    connection.query(query, data, callback);
  },

  // Find user by email
  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], callback);
  },

  // Get all users
  getAll: (callback) => {
    const query = 'SELECT id, name, email, last_login_time, status,registration_time FROM users';
    connection.query(query, [], callback);
  },

  // Find user by ID
  findById: (id, callback) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    connection.query(query, [id], callback);
  },

  // Update user status
  updateStatus: (id, status, callback) => {
    const query = 'UPDATE users SET status = ? WHERE id = ?';
    connection.query(query, [status, id], callback);
  },

  // Delete user by ID
  delete: (id, callback) => {
    const query = 'DELETE FROM users WHERE id = ?';
    connection.query(query, [id], callback);
  },

  // Update last login time
  updateLoginTime: (email, date, callback) => {
    const query = 'UPDATE users SET last_login_time = ? WHERE email = ?';
    connection.query(query, [date, email], callback);
  },
};

module.exports = User;

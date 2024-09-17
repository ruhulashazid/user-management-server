const connection = require('../config/db');

const User = {
    create: (userData, callback) => {
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        connection.execute(query, [userData.name, userData.email, userData.password], callback);
    },
    findByEmail: (email, callback) => {
        const query = 'SELECT * FROM users WHERE email = ? AND status = "active"';
        connection.execute(query, [email], callback);
    },
    
    getAll: (callback) => {
        const query = 'SELECT id, name, email, registration_time, last_login_time, status FROM users';
        connection.execute(query, [], callback);
    },
    updateLoginTime: (email, date, callback) => {
        console.log(date, email)
        const query = 'UPDATE users SET last_login_time = ? WHERE email = ?';
        connection.execute(query, [date, email], callback);
    },
    updateStatus: (id, status, callback) => {
        const query = 'UPDATE users SET status = ? WHERE id = ?';
        connection.execute(query, [status, id], callback);
    },
    delete: (id, callback) => {
        const query = 'DELETE FROM users WHERE id = ?';
        connection.execute(query, [id], callback);
    },
};

module.exports = User;

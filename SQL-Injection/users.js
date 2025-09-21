const crypto = require('crypto');
const bcrypt = require('bcrypt');

function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

module.exports = function (db) {
    const users = [
        {
            username: 'admin',
            // bcrypt, cost 10
            password: '$2b$10$72xqYjFN/AzGzRU0PZCp5u0mKtk/OI8MLMFYmpzkhwG5SFcIWl8EO',
            role: 'admin'
        },
        {
            username: 'security_expert',
            // bcrypt, cost 10
            password: '$2b$10$vMIOyJ3LxoKlquPwgeYVROi5yLsAh4O3oDE7IcAfrUft2UNeDlnUm',
            role: 'admin'
        },
        {
            username: 'secure_admin',
            // bcrypt, cost 10
            password: '$2b$10$H68ohT9CJVWByWoMxDKP6eeoixDZm7IQ1jbZciQc90XJiOcEkJtji',
            role: 'admin'
        },
        {
            username: 'bob_smith',
            // bcrypt, cost 10
            password: '$2b$10$LCZztrFI./k/b3jzrdecoORHp8aGSSU/M..zlmlaFGRihiPizusUi',
            role: 'member'
        },
        {
            username: 'dev_ops',
            // bcrypt, cost 10
            password: '$2b$10$.R8OuGbYqDK4tNJfBcKEGOhS12FvXtJd3xFcV/VpfF/7xBfKsNzv.',
            role: 'member'
        },
        {
            username: 'user1',
            // MD5 (legacy)
            password: '482c811da5d5b4bc6d497ffa98491e38',
            role: 'member'
        },
        {
            username: 'john_doe',
            // MD5 (legacy)
            password: '0d107d09f5bbe40cade3de5c71e9e9b7',
            role: 'member'
        },
        {
            username: 'alice',
            // MD5 (legacy)
            password: '0571749e2ac330a7455809c6b0e7af90',
            role: 'member'
        },
        {
            username: 'test_user',
            // MD5 (legacy)
            password: 'd8578edf8458ce06fbc5bb76a58c5ca4',
            role: 'member'
        },
        {
            username: 'cyber_student',
            // MD5 (legacy)
            password: '4e4316df8886f1bc822cd06e0a55a72e',
            role: 'member'
        },
        {
            username: 'alice_w',
            // MD5 (legacy)
            password: '8908ce6086a2c6c3ea44b88dae72e255',
            role: 'member'
        },
        {
            username: 'traveler',
            // MD5 (legacy)
            password: '78353b0a2755ea9e052e5379032c4b6e',
            role: 'member'
        },
        {
            username: 'newsletter_reader',
            // MD5 (legacy)
            password: '9e438d8a7b036ea9b8d4375377d47e1a',
            role: 'member'
        },
        {
            username: 'blue_sky',
            // bcrypt, cost 10
            password: '$2b$10$uJVLUMdjvPN.ZqGEAiyi/uJKQTzNRzFwFHiHrrJ.NWvZQh41zYnDy',
            role: 'member'
        },
        {
            username: 'coffee_lover',
            // MD5 (legacy)
            password: '8908ce6086a2c6c3ea44b88dae72e255',
            role: 'member'
        },
        {
            username: 'analyst_2024',
            // MD5 (legacy)
            password: '8a24367a1f46c141048752f2d5bbd14b',
            role: 'member'
        }
    ];

    db.serialize(() => {
        db.run('DROP TABLE IF EXISTS users', [], (err) => {
            if (err) {
                console.error('Error dropping users table:', err);
                return;
            }

            db.run(`
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    password TEXT,
                    role TEXT
                )
            `, [], (err) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    return;
                }

                const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
                users.forEach(user => {
                    stmt.run(user.username, user.password, user.role);
                });
                stmt.finalize();

                console.log('Database initialized with users');
                console.log('Weak passwords (MD5) can be cracked at https://crackstation.net/');
                console.log('Strong passwords (bcrypt) are secure');
            });
        });
    });
};
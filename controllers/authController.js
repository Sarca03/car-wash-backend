const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// POST /api/auth/register
exports.register = async (req, res) => {
  // Javna registracija je zatvorena: svaki nalog bi mogao da menja zajedničke
  // podatke. Uključuje se samo privremeno, sa ALLOW_REGISTER=true na serveru.
  if (process.env.ALLOW_REGISTER !== 'true') {
    return res.status(403).json({ error: 'Registracija nije dostupna' });
  }

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Sva polja su obavezna' });
    }

    const existing = await pool.query(
      'SELECT user_id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Korisnik već postoji' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, username, email, role, created_at`,
      [username, email, password_hash, 'worker']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Greška u register:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Korisničko ime i lozinka su obavezni' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Pogrešno korisničko ime ili lozinka' });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Pogrešno korisničko ime ili lozinka' });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Greška u login:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, username, email, role, created_at FROM users WHERE user_id = $1',
      [req.user.user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Greška u me:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};
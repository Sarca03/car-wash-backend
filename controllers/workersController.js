const pool = require('../config/db');

// GET /api/workers
exports.getAllWorkers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM workers ORDER BY worker_id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Greška u getAllWorkers:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// GET /api/workers/:id
exports.getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM workers WHERE worker_id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Radnik nije pronađen' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Greška u getWorkerById:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// POST /api/workers
exports.createWorker = async (req, res) => {
  try {
    const { full_name, phone, position, hire_date } = req.body;

    if (!full_name || !phone || !position) {
      return res.status(400).json({ error: 'Ime, telefon i pozicija su obavezni' });
    }

    const result = await pool.query(
      `INSERT INTO workers (full_name, phone, position, hire_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [full_name, phone, position, hire_date || new Date()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Greška u createWorker:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// PUT /api/workers/:id
exports.updateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, position, hire_date } = req.body;

    const result = await pool.query(
      `UPDATE workers
       SET full_name = $1, phone = $2, position = $3, hire_date = $4
       WHERE worker_id = $5
       RETURNING *`,
      [full_name, phone, position, hire_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Radnik nije pronađen' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Greška u updateWorker:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// DELETE /api/workers/:id
exports.deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM workers WHERE worker_id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Radnik nije pronađen' });
    }
    res.json({ message: 'Radnik obrisan', deleted: result.rows[0] });
  } catch (err) {
    console.error('Greška u deleteWorker:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};
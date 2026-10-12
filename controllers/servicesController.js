const pool = require('../config/db');

// GET /api/services
exports.getAllServices = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services ORDER BY category, service_name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Greška u getAllServices:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// GET /api/services/:id
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM services WHERE service_id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usluga nije pronađena' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Greška u getServiceById:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// POST /api/services
exports.createService = async (req, res) => {
  try {
    const { category, service_name, description, price, duration_minutes } = req.body;

    if (!category || !service_name || !price || !duration_minutes) {
      return res.status(400).json({ error: 'Sva polja su obavezna' });
    }

    const result = await pool.query(
      `INSERT INTO services (category, service_name, description, price, duration_minutes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [category, service_name, description || null, price, duration_minutes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Greška u createService:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// PUT /api/services/:id
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, service_name, description, price, duration_minutes } = req.body;

    const result = await pool.query(
      `UPDATE services
       SET category = $1, service_name = $2, description = $3, price = $4, duration_minutes = $5
       WHERE service_id = $6
       RETURNING *`,
      [category, service_name, description || null, price, duration_minutes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usluga nije pronađena' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Greška u updateService:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// DELETE /api/services/:id
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM services WHERE service_id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usluga nije pronađena' });
    }
    res.json({ message: 'Usluga obrisana', deleted: result.rows[0] });
  } catch (err) {
    // 23503: usluga se koristi u nekom terminu
    if (err.code === '23503') {
      return res.status(409).json({ error: 'Usluga se koristi u terminima i ne može da se obriše' });
    }
    console.error('Greška u deleteService:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};
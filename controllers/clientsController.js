const pool = require('../config/db');

// GET /api/clients: svi klijenti sa brojem vozila
exports.getAllClients = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.client_id,
        c.full_name,
        c.phone,
        c.email,
        c.created_at,
        COUNT(v.vehicle_id) AS vehicle_count
      FROM clients c
      LEFT JOIN vehicles v ON c.client_id = v.client_id
      GROUP BY c.client_id
      ORDER BY c.client_id DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Greška u getAllClients:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// GET /api/clients/:id
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM clients WHERE client_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Klijent nije pronađen' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Greška u getClientById:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// POST /api/clients
exports.createClient = async (req, res) => {
  try {
    const { full_name, phone, email } = req.body;

    if (!full_name || !phone) {
      return res.status(400).json({ error: 'Ime i telefon su obavezni' });
    }

    const result = await pool.query(
      `INSERT INTO clients (full_name, phone, email)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [full_name, phone, email || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Greška u createClient:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// PUT /api/clients/:id
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, email } = req.body;

    const result = await pool.query(
      `UPDATE clients
       SET full_name = $1, phone = $2, email = $3
       WHERE client_id = $4
       RETURNING *`,
      [full_name, phone, email || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Klijent nije pronađen' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Greška u updateClient:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// DELETE /api/clients/:id
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM clients WHERE client_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Klijent nije pronađen' });
    }

    res.json({ message: 'Klijent obrisan', deleted: result.rows[0] });
  } catch (err) {
    console.error('Greška u deleteClient:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};
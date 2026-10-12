const pool = require('../config/db');

// GET /api/vehicles: sva vozila sa imenom klijenta
exports.getAllVehicles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.client_id,
        v.brand,
        v.model,
        v.license_plate,
        v.vehicle_type,
        c.full_name AS owner_name,
        c.phone AS owner_phone
      FROM vehicles v
      LEFT JOIN clients c ON v.client_id = c.client_id
      ORDER BY v.vehicle_id DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Greška u getAllVehicles:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// GET /api/vehicles/:id
exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM vehicles WHERE vehicle_id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vozilo nije pronađeno' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Greška u getVehicleById:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// GET /api/vehicles/client/:clientId: sva vozila jednog klijenta
exports.getVehiclesByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const result = await pool.query(
      'SELECT * FROM vehicles WHERE client_id = $1 ORDER BY vehicle_id DESC',
      [clientId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Greška u getVehiclesByClient:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// POST /api/vehicles
exports.createVehicle = async (req, res) => {
  try {
    const { client_id, brand, model, license_plate, vehicle_type } = req.body;

    if (!brand || !model || !license_plate || !vehicle_type) {
      return res.status(400).json({ error: 'Sva polja su obavezna' });
    }

    const result = await pool.query(
      `INSERT INTO vehicles (client_id, brand, model, license_plate, vehicle_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [client_id || null, brand, model, license_plate, vehicle_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Greška u createVehicle:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// PUT /api/vehicles/:id
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id, brand, model, license_plate, vehicle_type } = req.body;

    const result = await pool.query(
      `UPDATE vehicles
       SET client_id = $1, brand = $2, model = $3, license_plate = $4, vehicle_type = $5
       WHERE vehicle_id = $6
       RETURNING *`,
      [client_id || null, brand, model, license_plate, vehicle_type, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vozilo nije pronađeno' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Greška u updateVehicle:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// DELETE /api/vehicles/:id
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM vehicles WHERE vehicle_id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vozilo nije pronađeno' });
    }
    res.json({ message: 'Vozilo obrisano', deleted: result.rows[0] });
  } catch (err) {
    console.error('Greška u deleteVehicle:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};
const pool = require('../config/db');

// GET /api/appointments: svi termini sa klijentom, vozilom, uslugom i radnikom
exports.getAllAppointments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.appointment_id,
        a.appointment_time,
        a.status,
        a.total_price,
        a.created_at,
        a.client_id,
        a.vehicle_id,
        a.service_id,
        a.worker_id,
        c.full_name AS client_name,
        c.phone AS client_phone,
        CONCAT(v.brand, ' ', v.model) AS vehicle,
        v.license_plate,
        v.vehicle_type,
        s.service_name,
        s.category AS service_category,
        s.duration_minutes,
        w.full_name AS worker_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.client_id
      LEFT JOIN vehicles v ON a.vehicle_id = v.vehicle_id
      LEFT JOIN services s ON a.service_id = s.service_id
      LEFT JOIN workers w ON a.worker_id = w.worker_id
      ORDER BY a.appointment_time DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Greška u getAllAppointments:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// GET /api/appointments/:id
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        a.*,
        c.full_name AS client_name,
        c.phone AS client_phone,
        c.email AS client_email,
        v.brand,
        v.model,
        v.license_plate,
        v.vehicle_type,
        s.service_name,
        s.price AS service_price,
        w.full_name AS worker_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.client_id
      LEFT JOIN vehicles v ON a.vehicle_id = v.vehicle_id
      LEFT JOIN services s ON a.service_id = s.service_id
      LEFT JOIN workers w ON a.worker_id = w.worker_id
      WHERE a.appointment_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Termin nije pronađen' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Greška u getAppointmentById:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// GET /api/appointments/stats: brojevi za pregled
exports.getStats = async (req, res) => {
  try {
    // Ukupan broj termina
    const totalAppointments = await pool.query(
      'SELECT COUNT(*) FROM appointments'
    );

    // Broj termina po statusu
    const byStatus = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM appointments
      GROUP BY status
    `);

    // Prihod (samo Completed termini)
    const revenue = await pool.query(`
      SELECT COALESCE(SUM(total_price), 0) AS total
      FROM appointments
      WHERE status = 'Completed'
    `);

    // Termini danas
    const today = await pool.query(`
      SELECT COUNT(*) AS count
      FROM appointments
      WHERE DATE(appointment_time) = CURRENT_DATE
    `);

    // Ukupno klijenata
    const clientsCount = await pool.query(
      'SELECT COUNT(*) FROM clients'
    );

    res.json({
      total_appointments: parseInt(totalAppointments.rows[0].count),
      by_status: byStatus.rows,
      total_revenue: parseFloat(revenue.rows[0].total),
      appointments_today: parseInt(today.rows[0].count),
      total_clients: parseInt(clientsCount.rows[0].count),
    });
  } catch (err) {
    console.error('Greška u getStats:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const {
      client_id,
      vehicle_id,
      service_id,
      worker_id,
      appointment_time,
      total_price,
      status
    } = req.body;

    // Validacija obaveznih polja
    if (!client_id || !vehicle_id || !service_id || !worker_id || !appointment_time) {
      return res.status(400).json({
        error: 'Klijent, vozilo, usluga, radnik i vreme su obavezni'
      });
    }

    // Ako total_price nije poslat, uzmi cenu usluge
    let finalPrice = total_price;
    if (finalPrice === undefined || finalPrice === null || finalPrice === '') {
      const serviceResult = await pool.query(
        'SELECT price FROM services WHERE service_id = $1',
        [service_id]
      );
      if (serviceResult.rows.length > 0) {
        finalPrice = serviceResult.rows[0].price;
      }
    }

    const result = await pool.query(
      `INSERT INTO appointments 
        (client_id, vehicle_id, service_id, worker_id, appointment_time, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        client_id,
        vehicle_id,
        service_id,
        worker_id,
        appointment_time,
        finalPrice,
        status || 'Pending'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Greška u createAppointment:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// PUT /api/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      client_id,
      vehicle_id,
      service_id,
      worker_id,
      appointment_time,
      total_price,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE appointments
       SET client_id = $1,
           vehicle_id = $2,
           service_id = $3,
           worker_id = $4,
           appointment_time = $5,
           total_price = $6,
           status = $7
       WHERE appointment_id = $8
       RETURNING *`,
      [
        client_id,
        vehicle_id,
        service_id,
        worker_id,
        appointment_time,
        total_price,
        status,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Termin nije pronađen' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Greška u updateAppointment:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// PATCH /api/appointments/:id/status: samo status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // U bazi su statusi na engleskom, u aplikaciji se prikazuju na srpskom
    const statusLabels = {
      Pending: 'na čekanju',
      Confirmed: 'potvrđen',
      Completed: 'završen',
      Cancelled: 'otkazan',
    };
    if (!Object.keys(statusLabels).includes(status)) {
      return res.status(400).json({
        error: `Status mora biti jedan od: ${Object.values(statusLabels).join(', ')}`
      });
    }

    const result = await pool.query(
      'UPDATE appointments SET status = $1 WHERE appointment_id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Termin nije pronađen' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Greška u updateStatus:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM appointments WHERE appointment_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Termin nije pronađen' });
    }
    res.json({ message: 'Termin obrisan', deleted: result.rows[0] });
  } catch (err) {
    console.error('Greška u deleteAppointment:', err.message);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};
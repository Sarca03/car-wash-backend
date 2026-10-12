const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const poolConfig = isProduction
  ? {
      // Produkcija (Neon/Render): koristi jedan connection string
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      // Lokalno: individualne varijable
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Greška pri povezivanju na bazu:', err.message);
    return;
  }
  console.log('Povezan na PostgreSQL bazu');
  release();
});

module.exports = pool;
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.attendance (
      id SERIAL PRIMARY KEY,
      company TEXT NOT NULL,
      name TEXT NOT NULL,
      kehadiran INT NOT NULL,
      tiket TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

module.exports = { pool, ensureTable };
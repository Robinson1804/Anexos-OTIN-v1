import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:gVjjcgIpenOccwTXXZyOMXAnodthjSgX@maglev.proxy.rlwy.net:48016/railway';

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function runSeed() {
  console.log('Connecting to Railway Postgres...');
  const client = await pool.connect();
  console.log('Connected!');

  const sql = readFileSync(join(__dirname, 'seed.sql'), 'utf-8');

  try {
    await client.query(sql);
    console.log('Seed executed successfully!');
  } catch (err) {
    console.error('Error executing seed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();

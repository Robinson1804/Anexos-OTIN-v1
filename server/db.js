import pg from 'pg';
const { Pool } = pg;

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false })
  : new Pool({ host: 'localhost', port: 5432, user: 'postgres', password: '1234', database: 'sasi_inei' });

export default pool;

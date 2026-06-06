import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

const pool = new Pool(config.db);

pool.on('error', (err) => console.error('[DB] Unexpected pool error:', err.message));

export const query = (text, params) => pool.query(text, params);

export default pool;

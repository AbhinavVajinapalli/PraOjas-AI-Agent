import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

/**
 * Returns true if all required PostgreSQL environment variables are set.
 * The database is optional for local development — the app runs without it
 * (patient data is held in-memory only).
 */
export const isDbConfigured = (): boolean => {
  return !!(
    process.env.SQL_HOST &&
    process.env.SQL_USER &&
    process.env.SQL_PASSWORD &&
    process.env.SQL_DB_NAME
  );
};

/**
 * Lazily creates and returns the database pool + Drizzle instance.
 * Returns null if DB env vars are not configured.
 */
let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export const getDb = () => {
  if (!isDbConfigured()) {
    return null;
  }
  if (!_db) {
    _pool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      connectionTimeoutMillis: 15000,
    });
    _pool.on('error', (err) => {
      console.error('[DB] Unexpected error on idle SQL pool client:', err);
    });
    _db = drizzle(_pool, { schema });
    console.log('[DB] PostgreSQL pool connected.');
  }
  return _db;
};

// Named export for backward compatibility with server.ts
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = getDb();
    if (!instance) return undefined;
    return (instance as any)[prop];
  },
});

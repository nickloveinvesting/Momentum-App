/**
 * Database Configuration
 * PostgreSQL connection pool and query helpers
 */

import { Pool, QueryResult, QueryResultRow, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Get PostgreSQL pool configuration
 * Prioritizes DATABASE_URL (Vercel/Supabase) over individual DB_* variables (local dev)
 */
const getPoolConfig = (): PoolConfig => {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    console.log('📡 Using DATABASE_URL connection (Vercel/Supabase)');
    return {
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: { rejectUnauthorized: false }, // Supabase requirement
    };
  }

  console.log('📡 Using individual DB_* environment variables (Local Dev)');
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'momentum',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error if connection takes longer than 2 seconds
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
};

// Create PostgreSQL connection pool
export const pool = new Pool(getPoolConfig());

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', err => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Execute a query with parameters
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log(`Query executed in ${duration}ms:`, {
      text,
      rows: result.rowCount,
    });
    return result;
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
}

/**
 * Execute a transaction with multiple queries
 */
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Close database connection pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('Database pool closed');
}

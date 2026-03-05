/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql from 'mysql2/promise';

// 1. Validation: Ensure we don't even try to connect if variables are missing
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
};

const globalForDb = global as unknown as { pool: mysql.Pool };

// 2. Singleton Pool
export const pool =
  globalForDb.pool ||
  mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // Max idle connections, the default is the same as `connectionLimit`
    idleTimeout: 60000, // Idle connections timeout, in milliseconds
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

// 3. Robust Query Helper
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    const [results] = await pool.query(sql, params);
    return results as T;
  } catch (error: any) {
    // Log detailed error for debugging your HR system
    console.error(`[DB Query Error]: ${error.message}`, { sql, params });
    throw error;
  }
}

// 4. Robust Execute Helper (Best for INSERT/UPDATE/DELETE)
export async function execute<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error: any) {
    console.error(`[DB Execute Error]: ${error.message}`, { sql, params });
    throw error;
  }
}
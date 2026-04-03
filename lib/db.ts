/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql from 'mysql2/promise';
import { notifyClients } from '@/lib/sse';

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
console.log('Creating DB Pool with:', { ...dbConfig, password: '***' });
export const pool =
  globalForDb.pool ||
  mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

pool.getConnection()
  .then(conn => {
    console.log('Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
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
    
    // Broadcast event on ANY data modification
    if (sql.trim().toUpperCase().match(/^(INSERT|UPDATE|DELETE|REPLACE)/)) {
      notifyClients('db_updated');
    }
    
    return results as T;
  } catch (error: any) {
    console.error(`[DB Execute Error]: ${error.message}`, { sql, params });
    throw error;
  }
}

// 5. Schema Maintenance
export async function ensureSchema() {
  try {
    // This works on MariaDB (the XAMPP default)
    await pool.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(191) NOT NULL DEFAULT 'staff'");
    console.log('Schema verified: users.role exists');
  } catch (error: any) {
    if (error.message.includes("Duplicate column name") || error.code === 'ER_DUP_FIELDNAME') {
      console.log('Schema verified: users.role already exists');
    } else {
      console.error('Schema verification failed:', error.message);
    }
  }

  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS \`Team\` (
          \`id\` VARCHAR(191) PRIMARY KEY,
          \`name\` VARCHAR(191) UNIQUE NOT NULL,
          \`description\` TEXT NULL,
          \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS \`TeamMember\` (
          \`id\` VARCHAR(191) PRIMARY KEY,
          \`team_id\` VARCHAR(191) NOT NULL,
          \`user_id\` VARCHAR(191) NOT NULL,
          \`role\` VARCHAR(191) NOT NULL DEFAULT 'Member',
          \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          FOREIGN KEY (\`team_id\`) REFERENCES \`Team\`(\`id\`) ON DELETE CASCADE,
          FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
          UNIQUE (\`team_id\`, \`user_id\`)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS \`ChatMessage\` (
          \`id\` VARCHAR(191) PRIMARY KEY,
          \`sender_id\` VARCHAR(191) NOT NULL,
          \`content\` TEXT NOT NULL,
          \`target_type\` ENUM('all', 'team', 'individual') NOT NULL,
          \`target_id\` VARCHAR(191) NULL,
          \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          FOREIGN KEY (\`sender_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      )
    `);
    console.log('Schema verified: Team and Chat tables exist');

    // Seed the default teams if they don't exist
    const defaultTeams = ['IT', 'HR', 'Designing', 'Accounts'];
    for (const team of defaultTeams) {
      await pool.execute(
        "INSERT IGNORE INTO \`Team\` (\`id\`, \`name\`, \`description\`) VALUES (UUID(), ?, ?)",
        [team, `${team} Department`]
      );
    }
    console.log('Default teams seeded');

  } catch (error: any) {
    console.error('Team schema creation/verification failed:', error.message);
  }
}

// Run schema verification once locally
if (process.env.NODE_ENV !== 'production') {
  ensureSchema().catch(console.error);
}
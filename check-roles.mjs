import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function run() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const env = {};
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });

  const dbConfig = {
    host: env.DB_HOST || '127.0.0.1',
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'hr_management',
    port: Number(env.DB_PORT) || 3306,
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT DISTINCT role FROM users');
    console.log("Distinct roles:", rows);
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();

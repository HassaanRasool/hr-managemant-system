import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Reusable names for generating users
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Donald', 'Sandra', 'Mark', 'Ashley', 'Paul', 'Dorothy', 'Steven', 'Kimberly', 'Andrew', 'Emily', 'Kenneth', 'Donna', 'Joshua', 'Michelle', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Rebecca', 'Timothy', 'Melissa', 'Ronald', 'Laura', 'Edward', 'Stephanie', 'Jason', 'Sharon', 'Jeffrey', 'Helen', 'Ryan', 'Victoria'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes'];
// 4 standard departments/teams we've got
const departments = ['IT', 'HR', 'Designing', 'Accounts'];
const positions = {
  'IT': ['Software Engineer', 'SysAdmin', 'QA Tester', 'DevOps Engineer'],
  'HR': ['Recruiter', 'HR Generalist', 'Payroll Specialist', 'HR Manager'],
  'Designing': ['UI Designer', 'UX Researcher', 'Graphic Designer', 'Art Director'],
  'Accounts': ['Accountant', 'Financial Analyst', 'Bookkeeper', 'Finance Manager']
};

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

  console.log('Connecting to database...', { host: dbConfig.host, database: dbConfig.database });

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected!');

    // Get Teams
    const [teamRows] = await connection.execute('SELECT id, name FROM Team');
    const teams = {};
    for (const row of teamRows) {
        teams[row.name] = row.id;
    }
    
    // Fallback if teams somehow don't exist
    if (Object.keys(teams).length === 0) {
      console.error("No teams found! Please ensure default teams are seeded first.");
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash('password123', 10);
    const numUsers = 60;
    
    console.log(`Generating ${numUsers} dummy members...`);

    let addedCount = 0;
    for (let i = 0; i < numUsers; i++) {
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@dummycompany.com`;
      const department = departments[Math.floor(Math.random() * departments.length)];
      const deptPositions = positions[department];
      const position = deptPositions[Math.floor(Math.random() * deptPositions.length)];
      
      const userId = crypto.randomUUID();
      const employeeId = `DUMMY-${1000 + i}`;
      const phone = `555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const basicSalary = Math.floor(Math.random() * 60000) + 40000;
      
      try {
          // 1. Create `users` record
          await connection.execute(
            'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
            [userId, email, passwordHash, `${fName} ${lName}`, 'staff']
          );

          // 2. Create `Employee` record
          await connection.execute(
            'INSERT INTO Employee (id, employee_id, first_name, last_name, email, phone, position, department, manager, start_date, basic_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [crypto.randomUUID(), employeeId, fName, lName, email, phone, position, department, 'Admin', new Date(), basicSalary, 'Active']
          );

          // 3. Add to `TeamMember` based on their department
          const teamId = teams[department];
          if (teamId) {
             const role = position.includes('Manager') || position.includes('Director') ? 'Lead' : 'Member';
             await connection.execute(
               'INSERT INTO TeamMember (id, team_id, user_id, role) VALUES (?, ?, ?, ?)',
               [crypto.randomUUID(), teamId, userId, role]
             );
          }
          addedCount++;
          if (addedCount % 10 === 0) console.log(`Added ${addedCount} members...`);
      } catch (err) {
          // Ignore duplicate emails or other collision errors to let the script finish
          console.error(`Failed pushing user ${email}:`, err.message);
      }
    }

    console.log(`\nSuccessfully seeded ${addedCount} dummy members into the Database, linked across 'users', 'Employee', and 'TeamMember' tables!`);

  } catch (err) {
    console.error('Core Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

run();

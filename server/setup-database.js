const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dbstatistics',
  multipleStatements: true // Allow multiple SQL statements in one query
};

// SQL files to execute in order
// const sqlFiles = [
//   'new1.sql',
//   'new2.sql',
//   'new3.sql',
//   'new4.sql',
//   'new5.sql',
//   'new6.sql'
// ];

const sqlFiles = [

// 'create_new_menus_tables.sql'
  'new3.sql',
  // 'new4.sql',
];

async function setupDatabase() {
  let connection;
  try {
    // Create database connection
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Process each SQL file
    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, file);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: SQL file not found: ${file}`);
        continue;
      }
      
      console.log(`Executing SQL file: ${file}`);
      
      // Read SQL file content
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      // Split SQL content into individual statements
      const statements = sqlContent
        .replace(/--.*$/gm, '') // Remove SQL comments
        .split(';')
        .filter(statement => statement.trim().length > 0);
      
      // Execute each statement separately
      for (const statement of statements) {
        try {
          await connection.execute(statement);
        } catch (err) {
          console.error(`Error executing statement from ${file}:`, err.message);
          console.error('Statement:', statement);
        }
      }
      
      console.log(`Successfully executed: ${file}`);
    }
    
    console.log('Database setup completed successfully!');
    
  } catch (err) {
    console.error('Database setup failed:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupDatabase(); 
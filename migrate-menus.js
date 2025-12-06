const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Prisma migration for menu tables...');

// Run Prisma migration
try {
  // Generate migration
  console.log('Generating Prisma migration...');
  execSync('npx prisma migrate dev --name add_menu_tables', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('Migration completed successfully');
  
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('Prisma client generated successfully');
  console.log('Menu tables have been added to the database');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
} 
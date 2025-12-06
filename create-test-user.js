const { PrismaClient } = require('@prisma/client');
const { encrypt } = require('./util');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Encrypt the password "1111"
    const encryptedPassword = encrypt('1111');
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        user_id: 'test'
      }
    });
    
    if (existingUser) {
      console.log('Test user already exists, updating password...');
      
      // Update the user
      await prisma.user.update({
        where: {
          user_id: 'test'
        },
        data: {
          user_pwd: encryptedPassword
        }
      });
      
      console.log('Test user password updated successfully!');
    } else {
      // Create the test user
      const newUser = await prisma.user.create({
        data: {
          user_id: 'test',
          user_name: 'Test User',
          user_pwd: encryptedPassword,
          value: '1'
        }
      });
      
      console.log('Test user created successfully!');
    }
    
    console.log('You can now login with:');
    console.log('ID: test');
    console.log('Password: 1111');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 
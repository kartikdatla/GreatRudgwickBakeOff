require('dotenv').config();
const { User } = require('../models/User');
const db = require('../config/database');

async function createAdmin() {
  console.log('\n🎂 Great Rudgwick Bake Off - Creating Default Admin User\n');

  const email = 'admin@bakeoff.com';
  const name = 'Admin User';
  const password = 'admin123';

  try {
    const user = await User.create(email, password, name, 'Admin');

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password: admin123`);
    console.log('\n⚠️  Please change the password after first login!\n');

  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.log('ℹ️  Admin user already exists.');
      console.log('   Email: admin@bakeoff.com');
      console.log('   Password: admin123\n');
    } else {
      console.error('\n❌ Error creating admin user:', error.message, '\n');
    }
  } finally {
    db.close();
    process.exit(0);
  }
}

createAdmin();

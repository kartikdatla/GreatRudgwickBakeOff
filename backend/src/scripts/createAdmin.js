const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { User } = require('../models/User');
const db = require('../config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('\n🎂 Great Rudgwick Bake Off - Create Admin User\n');

  try {
    const email = await question('Admin email: ');
    const name = await question('Admin name: ');
    const password = await question('Admin password: ');

    const user = await User.create(email, password, name, 'Admin');

    console.log('\n✅ Admin user created successfully!');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}\n`);

  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.error('\n❌ Error: A user with this email already exists.\n');
    } else {
      console.error('\n❌ Error creating admin user:', error.message, '\n');
    }
  } finally {
    rl.close();
    db.close();
    process.exit(0);
  }
}

createAdmin();

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const userId = '699ee7446b1300f6181f5394';
  
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
  const user = await User.findById(userId);
  
  console.log('User exists:', !!user);
  if (user) {
    console.log('User:', user.toObject());
  } else {
    console.log('User not found with ID:', userId);
    
    // Check all users
    const allUsers = await User.find({}).limit(5);
    console.log('\nFirst 5 users in database:');
    allUsers.forEach(u => {
      console.log(`  - ${u._id} | ${u.email} | ${u.name}`);
    });
  }
  
  await mongoose.disconnect();
  process.exit(0);
}

checkUser();

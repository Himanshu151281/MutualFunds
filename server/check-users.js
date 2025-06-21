import mongoose from 'mongoose';
import User from './models/User.js';

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mutual-fund-compass');
    const users = await User.find({});
    console.log('Users in database:');
    users.forEach(user => console.log(`- ${user.email} (ID: ${user._id})`));
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();

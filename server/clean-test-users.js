import mongoose from 'mongoose';
import User from './models/User.js';

async function cleanTestUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mutual-fund-compass');
    
    // Delete test users
    const result = await User.deleteMany({
      email: { 
        $regex: /^(test|frontend-test|cors-test).*@example\.com$/ 
      }
    });
    
    console.log(`Deleted ${result.deletedCount} test users`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

cleanTestUsers();

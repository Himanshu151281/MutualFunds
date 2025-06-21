import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      // Modern MongoDB driver options (compatible with Mongoose 8.x)
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Make sure MongoDB is running on your system');
      console.error('💡 Start MongoDB with: mongod --dbpath /path/to/your/db');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Check your MongoDB credentials');
    } else if (error.message.includes('network timeout')) {
      console.error('💡 Check your network connection and MongoDB URI');
    }
    
    // In development, don't exit the process - just log the error
    if (process.env.NODE_ENV === 'development') {
      console.error('💡 Continuing without database connection in development mode');
      console.error('💡 Some features may not work properly');
      return null;
    }
    
    process.exit(1);
  }
};

export default connectDB;

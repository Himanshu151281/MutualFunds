#!/bin/bash

# Mutual Fund Compass - MongoDB Setup Script
echo "🚀 Setting up Mutual Fund Compass with MongoDB..."

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB is not installed on your system"
    echo "📝 Please install MongoDB first:"
    echo "   - Windows: Download from https://www.mongodb.com/try/download/community"
    echo "   - macOS: brew install mongodb/brew/mongodb-community"
    echo "   - Linux: Follow instructions at https://docs.mongodb.com/manual/installation/"
    exit 1
fi

echo "✅ MongoDB is installed"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️ MongoDB is not running"
    echo "🔄 Starting MongoDB..."
    
    # Try to start MongoDB (this varies by system)
    if command -v brew &> /dev/null; then
        # macOS with Homebrew
        brew services start mongodb/brew/mongodb-community
    elif command -v systemctl &> /dev/null; then
        # Linux with systemctl
        sudo systemctl start mongod
    else
        echo "📝 Please start MongoDB manually:"
        echo "   mongod --dbpath /path/to/your/db"
    fi
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

# Check if .env file exists and has required variables
if [ ! -f ".env" ]; then
    echo "❌ .env file not found in server directory"
    exit 1
fi

# Validate required environment variables
echo "🔍 Validating environment variables..."
source .env

if [ -z "$MONGODB_URI" ]; then
    echo "❌ MONGODB_URI not set in .env file"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET not set in .env file"
    exit 1
fi

echo "✅ Environment variables validated"

# Test MongoDB connection
echo "🔗 Testing MongoDB connection..."
node -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });
"

if [ $? -eq 0 ]; then
    echo "🎉 Setup completed successfully!"
    echo "🚀 You can now start the server with: npm run dev"
    echo "🌐 Server will run on: http://localhost:${PORT:-5000}"
    echo "📊 MongoDB database: mutual-fund-compass"
else
    echo "❌ Setup failed. Please check your MongoDB installation and configuration."
    exit 1
fi

@echo off
echo 🚀 Setting up Mutual Fund Compass with MongoDB...

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MongoDB is not installed on your system
    echo 📝 Please install MongoDB first:
    echo    Download from https://www.mongodb.com/try/download/community
    echo    or use chocolatey: choco install mongodb
    pause
    exit /b 1
)

echo ✅ MongoDB is installed

REM Check if MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ MongoDB is not running
    echo 🔄 Please start MongoDB manually or as a service
    echo 📝 You can start it with: net start MongoDB
    echo    or manually: mongod --dbpath C:\data\db
)

REM Install server dependencies
echo 📦 Installing server dependencies...
cd server
call npm install

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found in server directory
    pause
    exit /b 1
)

echo ✅ Environment variables file found

echo 🎉 Setup completed!
echo 🚀 You can now start the server with: npm run dev
echo 🌐 Server will run on: http://localhost:5000
echo 📊 MongoDB database: mutual-fund-compass

pause

# Mutual Fund Compass - Backend

A robust backend API for the Mutual Fund Compass application built with Express.js, MongoDB, and JWT authentication.

## 🏗️ Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **Security:** Helmet, CORS, Rate Limiting

## 📋 Features

### Authentication & Authorization
- User registration and login with JWT tokens
- Password hashing with bcrypt (12 salt rounds)
- Token verification and protected routes
- Login history tracking

### User Management
- User profiles with preferences
- Email validation and verification
- Password reset functionality
- User activity tracking

### Fund Management
- Save/unsave mutual funds
- Fund search and filtering
- User-specific saved funds list
- Fund metadata storage (NAV, category, etc.)

### Security Features
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- MongoDB injection protection

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (v4.4 or higher)
   - Local installation OR MongoDB Atlas cloud database

### Installation

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Copy and edit the .env file
   cp .env.example .env
   ```

4. **Start MongoDB:**
   
   **Option A - Local MongoDB:**
   ```bash
   # Windows (if installed as service)
   net start MongoDB
   
   # macOS (with Homebrew)
   brew services start mongodb/brew/mongodb-community
   
   # Linux (with systemd)
   sudo systemctl start mongod
   
   # Manual start
   mongod --dbpath /path/to/your/db
   ```
   
   **Option B - MongoDB Atlas:**
   - Create a cluster at [MongoDB Atlas](https://cloud.mongodb.com)
   - Get your connection string
   - Update `MONGODB_URI` in `.env`

5. **Run setup script (optional):**
   ```bash
   # Windows
   setup.bat
   
   # Linux/macOS
   chmod +x setup.sh
   ./setup.sh
   ```

6. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mutual-fund-compass

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production Environment Variables

For production, ensure you:
- Use a strong, randomly generated `JWT_SECRET`
- Set `NODE_ENV=production`
- Use MongoDB Atlas or a properly secured MongoDB instance
- Configure proper CORS origins
- Set up proper logging and monitoring

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

### User Endpoints

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

#### Get Saved Funds
```http
GET /api/user/saved-funds
Authorization: Bearer <token>
```

#### Save a Fund
```http
POST /api/user/save-fund
Authorization: Bearer <token>
Content-Type: application/json

{
  "schemeCode": "120503",
  "schemeName": "Aditya Birla Sun Life Tax Relief 96 Growth",
  "fundHouse": "Aditya Birla Sun Life Mutual Fund",
  "category": "ELSS",
  "nav": 125.50
}
```

#### Remove Saved Fund
```http
DELETE /api/user/saved-fund/:schemeCode
Authorization: Bearer <token>
```

#### Check if Fund is Saved
```http
GET /api/user/is-saved/:schemeCode
Authorization: Bearer <token>
```

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "errors": []
}
```

## 🗄️ Database Schema

### User Model

```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  firstName: String,
  lastName: String,
  savedFunds: [SavedFund],
  preferences: {
    currency: String,
    riskProfile: String,
    investmentGoals: [String],
    notifications: Object
  },
  loginHistory: [LoginEntry],
  isEmailVerified: Boolean,
  lastLogin: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### SavedFund Sub-Schema

```javascript
{
  schemeCode: String (required),
  schemeName: String (required),
  fundHouse: String,
  category: String,
  subCategory: String,
  nav: Number,
  savedAt: Date,
  notes: String
}
```

## 🔒 Security Features

### Password Security
- Passwords hashed using bcrypt with 12 salt rounds
- Minimum 6 characters with letter and number requirement
- Passwords excluded from API responses

### JWT Security
- Tokens expire in 30 days (configurable)
- Tokens required for all protected routes
- Token verification with user existence check

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable via environment variables
- Applied globally to all routes

### Input Validation
- Email format validation
- Password strength requirements
- Scheme code and fund name validation
- Request body size limits (10MB)

### CORS Protection
- Configurable allowed origins
- Credentials support for authenticated requests
- Proper HTTP methods and headers

## 🚦 Health Check

Check if the server is running:

```http
GET /api/health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🐛 Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

Error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

## 📊 Monitoring & Logging

### Development
- Console logging for requests and errors
- MongoDB connection status logging
- Detailed error stack traces

### Production Recommendations
- Use a logging service (Winston, Bunyan)
- Set up error tracking (Sentry, Bugsnag)
- Monitor database performance
- Set up health checks and alerts

## 🔧 Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests (when implemented)
npm test

# Check for vulnerabilities
npm audit

# Update dependencies
npm update
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### MongoDB Connection Issues

1. **Connection Refused:**
   ```bash
   # Check if MongoDB is running
   ps aux | grep mongod
   
   # Start MongoDB
   mongod --dbpath /path/to/db
   ```

2. **Authentication Failed:**
   - Check your MongoDB URI credentials
   - Ensure the database user has proper permissions

3. **Network Timeout:**
   - Check your network connection
   - Verify MongoDB Atlas IP whitelist (if using Atlas)

### Common Errors

1. **JWT Secret Missing:**
   ```
   Error: JWT_SECRET is not defined
   ```
   Solution: Add `JWT_SECRET` to your `.env` file

2. **Port Already in Use:**
   ```
   Error: listen EADDRINUSE :::5000
   ```
   Solution: Change the `PORT` in `.env` or kill the process using port 5000

3. **Validation Errors:**
   Check the API response for specific validation error messages

For more help, check the logs or create an issue in the repository.

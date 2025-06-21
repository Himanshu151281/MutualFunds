# Mutual Fund Compass - Your Investment Guide

Navigate your mutual fund investments with ease. Track, analyze, and manage your portfolio with comprehensive market insights.

## 🚀 Features

- **Fund Discovery**: Search and discover mutual funds across various categories
- **Portfolio Management**: Track your saved funds and investment performance
- **Real-time Data**: Get up-to-date NAV and fund performance metrics
- **User Authentication**: Secure user accounts with JWT authentication
- **Responsive Design**: Modern, mobile-friendly interface built with React and Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **TanStack Query** for data fetching

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing

## 🏗️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- npm or yarn package manager

## 📁 Project Structure

```
mutual-fund-compass/
├── public/                 # Static assets
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── styles/             # CSS and styling
├── server/                 # Backend source code
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   └── config/             # Configuration files
└── docs/                   # Documentation
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm start` - Start the server
- `npm run dev` - Start with nodemon (development)
- `npm test` - Run tests

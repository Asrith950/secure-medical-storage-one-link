// Demo mode middleware - provides mock responses when database is not connected
const mongoose = require('mongoose');

const demoMode = (req, res, next) => {
  // Check if we're in demo mode (MongoDB not connected)
  if (mongoose.connection.readyState !== 1) {
    // Mock user data for demo
    const mockUser = {
      _id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@securemed.com',
      role: 'user',
      lastLogin: new Date(),
      emergencyInfo: {
        bloodGroup: 'O+',
        allergies: ['Peanuts'],
        conditions: ['None'],
        emergencyContacts: [
          {
            name: 'John Doe',
            relationship: 'Brother',
            phone: '+1-555-0123'
          }
        ]
      },
      darkMode: false,
      createdAt: new Date()
    };

    // Mock token
    const mockToken = 'demo-jwt-token-12345';

    // Handle different routes in demo mode
    if (req.path === '/register' && req.method === 'POST') {
      return res.status(201).json({
        success: true,
        token: mockToken,
        data: mockUser,
        message: 'Demo registration successful! (No database required)'
      });
    }

    if (req.path === '/login' && req.method === 'POST') {
      return res.status(200).json({
        success: true,
        token: mockToken,
        data: mockUser,
        message: 'Demo login successful! (No database required)'
      });
    }

    if (req.path === '/me' && req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: mockUser,
        message: 'Demo user data (No database required)'
      });
    }
  }

  next();
};

module.exports = demoMode;
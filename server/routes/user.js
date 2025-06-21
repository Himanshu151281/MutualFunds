import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { 
  validateSaveFund, 
  validateSchemeCode, 
  validateProfileUpdate,
  validateSearchQuery 
} from '../middleware/validation.js';

const router = express.Router();

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user profile
router.put('/profile', protect, validateProfileUpdate, async (req, res) => {
  try {
    const { firstName, lastName, preferences } = req.body;
    const user = await User.findById(req.user.id);

    // Update basic info
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    // Update preferences
    if (preferences) {
      if (preferences.currency) user.preferences.currency = preferences.currency;
      if (preferences.riskProfile) user.preferences.riskProfile = preferences.riskProfile;
      if (preferences.investmentGoals) user.preferences.investmentGoals = preferences.investmentGoals;
      if (preferences.notifications) {
        Object.assign(user.preferences.notifications, preferences.notifications);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get saved funds with pagination and search
router.get('/saved-funds', protect, validateSearchQuery, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const user = await User.findById(req.user.id);
    let savedFunds = user.savedFunds || [];

    // Apply search filter
    if (search) {
      savedFunds = savedFunds.filter(fund => 
        fund.schemeName.toLowerCase().includes(search.toLowerCase()) ||
        fund.fundHouse.toLowerCase().includes(search.toLowerCase()) ||
        fund.schemeCode.includes(search)
      );
    }

    // Apply pagination
    const total = savedFunds.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedFunds = savedFunds.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      savedFunds: paginatedFunds,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: endIndex < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get saved funds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Save a fund
router.post('/save-fund', protect, validateSaveFund, async (req, res) => {
  try {
    const { schemeCode, schemeName, fundHouse, category, subCategory, nav, notes } = req.body;
    const user = await User.findById(req.user.id);

    // Check if fund is already saved
    if (user.isFundSaved(schemeCode)) {
      return res.status(400).json({
        success: false,
        message: 'Fund is already saved'
      });
    }

    // Add fund to saved funds using the model method
    await user.addSavedFund({
      schemeCode,
      schemeName,
      fundHouse: fundHouse || '',
      category: category || '',
      subCategory: subCategory || '',
      nav: nav || null,
      notes: notes || '',
      savedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Fund saved successfully',
      savedFunds: user.savedFunds,
      savedFundsCount: user.savedFundsCount
    });
  } catch (error) {
    console.error('Save fund error:', error);
    
    if (error.message === 'Fund is already saved') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update a saved fund
router.put('/saved-fund/:schemeCode', protect, validateSchemeCode, async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const { notes, nav } = req.body;
    const user = await User.findById(req.user.id);

    const updateData = {};
    if (notes !== undefined) updateData.notes = notes;
    if (nav !== undefined) updateData.nav = nav;

    await user.updateSavedFund(schemeCode, updateData);

    res.status(200).json({
      success: true,
      message: 'Fund updated successfully',
      savedFunds: user.savedFunds
    });
  } catch (error) {
    console.error('Update fund error:', error);
    
    if (error.message === 'Fund not found in saved list') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Remove a saved fund
router.delete('/saved-fund/:schemeCode', protect, validateSchemeCode, async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const user = await User.findById(req.user.id);

    // Check if fund exists
    if (!user.isFundSaved(schemeCode)) {
      return res.status(404).json({
        success: false,
        message: 'Fund not found in saved list'
      });
    }

    // Remove fund using model method
    await user.removeSavedFund(schemeCode);

    res.status(200).json({
      success: true,
      message: 'Fund removed successfully',
      savedFunds: user.savedFunds,
      savedFundsCount: user.savedFundsCount
    });
  } catch (error) {
    console.error('Remove fund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Check if a fund is saved
router.get('/is-saved/:schemeCode', protect, validateSchemeCode, async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const user = await User.findById(req.user.id);

    const isSaved = user.isFundSaved(schemeCode);
    const savedFund = isSaved ? user.getSavedFund(schemeCode) : null;

    res.status(200).json({
      success: true,
      isSaved,
      savedFund
    });
  } catch (error) {
    console.error('Check saved fund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Calculate statistics
    const stats = {
      totalSavedFunds: user.savedFundsCount,
      accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
      lastLogin: user.lastLogin,
      loginHistory: user.loginHistory.slice(-5), // Last 5 logins
      fundCategories: {}
    };

    // Count funds by category
    user.savedFunds.forEach(fund => {
      const category = fund.category || 'Other';
      stats.fundCategories[category] = (stats.fundCategories[category] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// This route can be used for any fund-related operations that need authentication
// For now, it's mainly a placeholder since the actual fund data comes from external API

// Get fund history for saved funds (optional enhancement)
router.get('/history', protect, async (req, res) => {
  try {
    // This could be used to store historical data or user-specific fund analytics
    res.status(200).json({
      success: true,
      message: 'Fund history endpoint - can be extended for analytics'
    });
  } catch (error) {
    console.error('Fund history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

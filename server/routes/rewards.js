const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const Reward = require('../models/Reward');
const UserReward = require('../models/UserReward');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/rewards
// @desc    Get available rewards
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, type, maxCost, featured, limit = 20 } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (type) filters.type = type;
    if (maxCost) filters.maxCost = parseInt(maxCost);
    if (featured === 'true') filters.featured = true;

    const rewards = await Reward.getRewardsForUser(req.user._id, filters, parseInt(limit));

    // Check redemption status for each reward
    const rewardsWithStatus = await Promise.all(
      rewards.map(async (reward) => {
        const canRedeem = await reward.canUserRedeem(req.user._id);
        return {
          ...reward.toObject(),
          canRedeem: canRedeem.canRedeem,
          redeemReason: canRedeem.reason
        };
      })
    );

    res.json({
      success: true,
      data: {
        rewards: rewardsWithStatus
      }
    });

  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rewards'
    });
  }
});

// @route   POST /api/rewards/:id/redeem
// @desc    Redeem a reward
// @access  Private
router.post('/:id/redeem', auth, async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    // Redeem the reward
    const userReward = await reward.redeemReward(req.user._id);

    res.json({
      success: true,
      message: 'Reward redeemed successfully',
      data: {
        userReward
      }
    });

  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Server error while redeeming reward'
    });
  }
});

// @route   GET /api/rewards/my-rewards
// @desc    Get user's redeemed rewards
// @access  Private
router.get('/my-rewards', auth, async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;

    const userRewards = await UserReward.getUserRewards(req.user._id, status, parseInt(limit));

    res.json({
      success: true,
      data: {
        rewards: userRewards
      }
    });

  } catch (error) {
    console.error('Get user rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user rewards'
    });
  }
});

module.exports = router;
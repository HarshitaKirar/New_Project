const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const User = require('../models/User');
const UserTask = require('../models/UserTask');
const CarbonEntry = require('../models/CarbonEntry');
const { auth } = require('../middleware/auth');

// @route   GET /api/user/leaderboard
// @desc    Get leaderboard
// @access  Private
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { type = 'coins', limit = 20 } = req.query;

    let sortField;
    switch (type) {
      case 'coins':
        sortField = { ecoCoins: -1 };
        break;
      case 'level':
        sortField = { level: -1, experiencePoints: -1 };
        break;
      case 'streak':
        sortField = { 'streak.currentStreak': -1 };
        break;
      default:
        sortField = { ecoCoins: -1 };
    }

    const users = await User.find({ isActive: true })
      .select('name avatar level ecoCoins experiencePoints streak.currentStreak')
      .sort(sortField)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        leaderboard: users.map((user, index) => ({
          rank: index + 1,
          ...user.toObject()
        }))
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboard'
    });
  }
});

// @route   GET /api/user/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get user with populated data
    const user = await User.findById(req.user._id);

    // Get recent carbon entries
    const recentEntries = await CarbonEntry.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(7);

    // Get active tasks
    const activeTasks = await UserTask.find({
      user: req.user._id,
      status: { $in: ['Assigned', 'In Progress'] }
    }).populate('task').limit(5);

    // Calculate progress
    const thisMonth = new Date();
    const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
    
    const thisMonthData = await CarbonEntry.getUserFootprint(req.user._id, lastMonth, thisMonth);
    const currentFootprint = thisMonthData.length > 0 ? thisMonthData[0].totalEmissions : 0;

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          avatar: user.avatar,
          level: user.level,
          ecoCoins: user.ecoCoins,
          experiencePoints: user.experiencePoints,
          streak: user.streak,
          carbonFootprint: user.carbonFootprint
        },
        recentEntries,
        activeTasks,
        progress: {
          currentFootprint,
          targetReduction: user.carbonFootprint.target,
          achievedReduction: user.carbonFootprint.baseline > 0 ? 
            ((user.carbonFootprint.baseline - currentFootprint) / user.carbonFootprint.baseline) * 100 : 0
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

module.exports = router;
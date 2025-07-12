const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const Task = require('../models/Task');
const UserTask = require('../models/UserTask');
const User = require('../models/User');
const { auth, levelAuth } = require('../middleware/auth');

// @route   GET /api/tasks
// @desc    Get available tasks for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      type, 
      featured, 
      limit = 20, 
      skip = 0 
    } = req.query;

    // Build query
    const query = {
      status: 'Approved',
      'requirements.minimumLevel': { $lte: req.user.level }
    };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;
    if (featured === 'true') query.featured = true;

    // Get tasks
    const tasks = await Task.find(query)
      .sort({ featured: -1, 'rewards.ecoCoins': -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Get user's task assignments to check status
    const userTaskIds = tasks.map(task => task._id);
    const userTasks = await UserTask.find({
      user: req.user._id,
      task: { $in: userTaskIds }
    }).select('task status assignedAt completedAt');

    // Map user task status to tasks
    const tasksWithStatus = tasks.map(task => {
      const userTask = userTasks.find(ut => ut.task.toString() === task._id.toString());
      return {
        ...task.toObject(),
        userStatus: userTask ? {
          status: userTask.status,
          assignedAt: userTask.assignedAt,
          completedAt: userTask.completedAt
        } : null,
        canAssign: !userTask && task.isAvailableToday()
      };
    });

    res.json({
      success: true,
      data: {
        tasks: tasksWithStatus,
        count: tasksWithStatus.length
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
});

// @route   GET /api/tasks/featured
// @desc    Get featured tasks
// @access  Private
router.get('/featured', auth, async (req, res) => {
  try {
    const featuredTasks = await Task.getFeaturedTasks(5);
    
    // Check user task status for featured tasks
    const userTasks = await UserTask.find({
      user: req.user._id,
      task: { $in: featuredTasks.map(t => t._id) }
    }).select('task status');

    const tasksWithStatus = featuredTasks.map(task => {
      const userTask = userTasks.find(ut => ut.task.toString() === task._id.toString());
      return {
        ...task.toObject(),
        userStatus: userTask?.status || null,
        canAssign: !userTask && task.isAvailableToday()
      };
    });

    res.json({
      success: true,
      data: {
        tasks: tasksWithStatus
      }
    });

  } catch (error) {
    console.error('Get featured tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured tasks'
    });
  }
});

// @route   GET /api/tasks/my-tasks
// @desc    Get user's assigned tasks
// @access  Private
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const { status, limit = 20, skip = 0 } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const userTasks = await UserTask.find(query)
      .populate('task')
      .sort({ assignedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Filter out tasks where task is null (deleted tasks)
    const validUserTasks = userTasks.filter(ut => ut.task);

    res.json({
      success: true,
      data: {
        tasks: validUserTasks,
        count: validUserTasks.length
      }
    });

  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user tasks'
    });
  }
});

// @route   POST /api/tasks/:id/assign
// @desc    Assign task to user
// @access  Private
router.post('/:id/assign', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Task is not available for assignment'
      });
    }

    // Check if user meets requirements
    if (req.user.level < task.requirements.minimumLevel) {
      return res.status(403).json({
        success: false,
        message: `Minimum level ${task.requirements.minimumLevel} required`,
        currentLevel: req.user.level
      });
    }

    // Check if task is available today
    if (!task.isAvailableToday()) {
      return res.status(400).json({
        success: false,
        message: 'Task is not available today'
      });
    }

    // Check if user already has this task assigned
    const existingUserTask = await UserTask.findOne({
      user: req.user._id,
      task: task._id,
      status: { $in: ['Assigned', 'In Progress'] }
    });

    if (existingUserTask) {
      return res.status(400).json({
        success: false,
        message: 'Task is already assigned to you'
      });
    }

    // Check daily task limit (prevent spam assignment)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAssignments = await UserTask.countDocuments({
      user: req.user._id,
      assignedAt: { $gte: today, $lt: tomorrow }
    });

    if (todayAssignments >= 10) { // Max 10 task assignments per day
      return res.status(400).json({
        success: false,
        message: 'Daily task assignment limit reached'
      });
    }

    // Calculate deadline based on task type
    let deadline = new Date();
    switch (task.type) {
      case 'Daily':
        deadline.setDate(deadline.getDate() + 1);
        break;
      case 'Weekly':
        deadline.setDate(deadline.getDate() + 7);
        break;
      case 'Monthly':
        deadline.setDate(deadline.getDate() + 30);
        break;
      default:
        deadline.setDate(deadline.getDate() + 7);
    }

    // Create user task assignment
    const userTask = new UserTask({
      user: req.user._id,
      task: task._id,
      status: 'Assigned',
      deadline,
      verification: {
        type: task.verification.type
      }
    });

    await userTask.save();

    // Update task statistics
    task.stats.totalAssigned += 1;
    await task.save();

    // Populate task details
    await userTask.populate('task');

    res.status(201).json({
      success: true,
      message: 'Task assigned successfully',
      data: {
        userTask
      }
    });

  } catch (error) {
    console.error('Task assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning task'
    });
  }
});

// @route   POST /api/tasks/:id/start
// @desc    Start a task
// @access  Private
router.post('/:id/start', auth, async (req, res) => {
  try {
    const userTask = await UserTask.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'Assigned'
    }).populate('task');

    if (!userTask) {
      return res.status(404).json({
        success: false,
        message: 'Task assignment not found or already started'
      });
    }

    await userTask.startTask();

    res.json({
      success: true,
      message: 'Task started successfully',
      data: {
        userTask
      }
    });

  } catch (error) {
    console.error('Start task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting task'
    });
  }
});

// @route   POST /api/tasks/:id/complete
// @desc    Complete a task
// @access  Private
router.post('/:id/complete', auth, [
  body('verificationData').optional().isObject(),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userTask = await UserTask.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $in: ['Assigned', 'In Progress'] }
    }).populate('task');

    if (!userTask) {
      return res.status(404).json({
        success: false,
        message: 'Task assignment not found or already completed'
      });
    }

    const { verificationData = {}, notes } = req.body;

    // Add notes to verification data
    if (notes) {
      verificationData.notes = notes;
    }

    // Complete the task
    await userTask.completeTask(verificationData, true);

    // Award rewards
    await userTask.awardRewards();

    // Update user streak
    const user = await User.findById(req.user._id);
    await user.updateStreak();

    // Check for achievements
    const achievements = await checkTaskAchievements(req.user._id);

    res.json({
      success: true,
      message: 'Task completed successfully',
      data: {
        userTask,
        rewardsEarned: userTask.rewardsEarned,
        achievements
      }
    });

  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing task'
    });
  }
});

// @route   POST /api/tasks/:id/rate
// @desc    Rate and provide feedback for a completed task
// @access  Private
router.post('/:id/rate', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().isLength({ max: 500 }).withMessage('Feedback must be less than 500 characters'),
  body('difficulty').optional().isIn(['Too Easy', 'Easy', 'Just Right', 'Hard', 'Too Hard'])
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userTask = await UserTask.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'Completed'
    }).populate('task');

    if (!userTask) {
      return res.status(404).json({
        success: false,
        message: 'Completed task not found'
      });
    }

    if (userTask.rating) {
      return res.status(400).json({
        success: false,
        message: 'Task has already been rated'
      });
    }

    const { rating, feedback, difficulty } = req.body;

    // Update user task with rating and feedback
    userTask.rating = rating;
    userTask.feedback = feedback;
    if (difficulty) {
      userTask.difficulty.perceived = difficulty;
    }

    await userTask.save();

    // Update task's average rating
    const task = await Task.findById(userTask.task._id);
    task.stats.ratingCount += 1;
    
    // Calculate new average rating
    const allRatedUserTasks = await UserTask.find({
      task: task._id,
      rating: { $exists: true }
    }).select('rating');
    
    const totalRating = allRatedUserTasks.reduce((sum, ut) => sum + ut.rating, 0);
    task.stats.averageRating = totalRating / allRatedUserTasks.length;
    
    await task.save();

    // Award bonus eco coins for rating
    const user = await User.findById(req.user._id);
    await user.addReward(5, 2); // 5 XP, 2 coins for rating

    res.json({
      success: true,
      message: 'Task rated successfully',
      data: {
        userTask,
        ecoCoinsEarned: 2
      }
    });

  } catch (error) {
    console.error('Rate task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rating task'
    });
  }
});

// @route   GET /api/tasks/categories
// @desc    Get task categories with counts
// @access  Private
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Task.aggregate([
      {
        $match: {
          status: 'Approved',
          'requirements.minimumLevel': { $lte: req.user.level }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageReward: { $avg: '$rewards.ecoCoins' },
          difficulties: { $addToSet: '$difficulty' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/tasks/stats
// @desc    Get user's task statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await UserTask.getUserStats(req.user._id);
    
    // Get task completion by category
    const categoryStats = await UserTask.aggregate([
      { $match: { user: req.user._id } },
      {
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          as: 'taskInfo'
        }
      },
      { $unwind: '$taskInfo' },
      {
        $group: {
          _id: '$taskInfo.category',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          totalRewards: { $sum: '$rewardsEarned.ecoCoins' }
        }
      }
    ]);

    // Get recent achievements
    const user = await User.findById(req.user._id);
    const recentAchievements = user.achievements
      .sort((a, b) => b.earnedAt - a.earnedAt)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalAssigned: 0,
          totalCompleted: 0,
          totalInProgress: 0,
          totalEcoCoins: 0,
          totalExperiencePoints: 0,
          totalCarbonSaving: 0,
          averageRating: 0,
          averageTimeToComplete: 0
        },
        categoryStats,
        recentAchievements
      }
    });

  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task statistics'
    });
  }
});

// @route   DELETE /api/tasks/:id/cancel
// @desc    Cancel an assigned task
// @access  Private
router.delete('/:id/cancel', auth, async (req, res) => {
  try {
    const userTask = await UserTask.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $in: ['Assigned', 'In Progress'] }
    });

    if (!userTask) {
      return res.status(404).json({
        success: false,
        message: 'Task assignment not found or cannot be cancelled'
      });
    }

    // Update task status
    userTask.status = 'Skipped';
    await userTask.save();

    // Update task statistics
    await Task.findByIdAndUpdate(userTask.task, {
      $inc: { 'stats.totalAssigned': -1 }
    });

    res.json({
      success: true,
      message: 'Task cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling task'
    });
  }
});

// Helper function to check task achievements
async function checkTaskAchievements(userId) {
  const achievements = [];
  
  try {
    const user = await User.findById(userId);
    const userTaskStats = await UserTask.getUserStats(userId);
    
    if (userTaskStats.length === 0) return achievements;
    
    const stats = userTaskStats[0];
    
    // Achievement: First Task
    if (stats.totalCompleted === 1 && !user.achievements.some(a => a.id === 'first_task')) {
      const achievement = {
        id: 'first_task',
        name: 'Getting Started',
        description: 'Complete your first eco-task',
        ecoCoinsReward: 25
      };
      
      user.achievements.push(achievement);
      user.ecoCoins += achievement.ecoCoinsReward;
      achievements.push(achievement);
    }
    
    // Achievement: Task Streak
    if (user.streak.currentStreak >= 7 && !user.achievements.some(a => a.id === 'week_streak')) {
      const achievement = {
        id: 'week_streak',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        ecoCoinsReward: 50
      };
      
      user.achievements.push(achievement);
      user.ecoCoins += achievement.ecoCoinsReward;
      achievements.push(achievement);
    }
    
    // Achievement: 50 Tasks
    if (stats.totalCompleted >= 50 && !user.achievements.some(a => a.id === 'task_master')) {
      const achievement = {
        id: 'task_master',
        name: 'Task Master',
        description: 'Complete 50 eco-tasks',
        ecoCoinsReward: 100
      };
      
      user.achievements.push(achievement);
      user.ecoCoins += achievement.ecoCoinsReward;
      achievements.push(achievement);
    }
    
    await user.save();
    
  } catch (error) {
    console.error('Check achievements error:', error);
  }
  
  return achievements;
}

module.exports = router;
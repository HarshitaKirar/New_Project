const mongoose = require('mongoose');

const userTaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  
  // Task status tracking
  status: {
    type: String,
    enum: ['Assigned', 'In Progress', 'Completed', 'Failed', 'Skipped'],
    default: 'Assigned'
  },
  
  // Timeline
  assignedAt: {
    type: Date,
    default: Date.now
  },
  
  startedAt: {
    type: Date
  },
  
  completedAt: {
    type: Date
  },
  
  deadline: {
    type: Date
  },
  
  // Progress tracking
  progress: {
    type: Number, // 0-100 percentage
    default: 0,
    min: 0,
    max: 100
  },
  
  // Verification data
  verification: {
    type: {
      type: String,
      enum: ['Self-Report', 'Photo Upload', 'Data Entry', 'Bill Upload', 'GPS Check', 'Timer', 'Quiz']
    },
    data: {
      // For photo uploads
      photos: [{
        url: String,
        description: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }],
      
      // For data entry
      values: mongoose.Schema.Types.Mixed,
      
      // For GPS check
      location: {
        latitude: Number,
        longitude: Number,
        address: String,
        checkedAt: Date
      },
      
      // For timer-based tasks
      duration: {
        type: Number, // in minutes
        startTime: Date,
        endTime: Date
      },
      
      // For quiz tasks
      answers: [{
        question: String,
        answer: String,
        correct: Boolean
      }],
      
      // General verification notes
      notes: String
    },
    
    verified: {
      type: Boolean,
      default: false
    },
    
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    verifiedAt: {
      type: Date
    },
    
    autoVerified: {
      type: Boolean,
      default: false
    }
  },
  
  // Rewards earned
  rewardsEarned: {
    ecoCoins: {
      type: Number,
      default: 0
    },
    experiencePoints: {
      type: Number,
      default: 0
    },
    carbonSaving: {
      type: Number,
      default: 0
    },
    bonusMultiplier: {
      type: Number,
      default: 1
    }
  },
  
  // User feedback
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  feedback: {
    type: String,
    maxlength: 500
  },
  
  difficulty: {
    perceived: {
      type: String,
      enum: ['Too Easy', 'Easy', 'Just Right', 'Hard', 'Too Hard']
    },
    actualTime: {
      type: Number // in minutes
    }
  },
  
  // Streak and frequency tracking
  streak: {
    current: {
      type: Number,
      default: 0
    },
    best: {
      type: Number,
      default: 0
    }
  },
  
  // Reminders and notifications
  reminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['Once', 'Daily', 'Twice Daily', 'Custom'],
      default: 'Daily'
    },
    customTimes: [String], // Time strings like "09:00", "15:30"
    lastSent: Date
  },
  
  // Social features
  shared: {
    type: Boolean,
    default: false
  },
  
  sharedAt: {
    type: Date
  },
  
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: 200
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Attempts tracking (for repeatable tasks)
  attempts: [{
    attemptNumber: {
      type: Number,
      required: true
    },
    startedAt: Date,
    completedAt: Date,
    status: {
      type: String,
      enum: ['Completed', 'Failed', 'Abandoned']
    },
    score: Number
  }],
  
  // Task-specific metadata
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Compound indexes for efficient queries
userTaskSchema.index({ user: 1, status: 1 });
userTaskSchema.index({ user: 1, task: 1 });
userTaskSchema.index({ user: 1, completedAt: -1 });
userTaskSchema.index({ user: 1, assignedAt: -1 });
userTaskSchema.index({ task: 1, status: 1 });
userTaskSchema.index({ completedAt: -1 });

// Unique constraint to prevent duplicate task assignments
userTaskSchema.index({ user: 1, task: 1, assignedAt: 1 }, { unique: true });

// Virtual for time taken to complete
userTaskSchema.virtual('timeToComplete').get(function() {
  if (this.startedAt && this.completedAt) {
    return Math.round((this.completedAt - this.startedAt) / (1000 * 60)); // in minutes
  }
  return null;
});

// Virtual for days since assignment
userTaskSchema.virtual('daysSinceAssigned').get(function() {
  const now = new Date();
  return Math.floor((now - this.assignedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
userTaskSchema.virtual('isOverdue').get(function() {
  if (!this.deadline) return false;
  return new Date() > this.deadline && this.status !== 'Completed';
});

// Method to mark task as started
userTaskSchema.methods.startTask = function() {
  this.status = 'In Progress';
  this.startedAt = new Date();
  return this.save();
};

// Method to complete task with verification
userTaskSchema.methods.completeTask = function(verificationData = {}, autoVerify = true) {
  this.status = 'Completed';
  this.completedAt = new Date();
  this.progress = 100;
  
  if (verificationData) {
    this.verification.data = { ...this.verification.data, ...verificationData };
    this.verification.verified = autoVerify;
    this.verification.autoVerified = autoVerify;
    
    if (autoVerify) {
      this.verification.verifiedAt = new Date();
    }
  }
  
  return this.save();
};

// Method to calculate and award rewards
userTaskSchema.methods.awardRewards = async function() {
  if (this.status !== 'Completed' || !this.verification.verified) {
    throw new Error('Task must be completed and verified to award rewards');
  }
  
  // Populate task to get reward details
  await this.populate('task');
  
  const baseRewards = this.task.rewards;
  const multiplier = this.rewardsEarned.bonusMultiplier || 1;
  
  this.rewardsEarned.ecoCoins = Math.round(baseRewards.ecoCoins * multiplier);
  this.rewardsEarned.experiencePoints = Math.round(baseRewards.experiencePoints * multiplier);
  this.rewardsEarned.carbonSaving = baseRewards.carbonSaving || 0;
  
  // Update user's eco coins and experience
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.user, {
    $inc: {
      ecoCoins: this.rewardsEarned.ecoCoins,
      experiencePoints: this.rewardsEarned.experiencePoints
    }
  });
  
  return this.save();
};

// Static method to get user's active tasks
userTaskSchema.statics.getActiveTasks = function(userId, limit = 10) {
  return this.find({
    user: userId,
    status: { $in: ['Assigned', 'In Progress'] }
  })
  .populate('task')
  .sort({ assignedAt: -1 })
  .limit(limit);
};

// Static method to get user's completed tasks
userTaskSchema.statics.getCompletedTasks = function(userId, dateRange = null, limit = 50) {
  const query = {
    user: userId,
    status: 'Completed'
  };
  
  if (dateRange && dateRange.start && dateRange.end) {
    query.completedAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  return this.find(query)
    .populate('task')
    .sort({ completedAt: -1 })
    .limit(limit);
};

// Static method to get user task statistics
userTaskSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalAssigned: { $sum: 1 },
        totalCompleted: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        },
        totalInProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
        },
        totalEcoCoins: { $sum: '$rewardsEarned.ecoCoins' },
        totalExperiencePoints: { $sum: '$rewardsEarned.experiencePoints' },
        totalCarbonSaving: { $sum: '$rewardsEarned.carbonSaving' },
        averageRating: { $avg: '$rating' },
        averageTimeToComplete: { $avg: '$timeToComplete' }
      }
    }
  ]);
};

// Update task statistics when status changes
userTaskSchema.post('save', async function(doc) {
  if (doc.isModified('status') && doc.status === 'Completed') {
    // Update task completion statistics
    const Task = mongoose.model('Task');
    await Task.findByIdAndUpdate(doc.task, {
      $inc: { 'stats.totalCompleted': 1 }
    });
  }
});

module.exports = mongoose.model('UserTask', userTaskSchema);
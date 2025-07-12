const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  category: {
    type: String,
    enum: ['Transportation', 'Energy', 'Food', 'Shopping', 'Waste', 'Water', 'Community', 'Education'],
    required: true
  },
  
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  
  type: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'One-time', 'Challenge'],
    default: 'Daily'
  },
  
  // Rewards for completing the task
  rewards: {
    ecoCoins: {
      type: Number,
      required: true,
      min: 1
    },
    experiencePoints: {
      type: Number,
      required: true,
      min: 1
    },
    carbonSaving: {
      type: Number, // in kg CO2
      default: 0,
      min: 0
    }
  },
  
  // Task Requirements
  requirements: {
    minimumLevel: {
      type: Number,
      default: 1,
      min: 1
    },
    prerequisites: [{
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      },
      completed: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Instructions and guidance
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 200
    },
    tip: {
      type: String,
      maxlength: 150
    }
  }],
  
  // Verification method
  verification: {
    type: {
      type: String,
      enum: ['Self-Report', 'Photo Upload', 'Data Entry', 'Bill Upload', 'GPS Check', 'Timer', 'Quiz'],
      default: 'Self-Report'
    },
    criteria: {
      type: String,
      maxlength: 300
    },
    autoVerify: {
      type: Boolean,
      default: true
    }
  },
  
  // Task availability
  availability: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    recurring: {
      type: Boolean,
      default: true
    },
    daysOfWeek: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    timeOfDay: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Anytime'],
      default: 'Anytime'
    }
  },
  
  // Task metadata
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  estimatedDuration: {
    type: Number, // in minutes
    default: 10,
    min: 1
  },
  
  // Statistics
  stats: {
    totalAssigned: {
      type: Number,
      default: 0
    },
    totalCompleted: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number, // percentage
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  },
  
  // Content and media
  icon: {
    type: String, // emoji or icon name
    default: '🌱'
  },
  
  image: {
    type: String, // URL to task image
    default: ''
  },
  
  color: {
    type: String, // hex color for UI
    default: '#22c55e'
  },
  
  // Creator information (for user-generated tasks)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Approval status for user-generated tasks
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Archived'],
    default: 'Approved'
  },
  
  // Featured task (shown prominently)
  featured: {
    type: Boolean,
    default: false
  },
  
  // Seasonal or special event tasks
  event: {
    type: String,
    enum: ['Earth Day', 'World Environment Day', 'Green Week', 'Climate Action', 'Summer Challenge', 'Winter Challenge', 'None'],
    default: 'None'
  }
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ category: 1, difficulty: 1 });
taskSchema.index({ type: 1, 'availability.recurring': 1 });
taskSchema.index({ featured: 1, status: 1 });
taskSchema.index({ 'rewards.ecoCoins': -1 });
taskSchema.index({ createdAt: -1 });

// Virtual for completion rate calculation
taskSchema.virtual('completionPercentage').get(function() {
  if (this.stats.totalAssigned === 0) return 0;
  return Math.round((this.stats.totalCompleted / this.stats.totalAssigned) * 100);
});

// Method to check if task is available today
taskSchema.methods.isAvailableToday = function() {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Check if task is within date range
  if (this.availability.startDate && today < this.availability.startDate) return false;
  if (this.availability.endDate && today > this.availability.endDate) return false;
  
  // Check day of week availability
  if (this.availability.daysOfWeek.length > 0) {
    return this.availability.daysOfWeek.includes(dayName);
  }
  
  return true;
};

// Method to calculate task score based on difficulty and rewards
taskSchema.methods.getTaskScore = function() {
  const difficultyMultiplier = {
    'Easy': 1,
    'Medium': 1.5,
    'Hard': 2
  };
  
  const baseScore = this.rewards.ecoCoins + (this.rewards.experiencePoints * 0.1);
  return Math.round(baseScore * difficultyMultiplier[this.difficulty]);
};

// Static method to get tasks for a user based on level and preferences
taskSchema.statics.getTasksForUser = function(userLevel, categories = [], difficulty = null, limit = 10) {
  const query = {
    status: 'Approved',
    'requirements.minimumLevel': { $lte: userLevel }
  };
  
  if (categories.length > 0) {
    query.category = { $in: categories };
  }
  
  if (difficulty) {
    query.difficulty = difficulty;
  }
  
  return this.find(query)
    .limit(limit)
    .sort({ featured: -1, 'rewards.ecoCoins': -1, createdAt: -1 });
};

// Static method to get featured tasks
taskSchema.statics.getFeaturedTasks = function(limit = 5) {
  return this.find({ 
    status: 'Approved', 
    featured: true 
  })
  .limit(limit)
  .sort({ 'stats.completionRate': -1, createdAt: -1 });
};

// Update completion rate when stats change
taskSchema.pre('save', function(next) {
  if (this.stats.totalAssigned > 0) {
    this.stats.completionRate = Math.round((this.stats.totalCompleted / this.stats.totalAssigned) * 100);
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
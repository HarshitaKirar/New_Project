const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  
  // Profile Information
  profession: {
    type: String,
    enum: ['Student', 'Professional', 'Business Owner', 'Freelancer', 'Retired', 'Homemaker', 'Other'],
    required: true
  },
  
  // Lifestyle Preferences
  lifestyle: {
    transportation: {
      primaryMode: {
        type: String,
        enum: ['Car', 'Public Transport', 'Bicycle', 'Walking', 'Motorcycle', 'Mixed'],
        default: 'Mixed'
      },
      hasPrivateVehicle: {
        type: Boolean,
        default: false
      },
      weeklyCommute: {
        type: Number, // in kilometers
        default: 0
      }
    },
    
    diet: {
      type: {
        type: String,
        enum: ['Vegetarian', 'Vegan', 'Pescatarian', 'Omnivore', 'Keto', 'Other'],
        default: 'Omnivore'
      },
      meatConsumption: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'],
        default: 'Weekly'
      }
    },
    
    housing: {
      type: {
        type: String,
        enum: ['Apartment', 'House', 'Shared', 'Hostel', 'Other'],
        default: 'Apartment'
      },
      size: {
        type: String,
        enum: ['Small', 'Medium', 'Large'],
        default: 'Medium'
      },
      energySource: {
        type: String,
        enum: ['Grid', 'Solar', 'Mixed', 'Other'],
        default: 'Grid'
      }
    },
    
    shopping: {
      frequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'],
        default: 'Weekly'
      },
      preferLocalProducts: {
        type: Boolean,
        default: false
      },
      ecoFriendlyBrands: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Carbon Footprint Data
  carbonFootprint: {
    baseline: {
      type: Number, // in kg CO2 per month
      default: 0
    },
    current: {
      type: Number, // in kg CO2 per month
      default: 0
    },
    target: {
      type: Number, // reduction target percentage
      default: 20
    },
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Gamification
  ecoCoins: {
    type: Number,
    default: 100 // Starting bonus
  },
  level: {
    type: Number,
    default: 1
  },
  experiencePoints: {
    type: Number,
    default: 0
  },
  streak: {
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  // Achievements
  achievements: [{
    id: String,
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    ecoCoinsReward: Number
  }],
  
  // Community
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Settings
  notifications: {
    daily: {
      type: Boolean,
      default: true
    },
    weekly: {
      type: Boolean,
      default: true
    },
    achievements: {
      type: Boolean,
      default: true
    },
    community: {
      type: Boolean,
      default: true
    }
  },
  
  // Referral System
  referralCode: {
    type: String,
    unique: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ ecoCoins: -1 });
userSchema.index({ level: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate referral code before saving
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = 'ECO' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate level based on experience points
userSchema.methods.calculateLevel = function() {
  const baseXP = 1000;
  const level = Math.floor(this.experiencePoints / baseXP) + 1;
  this.level = level;
  return level;
};

// Add experience points and eco coins
userSchema.methods.addReward = function(xp, coins) {
  this.experiencePoints += xp;
  this.ecoCoins += coins;
  this.calculateLevel();
  return this.save();
};

// Update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActivity = new Date(this.streak.lastActivity);
  const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    // Continue streak
    this.streak.currentStreak += 1;
    if (this.streak.currentStreak > this.streak.longestStreak) {
      this.streak.longestStreak = this.streak.currentStreak;
    }
  } else if (diffDays > 1) {
    // Reset streak
    this.streak.currentStreak = 1;
  }
  // If diffDays === 0, same day activity, don't change streak
  
  this.streak.lastActivity = today;
  return this.save();
};

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
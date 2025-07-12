const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  // Reward details
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
  
  // Reward type and category
  type: {
    type: String,
    enum: ['Discount', 'Voucher', 'Product', 'Service', 'Experience', 'Donation', 'Digital'],
    required: true
  },
  
  category: {
    type: String,
    enum: ['Transportation', 'Shopping', 'Food & Dining', 'Entertainment', 'Education', 'Eco Products', 'Charity', 'Digital Services'],
    required: true
  },
  
  // Cost and availability
  cost: {
    ecoCoins: {
      type: Number,
      required: true,
      min: 1
    },
    currency: {
      type: String,
      default: 'EcoCoins'
    }
  },
  
  value: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    description: String // e.g., "₹100 discount", "Free ride"
  },
  
  // Availability and limits
  availability: {
    total: {
      type: Number,
      default: -1 // -1 means unlimited
    },
    remaining: {
      type: Number,
      default: -1
    },
    dailyLimit: {
      type: Number,
      default: -1 // -1 means no daily limit
    },
    userLimit: {
      type: Number,
      default: 1 // Maximum times a user can redeem this reward
    }
  },
  
  // Validity period
  validity: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    duration: {
      type: Number, // Duration in days after redemption
      default: 30
    }
  },
  
  // Requirements and restrictions
  requirements: {
    minimumLevel: {
      type: Number,
      default: 1
    },
    minimumEcoCoins: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    carbonSavings: {
      type: Number, // Minimum kg CO2 saved
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    }
  },
  
  // Partner/Brand information
  partner: {
    name: {
      type: String,
      required: true
    },
    logo: String,
    website: String,
    description: String,
    contact: {
      email: String,
      phone: String,
      address: String
    }
  },
  
  // Redemption instructions
  redemption: {
    type: {
      type: String,
      enum: ['Coupon Code', 'QR Code', 'Link', 'Contact Info', 'Download', 'Manual'],
      required: true
    },
    instructions: {
      type: String,
      required: true,
      maxlength: 1000
    },
    code: String, // For coupon codes
    link: String, // For direct links
    qrCode: String, // For QR code redemption
    location: String, // For physical redemption
    contactInfo: String
  },
  
  // Media and presentation
  image: {
    type: String,
    required: true
  },
  
  gallery: [String], // Additional images
  
  icon: {
    type: String,
    default: '🎁'
  },
  
  color: {
    type: String,
    default: '#3b82f6'
  },
  
  // Tags and search
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  // Location restrictions
  location: {
    countries: [String],
    cities: [String],
    regions: [String],
    isGlobal: {
      type: Boolean,
      default: false
    }
  },
  
  // Featured and promotional
  featured: {
    type: Boolean,
    default: false
  },
  
  promoted: {
    type: Boolean,
    default: false
  },
  
  trending: {
    type: Boolean,
    default: false
  },
  
  // Status and moderation
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Expired', 'Out of Stock', 'Coming Soon'],
    default: 'Active'
  },
  
  // Statistics
  stats: {
    totalRedemptions: {
      type: Number,
      default: 0
    },
    uniqueUsers: {
      type: Number,
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
    },
    views: {
      type: Number,
      default: 0
    }
  },
  
  // Reviews and feedback
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 300
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Creator information (for partner-created rewards)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Approval workflow
  approved: {
    type: Boolean,
    default: true
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
rewardSchema.index({ type: 1, category: 1 });
rewardSchema.index({ 'cost.ecoCoins': 1 });
rewardSchema.index({ status: 1, featured: 1 });
rewardSchema.index({ 'stats.totalRedemptions': -1 });
rewardSchema.index({ 'stats.averageRating': -1 });
rewardSchema.index({ tags: 1 });
rewardSchema.index({ 'partner.name': 1 });

// Text index for search
rewardSchema.index({
  title: 'text',
  description: 'text',
  'partner.name': 'text',
  tags: 'text'
});

// Virtual for availability status
rewardSchema.virtual('isAvailable').get(function() {
  if (this.status !== 'Active') return false;
  if (this.availability.remaining === 0) return false;
  if (this.validity.endDate && new Date() > this.validity.endDate) return false;
  return true;
});

// Virtual for discount percentage (for discount type rewards)
rewardSchema.virtual('discountPercentage').get(function() {
  if (this.type === 'Discount' && this.value.amount) {
    // Assuming a base value for calculation
    return Math.round((this.value.amount / 1000) * 100);
  }
  return null;
});

// Method to check if user can redeem this reward
rewardSchema.methods.canUserRedeem = async function(userId) {
  const User = mongoose.model('User');
  const UserReward = mongoose.model('UserReward');
  
  // Get user details
  const user = await User.findById(userId);
  if (!user) return { canRedeem: false, reason: 'User not found' };
  
  // Check basic requirements
  if (user.level < this.requirements.minimumLevel) {
    return { canRedeem: false, reason: 'Insufficient level' };
  }
  
  if (user.ecoCoins < this.cost.ecoCoins) {
    return { canRedeem: false, reason: 'Insufficient EcoCoins' };
  }
  
  // Check availability
  if (!this.isAvailable) {
    return { canRedeem: false, reason: 'Reward not available' };
  }
  
  // Check user redemption limit
  const userRedemptions = await UserReward.countDocuments({
    user: userId,
    reward: this._id,
    status: { $in: ['Redeemed', 'Used'] }
  });
  
  if (userRedemptions >= this.availability.userLimit) {
    return { canRedeem: false, reason: 'User redemption limit reached' };
  }
  
  // Check daily limit
  if (this.availability.dailyLimit > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayRedemptions = await UserReward.countDocuments({
      reward: this._id,
      redeemedAt: { $gte: today, $lt: tomorrow },
      status: { $in: ['Redeemed', 'Used'] }
    });
    
    if (todayRedemptions >= this.availability.dailyLimit) {
      return { canRedeem: false, reason: 'Daily redemption limit reached' };
    }
  }
  
  return { canRedeem: true };
};

// Method to redeem reward
rewardSchema.methods.redeemReward = async function(userId) {
  const canRedeem = await this.canUserRedeem(userId);
  
  if (!canRedeem.canRedeem) {
    throw new Error(canRedeem.reason);
  }
  
  // Create user reward record
  const UserReward = mongoose.model('UserReward');
  const userReward = new UserReward({
    user: userId,
    reward: this._id,
    status: 'Redeemed',
    redeemedAt: new Date(),
    expiresAt: new Date(Date.now() + (this.validity.duration * 24 * 60 * 60 * 1000)),
    redemptionData: {
      type: this.redemption.type,
      instructions: this.redemption.instructions,
      code: this.redemption.code,
      link: this.redemption.link,
      qrCode: this.redemption.qrCode
    }
  });
  
  await userReward.save();
  
  // Deduct eco coins from user
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(userId, {
    $inc: { ecoCoins: -this.cost.ecoCoins }
  });
  
  // Update reward statistics
  this.stats.totalRedemptions += 1;
  if (this.availability.remaining > 0) {
    this.availability.remaining -= 1;
  }
  
  await this.save();
  
  return userReward;
};

// Method to add review
rewardSchema.methods.addReview = function(userId, rating, comment = '') {
  // Check if user already reviewed
  const existingReview = this.reviews.find(review => 
    review.user.toString() === userId.toString()
  );
  
  if (existingReview) {
    // Update existing review
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    // Add new review
    this.reviews.push({
      user: userId,
      rating: rating,
      comment: comment
    });
    this.stats.ratingCount += 1;
  }
  
  // Recalculate average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.stats.averageRating = totalRating / this.reviews.length;
  
  return this.save();
};

// Static method to get rewards for user
rewardSchema.statics.getRewardsForUser = function(userId, filters = {}, limit = 20) {
  const query = { status: 'Active' };
  
  if (filters.category) query.category = filters.category;
  if (filters.type) query.type = filters.type;
  if (filters.maxCost) query['cost.ecoCoins'] = { $lte: filters.maxCost };
  if (filters.featured) query.featured = true;
  
  return this.find(query)
    .sort({ featured: -1, promoted: -1, 'stats.averageRating': -1 })
    .limit(limit);
};

// Static method to get trending rewards
rewardSchema.statics.getTrendingRewards = function(limit = 10) {
  return this.find({ 
    status: 'Active',
    trending: true 
  })
  .sort({ 'stats.totalRedemptions': -1, 'stats.averageRating': -1 })
  .limit(limit);
};

// Pre-save middleware to update status based on availability
rewardSchema.pre('save', function(next) {
  // Auto-expire if end date passed
  if (this.validity.endDate && new Date() > this.validity.endDate) {
    this.status = 'Expired';
  }
  
  // Mark as out of stock if no remaining quantity
  if (this.availability.remaining === 0) {
    this.status = 'Out of Stock';
  }
  
  next();
});

module.exports = mongoose.model('Reward', rewardSchema);
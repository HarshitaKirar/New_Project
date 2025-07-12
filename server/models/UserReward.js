const mongoose = require('mongoose');

const userRewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  reward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true
  },
  
  // Redemption status
  status: {
    type: String,
    enum: ['Redeemed', 'Used', 'Expired', 'Cancelled'],
    default: 'Redeemed'
  },
  
  // Timeline
  redeemedAt: {
    type: Date,
    default: Date.now
  },
  
  usedAt: {
    type: Date
  },
  
  expiresAt: {
    type: Date,
    required: true
  },
  
  // Redemption details
  redemptionData: {
    type: {
      type: String,
      enum: ['Coupon Code', 'QR Code', 'Link', 'Contact Info', 'Download', 'Manual']
    },
    instructions: String,
    code: String,
    link: String,
    qrCode: String,
    location: String,
    contactInfo: String
  },
  
  // Usage tracking
  usage: {
    location: {
      name: String,
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    partner: String,
    notes: String,
    verificationCode: String,
    receipt: String, // URL to receipt image
    amount: Number, // Amount saved/received
    currency: String
  },
  
  // Cost at time of redemption
  costPaid: {
    ecoCoins: {
      type: Number,
      required: true
    },
    level: Number // User level at time of redemption
  },
  
  // Value received
  valueReceived: {
    amount: Number,
    currency: String,
    description: String
  },
  
  // User feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    satisfaction: {
      type: String,
      enum: ['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied', 'Very Unsatisfied']
    },
    wouldRecommend: Boolean,
    feedbackAt: Date
  },
  
  // Technical details
  deviceInfo: {
    userAgent: String,
    ip: String,
    platform: String
  },
  
  // Notifications sent
  notifications: [{
    type: {
      type: String,
      enum: ['Redemption Confirmation', 'Usage Reminder', 'Expiry Warning', 'Expiry Notice']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    channel: {
      type: String,
      enum: ['Email', 'Push', 'SMS', 'In-App']
    }
  }],
  
  // Support and issues
  issues: [{
    type: {
      type: String,
      enum: ['Cannot Redeem', 'Code Not Working', 'Partner Issue', 'Technical Problem', 'Other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date,
    resolution: String
  }],
  
  // Referral tracking (if reward was obtained through referral)
  referralSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Campaign tracking
  campaign: {
    name: String,
    source: String,
    medium: String
  }
}, {
  timestamps: true
});

// Indexes for performance
userRewardSchema.index({ user: 1, status: 1 });
userRewardSchema.index({ user: 1, redeemedAt: -1 });
userRewardSchema.index({ reward: 1, status: 1 });
userRewardSchema.index({ expiresAt: 1 });
userRewardSchema.index({ status: 1, expiresAt: 1 });

// Virtual for days until expiry
userRewardSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const diffTime = this.expiresAt - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for expired status
userRewardSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for time since redemption
userRewardSchema.virtual('daysSinceRedemption').get(function() {
  const now = new Date();
  const diffTime = now - this.redeemedAt;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Method to mark as used
userRewardSchema.methods.markAsUsed = function(usageData = {}) {
  this.status = 'Used';
  this.usedAt = new Date();
  
  if (usageData) {
    this.usage = { ...this.usage, ...usageData };
  }
  
  return this.save();
};

// Method to add feedback
userRewardSchema.methods.addFeedback = function(rating, comment = '', satisfaction = null, wouldRecommend = null) {
  this.feedback = {
    rating: rating,
    comment: comment,
    satisfaction: satisfaction,
    wouldRecommend: wouldRecommend,
    feedbackAt: new Date()
  };
  
  return this.save();
};

// Method to report issue
userRewardSchema.methods.reportIssue = function(type, description) {
  this.issues.push({
    type: type,
    description: description,
    reportedAt: new Date()
  });
  
  return this.save();
};

// Method to send notification
userRewardSchema.methods.sendNotification = function(type, channel = 'In-App') {
  this.notifications.push({
    type: type,
    channel: channel,
    sentAt: new Date()
  });
  
  return this.save();
};

// Static method to get user's rewards
userRewardSchema.statics.getUserRewards = function(userId, status = null, limit = 50) {
  const query = { user: userId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('reward')
    .sort({ redeemedAt: -1 })
    .limit(limit);
};

// Static method to get expiring rewards
userRewardSchema.statics.getExpiringRewards = function(daysAhead = 3) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  return this.find({
    status: 'Redeemed',
    expiresAt: { $lte: futureDate, $gt: new Date() }
  })
  .populate('user', 'name email notifications')
  .populate('reward', 'title partner.name');
};

// Static method to get user reward statistics
userRewardSchema.statics.getUserRewardStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalRedeemed: { $sum: 1 },
        totalUsed: {
          $sum: { $cond: [{ $eq: ['$status', 'Used'] }, 1, 0] }
        },
        totalExpired: {
          $sum: { $cond: [{ $eq: ['$status', 'Expired'] }, 1, 0] }
        },
        totalEcoCoinsSpent: { $sum: '$costPaid.ecoCoins' },
        totalValueReceived: { $sum: '$valueReceived.amount' },
        averageRating: { $avg: '$feedback.rating' },
        usageRate: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'Used'] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

// Static method to get rewards by category for user
userRewardSchema.statics.getUserRewardsByCategory = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'rewards',
        localField: 'reward',
        foreignField: '_id',
        as: 'rewardInfo'
      }
    },
    { $unwind: '$rewardInfo' },
    {
      $group: {
        _id: '$rewardInfo.category',
        count: { $sum: 1 },
        totalSpent: { $sum: '$costPaid.ecoCoins' },
        used: {
          $sum: { $cond: [{ $eq: ['$status', 'Used'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Pre-save middleware to handle expiry
userRewardSchema.pre('save', function(next) {
  // Auto-expire if past expiry date
  if (this.status === 'Redeemed' && new Date() > this.expiresAt) {
    this.status = 'Expired';
  }
  
  next();
});

// Post-save middleware to update reward statistics
userRewardSchema.post('save', async function(doc) {
  if (doc.isModified('status') && doc.status === 'Used') {
    // Update reward statistics
    const Reward = mongoose.model('Reward');
    const reward = await Reward.findById(doc.reward);
    
    if (reward) {
      // Add user to unique users count if not already counted
      const userRewards = await this.constructor.find({
        reward: doc.reward,
        user: doc.user,
        status: 'Used'
      });
      
      if (userRewards.length === 1) {
        reward.stats.uniqueUsers += 1;
        await reward.save();
      }
    }
  }
});

module.exports = mongoose.model('UserReward', userRewardSchema);
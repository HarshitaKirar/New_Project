const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Post content
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Post type and category
  type: {
    type: String,
    enum: ['Share', 'Question', 'Achievement', 'Tip', 'Challenge', 'Discussion', 'News'],
    required: true
  },
  
  category: {
    type: String,
    enum: ['Transportation', 'Energy', 'Food', 'Shopping', 'Waste', 'Water', 'Community', 'Education', 'General'],
    required: true
  },
  
  // Media attachments
  media: [{
    type: {
      type: String,
      enum: ['Image', 'Video', 'Document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: 200
    },
    size: Number, // in bytes
    mimeType: String
  }],
  
  // Tags and mentions
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Engagement metrics
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
  
  likesCount: {
    type: Number,
    default: 0
  },
  
  // Comments
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
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
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: 300
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    edited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  }],
  
  commentsCount: {
    type: Number,
    default: 0
  },
  
  // Shares and saves
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    platform: {
      type: String,
      enum: ['Internal', 'Twitter', 'Facebook', 'Instagram', 'WhatsApp', 'Other'],
      default: 'Internal'
    }
  }],
  
  sharesCount: {
    type: Number,
    default: 0
  },
  
  saves: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  savesCount: {
    type: Number,
    default: 0
  },
  
  // Post status and moderation
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Hidden', 'Reported', 'Removed'],
    default: 'Published'
  },
  
  visibility: {
    type: String,
    enum: ['Public', 'Followers', 'Private'],
    default: 'Public'
  },
  
  // Moderation flags
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['Spam', 'Inappropriate Content', 'Harassment', 'False Information', 'Other'],
      required: true
    },
    description: {
      type: String,
      maxlength: 300
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Featured and pinned posts
  featured: {
    type: Boolean,
    default: false
  },
  
  pinned: {
    type: Boolean,
    default: false
  },
  
  // Carbon impact related data
  carbonImpact: {
    action: String, // What eco-action was taken
    impact: Number, // CO2 saved in kg
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  // Achievement sharing
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  },
  
  // Task completion sharing
  taskCompletion: {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    userTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserTask'
    }
  },
  
  // Location data (optional)
  location: {
    city: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    },
    reachCount: {
      type: Number,
      default: 0
    }
  },
  
  // Editing history
  edited: {
    type: Boolean,
    default: false
  },
  
  editHistory: [{
    editedAt: Date,
    previousContent: String,
    reason: String
  }]
}, {
  timestamps: true
});

// Indexes for performance
communityPostSchema.index({ author: 1, createdAt: -1 });
communityPostSchema.index({ type: 1, category: 1 });
communityPostSchema.index({ status: 1, visibility: 1 });
communityPostSchema.index({ featured: 1, pinned: 1 });
communityPostSchema.index({ likesCount: -1, createdAt: -1 });
communityPostSchema.index({ tags: 1 });
communityPostSchema.index({ 'carbonImpact.impact': -1 });

// Text index for search
communityPostSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

// Virtual for total engagement
communityPostSchema.virtual('engagementScore').get(function() {
  return this.likesCount + this.commentsCount + this.sharesCount + this.savesCount;
});

// Virtual for engagement rate
communityPostSchema.virtual('engagementRate').get(function() {
  if (this.analytics.views === 0) return 0;
  return Math.round((this.engagementScore / this.analytics.views) * 100);
});

// Method to like/unlike post
communityPostSchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    // Unlike
    this.likes.pull(existingLike._id);
    this.likesCount = Math.max(0, this.likesCount - 1);
  } else {
    // Like
    this.likes.push({ user: userId });
    this.likesCount += 1;
  }
  
  return this.save();
};

// Method to add comment
communityPostSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  this.commentsCount += 1;
  return this.save();
};

// Method to share post
communityPostSchema.methods.sharePost = function(userId, platform = 'Internal') {
  this.shares.push({
    user: userId,
    platform: platform
  });
  this.sharesCount += 1;
  return this.save();
};

// Method to save/unsave post
communityPostSchema.methods.toggleSave = function(userId) {
  const existingSave = this.saves.find(save => save.user.toString() === userId.toString());
  
  if (existingSave) {
    // Unsave
    this.saves.pull(existingSave._id);
    this.savesCount = Math.max(0, this.savesCount - 1);
  } else {
    // Save
    this.saves.push({ user: userId });
    this.savesCount += 1;
  }
  
  return this.save();
};

// Method to report post
communityPostSchema.methods.reportPost = function(reporterId, reason, description = '') {
  this.reports.push({
    reporter: reporterId,
    reason: reason,
    description: description
  });
  
  // Auto-hide if multiple reports
  if (this.reports.length >= 3) {
    this.status = 'Reported';
  }
  
  return this.save();
};

// Method to increment view count
communityPostSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

// Static method to get trending posts
communityPostSchema.statics.getTrendingPosts = function(timeframe = '7d', limit = 20) {
  const date = new Date();
  const days = parseInt(timeframe) || 7;
  date.setDate(date.getDate() - days);
  
  return this.find({
    status: 'Published',
    visibility: 'Public',
    createdAt: { $gte: date }
  })
  .sort({ engagementScore: -1, createdAt: -1 })
  .limit(limit)
  .populate('author', 'name avatar level')
  .populate('comments.user', 'name avatar');
};

// Static method to get posts by category
communityPostSchema.statics.getPostsByCategory = function(category, limit = 20, skip = 0) {
  return this.find({
    category: category,
    status: 'Published',
    visibility: 'Public'
  })
  .sort({ featured: -1, pinned: -1, createdAt: -1 })
  .limit(limit)
  .skip(skip)
  .populate('author', 'name avatar level')
  .populate('comments.user', 'name avatar');
};

// Static method to search posts
communityPostSchema.statics.searchPosts = function(query, filters = {}, limit = 20) {
  const searchQuery = {
    $text: { $search: query },
    status: 'Published',
    visibility: 'Public'
  };
  
  if (filters.category) {
    searchQuery.category = filters.category;
  }
  
  if (filters.type) {
    searchQuery.type = filters.type;
  }
  
  if (filters.dateRange) {
    searchQuery.createdAt = {
      $gte: new Date(filters.dateRange.start),
      $lte: new Date(filters.dateRange.end)
    };
  }
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .limit(limit)
    .populate('author', 'name avatar level');
};

// Pre-save middleware to update engagement metrics
communityPostSchema.pre('save', function(next) {
  // Update counts from arrays
  this.likesCount = this.likes.length;
  this.commentsCount = this.comments.length;
  this.sharesCount = this.shares.length;
  this.savesCount = this.saves.length;
  
  // Calculate engagement rate
  if (this.analytics.views > 0) {
    this.analytics.engagementRate = Math.round((this.engagementScore / this.analytics.views) * 100);
  }
  
  next();
});

module.exports = mongoose.model('CommunityPost', communityPostSchema);
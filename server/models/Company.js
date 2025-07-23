const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    unique: true,
    index: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  tagline: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // Company Details
  industry: {
    primary: String,
    secondary: [String],
    tags: [String]
  },
  size: {
    type: String,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
    index: true
  },
  employeeCount: {
    min: Number,
    max: Number,
    exact: Number
  },
  founded: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  stage: {
    type: String,
    enum: ['seed', 'series-a', 'series-b', 'series-c', 'series-d', 'ipo', 'public', 'private', 'acquired']
  },
  
  // Contact Information
  website: {
    type: String,
    trim: true,
    lowercase: true
  },
  careersPage: String,
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: String,
  
  // Location Information
  headquarters: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  locations: [{
    type: {
      type: String,
      enum: ['headquarters', 'office', 'remote', 'coworking']
    },
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    employeeCount: Number,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Media and Branding
  logo: {
    url: String,
    sizes: {
      small: String,
      medium: String,
      large: String
    }
  },
  images: [{
    url: String,
    alt: String,
    type: { type: String, enum: ['office', 'team', 'product', 'event', 'other'] }
  }],
  colors: {
    primary: String,
    secondary: String,
    accent: String
  },
  
  // Social Media and Online Presence
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String,
    github: String,
    glassdoor: String,
    crunchbase: String
  },
  
  // Financial Information
  funding: {
    totalRaised: Number,
    currency: { type: String, default: 'USD' },
    lastRound: {
      type: String,
      enum: ['seed', 'series-a', 'series-b', 'series-c', 'series-d', 'ipo']
    },
    lastRoundAmount: Number,
    lastRoundDate: Date,
    investors: [String],
    valuation: Number
  },
  revenue: {
    annual: Number,
    currency: { type: String, default: 'USD' },
    year: Number,
    isEstimated: { type: Boolean, default: true }
  },
  
  // Company Culture and Values
  culture: {
    values: [String],
    mission: String,
    vision: String,
    workEnvironment: {
      type: String,
      enum: ['traditional', 'startup', 'corporate', 'creative', 'tech', 'remote-first']
    },
    perks: [String],
    benefits: {
      health: Boolean,
      dental: Boolean,
      vision: Boolean,
      retirement401k: Boolean,
      paidTimeOff: Number,
      flexibleSchedule: Boolean,
      remoteWork: Boolean,
      professionalDevelopment: Boolean,
      stockOptions: Boolean,
      gym: Boolean,
      meals: Boolean,
      other: [String]
    }
  },
  
  // Technology and Stack
  technology: {
    stack: [String],
    tools: [String],
    platforms: [String],
    databases: [String],
    cloudProviders: [String]
  },
  
  // Ratings and Reviews
  ratings: {
    glassdoor: {
      overall: { type: Number, min: 0, max: 5 },
      ceo: { type: Number, min: 0, max: 5 },
      culture: { type: Number, min: 0, max: 5 },
      workLife: { type: Number, min: 0, max: 5 },
      compensation: { type: Number, min: 0, max: 5 },
      career: { type: Number, min: 0, max: 5 },
      reviewCount: Number,
      recommendToFriend: Number, // percentage
      lastUpdated: Date
    },
    indeed: {
      overall: { type: Number, min: 0, max: 5 },
      reviewCount: Number,
      lastUpdated: Date
    },
    linkedin: {
      overall: { type: Number, min: 0, max: 5 },
      reviewCount: Number,
      lastUpdated: Date
    }
  },
  
  // Job Market Information
  hiring: {
    isActivelyHiring: { type: Boolean, default: false },
    openPositions: { type: Number, default: 0 },
    commonRoles: [String],
    averageSalary: {
      entry: Number,
      mid: Number,
      senior: Number,
      executive: Number
    },
    hiringDifficulty: {
      type: String,
      enum: ['easy', 'moderate', 'difficult', 'very-difficult']
    },
    averageInterviewProcess: {
      stages: Number,
      duration: Number, // in days
      responseTime: Number // in days
    }
  },
  
  // Company Performance
  performance: {
    growth: {
      type: String,
      enum: ['declining', 'stable', 'growing', 'fast-growing']
    },
    stability: {
      type: String,
      enum: ['unstable', 'stable', 'very-stable']
    },
    layoffs: [{
      date: Date,
      count: Number,
      percentage: Number,
      reason: String
    }],
    acquisitions: [{
      company: String,
      date: Date,
      amount: Number,
      currency: { type: String, default: 'USD' }
    }]
  },
  
  // Diversity and Inclusion
  diversity: {
    genderRatio: {
      male: Number,
      female: Number,
      other: Number
    },
    ethnicityBreakdown: [{
      ethnicity: String,
      percentage: Number
    }],
    leadershipDiversity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    inclusionScore: { type: Number, min: 0, max: 100 }
  },
  
  // Analytics and Tracking
  analytics: {
    profileViews: { type: Number, default: 0 },
    jobViews: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    lastViewed: Date,
    popularityScore: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 }
  },
  
  // Data Sources and Quality
  dataSources: [{
    source: String,
    lastUpdated: Date,
    reliability: { type: Number, min: 0, max: 100 },
    fields: [String]
  }],
  dataQuality: {
    completeness: { type: Number, min: 0, max: 100 },
    accuracy: { type: Number, min: 0, max: 100 },
    freshness: { type: Number, min: 0, max: 100 },
    lastValidated: Date
  },
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'acquired', 'closed'],
    default: 'active',
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // SEO and Marketing
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: String
  },
  
  // Related Companies
  competitors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }],
  partnerships: [{
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    type: { type: String, enum: ['strategic', 'technology', 'distribution', 'investment'] },
    startDate: Date,
    description: String
  }],
  
  // User Interactions
  followers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    followedAt: { type: Date, default: Date.now }
  }],
  
  // Admin and Moderation
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  claimedAt: Date,
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for company age
companySchema.virtual('age').get(function() {
  if (!this.founded) return null;
  return new Date().getFullYear() - this.founded;
});

// Virtual for total funding
companySchema.virtual('totalFunding').get(function() {
  if (!this.funding.totalRaised) return null;
  return this.funding.totalRaised;
});

// Virtual for average rating
companySchema.virtual('averageRating').get(function() {
  const ratings = [];
  if (this.ratings.glassdoor?.overall) ratings.push(this.ratings.glassdoor.overall);
  if (this.ratings.indeed?.overall) ratings.push(this.ratings.indeed.overall);
  if (this.ratings.linkedin?.overall) ratings.push(this.ratings.linkedin.overall);
  
  if (ratings.length === 0) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Virtual for full address
companySchema.virtual('fullAddress').get(function() {
  if (!this.headquarters) return null;
  
  const parts = [];
  if (this.headquarters.address) parts.push(this.headquarters.address);
  if (this.headquarters.city) parts.push(this.headquarters.city);
  if (this.headquarters.state) parts.push(this.headquarters.state);
  if (this.headquarters.country) parts.push(this.headquarters.country);
  
  return parts.join(', ');
});

// Pre-save middleware to generate slug
companySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Method to increment view count
companySchema.methods.incrementViewCount = function() {
  this.analytics.profileViews += 1;
  this.analytics.lastViewed = new Date();
  return this.save({ validateBeforeSave: false });
};

// Method to update hiring status
companySchema.methods.updateHiringStatus = function(openPositions) {
  this.hiring.openPositions = openPositions;
  this.hiring.isActivelyHiring = openPositions > 0;
  return this.save();
};

// Method to add follower
companySchema.methods.addFollower = function(userId) {
  const existingFollower = this.followers.find(f => f.user.toString() === userId.toString());
  if (!existingFollower) {
    this.followers.push({ user: userId });
    this.analytics.followers += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove follower
companySchema.methods.removeFollower = function(userId) {
  this.followers = this.followers.filter(f => f.user.toString() !== userId.toString());
  this.analytics.followers = Math.max(0, this.analytics.followers - 1);
  return this.save();
};

// Method to calculate popularity score
companySchema.methods.calculatePopularityScore = function() {
  let score = 0;
  
  // Base score from followers
  score += Math.min(this.analytics.followers * 0.1, 50);
  
  // Score from job applications
  score += Math.min(this.analytics.applications * 0.05, 30);
  
  // Score from ratings
  if (this.averageRating) {
    score += this.averageRating * 4; // Max 20 points
  }
  
  // Score from company size
  const sizeScores = { startup: 5, small: 10, medium: 15, large: 20, enterprise: 25 };
  if (this.size && sizeScores[this.size]) {
    score += sizeScores[this.size];
  }
  
  // Score from funding
  if (this.funding.totalRaised) {
    if (this.funding.totalRaised > 100000000) score += 20; // $100M+
    else if (this.funding.totalRaised > 10000000) score += 15; // $10M+
    else if (this.funding.totalRaised > 1000000) score += 10; // $1M+
    else score += 5;
  }
  
  this.analytics.popularityScore = Math.min(Math.round(score), 100);
  return this.analytics.popularityScore;
};

// Static method to find companies by industry
companySchema.statics.findByIndustry = function(industry) {
  return this.find({
    $or: [
      { 'industry.primary': { $regex: industry, $options: 'i' } },
      { 'industry.secondary': { $regex: industry, $options: 'i' } }
    ],
    status: 'active'
  });
};

// Static method to find companies by size
companySchema.statics.findBySize = function(size) {
  return this.find({ size, status: 'active' });
};

// Static method to find hiring companies
companySchema.statics.findHiring = function() {
  return this.find({ 
    'hiring.isActivelyHiring': true,
    status: 'active'
  }).sort({ 'hiring.openPositions': -1 });
};

// Static method to find top-rated companies
companySchema.statics.findTopRated = function(limit = 20) {
  return this.find({ status: 'active' })
    .sort({ 'analytics.popularityScore': -1 })
    .limit(limit);
};

// Static method to search companies
companySchema.statics.searchCompanies = function(query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { 'industry.primary': { $regex: query, $options: 'i' } },
      { 'industry.tags': { $regex: query, $options: 'i' } }
    ],
    status: 'active'
  });
};

// Indexes for better query performance
companySchema.index({ name: 'text', description: 'text', 'industry.primary': 'text' });
companySchema.index({ slug: 1 });
companySchema.index({ size: 1, status: 1 });
companySchema.index({ 'industry.primary': 1 });
companySchema.index({ 'hiring.isActivelyHiring': 1, 'hiring.openPositions': -1 });
companySchema.index({ 'analytics.popularityScore': -1 });
companySchema.index({ 'headquarters.city': 1, 'headquarters.state': 1 });
companySchema.index({ status: 1, createdAt: -1 });
companySchema.index({ isVerified: 1, isFeatured: 1 });

module.exports = mongoose.model('Company', companySchema);
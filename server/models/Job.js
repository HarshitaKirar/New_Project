const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Job Basic Information
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters'],
    index: true
  },
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true
    },
    logo: String,
    website: String,
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    },
    industry: String,
    description: String,
    rating: {
      type: Number,
      min: 0,
      max: 5
    }
  },
  
  // Job Details
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true
  },
  requirements: {
    education: {
      level: {
        type: String,
        enum: ['high-school', 'associate', 'bachelor', 'master', 'phd', 'not-specified']
      },
      field: String,
      preferred: Boolean
    },
    experience: {
      min: { type: Number, default: 0 },
      max: { type: Number },
      level: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'executive']
      }
    },
    skills: {
      required: [{
        name: { type: String, required: true, trim: true },
        importance: { type: String, enum: ['required', 'preferred', 'nice-to-have'], default: 'required' },
        category: { type: String, enum: ['technical', 'soft', 'language', 'certification'] }
      }],
      preferred: [{
        name: { type: String, required: true, trim: true },
        importance: { type: String, enum: ['required', 'preferred', 'nice-to-have'], default: 'preferred' },
        category: { type: String, enum: ['technical', 'soft', 'language', 'certification'] }
      }]
    },
    certifications: [String],
    languages: [String]
  },
  
  // Job Type and Schedule
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary'],
    required: true,
    index: true
  },
  workSchedule: {
    type: String,
    enum: ['standard', 'flexible', 'shift-work', 'weekend', 'on-call']
  },
  remote: {
    type: String,
    enum: ['on-site', 'remote', 'hybrid'],
    default: 'on-site',
    index: true
  },
  
  // Location
  location: {
    city: { type: String, trim: true, index: true },
    state: { type: String, trim: true, index: true },
    country: { type: String, trim: true, default: 'United States' },
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    timezone: String
  },
  
  // Compensation
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' },
    negotiable: { type: Boolean, default: false }
  },
  benefits: {
    health: Boolean,
    dental: Boolean,
    vision: Boolean,
    retirement401k: Boolean,
    paidTimeOff: Number, // days per year
    flexibleSchedule: Boolean,
    remoteWork: Boolean,
    professionalDevelopment: Boolean,
    stockOptions: Boolean,
    bonuses: Boolean,
    other: [String]
  },
  
  // Application Information
  applicationProcess: {
    method: {
      type: String,
      enum: ['external', 'email', 'online-form', 'company-website'],
      default: 'external'
    },
    applyUrl: String,
    contactEmail: String,
    applicationDeadline: Date,
    documentsRequired: [{
      type: String,
      enum: ['resume', 'cover-letter', 'portfolio', 'references', 'transcript', 'other']
    }],
    instructions: String
  },
  
  // Source Information
  source: {
    platform: {
      type: String,
      enum: ['linkedin', 'indeed', 'glassdoor', 'ziprecruiter', 'monster', 'careerbuilder', 'company-website', 'other'],
      required: true,
      index: true
    },
    jobId: String, // ID from the source platform
    url: { type: String, required: true },
    postedDate: Date,
    lastUpdated: Date,
    expiryDate: Date
  },
  
  // AI Analysis and Matching
  aiAnalysis: {
    keySkills: [String],
    industryTags: [String],
    seniorityLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'executive']
    },
    difficultyScore: {
      type: Number,
      min: 1,
      max: 10
    },
    competitiveness: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    growthPotential: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    workLifeBalance: {
      type: Number,
      min: 1,
      max: 5
    },
    cultureMatch: [String], // culture keywords
    redFlags: [String], // potential concerns
    highlights: [String] // positive aspects
  },
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['active', 'expired', 'filled', 'removed'],
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
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Analytics and Engagement
  analytics: {
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    clickThroughRate: { type: Number, default: 0 },
    averageMatchScore: { type: Number, default: 0 },
    lastViewed: Date
  },
  
  // Similar Jobs
  similarJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  
  // User Interactions
  savedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    savedAt: { type: Date, default: Date.now }
  }],
  
  // Data Quality
  dataQuality: {
    completeness: { type: Number, min: 0, max: 100 },
    accuracy: { type: Number, min: 0, max: 100 },
    freshness: { type: Number, min: 0, max: 100 },
    lastValidated: Date
  },
  
  // Scraping Metadata
  scrapingInfo: {
    lastScraped: Date,
    scrapingSource: String,
    scrapingVersion: String,
    processingTime: Number, // in milliseconds
    errors: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days since posting
jobSchema.virtual('daysSincePosted').get(function() {
  if (!this.source.postedDate) return null;
  const now = new Date();
  const posted = new Date(this.source.postedDate);
  const diffTime = Math.abs(now - posted);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for full location string
jobSchema.virtual('fullLocation').get(function() {
  const parts = [];
  if (this.location.city) parts.push(this.location.city);
  if (this.location.state) parts.push(this.location.state);
  if (this.location.country && this.location.country !== 'United States') {
    parts.push(this.location.country);
  }
  return parts.join(', ');
});

// Virtual for salary range string
jobSchema.virtual('salaryRange').get(function() {
  if (!this.salary.min && !this.salary.max) return null;
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.salary.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  if (this.salary.min && this.salary.max) {
    return `${formatter.format(this.salary.min)} - ${formatter.format(this.salary.max)}`;
  } else if (this.salary.min) {
    return `${formatter.format(this.salary.min)}+`;
  } else {
    return `Up to ${formatter.format(this.salary.max)}`;
  }
});

// Method to increment view count
jobSchema.methods.incrementViewCount = function() {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  return this.save({ validateBeforeSave: false });
};

// Method to increment application count
jobSchema.methods.incrementApplicationCount = function() {
  this.analytics.applications += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to calculate match score for a user
jobSchema.methods.calculateMatchScore = function(userSkills, userPreferences) {
  let score = 0;
  let maxScore = 100;
  
  // Skill matching (40% of total score)
  const skillScore = this.calculateSkillMatch(userSkills);
  score += skillScore * 0.4;
  
  // Location matching (20% of total score)
  const locationScore = this.calculateLocationMatch(userPreferences.locations);
  score += locationScore * 0.2;
  
  // Job type matching (20% of total score)
  const jobTypeScore = this.calculateJobTypeMatch(userPreferences.jobTypes);
  score += jobTypeScore * 0.2;
  
  // Salary matching (20% of total score)
  const salaryScore = this.calculateSalaryMatch(userPreferences.salaryRange);
  score += salaryScore * 0.2;
  
  return Math.round(score);
};

// Helper method to calculate skill match
jobSchema.methods.calculateSkillMatch = function(userSkills) {
  if (!userSkills || userSkills.length === 0) return 0;
  
  const requiredSkills = this.requirements.skills.required.map(s => s.name.toLowerCase());
  const preferredSkills = this.requirements.skills.preferred.map(s => s.name.toLowerCase());
  const userSkillNames = userSkills.map(s => s.name.toLowerCase());
  
  let matchedRequired = 0;
  let matchedPreferred = 0;
  
  requiredSkills.forEach(skill => {
    if (userSkillNames.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))) {
      matchedRequired++;
    }
  });
  
  preferredSkills.forEach(skill => {
    if (userSkillNames.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))) {
      matchedPreferred++;
    }
  });
  
  const requiredScore = requiredSkills.length > 0 ? (matchedRequired / requiredSkills.length) * 70 : 70;
  const preferredScore = preferredSkills.length > 0 ? (matchedPreferred / preferredSkills.length) * 30 : 30;
  
  return requiredScore + preferredScore;
};

// Helper method to calculate location match
jobSchema.methods.calculateLocationMatch = function(preferredLocations) {
  if (!preferredLocations || preferredLocations.length === 0) return 50;
  if (this.remote === 'remote') return 100;
  
  const jobLocation = this.fullLocation.toLowerCase();
  const isMatch = preferredLocations.some(location => 
    jobLocation.includes(location.toLowerCase()) || location.toLowerCase().includes(jobLocation)
  );
  
  return isMatch ? 100 : 0;
};

// Helper method to calculate job type match
jobSchema.methods.calculateJobTypeMatch = function(preferredJobTypes) {
  if (!preferredJobTypes || preferredJobTypes.length === 0) return 50;
  return preferredJobTypes.includes(this.jobType) ? 100 : 0;
};

// Helper method to calculate salary match
jobSchema.methods.calculateSalaryMatch = function(preferredSalaryRange) {
  if (!preferredSalaryRange || (!preferredSalaryRange.min && !preferredSalaryRange.max)) return 50;
  if (!this.salary.min && !this.salary.max) return 50;
  
  const jobMin = this.salary.min || 0;
  const jobMax = this.salary.max || 999999;
  const userMin = preferredSalaryRange.min || 0;
  const userMax = preferredSalaryRange.max || 999999;
  
  // Check for overlap
  if (jobMax >= userMin && jobMin <= userMax) {
    return 100;
  }
  
  // Calculate proximity if no overlap
  const distance = Math.min(Math.abs(jobMin - userMax), Math.abs(userMin - jobMax));
  const maxDistance = Math.max(userMax, jobMax);
  return Math.max(0, 100 - (distance / maxDistance) * 100);
};

// Static method to find jobs by skill
jobSchema.statics.findBySkill = function(skillName) {
  return this.find({
    $or: [
      { 'requirements.skills.required.name': { $regex: skillName, $options: 'i' } },
      { 'requirements.skills.preferred.name': { $regex: skillName, $options: 'i' } },
      { 'aiAnalysis.keySkills': { $regex: skillName, $options: 'i' } }
    ],
    status: 'active'
  });
};

// Static method to find recent jobs
jobSchema.statics.findRecent = function(limit = 20) {
  return this.find({ status: 'active' })
    .sort({ 'source.postedDate': -1, createdAt: -1 })
    .limit(limit);
};

// Static method to find jobs by location
jobSchema.statics.findByLocation = function(city, state) {
  const query = { status: 'active' };
  if (city) query['location.city'] = { $regex: city, $options: 'i' };
  if (state) query['location.state'] = { $regex: state, $options: 'i' };
  return this.find(query);
};

// Indexes for better query performance
jobSchema.index({ title: 'text', 'company.name': 'text', description: 'text' });
jobSchema.index({ status: 1, 'source.postedDate': -1 });
jobSchema.index({ jobType: 1, remote: 1 });
jobSchema.index({ 'location.city': 1, 'location.state': 1 });
jobSchema.index({ 'requirements.skills.required.name': 1 });
jobSchema.index({ 'requirements.skills.preferred.name': 1 });
jobSchema.index({ 'company.name': 1 });
jobSchema.index({ 'source.platform': 1 });
jobSchema.index({ 'aiAnalysis.seniorityLevel': 1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
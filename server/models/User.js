const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  }
});

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  achievements: [{
    type: String,
    trim: true
  }]
});

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: true,
    trim: true
  },
  degree: {
    type: String,
    required: true,
    trim: true
  },
  fieldOfStudy: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4
  }
});

const jobPreferencesSchema = new mongoose.Schema({
  desiredRoles: [{
    type: String,
    trim: true
  }],
  industries: [{
    type: String,
    trim: true
  }],
  locations: [{
    city: String,
    state: String,
    country: String,
    remote: Boolean
  }],
  salaryRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  employmentType: [{
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
    default: 'Full-time'
  }],
  workArrangement: [{
    type: String,
    enum: ['Remote', 'Hybrid', 'On-site'],
    default: 'Hybrid'
  }],
  availabilityDate: {
    type: Date,
    default: Date.now
  }
});

const profileAnalysisSchema = new mongoose.Schema({
  strengthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  skillGaps: [{
    skill: String,
    importance: String,
    recommendation: String
  }],
  marketPosition: {
    type: String,
    enum: ['Entry-level', 'Mid-level', 'Senior-level', 'Executive'],
    default: 'Entry-level'
  },
  improvementSuggestions: [{
    category: String,
    suggestion: String,
    priority: String
  }],
  lastAnalyzed: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
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
  phone: {
    type: String,
    trim: true
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  
  // Professional Information
  headline: {
    type: String,
    trim: true,
    maxlength: 200
  },
  summary: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  skills: [skillSchema],
  experience: [experienceSchema],
  education: [educationSchema],
  
  // Resume Information
  resumeUrl: {
    type: String
  },
  resumeFileName: {
    type: String
  },
  resumeAnalysis: {
    extractedText: String,
    keySkills: [String],
    experienceYears: Number,
    lastUpdated: Date
  },
  
  // Job Preferences
  jobPreferences: jobPreferencesSchema,
  
  // Profile Analysis
  profileAnalysis: profileAnalysisSchema,
  
  // Application Settings
  autoApplyEnabled: {
    type: Boolean,
    default: false
  },
  dailyApplicationLimit: {
    type: Number,
    default: 10,
    min: 1,
    max: 50
  },
  jobAlertFrequency: {
    type: String,
    enum: ['Real-time', 'Daily', 'Weekly'],
    default: 'Daily'
  },
  
  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiresAt: {
    type: Date
  },
  
  // Tracking
  lastLoginAt: {
    type: Date
  },
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ 'jobPreferences.desiredRoles': 1 });
userSchema.index({ 'jobPreferences.locations.city': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate profile completeness
userSchema.methods.calculateProfileCompleteness = function() {
  let score = 0;
  const weights = {
    basicInfo: 20,
    professionalInfo: 25,
    experience: 20,
    education: 15,
    skills: 15,
    preferences: 5
  };
  
  // Basic information
  if (this.firstName && this.lastName && this.email && this.phone && this.location.city) {
    score += weights.basicInfo;
  }
  
  // Professional information
  if (this.headline && this.summary) {
    score += weights.professionalInfo;
  }
  
  // Experience
  if (this.experience && this.experience.length > 0) {
    score += weights.experience;
  }
  
  // Education
  if (this.education && this.education.length > 0) {
    score += weights.education;
  }
  
  // Skills
  if (this.skills && this.skills.length >= 5) {
    score += weights.skills;
  }
  
  // Job preferences
  if (this.jobPreferences.desiredRoles && this.jobPreferences.desiredRoles.length > 0) {
    score += weights.preferences;
  }
  
  this.profileCompleteness = score;
  return score;
};

// Method to get skills by category
userSchema.methods.getSkillsByLevel = function(level) {
  return this.skills.filter(skill => skill.level === level);
};

// Method to check if premium
userSchema.methods.isPremiumActive = function() {
  return this.isPremium && this.premiumExpiresAt && this.premiumExpiresAt > new Date();
};

module.exports = mongoose.model('User', userSchema);
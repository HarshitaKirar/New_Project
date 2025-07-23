const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number']
  },
  
  // Profile Information
  profilePicture: {
    type: String,
    default: null
  },
  location: {
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    zipCode: { type: String, trim: true }
  },
  
  // Professional Information
  currentTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'Current title cannot exceed 100 characters']
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    default: 'entry'
  },
  industry: {
    type: String,
    trim: true
  },
  
  // Skills and Preferences
  skills: [{
    name: { type: String, required: true, trim: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
    category: { type: String, enum: ['technical', 'soft', 'language', 'certification'], default: 'technical' }
  }],
  
  // Job Search Preferences
  jobPreferences: {
    desiredRoles: [{ type: String, trim: true }],
    industries: [{ type: String, trim: true }],
    locations: [{ type: String, trim: true }],
    remoteWork: { type: Boolean, default: false },
    salaryRange: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 }
    },
    jobTypes: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship']
    }],
    workSchedule: [{
      type: String,
      enum: ['flexible', 'standard', 'shift-work', 'weekend']
    }]
  },
  
  // Resume and Documents
  resumeFile: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now },
    parsedData: {
      extractedText: String,
      skills: [String],
      experience: [{
        company: String,
        position: String,
        startDate: String,
        endDate: String,
        description: String
      }],
      education: [{
        institution: String,
        degree: String,
        field: String,
        graduationDate: String
      }],
      certifications: [String],
      languages: [String]
    }
  },
  
  // Application Settings
  applicationSettings: {
    autoApply: { type: Boolean, default: false },
    maxApplicationsPerDay: { type: Number, default: 5, min: 1, max: 20 },
    coverLetterTemplate: { type: String, default: '' },
    followUpEnabled: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true }
  },
  
  // Account Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Subscription and Usage
  subscription: {
    plan: { type: String, enum: ['free', 'premium', 'enterprise'], default: 'free' },
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true }
  },
  usage: {
    applicationsThisMonth: { type: Number, default: 0 },
    lastApplicationDate: Date,
    totalApplications: { type: Number, default: 0 }
  },
  
  // Analytics and Tracking
  analytics: {
    profileViews: { type: Number, default: 0 },
    jobsViewed: { type: Number, default: 0 },
    applicationsSubmitted: { type: Number, default: 0 },
    interviewsScheduled: { type: Number, default: 0 },
    offersReceived: { type: Number, default: 0 }
  },
  
  // Timestamps
  lastLogin: Date,
  lastProfileUpdate: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for application success rate
userSchema.virtual('successRate').get(function() {
  if (this.analytics.applicationsSubmitted === 0) return 0;
  return Math.round((this.analytics.offersReceived / this.analytics.applicationsSubmitted) * 100);
});

// Pre-save middleware to hash password
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

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Method to increment application count
userSchema.methods.incrementApplicationCount = function() {
  this.usage.applicationsThisMonth += 1;
  this.usage.totalApplications += 1;
  this.usage.lastApplicationDate = new Date();
  this.analytics.applicationsSubmitted += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to check if user can apply to more jobs
userSchema.methods.canApplyToJobs = function() {
  if (this.subscription.plan === 'free') {
    return this.usage.applicationsThisMonth < 10; // Free plan limit
  } else if (this.subscription.plan === 'premium') {
    return this.usage.applicationsThisMonth < 100; // Premium plan limit
  }
  return true; // Enterprise plan - unlimited
};

// Static method to find users by skill
userSchema.statics.findBySkill = function(skillName) {
  return this.find({
    'skills.name': { $regex: skillName, $options: 'i' }
  });
};

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ 'jobPreferences.desiredRoles': 1 });
userSchema.index({ 'location.city': 1, 'location.state': 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // File Information
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true,
    enum: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  size: {
    type: Number,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  
  // Parsing Status
  parsingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  parsingError: {
    type: String,
    default: null
  },
  
  // Extracted Raw Text
  extractedText: {
    type: String,
    default: ''
  },
  
  // Parsed Personal Information
  personalInfo: {
    fullName: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    linkedin: String,
    github: String,
    portfolio: String,
    website: String
  },
  
  // Professional Summary
  summary: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Work Experience
  experience: [{
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
    location: {
      city: String,
      state: String,
      country: String
    },
    startDate: {
      month: String,
      year: String
    },
    endDate: {
      month: String,
      year: String,
      current: { type: Boolean, default: false }
    },
    description: {
      type: String,
      trim: true
    },
    responsibilities: [String],
    achievements: [String],
    technologies: [String],
    industry: String
  }],
  
  // Education
  education: [{
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
    field: {
      type: String,
      trim: true
    },
    gpa: {
      value: Number,
      scale: Number
    },
    startDate: {
      month: String,
      year: String
    },
    endDate: {
      month: String,
      year: String
    },
    location: {
      city: String,
      state: String,
      country: String
    },
    honors: [String],
    relevantCoursework: [String]
  }],
  
  // Skills
  skills: {
    technical: [{
      name: { type: String, required: true, trim: true },
      level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
      yearsOfExperience: Number,
      category: String // e.g., 'Programming Languages', 'Frameworks', 'Databases'
    }],
    soft: [{
      name: { type: String, required: true, trim: true },
      level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] }
    }],
    languages: [{
      name: { type: String, required: true, trim: true },
      proficiency: { type: String, enum: ['basic', 'conversational', 'fluent', 'native'] }
    }]
  },
  
  // Certifications
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      trim: true
    },
    issueDate: {
      month: String,
      year: String
    },
    expiryDate: {
      month: String,
      year: String
    },
    credentialId: String,
    credentialUrl: String,
    isActive: { type: Boolean, default: true }
  }],
  
  // Projects
  projects: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    technologies: [String],
    startDate: {
      month: String,
      year: String
    },
    endDate: {
      month: String,
      year: String
    },
    url: String,
    githubUrl: String,
    role: String,
    teamSize: Number,
    highlights: [String]
  }],
  
  // Publications
  publications: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    journal: String,
    authors: [String],
    publishedDate: {
      month: String,
      year: String
    },
    url: String,
    doi: String
  }],
  
  // Awards and Honors
  awards: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    issuer: String,
    date: {
      month: String,
      year: String
    },
    description: String
  }],
  
  // AI Analysis Results
  aiAnalysis: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    industryMatch: [{
      industry: String,
      matchScore: Number,
      reasons: [String]
    }],
    roleMatch: [{
      role: String,
      matchScore: Number,
      reasons: [String]
    }],
    skillGaps: [{
      skill: String,
      importance: { type: String, enum: ['low', 'medium', 'high'] },
      suggestion: String
    }],
    salaryEstimate: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
      location: String
    },
    careerLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'executive']
    },
    experienceYears: Number
  },
  
  // Optimization Suggestions
  optimizations: [{
    section: {
      type: String,
      enum: ['summary', 'experience', 'education', 'skills', 'certifications', 'projects', 'overall']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    suggestion: String,
    impact: String,
    implemented: { type: Boolean, default: false }
  }],
  
  // Formatting and Structure Analysis
  formatting: {
    hasProperStructure: Boolean,
    hasContactInfo: Boolean,
    hasSummary: Boolean,
    hasExperience: Boolean,
    hasEducation: Boolean,
    hasSkills: Boolean,
    lengthScore: Number, // 1-100 based on optimal length
    readabilityScore: Number, // 1-100 based on readability
    keywordDensity: Number,
    atsCompatible: Boolean
  },
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Processing Metadata
  processingTime: Number, // in milliseconds
  aiModel: String, // which AI model was used for parsing
  parsingVersion: String, // version of parsing algorithm
  
  // Analytics
  analytics: {
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    lastViewed: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total years of experience
resumeSchema.virtual('totalExperience').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  let totalMonths = 0;
  this.experience.forEach(exp => {
    if (exp.startDate && exp.startDate.year) {
      const startYear = parseInt(exp.startDate.year);
      const startMonth = exp.startDate.month ? new Date(`${exp.startDate.month} 1, ${startYear}`).getMonth() : 0;
      
      let endYear, endMonth;
      if (exp.endDate && exp.endDate.current) {
        const now = new Date();
        endYear = now.getFullYear();
        endMonth = now.getMonth();
      } else if (exp.endDate && exp.endDate.year) {
        endYear = parseInt(exp.endDate.year);
        endMonth = exp.endDate.month ? new Date(`${exp.endDate.month} 1, ${endYear}`).getMonth() : 11;
      } else {
        return; // Skip if no end date
      }
      
      const months = (endYear - startYear) * 12 + (endMonth - startMonth);
      totalMonths += Math.max(0, months);
    }
  });
  
  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
});

// Virtual for skill count
resumeSchema.virtual('skillCount').get(function() {
  let count = 0;
  if (this.skills.technical) count += this.skills.technical.length;
  if (this.skills.soft) count += this.skills.soft.length;
  if (this.skills.languages) count += this.skills.languages.length;
  return count;
});

// Method to update parsing status
resumeSchema.methods.updateParsingStatus = function(status, error = null) {
  this.parsingStatus = status;
  if (error) this.parsingError = error;
  return this.save();
};

// Method to add AI analysis
resumeSchema.methods.addAIAnalysis = function(analysis) {
  this.aiAnalysis = { ...this.aiAnalysis, ...analysis };
  return this.save();
};

// Method to increment view count
resumeSchema.methods.incrementViewCount = function() {
  this.analytics.viewCount += 1;
  this.analytics.lastViewed = new Date();
  return this.save({ validateBeforeSave: false });
};

// Static method to find resumes by skill
resumeSchema.statics.findBySkill = function(skillName) {
  return this.find({
    $or: [
      { 'skills.technical.name': { $regex: skillName, $options: 'i' } },
      { 'skills.soft.name': { $regex: skillName, $options: 'i' } }
    ]
  });
};

// Static method to find recent resumes
resumeSchema.statics.findRecent = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName email');
};

// Indexes for better query performance
resumeSchema.index({ userId: 1 });
resumeSchema.index({ parsingStatus: 1 });
resumeSchema.index({ 'skills.technical.name': 1 });
resumeSchema.index({ 'experience.company': 1 });
resumeSchema.index({ 'education.institution': 1 });
resumeSchema.index({ createdAt: -1 });
resumeSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
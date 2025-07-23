const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Resume Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  version: {
    type: String,
    default: '1.0'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // File Information
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['PDF', 'DOC', 'DOCX'],
    required: true
  },
  fileSize: {
    type: Number // in bytes
  },
  
  // Content Analysis
  extractedText: {
    type: String,
    required: true
  },
  
  // Structured Data
  sections: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      website: String,
      summary: String
    },
    
    experience: [{
      company: String,
      position: String,
      startDate: String,
      endDate: String,
      isCurrent: Boolean,
      description: String,
      achievements: [String],
      skills: [String]
    }],
    
    education: [{
      institution: String,
      degree: String,
      fieldOfStudy: String,
      startDate: String,
      endDate: String,
      gpa: String,
      achievements: [String]
    }],
    
    skills: [{
      name: String,
      category: String,
      level: String,
      yearsOfExperience: Number
    }],
    
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      url: String,
      startDate: String,
      endDate: String
    }],
    
    certifications: [{
      name: String,
      issuer: String,
      issueDate: String,
      expiryDate: String,
      credentialId: String,
      url: String
    }],
    
    languages: [{
      name: String,
      proficiency: String
    }],
    
    awards: [{
      name: String,
      issuer: String,
      date: String,
      description: String
    }],
    
    publications: [{
      title: String,
      publisher: String,
      date: String,
      url: String,
      description: String
    }],
    
    volunteerWork: [{
      organization: String,
      role: String,
      startDate: String,
      endDate: String,
      description: String
    }]
  },
  
  // AI Analysis
  aiAnalysis: {
    extractedSkills: [{
      skill: String,
      confidence: Number,
      category: String,
      yearsOfExperience: Number
    }],
    
    experienceLevel: {
      type: String,
      enum: ['Entry-level', 'Mid-level', 'Senior-level', 'Executive']
    },
    
    totalExperience: {
      type: Number // in years
    },
    
    industryFocus: [String],
    
    strengthsAnalysis: {
      technicalSkills: [String],
      softSkills: [String],
      achievements: [String],
      uniqueValue: String
    },
    
    improvementSuggestions: [{
      category: String,
      suggestion: String,
      priority: String,
      impact: String
    }],
    
    atsScore: {
      type: Number,
      min: 0,
      max: 100
    },
    
    keywords: [String],
    
    formatting: {
      score: Number,
      issues: [String],
      suggestions: [String]
    },
    
    contentQuality: {
      score: Number,
      strengths: [String],
      weaknesses: [String]
    },
    
    lastAnalyzed: {
      type: Date,
      default: Date.now
    }
  },
  
  // Customizations History
  customizations: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    jobTitle: String,
    company: String,
    customizedAt: {
      type: Date,
      default: Date.now
    },
    changes: [{
      section: String,
      field: String,
      originalContent: String,
      customizedContent: String,
      reason: String,
      aiGenerated: Boolean
    }],
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    customizedFileUrl: String,
    isUsed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Performance Metrics
  metrics: {
    totalApplications: {
      type: Number,
      default: 0
    },
    successfulApplications: {
      type: Number,
      default: 0
    },
    interviewRate: {
      type: Number,
      default: 0
    },
    averageMatchScore: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    popularCustomizations: [{
      field: String,
      frequency: Number,
      avgImpact: Number
    }]
  },
  
  // Version Control
  parentResume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  childVersions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  }],
  
  // Settings
  settings: {
    allowAutoCustomization: {
      type: Boolean,
      default: true
    },
    customizationLevel: {
      type: String,
      enum: ['Conservative', 'Moderate', 'Aggressive'],
      default: 'Moderate'
    },
    preserveSections: [String], // sections that should not be auto-customized
    maxCustomizations: {
      type: Number,
      default: 10
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Archived', 'Draft'],
    default: 'Active'
  },
  
  // Tags and Categories
  tags: [String],
  category: {
    type: String,
    enum: ['General', 'Technical', 'Creative', 'Executive', 'Academic', 'Entry-level'],
    default: 'General'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
resumeSchema.index({ user: 1, isDefault: 1 });
resumeSchema.index({ user: 1, status: 1 });
resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ 'aiAnalysis.extractedSkills.skill': 1 });
resumeSchema.index({ 'customizations.jobId': 1 });
resumeSchema.index({ category: 1 });

// Virtual for resume age
resumeSchema.virtual('age').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Virtual for success rate
resumeSchema.virtual('successRate').get(function() {
  if (this.metrics.totalApplications === 0) return 0;
  return Math.round((this.metrics.successfulApplications / this.metrics.totalApplications) * 100);
});

// Method to extract skills from content
resumeSchema.methods.extractSkills = async function() {
  const natural = require('natural');
  const skillKeywords = [
    // Programming languages
    'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
    // Frameworks
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    // Cloud
    'aws', 'azure', 'gcp', 'docker', 'kubernetes',
    // Tools
    'git', 'jenkins', 'jira', 'slack', 'figma', 'photoshop'
  ];
  
  const extractedSkills = [];
  const text = this.extractedText.toLowerCase();
  
  skillKeywords.forEach(skill => {
    if (text.includes(skill)) {
      // Calculate confidence based on frequency and context
      const regex = new RegExp(skill, 'gi');
      const matches = text.match(regex);
      const frequency = matches ? matches.length : 0;
      const confidence = Math.min(frequency * 0.3, 1);
      
      extractedSkills.push({
        skill: skill,
        confidence: confidence,
        category: this.categorizeSkill(skill)
      });
    }
  });
  
  this.aiAnalysis.extractedSkills = extractedSkills;
  return extractedSkills;
};

// Method to categorize skills
resumeSchema.methods.categorizeSkill = function(skill) {
  const categories = {
    'Programming Languages': ['javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift'],
    'Frameworks': ['react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring'],
    'Databases': ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch'],
    'Cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes'],
    'Tools': ['git', 'jenkins', 'jira', 'slack', 'figma', 'photoshop']
  };
  
  for (const [category, skills] of Object.entries(categories)) {
    if (skills.includes(skill.toLowerCase())) {
      return category;
    }
  }
  
  return 'Other';
};

// Method to calculate ATS score
resumeSchema.methods.calculateATSScore = function() {
  let score = 0;
  const maxScore = 100;
  
  // Check for standard sections (30 points)
  const requiredSections = ['personalInfo', 'experience', 'education', 'skills'];
  const presentSections = requiredSections.filter(section => 
    this.sections[section] && Object.keys(this.sections[section]).length > 0
  );
  score += (presentSections.length / requiredSections.length) * 30;
  
  // Check for contact information (20 points)
  const contactFields = ['name', 'email', 'phone'];
  const presentContactFields = contactFields.filter(field => 
    this.sections.personalInfo && this.sections.personalInfo[field]
  );
  score += (presentContactFields.length / contactFields.length) * 20;
  
  // Check for experience details (25 points)
  if (this.sections.experience && this.sections.experience.length > 0) {
    const experienceScore = this.sections.experience.reduce((acc, exp) => {
      let expScore = 0;
      if (exp.company) expScore += 0.25;
      if (exp.position) expScore += 0.25;
      if (exp.startDate) expScore += 0.25;
      if (exp.description) expScore += 0.25;
      return acc + expScore;
    }, 0);
    score += (experienceScore / this.sections.experience.length) * 25;
  }
  
  // Check for skills (15 points)
  if (this.sections.skills && this.sections.skills.length >= 5) {
    score += 15;
  } else if (this.sections.skills && this.sections.skills.length > 0) {
    score += (this.sections.skills.length / 5) * 15;
  }
  
  // Check for education (10 points)
  if (this.sections.education && this.sections.education.length > 0) {
    score += 10;
  }
  
  this.aiAnalysis.atsScore = Math.round(score);
  return Math.round(score);
};

// Method to customize resume for a specific job
resumeSchema.methods.customizeForJob = async function(job, customizationLevel = 'Moderate') {
  const customization = {
    jobId: job._id,
    jobTitle: job.title,
    company: job.company.name,
    changes: [],
    customizedAt: new Date()
  };
  
  // Customize skills section based on job requirements
  if (job.requiredSkills && this.sections.skills) {
    const jobSkills = job.requiredSkills.map(s => s.name.toLowerCase());
    const resumeSkills = this.sections.skills.map(s => s.name.toLowerCase());
    
    // Add missing skills that the user might have but didn't emphasize
    jobSkills.forEach(jobSkill => {
      if (!resumeSkills.includes(jobSkill) && this.extractedText.toLowerCase().includes(jobSkill)) {
        customization.changes.push({
          section: 'skills',
          field: 'add_skill',
          originalContent: '',
          customizedContent: jobSkill,
          reason: `Added ${jobSkill} to match job requirements`,
          aiGenerated: true
        });
      }
    });
  }
  
  // Customize summary/objective
  if (this.sections.personalInfo.summary && customizationLevel !== 'Conservative') {
    const customizedSummary = await this.generateCustomSummary(job);
    if (customizedSummary) {
      customization.changes.push({
        section: 'personalInfo',
        field: 'summary',
        originalContent: this.sections.personalInfo.summary,
        customizedContent: customizedSummary,
        reason: 'Tailored summary to match job requirements',
        aiGenerated: true
      });
    }
  }
  
  // Calculate match score
  customization.matchScore = job.calculateMatchScore({
    skills: this.sections.skills,
    jobPreferences: { employmentType: [job.employmentType] },
    profileAnalysis: { marketPosition: this.aiAnalysis.experienceLevel }
  });
  
  this.customizations.push(customization);
  return this.save();
};

// Method to generate custom summary (placeholder for AI integration)
resumeSchema.methods.generateCustomSummary = async function(job) {
  // This would integrate with OpenAI API in a real implementation
  const originalSummary = this.sections.personalInfo.summary;
  const jobTitle = job.title;
  const companyName = job.company.name;
  
  // Simple template-based customization for now
  if (originalSummary) {
    return originalSummary.replace(/\b(seeking|looking for|interested in)\b.*?\./i, 
      `seeking a ${jobTitle} position at ${companyName}.`);
  }
  
  return null;
};

// Method to update metrics
resumeSchema.methods.updateMetrics = function(applicationResult) {
  this.metrics.totalApplications += 1;
  
  if (applicationResult.successful) {
    this.metrics.successfulApplications += 1;
  }
  
  if (applicationResult.matchScore) {
    const currentAvg = this.metrics.averageMatchScore || 0;
    const total = this.metrics.totalApplications;
    this.metrics.averageMatchScore = ((currentAvg * (total - 1)) + applicationResult.matchScore) / total;
  }
  
  this.metrics.interviewRate = (this.metrics.successfulApplications / this.metrics.totalApplications) * 100;
  this.metrics.lastUsed = new Date();
  
  return this.save();
};

// Method to create a new version
resumeSchema.methods.createVersion = function(versionData) {
  const newResume = new this.constructor({
    ...this.toObject(),
    _id: undefined,
    name: versionData.name || `${this.name} v${parseFloat(this.version) + 0.1}`,
    version: versionData.version || `${parseFloat(this.version) + 0.1}`,
    parentResume: this._id,
    isDefault: false,
    customizations: [],
    metrics: {
      totalApplications: 0,
      successfulApplications: 0,
      interviewRate: 0,
      averageMatchScore: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Update parent resume
  this.childVersions.push(newResume._id);
  this.save();
  
  return newResume.save();
};

// Static method to find best resume for a job
resumeSchema.statics.findBestForJob = async function(userId, job) {
  const resumes = await this.find({ 
    user: userId, 
    status: 'Active' 
  }).sort({ 'metrics.averageMatchScore': -1, isDefault: -1 });
  
  if (resumes.length === 0) return null;
  
  // Calculate match scores for all resumes
  const resumesWithScores = resumes.map(resume => ({
    resume,
    matchScore: job.calculateMatchScore({
      skills: resume.sections.skills,
      jobPreferences: { employmentType: [job.employmentType] },
      profileAnalysis: { marketPosition: resume.aiAnalysis.experienceLevel }
    })
  }));
  
  // Sort by match score
  resumesWithScores.sort((a, b) => b.matchScore - a.matchScore);
  
  return resumesWithScores[0].resume;
};

// Pre-save middleware
resumeSchema.pre('save', function(next) {
  // Ensure only one default resume per user
  if (this.isDefault && this.isModified('isDefault')) {
    this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    ).exec();
  }
  
  // Update ATS score if content changed
  if (this.isModified('sections') || this.isModified('extractedText')) {
    this.calculateATSScore();
  }
  
  next();
});

// Ensure virtual fields are serialized
resumeSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Resume', resumeSchema);
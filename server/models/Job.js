const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Basic Job Information
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  company: {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    logo: {
      type: String
    },
    website: {
      type: String
    },
    size: {
      type: String,
      enum: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise']
    },
    industry: {
      type: String,
      trim: true
    }
  },
  
  // Job Details
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String
  },
  responsibilities: {
    type: String
  },
  benefits: {
    type: String
  },
  
  // Location Information
  location: {
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'United States'
    },
    isRemote: {
      type: Boolean,
      default: false
    },
    workArrangement: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'On-site'
    }
  },
  
  // Employment Details
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
    required: true,
    default: 'Full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['Entry-level', 'Mid-level', 'Senior-level', 'Executive'],
    default: 'Mid-level'
  },
  
  // Salary Information
  salary: {
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['Hourly', 'Monthly', 'Yearly'],
      default: 'Yearly'
    },
    isNegotiable: {
      type: Boolean,
      default: false
    }
  },
  
  // Skills and Requirements
  requiredSkills: [{
    name: {
      type: String,
      trim: true
    },
    importance: {
      type: String,
      enum: ['Required', 'Preferred', 'Nice-to-have'],
      default: 'Required'
    }
  }],
  
  // Source Information
  source: {
    platform: {
      type: String,
      required: true,
      enum: ['LinkedIn', 'Indeed', 'Naukri', 'Glassdoor', 'AngelList', 'Monster', 'ZipRecruiter', 'Direct']
    },
    url: {
      type: String,
      required: true
    },
    jobId: {
      type: String,
      required: true
    },
    postedDate: {
      type: Date
    },
    scrapedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // AI Analysis
  aiAnalysis: {
    skillsExtracted: [{
      skill: String,
      confidence: Number,
      category: String
    }],
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1
    },
    difficultyLevel: {
      type: Number,
      min: 1,
      max: 10
    },
    keywords: [String],
    jobCategory: {
      type: String,
      trim: true
    },
    lastAnalyzed: {
      type: Date,
      default: Date.now
    }
  },
  
  // Application Information
  applicationMethod: {
    type: {
      type: String,
      enum: ['Direct', 'Email', 'External', 'Platform'],
      default: 'External'
    },
    email: {
      type: String
    },
    applicationUrl: {
      type: String
    },
    instructions: {
      type: String
    }
  },
  
  // Status and Tracking
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Filled', 'Closed', 'Paused'],
    default: 'Active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // Interaction Tracking
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  saves: {
    type: Number,
    default: 0
  },
  
  // Expiration
  expiresAt: {
    type: Date
  },
  
  // Duplicate Detection
  duplicateHash: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
jobSchema.index({ 'company.name': 1, title: 1 });
jobSchema.index({ 'location.city': 1, 'location.isRemote': 1 });
jobSchema.index({ employmentType: 1, experienceLevel: 1 });
jobSchema.index({ 'source.platform': 1, 'source.jobId': 1 }, { unique: true });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ 'requiredSkills.name': 1 });
jobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
jobSchema.index({ duplicateHash: 1 });

// Text index for search functionality
jobSchema.index({
  title: 'text',
  'company.name': 'text',
  description: 'text',
  'location.city': 'text'
});

// Virtual for full location
jobSchema.virtual('fullLocation').get(function() {
  if (this.location.isRemote) {
    return 'Remote';
  }
  
  const parts = [];
  if (this.location.city) parts.push(this.location.city);
  if (this.location.state) parts.push(this.location.state);
  if (this.location.country && this.location.country !== 'United States') {
    parts.push(this.location.country);
  }
  
  return parts.join(', ') || 'Location not specified';
});

// Virtual for salary range display
jobSchema.virtual('salaryDisplay').get(function() {
  if (!this.salary.min && !this.salary.max) {
    return 'Salary not disclosed';
  }
  
  const formatSalary = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };
  
  if (this.salary.min && this.salary.max) {
    return `${formatSalary(this.salary.min)} - ${formatSalary(this.salary.max)}`;
  } else if (this.salary.min) {
    return `${formatSalary(this.salary.min)}+`;
  } else {
    return `Up to ${formatSalary(this.salary.max)}`;
  }
});

// Method to check if job is expired
jobSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Method to calculate job matching score for a user
jobSchema.methods.calculateMatchScore = function(userProfile) {
  let score = 0;
  let totalWeight = 0;
  
  // Skills matching (40% weight)
  const skillWeight = 40;
  if (userProfile.skills && this.requiredSkills) {
    const userSkillNames = userProfile.skills.map(s => s.name.toLowerCase());
    const jobSkillNames = this.requiredSkills.map(s => s.name.toLowerCase());
    
    const matchingSkills = userSkillNames.filter(skill => 
      jobSkillNames.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
    );
    
    const skillScore = (matchingSkills.length / Math.max(jobSkillNames.length, 1)) * 100;
    score += skillScore * (skillWeight / 100);
  }
  totalWeight += skillWeight;
  
  // Location matching (20% weight)
  const locationWeight = 20;
  if (userProfile.jobPreferences && userProfile.jobPreferences.locations) {
    const userLocations = userProfile.jobPreferences.locations;
    const jobLocation = this.location;
    
    let locationMatch = false;
    
    // Check for remote preference
    if (jobLocation.isRemote && userLocations.some(loc => loc.remote)) {
      locationMatch = true;
    }
    
    // Check for city/state match
    if (!locationMatch) {
      locationMatch = userLocations.some(loc => 
        (loc.city && loc.city.toLowerCase() === jobLocation.city?.toLowerCase()) ||
        (loc.state && loc.state.toLowerCase() === jobLocation.state?.toLowerCase())
      );
    }
    
    if (locationMatch) {
      score += locationWeight;
    }
  }
  totalWeight += locationWeight;
  
  // Employment type matching (15% weight)
  const employmentWeight = 15;
  if (userProfile.jobPreferences && userProfile.jobPreferences.employmentType) {
    if (userProfile.jobPreferences.employmentType.includes(this.employmentType)) {
      score += employmentWeight;
    }
  }
  totalWeight += employmentWeight;
  
  // Experience level matching (15% weight)
  const experienceWeight = 15;
  if (userProfile.profileAnalysis && userProfile.profileAnalysis.marketPosition) {
    const userLevel = userProfile.profileAnalysis.marketPosition;
    const jobLevel = this.experienceLevel;
    
    // Exact match gets full points
    if (userLevel === jobLevel) {
      score += experienceWeight;
    }
    // Adjacent levels get partial points
    else {
      const levels = ['Entry-level', 'Mid-level', 'Senior-level', 'Executive'];
      const userIndex = levels.indexOf(userLevel);
      const jobIndex = levels.indexOf(jobLevel);
      
      if (Math.abs(userIndex - jobIndex) === 1) {
        score += experienceWeight * 0.5;
      }
    }
  }
  totalWeight += experienceWeight;
  
  // Salary matching (10% weight)
  const salaryWeight = 10;
  if (userProfile.jobPreferences && userProfile.jobPreferences.salaryRange && this.salary.min) {
    const userMin = userProfile.jobPreferences.salaryRange.min || 0;
    const userMax = userProfile.jobPreferences.salaryRange.max || Infinity;
    const jobSalary = this.salary.min;
    
    if (jobSalary >= userMin && jobSalary <= userMax) {
      score += salaryWeight;
    } else if (jobSalary >= userMin * 0.8) {
      score += salaryWeight * 0.5;
    }
  }
  totalWeight += salaryWeight;
  
  // Normalize score to 0-100 range
  return Math.min(Math.round((score / totalWeight) * 100), 100);
};

// Method to increment view count
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment application count
jobSchema.methods.incrementApplications = function() {
  this.applications += 1;
  return this.save();
};

// Method to generate duplicate hash
jobSchema.methods.generateDuplicateHash = function() {
  const crypto = require('crypto');
  const content = `${this.title}-${this.company.name}-${this.location.city}`;
  this.duplicateHash = crypto.createHash('md5').update(content.toLowerCase()).digest('hex');
  return this.duplicateHash;
};

// Pre-save middleware
jobSchema.pre('save', function(next) {
  // Generate duplicate hash if not exists
  if (!this.duplicateHash) {
    this.generateDuplicateHash();
  }
  
  // Set expiration date if not set (default 30 days)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Ensure virtual fields are serialized
jobSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Job', jobSchema);
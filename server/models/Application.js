const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  
  // Application Details
  applicationMethod: {
    type: String,
    enum: ['automated', 'manual', 'bulk'],
    default: 'automated',
    index: true
  },
  status: {
    type: String,
    enum: [
      'draft',
      'submitted',
      'under-review',
      'screening',
      'phone-interview',
      'technical-interview',
      'on-site-interview',
      'final-interview',
      'reference-check',
      'offer-pending',
      'offer-received',
      'offer-accepted',
      'offer-declined',
      'rejected',
      'withdrawn',
      'expired'
    ],
    default: 'draft',
    index: true
  },
  
  // Application Content
  coverLetter: {
    content: String,
    isCustom: { type: Boolean, default: false },
    aiGenerated: { type: Boolean, default: true },
    template: String,
    wordCount: Number
  },
  
  // Submission Details
  submittedAt: Date,
  submissionUrl: String,
  submissionConfirmation: {
    confirmationNumber: String,
    confirmationEmail: String,
    screenshot: String // URL to screenshot of submission
  },
  
  // Application Tracking
  timeline: [{
    status: {
      type: String,
      enum: [
        'submitted',
        'viewed',
        'under-review',
        'screening',
        'phone-interview',
        'technical-interview',
        'on-site-interview',
        'final-interview',
        'reference-check',
        'offer-pending',
        'offer-received',
        'offer-accepted',
        'offer-declined',
        'rejected',
        'withdrawn'
      ]
    },
    date: { type: Date, default: Date.now },
    notes: String,
    source: { type: String, enum: ['system', 'user', 'email', 'scraping'], default: 'system' },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Interview Information
  interviews: [{
    type: {
      type: String,
      enum: ['phone', 'video', 'on-site', 'technical', 'behavioral', 'panel', 'informal']
    },
    scheduledDate: Date,
    duration: Number, // in minutes
    location: String,
    interviewers: [{
      name: String,
      title: String,
      email: String,
      linkedinProfile: String
    }],
    meetingLink: String,
    instructions: String,
    preparation: {
      notes: String,
      resources: [String],
      questionsToAsk: [String]
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      notes: String,
      strengths: [String],
      areasForImprovement: [String],
      nextSteps: String
    },
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  
  // Communication History
  communications: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'message', 'notification']
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound']
    },
    from: String,
    to: String,
    subject: String,
    content: String,
    attachments: [String],
    date: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    importance: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal'
    }
  }],
  
  // Offer Details
  offer: {
    salary: {
      amount: Number,
      currency: { type: String, default: 'USD' },
      period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' },
      negotiable: Boolean
    },
    benefits: {
      health: Boolean,
      dental: Boolean,
      vision: Boolean,
      retirement401k: Boolean,
      paidTimeOff: Number,
      stockOptions: {
        offered: Boolean,
        amount: Number,
        vestingSchedule: String
      },
      bonuses: {
        signing: Number,
        annual: Number,
        performance: Boolean
      },
      other: [String]
    },
    startDate: Date,
    location: String,
    remote: Boolean,
    offerDate: Date,
    expiryDate: Date,
    negotiationHistory: [{
      date: Date,
      counterOffer: {
        salary: Number,
        benefits: String,
        startDate: Date,
        other: String
      },
      response: String,
      notes: String
    }]
  },
  
  // Application Analytics
  analytics: {
    viewedByEmployer: { type: Boolean, default: false },
    viewedAt: Date,
    timeToResponse: Number, // in hours
    responseRate: Number, // percentage
    matchScore: { type: Number, min: 0, max: 100 },
    competitionLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  },
  
  // Follow-up Information
  followUp: {
    enabled: { type: Boolean, default: true },
    lastFollowUp: Date,
    nextFollowUp: Date,
    followUpCount: { type: Number, default: 0 },
    maxFollowUps: { type: Number, default: 3 },
    template: String,
    customMessage: String
  },
  
  // Application Quality
  quality: {
    resumeMatch: { type: Number, min: 0, max: 100 },
    coverLetterQuality: { type: Number, min: 0, max: 100 },
    applicationCompleteness: { type: Number, min: 0, max: 100 },
    submissionTiming: {
      type: String,
      enum: ['early', 'optimal', 'late'],
      default: 'optimal'
    },
    overallScore: { type: Number, min: 0, max: 100 }
  },
  
  // Error Handling
  errors: [{
    type: {
      type: String,
      enum: ['submission', 'parsing', 'network', 'authentication', 'validation']
    },
    message: String,
    details: String,
    occurredAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolvedAt: Date
  }],
  
  // User Notes and Tags
  userNotes: String,
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Automation Settings
  automation: {
    autoFollow: { type: Boolean, default: true },
    autoWithdraw: { type: Boolean, default: false },
    withdrawAfterDays: { type: Number, default: 30 },
    notifications: {
      statusChange: { type: Boolean, default: true },
      interviews: { type: Boolean, default: true },
      offers: { type: Boolean, default: true },
      rejections: { type: Boolean, default: false }
    }
  },
  
  // Source and Attribution
  source: {
    platform: String,
    referral: String,
    campaign: String,
    utm: {
      source: String,
      medium: String,
      campaign: String
    }
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: String,
    location: {
      city: String,
      state: String,
      country: String
    },
    timezone: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days since application
applicationSchema.virtual('daysSinceApplication').get(function() {
  if (!this.submittedAt) return null;
  const now = new Date();
  const submitted = new Date(this.submittedAt);
  const diffTime = Math.abs(now - submitted);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for current interview stage
applicationSchema.virtual('currentStage').get(function() {
  const stageOrder = [
    'draft', 'submitted', 'under-review', 'screening',
    'phone-interview', 'technical-interview', 'on-site-interview',
    'final-interview', 'reference-check', 'offer-pending',
    'offer-received', 'offer-accepted', 'offer-declined',
    'rejected', 'withdrawn', 'expired'
  ];
  return stageOrder.indexOf(this.status);
});

// Virtual for application progress percentage
applicationSchema.virtual('progressPercentage').get(function() {
  const totalStages = 12; // Number of positive stages before final outcome
  const currentStage = this.currentStage;
  
  if (currentStage < 0) return 0;
  if (['offer-accepted', 'offer-received'].includes(this.status)) return 100;
  if (['rejected', 'withdrawn', 'expired', 'offer-declined'].includes(this.status)) return 0;
  
  return Math.round((currentStage / totalStages) * 100);
});

// Virtual for time to response
applicationSchema.virtual('responseTime').get(function() {
  if (!this.submittedAt || this.timeline.length < 2) return null;
  
  const firstResponse = this.timeline.find(t => t.status !== 'submitted');
  if (!firstResponse) return null;
  
  const diffTime = new Date(firstResponse.date) - new Date(this.submittedAt);
  return Math.round(diffTime / (1000 * 60 * 60)); // in hours
});

// Method to update status
applicationSchema.methods.updateStatus = function(newStatus, notes = '', source = 'system') {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    date: new Date(),
    notes,
    source
  });
  
  // Update analytics
  if (newStatus === 'under-review' && !this.analytics.viewedByEmployer) {
    this.analytics.viewedByEmployer = true;
    this.analytics.viewedAt = new Date();
  }
  
  return this.save();
};

// Method to add interview
applicationSchema.methods.addInterview = function(interviewData) {
  this.interviews.push(interviewData);
  
  // Update status if appropriate
  const interviewStatuses = ['phone-interview', 'technical-interview', 'on-site-interview', 'final-interview'];
  if (interviewStatuses.includes(interviewData.type + '-interview')) {
    this.updateStatus(interviewData.type + '-interview', `${interviewData.type} interview scheduled`);
  }
  
  return this.save();
};

// Method to add communication
applicationSchema.methods.addCommunication = function(communicationData) {
  this.communications.push(communicationData);
  return this.save();
};

// Method to calculate match score
applicationSchema.methods.calculateMatchScore = function(job, userProfile) {
  // This would typically be called when the application is created
  // and the score would be stored in analytics.matchScore
  let score = 0;
  
  // Skill matching
  if (job.requirements && job.requirements.skills && userProfile.skills) {
    const jobSkills = [...job.requirements.skills.required, ...job.requirements.skills.preferred];
    const userSkills = userProfile.skills.map(s => s.name.toLowerCase());
    
    const matchedSkills = jobSkills.filter(jobSkill => 
      userSkills.some(userSkill => 
        userSkill.includes(jobSkill.name.toLowerCase()) || 
        jobSkill.name.toLowerCase().includes(userSkill)
      )
    );
    
    score += (matchedSkills.length / jobSkills.length) * 40;
  }
  
  // Experience matching
  if (job.requirements && job.requirements.experience && userProfile.totalExperience) {
    const requiredExp = job.requirements.experience.min || 0;
    const userExp = userProfile.totalExperience;
    
    if (userExp >= requiredExp) {
      score += 30;
    } else {
      score += (userExp / requiredExp) * 30;
    }
  }
  
  // Location matching
  if (job.location && userProfile.location) {
    if (job.remote === 'remote' || 
        job.location.city === userProfile.location.city ||
        job.location.state === userProfile.location.state) {
      score += 20;
    }
  }
  
  // Education matching
  if (job.requirements && job.requirements.education && userProfile.education) {
    // Simplified education matching
    score += 10;
  }
  
  this.analytics.matchScore = Math.round(score);
  return this.analytics.matchScore;
};

// Method to schedule follow-up
applicationSchema.methods.scheduleFollowUp = function(days = 7) {
  if (this.followUp.enabled && this.followUp.followUpCount < this.followUp.maxFollowUps) {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + days);
    this.followUp.nextFollowUp = followUpDate;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to find applications by status
applicationSchema.statics.findByStatus = function(status, userId = null) {
  const query = { status };
  if (userId) query.userId = userId;
  return this.find(query).populate('jobId').populate('userId', 'firstName lastName email');
};

// Static method to find recent applications
applicationSchema.statics.findRecent = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('jobId', 'title company location salary')
    .populate('resumeId', 'filename version');
};

// Static method to get application statistics
applicationSchema.statics.getStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Indexes for better query performance
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ submittedAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ 'followUp.nextFollowUp': 1 });
applicationSchema.index({ applicationMethod: 1 });
applicationSchema.index({ createdAt: -1 });

// Compound indexes
applicationSchema.index({ userId: 1, createdAt: -1 });
applicationSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
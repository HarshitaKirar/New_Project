const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // References
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  
  // Application Details
  status: {
    type: String,
    enum: [
      'Draft',
      'Submitted',
      'Under Review',
      'Phone Screen',
      'Technical Interview',
      'Final Interview',
      'Offer Extended',
      'Accepted',
      'Rejected',
      'Withdrawn',
      'Expired'
    ],
    default: 'Draft',
    index: true
  },
  
  // Application Method
  applicationMethod: {
    type: String,
    enum: ['Automated', 'Manual', 'One-Click'],
    default: 'Automated'
  },
  
  // Customized Documents
  customizedResume: {
    fileName: String,
    fileUrl: String,
    content: String,
    aiCustomizations: [{
      section: String,
      originalContent: String,
      customizedContent: String,
      reason: String
    }],
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  coverLetter: {
    content: String,
    aiGenerated: {
      type: Boolean,
      default: true
    },
    customizations: [{
      paragraph: String,
      reason: String,
      personalizedFor: String
    }],
    tone: {
      type: String,
      enum: ['Professional', 'Enthusiastic', 'Conservative', 'Creative'],
      default: 'Professional'
    }
  },
  
  // Application Tracking
  submissionDetails: {
    submittedAt: Date,
    platform: String,
    applicationId: String,
    confirmationNumber: String,
    submissionMethod: {
      type: String,
      enum: ['Direct', 'Email', 'Platform', 'API']
    }
  },
  
  // Communication History
  communications: [{
    type: {
      type: String,
      enum: ['Email', 'Phone', 'Message', 'Interview', 'Follow-up', 'Rejection', 'Offer']
    },
    direction: {
      type: String,
      enum: ['Inbound', 'Outbound']
    },
    subject: String,
    content: String,
    sender: String,
    recipient: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isImportant: {
      type: Boolean,
      default: false
    }
  }],
  
  // Interview Information
  interviews: [{
    type: {
      type: String,
      enum: ['Phone Screen', 'Video Call', 'On-site', 'Technical', 'Panel', 'Final']
    },
    scheduledAt: Date,
    duration: Number, // in minutes
    interviewer: {
      name: String,
      title: String,
      email: String
    },
    location: String,
    meetingLink: String,
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No-show'],
      default: 'Scheduled'
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      notes: String,
      strengths: [String],
      improvements: [String],
      nextSteps: String
    },
    preparation: {
      companyResearch: String,
      questionsAsked: [String],
      questionsToAsk: [String]
    }
  }],
  
  // Follow-up Tracking
  followUps: [{
    type: {
      type: String,
      enum: ['Thank You', 'Status Check', 'Additional Info', 'Salary Discussion', 'Acceptance', 'Decline']
    },
    scheduledFor: Date,
    completedAt: Date,
    content: String,
    response: String,
    isAutomated: {
      type: Boolean,
      default: false
    }
  }],
  
  // Offer Details
  offer: {
    salary: {
      base: Number,
      bonus: Number,
      equity: String,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    benefits: [String],
    startDate: Date,
    location: String,
    isRemote: Boolean,
    offerReceivedAt: Date,
    responseDeadline: Date,
    negotiationNotes: String,
    finalTerms: String
  },
  
  // Analytics and Insights
  analytics: {
    timeToResponse: Number, // in hours
    applicationToInterviewTime: Number, // in days
    interviewToOfferTime: Number, // in days
    totalProcessTime: Number, // in days
    responseRate: Number,
    conversionRate: Number
  },
  
  // AI Insights
  aiInsights: {
    rejectionReason: String,
    improvementSuggestions: [String],
    successFactors: [String],
    competitorAnalysis: String,
    marketFeedback: String,
    lastAnalyzed: Date
  },
  
  // User Actions
  userActions: {
    isSaved: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    notes: String,
    tags: [String]
  },
  
  // Automation Settings
  automationSettings: {
    autoFollowUp: {
      type: Boolean,
      default: true
    },
    followUpInterval: {
      type: Number,
      default: 7 // days
    },
    maxFollowUps: {
      type: Number,
      default: 2
    },
    autoStatusUpdate: {
      type: Boolean,
      default: true
    }
  },
  
  // External Integration
  externalData: {
    linkedinUrl: String,
    glassdoorData: mongoose.Schema.Types.Mixed,
    companyInsights: mongoose.Schema.Types.Mixed,
    salaryData: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, createdAt: -1 });
applicationSchema.index({ job: 1, createdAt: -1 });
applicationSchema.index({ status: 1, 'submissionDetails.submittedAt': -1 });
applicationSchema.index({ 'offer.responseDeadline': 1 });
applicationSchema.index({ 'interviews.scheduledAt': 1 });
applicationSchema.index({ 'followUps.scheduledFor': 1 });

// Virtual for application age
applicationSchema.virtual('applicationAge').get(function() {
  if (!this.submissionDetails.submittedAt) return null;
  
  const now = new Date();
  const submitted = new Date(this.submissionDetails.submittedAt);
  const diffTime = Math.abs(now - submitted);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Virtual for next action
applicationSchema.virtual('nextAction').get(function() {
  const now = new Date();
  
  // Check for upcoming interviews
  const upcomingInterview = this.interviews.find(interview => 
    interview.status === 'Scheduled' && interview.scheduledAt > now
  );
  if (upcomingInterview) {
    return {
      type: 'Interview',
      date: upcomingInterview.scheduledAt,
      description: `${upcomingInterview.type} interview`
    };
  }
  
  // Check for pending follow-ups
  const pendingFollowUp = this.followUps.find(followUp => 
    !followUp.completedAt && followUp.scheduledFor <= now
  );
  if (pendingFollowUp) {
    return {
      type: 'Follow-up',
      date: pendingFollowUp.scheduledFor,
      description: pendingFollowUp.type
    };
  }
  
  // Check for offer deadline
  if (this.offer && this.offer.responseDeadline && this.offer.responseDeadline > now) {
    return {
      type: 'Offer Response',
      date: this.offer.responseDeadline,
      description: 'Respond to job offer'
    };
  }
  
  return null;
});

// Method to update status with timestamp
applicationSchema.methods.updateStatus = function(newStatus, note = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Add to communications log
  this.communications.push({
    type: 'Status Update',
    direction: 'Internal',
    subject: `Status changed from ${oldStatus} to ${newStatus}`,
    content: note,
    timestamp: new Date()
  });
  
  // Update analytics
  this.updateAnalytics();
  
  return this.save();
};

// Method to add communication
applicationSchema.methods.addCommunication = function(communicationData) {
  this.communications.push({
    ...communicationData,
    timestamp: new Date()
  });
  
  return this.save();
};

// Method to schedule interview
applicationSchema.methods.scheduleInterview = function(interviewData) {
  this.interviews.push({
    ...interviewData,
    status: 'Scheduled'
  });
  
  // Update status if not already at interview stage
  if (!['Phone Screen', 'Technical Interview', 'Final Interview'].includes(this.status)) {
    this.status = interviewData.type || 'Phone Screen';
  }
  
  return this.save();
};

// Method to add follow-up
applicationSchema.methods.scheduleFollowUp = function(followUpData) {
  this.followUps.push({
    ...followUpData,
    scheduledFor: followUpData.scheduledFor || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  
  return this.save();
};

// Method to record offer
applicationSchema.methods.recordOffer = function(offerData) {
  this.offer = {
    ...offerData,
    offerReceivedAt: new Date()
  };
  
  this.status = 'Offer Extended';
  
  return this.save();
};

// Method to update analytics
applicationSchema.methods.updateAnalytics = function() {
  const submitted = this.submissionDetails.submittedAt;
  if (!submitted) return;
  
  const now = new Date();
  const submittedDate = new Date(submitted);
  
  // Calculate total process time
  this.analytics.totalProcessTime = Math.ceil((now - submittedDate) / (1000 * 60 * 60 * 24));
  
  // Calculate time to first response
  const firstResponse = this.communications.find(comm => comm.direction === 'Inbound');
  if (firstResponse) {
    this.analytics.timeToResponse = Math.ceil(
      (new Date(firstResponse.timestamp) - submittedDate) / (1000 * 60 * 60)
    );
  }
  
  // Calculate application to interview time
  const firstInterview = this.interviews[0];
  if (firstInterview) {
    this.analytics.applicationToInterviewTime = Math.ceil(
      (new Date(firstInterview.scheduledAt) - submittedDate) / (1000 * 60 * 60 * 24)
    );
  }
  
  // Calculate interview to offer time
  if (this.offer && firstInterview) {
    this.analytics.interviewToOfferTime = Math.ceil(
      (new Date(this.offer.offerReceivedAt) - new Date(firstInterview.scheduledAt)) / (1000 * 60 * 60 * 24)
    );
  }
};

// Method to check if application needs follow-up
applicationSchema.methods.needsFollowUp = function() {
  if (!this.automationSettings.autoFollowUp) return false;
  
  const lastCommunication = this.communications
    .filter(comm => comm.direction === 'Outbound')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  
  if (!lastCommunication) return true;
  
  const daysSinceLastContact = Math.ceil(
    (new Date() - new Date(lastCommunication.timestamp)) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceLastContact >= this.automationSettings.followUpInterval;
};

// Static method to get applications needing follow-up
applicationSchema.statics.findNeedingFollowUp = function() {
  return this.find({
    status: { $in: ['Submitted', 'Under Review', 'Phone Screen', 'Technical Interview'] },
    'automationSettings.autoFollowUp': true
  }).populate('user job');
};

// Pre-save middleware
applicationSchema.pre('save', function(next) {
  // Update analytics on save
  if (this.isModified('status') || this.isModified('communications') || this.isModified('interviews')) {
    this.updateAnalytics();
  }
  
  next();
});

// Ensure virtual fields are serialized
applicationSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Application', applicationSchema);
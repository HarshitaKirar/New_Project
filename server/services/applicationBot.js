const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const User = require('../models/User');
const aiService = require('./aiService');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

class ApplicationBot {
  constructor() {
    this.browser = null;
    this.emailTransporter = null;
    this.isRunning = false;
    this.applicationQueue = [];
    
    this.initEmailTransporter();
  }

  // Initialize email transporter for automated communications
  initEmailTransporter() {
    if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.emailTransporter = nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }

  // Main method to apply to a job
  async applyToJob(userId, jobId, options = {}) {
    try {
      const user = await User.findById(userId);
      const job = await Job.findById(jobId);
      
      if (!user || !job) {
        throw new Error('User or job not found');
      }

      // Check if already applied
      const existingApplication = await Application.findOne({ user: userId, job: jobId });
      if (existingApplication) {
        throw new Error('Already applied to this job');
      }

      // Check daily application limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayApplications = await Application.countDocuments({
        user: userId,
        createdAt: { $gte: today }
      });

      if (todayApplications >= user.dailyApplicationLimit) {
        throw new Error('Daily application limit reached');
      }

      // Find best resume for this job
      const bestResume = await Resume.findBestForJob(userId, job);
      if (!bestResume) {
        throw new Error('No resume found for user');
      }

      // Create application record
      const application = new Application({
        user: userId,
        job: jobId,
        status: 'Draft',
        applicationMethod: options.method || 'Automated'
      });

      // Customize resume for this job
      const customizedResume = await this.customizeResumeForJob(bestResume, job, options.customizationLevel);
      application.customizedResume = customizedResume;

      // Generate cover letter
      const coverLetter = await this.generateCoverLetter(user, job, options.coverLetterTone);
      application.coverLetter = coverLetter;

      // Save application
      await application.save();

      // Submit application based on method
      let submissionResult;
      switch (job.applicationMethod.type) {
        case 'Direct':
          submissionResult = await this.submitDirectApplication(application, job);
          break;
        case 'Email':
          submissionResult = await this.submitEmailApplication(application, job);
          break;
        case 'External':
          submissionResult = await this.submitExternalApplication(application, job);
          break;
        default:
          submissionResult = await this.submitExternalApplication(application, job);
      }

      // Update application with submission details
      application.submissionDetails = {
        submittedAt: new Date(),
        platform: job.source.platform,
        applicationId: submissionResult.applicationId,
        confirmationNumber: submissionResult.confirmationNumber,
        submissionMethod: submissionResult.method
      };
      application.status = 'Submitted';

      await application.save();

      // Update job application count
      await job.incrementApplications();

      // Update resume metrics
      await bestResume.updateMetrics({
        successful: true,
        matchScore: customizedResume.matchScore
      });

      // Schedule follow-up if enabled
      if (user.automationSettings?.autoFollowUp) {
        await this.scheduleFollowUp(application);
      }

      return application;

    } catch (error) {
      console.error('Error applying to job:', error);
      throw error;
    }
  }

  // Customize resume for specific job
  async customizeResumeForJob(resume, job, customizationLevel = 'Moderate') {
    try {
      // Use AI to customize resume
      const customization = await aiService.customizeResume(
        resume.sections,
        job,
        customizationLevel
      );

      // Calculate match score
      const matchScore = aiService.calculateJobMatchScore(
        { skills: resume.sections.skills },
        job
      );

      return {
        fileName: `${resume.name}_${job.company.name}_${Date.now()}.pdf`,
        content: JSON.stringify(customization.customizedContent),
        aiCustomizations: customization.changes,
        matchScore: matchScore
      };

    } catch (error) {
      console.error('Error customizing resume:', error);
      // Return original resume if customization fails
      return {
        fileName: resume.fileName,
        content: JSON.stringify(resume.sections),
        aiCustomizations: [],
        matchScore: 50
      };
    }
  }

  // Generate cover letter for job application
  async generateCoverLetter(user, job, tone = 'Professional') {
    try {
      const coverLetterContent = await aiService.generateCoverLetter(user, job, tone);
      
      return {
        content: coverLetterContent,
        aiGenerated: true,
        tone: tone,
        customizations: [
          {
            paragraph: 'Opening',
            reason: 'Personalized for company and role',
            personalizedFor: `${job.title} at ${job.company.name}`
          }
        ]
      };

    } catch (error) {
      console.error('Error generating cover letter:', error);
      // Return template cover letter if AI fails
      return {
        content: this.generateTemplateCoverLetter(user, job),
        aiGenerated: false,
        tone: tone,
        customizations: []
      };
    }
  }

  // Template cover letter fallback
  generateTemplateCoverLetter(user, job) {
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company.name}. With my background in ${user.skills?.slice(0, 3).map(s => s.name).join(', ') || 'relevant technologies'}, I am excited about the opportunity to contribute to your team.

In my previous roles, I have developed expertise in areas that align well with your requirements. I am particularly drawn to ${job.company.name} because of your reputation for innovation and excellence in the industry.

I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team's success. Thank you for considering my application.

Best regards,
${user.firstName} ${user.lastName}`;
  }

  // Submit application directly through company website
  async submitDirectApplication(application, job) {
    try {
      if (!this.browser) {
        this.browser = await puppeteer.launch({ headless: 'new' });
      }

      const page = await this.browser.newPage();
      await page.goto(job.applicationMethod.applicationUrl);

      // This would contain platform-specific logic
      // For now, return mock success
      await page.close();

      return {
        method: 'Direct',
        applicationId: `direct_${Date.now()}`,
        confirmationNumber: `CONF_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        success: true
      };

    } catch (error) {
      console.error('Error submitting direct application:', error);
      throw new Error('Failed to submit direct application');
    }
  }

  // Submit application via email
  async submitEmailApplication(application, job) {
    try {
      if (!this.emailTransporter) {
        throw new Error('Email transporter not configured');
      }

      const user = await User.findById(application.user);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: job.applicationMethod.email,
        subject: `Application for ${job.title} - ${user.firstName} ${user.lastName}`,
        html: `
          <p>Dear Hiring Manager,</p>
          
          <p>Please find attached my application for the ${job.title} position at ${job.company.name}.</p>
          
          ${application.coverLetter.content.replace(/\n/g, '<br>')}
          
          <p>I have attached my resume for your review. I look forward to hearing from you.</p>
          
          <p>Best regards,<br>
          ${user.firstName} ${user.lastName}<br>
          ${user.email}<br>
          ${user.phone || ''}</p>
        `,
        attachments: [
          {
            filename: application.customizedResume.fileName,
            content: application.customizedResume.content,
            contentType: 'application/pdf'
          }
        ]
      };

      const result = await this.emailTransporter.sendMail(mailOptions);

      return {
        method: 'Email',
        applicationId: result.messageId,
        confirmationNumber: `EMAIL_${Date.now()}`,
        success: true
      };

    } catch (error) {
      console.error('Error submitting email application:', error);
      throw new Error('Failed to submit email application');
    }
  }

  // Submit application through external job board
  async submitExternalApplication(application, job) {
    try {
      // This would contain platform-specific automation logic
      // For LinkedIn, Indeed, Naukri, etc.
      
      const platform = job.source.platform;
      
      switch (platform) {
        case 'LinkedIn':
          return await this.submitLinkedInApplication(application, job);
        case 'Indeed':
          return await this.submitIndeedApplication(application, job);
        case 'Naukri':
          return await this.submitNaukriApplication(application, job);
        default:
          // Generic external submission
          return {
            method: 'External',
            applicationId: `ext_${platform.toLowerCase()}_${Date.now()}`,
            confirmationNumber: `EXT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            success: true
          };
      }

    } catch (error) {
      console.error('Error submitting external application:', error);
      throw new Error('Failed to submit external application');
    }
  }

  // LinkedIn application automation
  async submitLinkedInApplication(application, job) {
    try {
      if (!this.browser) {
        this.browser = await puppeteer.launch({ headless: 'new' });
      }

      const page = await this.browser.newPage();
      
      // Navigate to job URL
      await page.goto(job.source.url);
      
      // Look for "Easy Apply" button
      const easyApplyButton = await page.$('.jobs-s-apply button[aria-label*="Easy Apply"]');
      
      if (easyApplyButton) {
        await easyApplyButton.click();
        
        // Handle multi-step application process
        await this.handleLinkedInApplicationSteps(page, application);
        
        await page.close();
        
        return {
          method: 'LinkedIn Easy Apply',
          applicationId: `linkedin_${Date.now()}`,
          confirmationNumber: `LI_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          success: true
        };
      } else {
        // Redirect to external site
        await page.close();
        throw new Error('LinkedIn Easy Apply not available');
      }

    } catch (error) {
      console.error('LinkedIn application error:', error);
      throw error;
    }
  }

  // Handle LinkedIn multi-step application
  async handleLinkedInApplicationSteps(page, application) {
    try {
      // Wait for application modal
      await page.waitForSelector('.jobs-easy-apply-modal', { timeout: 5000 });
      
      // Fill in any required fields
      const phoneInput = await page.$('input[id*="phoneNumber"]');
      if (phoneInput) {
        const user = await User.findById(application.user);
        await phoneInput.type(user.phone || '');
      }
      
      // Handle cover letter section
      const coverLetterTextarea = await page.$('textarea[id*="coverLetter"]');
      if (coverLetterTextarea) {
        await coverLetterTextarea.type(application.coverLetter.content);
      }
      
      // Click through steps
      let nextButton = await page.$('button[aria-label="Continue to next step"]');
      while (nextButton) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        nextButton = await page.$('button[aria-label="Continue to next step"]');
      }
      
      // Submit application
      const submitButton = await page.$('button[aria-label*="Submit application"]');
      if (submitButton) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }

    } catch (error) {
      console.error('Error handling LinkedIn application steps:', error);
      throw error;
    }
  }

  // Indeed application automation (placeholder)
  async submitIndeedApplication(application, job) {
    // Similar implementation for Indeed
    return {
      method: 'Indeed Apply',
      applicationId: `indeed_${Date.now()}`,
      confirmationNumber: `ID_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      success: true
    };
  }

  // Naukri application automation (placeholder)
  async submitNaukriApplication(application, job) {
    // Similar implementation for Naukri
    return {
      method: 'Naukri Apply',
      applicationId: `naukri_${Date.now()}`,
      confirmationNumber: `NK_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      success: true
    };
  }

  // Schedule automated follow-up
  async scheduleFollowUp(application) {
    try {
      const user = await User.findById(application.user);
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + (user.automationSettings?.followUpInterval || 7));

      await application.scheduleFollowUp({
        type: 'Status Check',
        scheduledFor: followUpDate,
        content: this.generateFollowUpMessage(application),
        isAutomated: true
      });

    } catch (error) {
      console.error('Error scheduling follow-up:', error);
    }
  }

  // Generate follow-up message
  generateFollowUpMessage(application) {
    return `Dear Hiring Manager,

I hope this message finds you well. I recently submitted my application for the ${application.job.title} position at ${application.job.company.name} and wanted to follow up on the status of my application.

I remain very interested in this opportunity and would welcome the chance to discuss how my skills and experience can contribute to your team.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
${application.user.firstName} ${application.user.lastName}`;
  }

  // Process automated follow-ups
  async processFollowUps() {
    try {
      const now = new Date();
      const applications = await Application.find({
        'followUps.scheduledFor': { $lte: now },
        'followUps.completedAt': { $exists: false },
        'automationSettings.autoFollowUp': true
      }).populate('user job');

      for (const application of applications) {
        const pendingFollowUps = application.followUps.filter(
          followUp => followUp.scheduledFor <= now && !followUp.completedAt
        );

        for (const followUp of pendingFollowUps) {
          await this.sendFollowUp(application, followUp);
        }
      }

    } catch (error) {
      console.error('Error processing follow-ups:', error);
    }
  }

  // Send follow-up message
  async sendFollowUp(application, followUp) {
    try {
      if (!this.emailTransporter) {
        console.log('Email transporter not configured for follow-up');
        return;
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: application.job.applicationMethod.email || 'hr@company.com',
        subject: `Follow-up: ${application.job.title} Application - ${application.user.firstName} ${application.user.lastName}`,
        text: followUp.content
      };

      await this.emailTransporter.sendMail(mailOptions);

      // Mark follow-up as completed
      followUp.completedAt = new Date();
      await application.save();

      // Add to communications log
      await application.addCommunication({
        type: 'Follow-up',
        direction: 'Outbound',
        subject: mailOptions.subject,
        content: followUp.content
      });

    } catch (error) {
      console.error('Error sending follow-up:', error);
    }
  }

  // Bulk apply to multiple jobs
  async bulkApply(userId, jobIds, options = {}) {
    const results = [];
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    for (const jobId of jobIds) {
      try {
        // Check daily limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayApplications = await Application.countDocuments({
          user: userId,
          createdAt: { $gte: today }
        });

        if (todayApplications >= user.dailyApplicationLimit) {
          results.push({
            jobId,
            success: false,
            error: 'Daily application limit reached'
          });
          break;
        }

        const application = await this.applyToJob(userId, jobId, options);
        results.push({
          jobId,
          success: true,
          applicationId: application._id
        });

        // Small delay between applications
        await this.delay(2000);

      } catch (error) {
        results.push({
          jobId,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Utility method for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup method
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Start automated application processing
  async startAutomation() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Application automation started');

    // Process follow-ups every hour
    setInterval(async () => {
      if (this.isRunning) {
        await this.processFollowUps();
      }
    }, 60 * 60 * 1000);
  }

  // Stop automated application processing
  stopAutomation() {
    this.isRunning = false;
    console.log('Application automation stopped');
  }
}

module.exports = new ApplicationBot();
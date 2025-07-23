const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { body, validationResult } = require('express-validator');

const Resume = require('../models/Resume');
const User = require('../models/User');
const aiService = require('../services/aiService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload and parse resume
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;

    // Create resume record
    const resume = new Resume({
      userId: req.user.id,
      filename,
      originalName: originalname,
      mimeType: mimetype,
      size,
      fileUrl: filePath,
      parsingStatus: 'pending'
    });

    await resume.save();

    // Start parsing process (async)
    parseResumeAsync(resume._id, filePath, mimetype);

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resumeId: resume._id,
      status: 'pending'
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Get resume parsing status
router.get('/:resumeId/status', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({
      status: resume.parsingStatus,
      error: resume.parsingError,
      progress: getParsingProgress(resume.parsingStatus)
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to get resume status' });
  }
});

// Get parsed resume data
router.get('/:resumeId', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Increment view count
    await resume.incrementViewCount();

    res.json(resume);
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to get resume' });
  }
});

// Get all user resumes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { userId: req.user.id };
    
    if (status) {
      query.parsingStatus = status;
    }

    const resumes = await Resume.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-extractedText'); // Exclude large text field

    const total = await Resume.countDocuments(query);

    res.json({
      resumes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ error: 'Failed to get resumes' });
  }
});

// Update resume data
router.put('/:resumeId', authMiddleware, [
  body('personalInfo.fullName').optional().trim().isLength({ min: 2 }),
  body('personalInfo.email').optional().isEmail(),
  body('summary').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'personalInfo', 'summary', 'experience', 'education', 
      'skills', 'certifications', 'projects', 'publications', 'awards'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        resume[field] = req.body[field];
      }
    });

    resume.version += 1;
    await resume.save();

    res.json({
      message: 'Resume updated successfully',
      resume
    });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

// Delete resume
router.delete('/:resumeId', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(resume.fileUrl);
    } catch (fileError) {
      console.error('File deletion error:', fileError);
    }

    // Soft delete (mark as inactive)
    resume.isActive = false;
    await resume.save();

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Get resume analysis
router.get('/:resumeId/analysis', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (resume.parsingStatus !== 'completed') {
      return res.status(400).json({ error: 'Resume parsing not completed' });
    }

    // If AI analysis doesn't exist, generate it
    if (!resume.aiAnalysis || Object.keys(resume.aiAnalysis).length === 0) {
      if (aiService.isAvailable) {
        try {
          const analysis = await aiService.analyzeResume(resume.toObject());
          resume.aiAnalysis = analysis;
          await resume.save();
        } catch (aiError) {
          console.error('AI analysis error:', aiError);
          return res.status(500).json({ error: 'Failed to analyze resume' });
        }
      } else {
        return res.status(503).json({ error: 'AI analysis service unavailable' });
      }
    }

    res.json({
      analysis: resume.aiAnalysis,
      optimizations: resume.optimizations,
      formatting: resume.formatting
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to get resume analysis' });
  }
});

// Optimize resume for specific job
router.post('/:resumeId/optimize', authMiddleware, [
  body('jobDescription').notEmpty().trim().isLength({ min: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (!aiService.isAvailable) {
      return res.status(503).json({ error: 'AI optimization service unavailable' });
    }

    const optimization = await aiService.optimizeResumeForJob(
      resume.toObject(),
      req.body.jobDescription
    );

    // Save optimization suggestions
    resume.optimizations = optimization.optimizations;
    await resume.save();

    res.json(optimization);
  } catch (error) {
    console.error('Resume optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize resume' });
  }
});

// Download resume file
router.get('/:resumeId/download', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Check if file exists
    try {
      await fs.access(resume.fileUrl);
    } catch {
      return res.status(404).json({ error: 'Resume file not found' });
    }

    // Increment download count
    resume.analytics.downloadCount += 1;
    await resume.save({ validateBeforeSave: false });

    res.download(resume.fileUrl, resume.originalName);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ error: 'Failed to download resume' });
  }
});

// Async function to parse resume
async function parseResumeAsync(resumeId, filePath, mimeType) {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) return;

    resume.parsingStatus = 'processing';
    await resume.save();

    const startTime = Date.now();

    // Extract text from file
    let extractedText = '';
    
    if (mimeType === 'application/pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (mimeType.includes('word')) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    }

    resume.extractedText = extractedText;

    // Parse with AI if available
    if (aiService.isAvailable && extractedText.trim()) {
      try {
        const parsedData = await aiService.parseResume(extractedText);
        
        // Update resume with parsed data
        Object.assign(resume, parsedData);
        
        // Generate AI analysis
        const analysis = await aiService.analyzeResume(parsedData);
        resume.aiAnalysis = analysis;
        
        // Basic formatting analysis
        resume.formatting = analyzeFormatting(extractedText);
        
      } catch (aiError) {
        console.error('AI parsing failed:', aiError);
        resume.parsingError = aiError.message;
      }
    }

    resume.parsingStatus = 'completed';
    resume.processingTime = Date.now() - startTime;
    resume.aiModel = 'gpt-3.5-turbo';
    resume.parsingVersion = '1.0';

    await resume.save();

    // Update user profile with resume data
    await updateUserProfile(resume.userId, resume);

  } catch (error) {
    console.error('Resume parsing error:', error);
    
    try {
      const resume = await Resume.findById(resumeId);
      if (resume) {
        resume.parsingStatus = 'failed';
        resume.parsingError = error.message;
        await resume.save();
      }
    } catch (updateError) {
      console.error('Failed to update resume status:', updateError);
    }
  }
}

// Helper function to analyze resume formatting
function analyzeFormatting(text) {
  const lines = text.split('\n');
  const wordCount = text.split(/\s+/).length;
  
  return {
    hasProperStructure: text.toLowerCase().includes('experience') && text.toLowerCase().includes('education'),
    hasContactInfo: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text),
    hasSummary: text.toLowerCase().includes('summary') || text.toLowerCase().includes('objective'),
    hasExperience: text.toLowerCase().includes('experience') || text.toLowerCase().includes('work'),
    hasEducation: text.toLowerCase().includes('education') || text.toLowerCase().includes('degree'),
    hasSkills: text.toLowerCase().includes('skills') || text.toLowerCase().includes('technical'),
    lengthScore: Math.min(100, Math.max(0, (wordCount - 200) / 8)), // Optimal range 400-1000 words
    readabilityScore: Math.max(0, 100 - lines.length / 10), // Penalize too many short lines
    keywordDensity: calculateKeywordDensity(text),
    atsCompatible: isATSCompatible(text)
  };
}

function calculateKeywordDensity(text) {
  const commonKeywords = [
    'experience', 'skills', 'management', 'development', 'project', 
    'team', 'leadership', 'analysis', 'design', 'implementation'
  ];
  
  const lowerText = text.toLowerCase();
  const totalWords = text.split(/\s+/).length;
  const keywordCount = commonKeywords.reduce((count, keyword) => {
    const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
    return count + matches;
  }, 0);
  
  return Math.min(100, (keywordCount / totalWords) * 1000);
}

function isATSCompatible(text) {
  // Basic ATS compatibility checks
  const hasStandardSections = ['experience', 'education', 'skills'].every(section =>
    text.toLowerCase().includes(section)
  );
  
  const hasDateFormats = /\d{4}/.test(text); // Year formats
  const hasNoSpecialChars = !/[^\w\s@.-]/.test(text.slice(0, 100)); // Check first 100 chars
  
  return hasStandardSections && hasDateFormats;
}

// Helper function to update user profile with resume data
async function updateUserProfile(userId, resume) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Update user skills
    if (resume.skills) {
      user.skills = resume.skills.technical?.map(skill => ({
        name: skill.name,
        level: skill.level || 'intermediate',
        category: 'technical'
      })) || [];
    }

    // Update experience level
    if (resume.aiAnalysis?.careerLevel) {
      user.experienceLevel = resume.aiAnalysis.careerLevel;
    }

    // Update current title
    if (resume.experience?.[0]?.position) {
      user.currentTitle = resume.experience[0].position;
    }

    // Update location
    if (resume.personalInfo?.address) {
      user.location = {
        city: resume.personalInfo.address.city,
        state: resume.personalInfo.address.state,
        country: resume.personalInfo.address.country
      };
    }

    user.lastProfileUpdate = new Date();
    await user.save();
  } catch (error) {
    console.error('Failed to update user profile:', error);
  }
}

function getParsingProgress(status) {
  const progressMap = {
    'pending': 0,
    'processing': 50,
    'completed': 100,
    'failed': 0
  };
  return progressMap[status] || 0;
}

module.exports = router;
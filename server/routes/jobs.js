const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Job = require('../models/Job');
const Company = require('../models/Company');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const jobMatcherService = require('../services/matcher');
const aiService = require('../services/aiService');

const router = express.Router();

// Get all jobs with filtering and pagination
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim().isLength({ min: 1, max: 100 }),
  query('location').optional().trim(),
  query('remote').optional().isIn(['on-site', 'remote', 'hybrid']),
  query('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary']),
  query('salaryMin').optional().isInt({ min: 0 }),
  query('salaryMax').optional().isInt({ min: 0 }),
  query('experienceLevel').optional().isIn(['entry', 'mid', 'senior', 'executive']),
  query('sortBy').optional().isIn(['date', 'salary', 'relevance', 'company']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      search,
      location,
      remote,
      jobType,
      salaryMin,
      salaryMax,
      experienceLevel,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { status: 'active' };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Location filter
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } }
      ];
    }

    // Remote work filter
    if (remote) {
      query.remote = remote;
    }

    // Job type filter
    if (jobType) {
      query.jobType = jobType;
    }

    // Salary filter
    if (salaryMin || salaryMax) {
      query['salary.min'] = {};
      if (salaryMin) query['salary.min'].$gte = parseInt(salaryMin);
      if (salaryMax) query['salary.max'] = { $lte: parseInt(salaryMax) };
    }

    // Experience level filter
    if (experienceLevel) {
      query['aiAnalysis.seniorityLevel'] = experienceLevel;
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'date':
        sort = { 'source.postedDate': sortOrder === 'asc' ? 1 : -1 };
        break;
      case 'salary':
        sort = { 'salary.min': sortOrder === 'asc' ? 1 : -1 };
        break;
      case 'company':
        sort = { 'company.name': sortOrder === 'asc' ? 1 : -1 };
        break;
      case 'relevance':
      default:
        if (search) {
          sort = { score: { $meta: 'textScore' } };
        } else {
          sort = { 'source.postedDate': -1 };
        }
        break;
    }

    // Execute query
    const jobs = await Job.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-description') // Exclude full description for list view
      .lean();

    const total = await Job.countDocuments(query);

    // If user is authenticated, calculate match scores
    let jobsWithScores = jobs;
    if (req.user) {
      try {
        jobsWithScores = await jobMatcherService.calculateMatchScores(jobs, req.user, req.user.resumeFile);
      } catch (matchError) {
        console.error('Match calculation error:', matchError);
        // Continue without match scores
      }
    }

    res.json({
      jobs: jobsWithScores,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: {
        search,
        location,
        remote,
        jobType,
        salaryMin,
        salaryMax,
        experienceLevel
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get job recommendations for authenticated user
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const recommendations = await jobMatcherService.getJobRecommendations(req.user.id, {
      limit: parseInt(limit)
    });

    res.json({
      recommendations,
      count: recommendations.length,
      message: recommendations.length === 0 ? 'No recommendations found. Try updating your profile or preferences.' : null
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get job recommendations' });
  }
});

// Get matching jobs for authenticated user
router.get('/matches', authMiddleware, [
  query('minScore').optional().isInt({ min: 0, max: 100 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { minScore = 60, limit = 20 } = req.query;

    const matchingJobs = await jobMatcherService.findMatchingJobs(req.user.id, {
      minScore: parseInt(minScore),
      limit: parseInt(limit)
    });

    res.json({
      matches: matchingJobs,
      count: matchingJobs.length,
      minScore: parseInt(minScore)
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get job matches' });
  }
});

// Get single job by ID
router.get('/:jobId', optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment view count
    await job.incrementViewCount();

    // Get company information
    let company = null;
    if (job.company?.name) {
      company = await Company.findOne({ name: job.company.name }).lean();
    }

    // Calculate match score if user is authenticated
    let matchScore = null;
    let matchDetails = null;
    if (req.user) {
      try {
        const matches = await jobMatcherService.calculateMatchScores([job.toObject()], req.user, req.user.resumeFile);
        if (matches.length > 0) {
          matchScore = matches[0].matchScore;
          matchDetails = matches[0].matchDetails;
        }
      } catch (matchError) {
        console.error('Match calculation error:', matchError);
      }
    }

    // Get similar jobs
    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      $or: [
        { 'company.name': job.company.name },
        { title: { $regex: job.title.split(' ').slice(0, 2).join('|'), $options: 'i' } }
      ],
      status: 'active'
    })
    .limit(5)
    .select('title company location salary remote jobType source.postedDate')
    .lean();

    res.json({
      job: {
        ...job.toObject(),
        matchScore,
        matchDetails
      },
      company,
      similarJobs
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to get job details' });
  }
});

// Save job for later
router.post('/:jobId/save', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already saved
    const existingSave = job.savedBy.find(save => save.user.toString() === req.user.id);

    if (existingSave) {
      return res.status(400).json({ error: 'Job already saved' });
    }

    // Add to saved jobs
    job.savedBy.push({ user: req.user.id });
    job.analytics.saves += 1;
    await job.save();

    res.json({ message: 'Job saved successfully' });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ error: 'Failed to save job' });
  }
});

// Remove job from saved
router.delete('/:jobId/save', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Remove from saved jobs
    const initialLength = job.savedBy.length;
    job.savedBy = job.savedBy.filter(save => save.user.toString() !== req.user.id);

    if (job.savedBy.length === initialLength) {
      return res.status(400).json({ error: 'Job was not saved' });
    }

    job.analytics.saves = Math.max(0, job.analytics.saves - 1);
    await job.save();

    res.json({ message: 'Job removed from saved' });
  } catch (error) {
    console.error('Unsave job error:', error);
    res.status(500).json({ error: 'Failed to remove saved job' });
  }
});

// Get user's saved jobs
router.get('/saved/list', authMiddleware, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 20 } = req.query;

    const savedJobs = await Job.find({
      'savedBy.user': req.user.id,
      status: 'active'
    })
    .sort({ 'savedBy.savedAt': -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-description')
    .lean();

    const total = await Job.countDocuments({
      'savedBy.user': req.user.id,
      status: 'active'
    });

    res.json({
      savedJobs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ error: 'Failed to get saved jobs' });
  }
});

// Search jobs with advanced filters
router.post('/search', optionalAuth, [
  body('query').optional().trim().isLength({ max: 200 }),
  body('location').optional().trim().isLength({ max: 100 }),
  body('skills').optional().isArray(),
  body('companies').optional().isArray(),
  body('salaryRange').optional().isObject(),
  body('datePosted').optional().isIn(['24h', '3d', '7d', '30d']),
  body('page').optional().isInt({ min: 1 }),
  body('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      query: searchQuery,
      location,
      skills = [],
      companies = [],
      salaryRange,
      datePosted,
      page = 1,
      limit = 20
    } = req.body;

    // Build advanced query
    const query = { status: 'active' };

    if (searchQuery) {
      query.$text = { $search: searchQuery };
    }

    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } }
      ];
    }

    if (skills.length > 0) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { 'requirements.skills.required.name': { $in: skills.map(s => new RegExp(s, 'i')) } },
          { 'requirements.skills.preferred.name': { $in: skills.map(s => new RegExp(s, 'i')) } }
        ]
      });
    }

    if (companies.length > 0) {
      query['company.name'] = { $in: companies.map(c => new RegExp(c, 'i')) };
    }

    if (salaryRange && (salaryRange.min || salaryRange.max)) {
      query.$and = query.$and || [];
      const salaryConditions = [];
      if (salaryRange.min) salaryConditions.push({ 'salary.min': { $gte: salaryRange.min } });
      if (salaryRange.max) salaryConditions.push({ 'salary.max': { $lte: salaryRange.max } });
      query.$and.push({ $or: salaryConditions });
    }

    if (datePosted) {
      const dateMap = {
        '24h': 1,
        '3d': 3,
        '7d': 7,
        '30d': 30
      };
      const daysAgo = dateMap[datePosted];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      query['source.postedDate'] = { $gte: cutoffDate };
    }

    // Execute search
    const sort = searchQuery ? { score: { $meta: 'textScore' } } : { 'source.postedDate': -1 };
    
    const jobs = await Job.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-description')
      .lean();

    const total = await Job.countDocuments(query);

    // Add match scores for authenticated users
    let jobsWithScores = jobs;
    if (req.user) {
      try {
        jobsWithScores = await jobMatcherService.calculateMatchScores(jobs, req.user, req.user.resumeFile);
      } catch (matchError) {
        console.error('Match calculation error:', matchError);
      }
    }

    res.json({
      jobs: jobsWithScores,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      searchCriteria: req.body
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Failed to search jobs' });
  }
});

// Get job statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          avgSalaryMin: { $avg: '$salary.min' },
          avgSalaryMax: { $avg: '$salary.max' },
          remoteJobs: {
            $sum: { $cond: [{ $eq: ['$remote', 'remote'] }, 1, 0] }
          },
          hybridJobs: {
            $sum: { $cond: [{ $eq: ['$remote', 'hybrid'] }, 1, 0] }
          }
        }
      }
    ]);

    const jobsByType = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 }
        }
      }
    ]);

    const jobsByLocation = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$location.city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topCompanies = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$company.name',
          jobCount: { $sum: 1 }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      overview: stats[0] || {
        totalJobs: 0,
        avgSalaryMin: 0,
        avgSalaryMax: 0,
        remoteJobs: 0,
        hybridJobs: 0
      },
      jobsByType,
      jobsByLocation,
      topCompanies
    });
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({ error: 'Failed to get job statistics' });
  }
});

module.exports = router;
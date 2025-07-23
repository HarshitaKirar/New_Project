const Job = require('../models/Job');
const User = require('../models/User');
const Resume = require('../models/Resume');
const aiService = require('./aiService');

class JobMatcherService {
  constructor() {
    this.matchingWeights = {
      skills: 0.4,
      experience: 0.25,
      location: 0.15,
      education: 0.1,
      salary: 0.1
    };
  }

  async findMatchingJobs(userId, options = {}) {
    try {
      const user = await User.findById(userId).lean();
      if (!user) {
        throw new Error('User not found');
      }

      const resume = await Resume.findOne({ userId, isActive: true }).lean();
      if (!resume) {
        throw new Error('No active resume found for user');
      }

      const {
        limit = 20,
        minScore = 50,
        includeRemote = true,
        specificSkills = [],
        salaryRange = null,
        jobTypes = [],
        industries = []
      } = options;

      // Build job query
      const jobQuery = this.buildJobQuery(user, {
        includeRemote,
        specificSkills,
        salaryRange,
        jobTypes,
        industries
      });

      // Get potential jobs
      const jobs = await Job.find(jobQuery)
        .sort({ 'source.postedDate': -1 })
        .limit(limit * 3) // Get more jobs to filter
        .lean();

      // Calculate match scores
      const matchedJobs = await this.calculateMatchScores(jobs, user, resume);

      // Filter by minimum score and sort
      const filteredJobs = matchedJobs
        .filter(job => job.matchScore >= minScore)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      return filteredJobs;
    } catch (error) {
      console.error('Error finding matching jobs:', error);
      throw error;
    }
  }

  buildJobQuery(user, options) {
    const query = { status: 'active' };

    // Location filter
    if (user.jobPreferences?.locations?.length > 0 && !options.includeRemote) {
      const locationConditions = user.jobPreferences.locations.map(location => ({
        $or: [
          { 'location.city': { $regex: location, $options: 'i' } },
          { 'location.state': { $regex: location, $options: 'i' } }
        ]
      }));
      query.$or = [...(query.$or || []), ...locationConditions];
    }

    // Include remote jobs if specified
    if (options.includeRemote || user.jobPreferences?.remoteWork) {
      query.$or = [...(query.$or || []), { remote: 'remote' }];
    }

    // Job type filter
    if (options.jobTypes?.length > 0) {
      query.jobType = { $in: options.jobTypes };
    } else if (user.jobPreferences?.jobTypes?.length > 0) {
      query.jobType = { $in: user.jobPreferences.jobTypes };
    }

    // Salary filter
    if (options.salaryRange) {
      query.$and = [...(query.$and || []), {
        $or: [
          { 'salary.min': { $lte: options.salaryRange.max } },
          { 'salary.max': { $gte: options.salaryRange.min } }
        ]
      }];
    } else if (user.jobPreferences?.salaryRange) {
      query.$and = [...(query.$and || []), {
        $or: [
          { 'salary.min': { $lte: user.jobPreferences.salaryRange.max } },
          { 'salary.max': { $gte: user.jobPreferences.salaryRange.min } }
        ]
      }];
    }

    // Skills filter
    if (options.specificSkills?.length > 0) {
      query.$and = [...(query.$and || []), {
        $or: [
          { 'requirements.skills.required.name': { $in: options.specificSkills.map(s => new RegExp(s, 'i')) } },
          { 'requirements.skills.preferred.name': { $in: options.specificSkills.map(s => new RegExp(s, 'i')) } }
        ]
      }];
    }

    // Industry filter
    if (options.industries?.length > 0) {
      query['company.industry'] = { $in: options.industries };
    }

    return query;
  }

  async calculateMatchScores(jobs, user, resume) {
    const matchedJobs = [];

    for (const job of jobs) {
      try {
        let matchScore = 0;
        const matchDetails = {
          skills: 0,
          experience: 0,
          location: 0,
          education: 0,
          salary: 0
        };

        // Skills matching
        matchDetails.skills = this.calculateSkillsMatch(resume, job);
        matchScore += matchDetails.skills * this.matchingWeights.skills;

        // Experience matching
        matchDetails.experience = this.calculateExperienceMatch(resume, job);
        matchScore += matchDetails.experience * this.matchingWeights.experience;

        // Location matching
        matchDetails.location = this.calculateLocationMatch(user, job);
        matchScore += matchDetails.location * this.matchingWeights.location;

        // Education matching
        matchDetails.education = this.calculateEducationMatch(resume, job);
        matchScore += matchDetails.education * this.matchingWeights.education;

        // Salary matching
        matchDetails.salary = this.calculateSalaryMatch(user, job);
        matchScore += matchDetails.salary * this.matchingWeights.salary;

        // AI-enhanced matching if available
        if (aiService.isAvailable && matchScore > 40) {
          try {
            const aiMatch = await aiService.calculateJobMatch(resume, job);
            matchScore = (matchScore + aiMatch.overallScore) / 2; // Average with AI score
          } catch (error) {
            console.error('AI matching failed:', error.message);
          }
        }

        matchedJobs.push({
          ...job,
          matchScore: Math.round(matchScore),
          matchDetails,
          matchReasons: this.generateMatchReasons(matchDetails, job)
        });
      } catch (error) {
        console.error('Error calculating match for job:', job._id, error);
      }
    }

    return matchedJobs;
  }

  calculateSkillsMatch(resume, job) {
    if (!resume.skills || !job.requirements?.skills) return 0;

    const userSkills = [
      ...(resume.skills.technical || []).map(s => s.name.toLowerCase()),
      ...(resume.skills.soft || []).map(s => s.name.toLowerCase())
    ];

    const requiredSkills = (job.requirements.skills.required || []).map(s => s.name.toLowerCase());
    const preferredSkills = (job.requirements.skills.preferred || []).map(s => s.name.toLowerCase());

    // Calculate required skills match
    const requiredMatches = requiredSkills.filter(skill =>
      userSkills.some(userSkill => 
        this.isSkillMatch(userSkill, skill)
      )
    ).length;

    // Calculate preferred skills match
    const preferredMatches = preferredSkills.filter(skill =>
      userSkills.some(userSkill => 
        this.isSkillMatch(userSkill, skill)
      )
    ).length;

    // Weight required skills more heavily
    const requiredScore = requiredSkills.length > 0 ? (requiredMatches / requiredSkills.length) * 70 : 70;
    const preferredScore = preferredSkills.length > 0 ? (preferredMatches / preferredSkills.length) * 30 : 30;

    return Math.min(100, requiredScore + preferredScore);
  }

  isSkillMatch(userSkill, jobSkill) {
    // Exact match
    if (userSkill === jobSkill) return true;
    
    // Partial match
    if (userSkill.includes(jobSkill) || jobSkill.includes(userSkill)) return true;
    
    // Synonym matching (basic)
    const synonyms = {
      'javascript': ['js', 'node.js', 'nodejs'],
      'python': ['py'],
      'react': ['reactjs', 'react.js'],
      'angular': ['angularjs'],
      'vue': ['vuejs', 'vue.js']
    };

    for (const [key, values] of Object.entries(synonyms)) {
      if ((userSkill === key && values.includes(jobSkill)) ||
          (jobSkill === key && values.includes(userSkill))) {
        return true;
      }
    }

    return false;
  }

  calculateExperienceMatch(resume, job) {
    if (!resume.experience || !job.requirements?.experience) return 50;

    const userExperience = resume.totalExperience || this.calculateTotalExperience(resume.experience);
    const requiredExperience = job.requirements.experience.min || 0;
    const maxExperience = job.requirements.experience.max || 20;

    if (userExperience >= requiredExperience && userExperience <= maxExperience + 2) {
      return 100;
    } else if (userExperience >= requiredExperience) {
      // Overqualified but still a good match
      return Math.max(70, 100 - (userExperience - maxExperience) * 5);
    } else {
      // Underqualified
      return Math.max(0, (userExperience / requiredExperience) * 100);
    }
  }

  calculateTotalExperience(experiences) {
    if (!experiences || experiences.length === 0) return 0;

    let totalMonths = 0;
    for (const exp of experiences) {
      if (exp.startDate?.year) {
        const startYear = parseInt(exp.startDate.year);
        const endYear = exp.endDate?.current ? new Date().getFullYear() : 
                       (exp.endDate?.year ? parseInt(exp.endDate.year) : startYear);
        
        totalMonths += Math.max(0, (endYear - startYear) * 12);
      }
    }

    return Math.round(totalMonths / 12 * 10) / 10;
  }

  calculateLocationMatch(user, job) {
    // Remote work preference
    if (user.jobPreferences?.remoteWork && job.remote === 'remote') {
      return 100;
    }

    // Hybrid work
    if (job.remote === 'hybrid') {
      return 80;
    }

    // Location preferences
    if (user.jobPreferences?.locations?.length > 0) {
      const jobLocation = `${job.location.city} ${job.location.state}`.toLowerCase();
      const isMatch = user.jobPreferences.locations.some(location =>
        jobLocation.includes(location.toLowerCase()) || 
        location.toLowerCase().includes(jobLocation)
      );
      return isMatch ? 100 : 20;
    }

    // User location vs job location
    if (user.location?.city && job.location?.city) {
      if (user.location.city.toLowerCase() === job.location.city.toLowerCase()) {
        return 100;
      } else if (user.location.state?.toLowerCase() === job.location.state?.toLowerCase()) {
        return 60;
      }
    }

    return 30; // Default score for unknown locations
  }

  calculateEducationMatch(resume, job) {
    if (!job.requirements?.education) return 100; // No education requirement

    if (!resume.education || resume.education.length === 0) {
      return job.requirements.education.preferred ? 50 : 20;
    }

    const userEducation = resume.education[0]; // Highest education
    const requiredLevel = job.requirements.education.level;

    const educationLevels = {
      'high-school': 1,
      'associate': 2,
      'bachelor': 3,
      'master': 4,
      'phd': 5
    };

    const userLevel = this.getEducationLevel(userEducation.degree);
    const requiredLevelNum = educationLevels[requiredLevel] || 0;

    if (userLevel >= requiredLevelNum) {
      return 100;
    } else {
      return Math.max(30, (userLevel / requiredLevelNum) * 100);
    }
  }

  getEducationLevel(degree) {
    if (!degree) return 0;
    
    const lowerDegree = degree.toLowerCase();
    
    if (lowerDegree.includes('phd') || lowerDegree.includes('doctorate')) return 5;
    if (lowerDegree.includes('master') || lowerDegree.includes('mba')) return 4;
    if (lowerDegree.includes('bachelor') || lowerDegree.includes('bs') || lowerDegree.includes('ba')) return 3;
    if (lowerDegree.includes('associate')) return 2;
    if (lowerDegree.includes('high school') || lowerDegree.includes('diploma')) return 1;
    
    return 2; // Default to associate level
  }

  calculateSalaryMatch(user, job) {
    if (!user.jobPreferences?.salaryRange || !job.salary) return 50;

    const userMin = user.jobPreferences.salaryRange.min || 0;
    const userMax = user.jobPreferences.salaryRange.max || 1000000;
    const jobMin = job.salary.min || 0;
    const jobMax = job.salary.max || 1000000;

    // Check for overlap
    if (jobMax >= userMin && jobMin <= userMax) {
      // Calculate overlap percentage
      const overlapStart = Math.max(userMin, jobMin);
      const overlapEnd = Math.min(userMax, jobMax);
      const overlapSize = overlapEnd - overlapStart;
      const userRangeSize = userMax - userMin;
      
      return Math.min(100, (overlapSize / userRangeSize) * 100);
    }

    // No overlap - calculate proximity
    const distance = Math.min(Math.abs(jobMin - userMax), Math.abs(userMin - jobMax));
    const maxSalary = Math.max(userMax, jobMax);
    
    return Math.max(0, 100 - (distance / maxSalary) * 100);
  }

  generateMatchReasons(matchDetails, job) {
    const reasons = [];

    if (matchDetails.skills > 80) {
      reasons.push('Strong skills match with job requirements');
    } else if (matchDetails.skills > 60) {
      reasons.push('Good skills alignment');
    }

    if (matchDetails.experience > 80) {
      reasons.push('Experience level matches perfectly');
    } else if (matchDetails.experience > 60) {
      reasons.push('Suitable experience level');
    }

    if (matchDetails.location > 80) {
      reasons.push('Excellent location match');
    } else if (job.remote === 'remote') {
      reasons.push('Remote work opportunity');
    }

    if (matchDetails.education > 80) {
      reasons.push('Education requirements met');
    }

    if (matchDetails.salary > 80) {
      reasons.push('Salary range aligns with preferences');
    }

    if (reasons.length === 0) {
      reasons.push('Potential career opportunity');
    }

    return reasons;
  }

  async getJobRecommendations(userId, options = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's recent applications to avoid recommending applied jobs
      const recentApplications = await this.getRecentApplications(userId);
      const appliedJobIds = recentApplications.map(app => app.jobId.toString());

      // Get matching jobs
      const matchingJobs = await this.findMatchingJobs(userId, {
        ...options,
        excludeJobIds: appliedJobIds
      });

      // Add recommendation reasons
      const recommendations = matchingJobs.map(job => ({
        ...job,
        recommendationScore: this.calculateRecommendationScore(job, user),
        tags: this.generateJobTags(job)
      }));

      return recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      throw error;
    }
  }

  async getRecentApplications(userId) {
    const Application = require('../models/Application');
    return await Application.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .select('jobId')
      .lean();
  }

  calculateRecommendationScore(job, user) {
    let score = job.matchScore || 0;

    // Boost score for recent postings
    const daysOld = job.daysSincePosted || 0;
    if (daysOld <= 1) score += 10;
    else if (daysOld <= 7) score += 5;

    // Boost score for companies user might be interested in
    if (user.jobPreferences?.industries?.includes(job.company?.industry)) {
      score += 15;
    }

    // Boost score for remote jobs if user prefers remote
    if (user.jobPreferences?.remoteWork && job.remote === 'remote') {
      score += 10;
    }

    // Boost score for jobs with good company ratings
    if (job.company?.rating > 4) {
      score += 5;
    }

    return Math.min(100, score);
  }

  generateJobTags(job) {
    const tags = [];

    if (job.remote === 'remote') tags.push('Remote');
    if (job.remote === 'hybrid') tags.push('Hybrid');
    if (job.daysSincePosted <= 1) tags.push('New');
    if (job.daysSincePosted <= 7) tags.push('Recent');
    if (job.salary?.min > 100000) tags.push('High Salary');
    if (job.company?.size === 'startup') tags.push('Startup');
    if (job.company?.size === 'enterprise') tags.push('Enterprise');
    if (job.matchScore >= 90) tags.push('Perfect Match');
    else if (job.matchScore >= 80) tags.push('Great Match');
    else if (job.matchScore >= 70) tags.push('Good Match');

    return tags;
  }
}

module.exports = new JobMatcherService();
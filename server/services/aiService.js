const OpenAI = require('openai');
const natural = require('natural');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();
  }

  // Analyze resume content and extract structured information
  async analyzeResume(resumeText, userProfile = null) {
    try {
      const prompt = `
        Analyze the following resume and extract structured information. Return a JSON object with the following structure:
        
        {
          "personalInfo": {
            "name": "string",
            "email": "string",
            "phone": "string",
            "location": "string",
            "linkedin": "string",
            "summary": "string"
          },
          "skills": [
            {
              "name": "string",
              "category": "string (Programming Languages, Frameworks, Tools, etc.)",
              "level": "string (Beginner, Intermediate, Advanced, Expert)",
              "yearsOfExperience": "number"
            }
          ],
          "experience": [
            {
              "company": "string",
              "position": "string",
              "startDate": "string",
              "endDate": "string",
              "isCurrent": "boolean",
              "description": "string",
              "achievements": ["string"],
              "skills": ["string"]
            }
          ],
          "education": [
            {
              "institution": "string",
              "degree": "string",
              "fieldOfStudy": "string",
              "startDate": "string",
              "endDate": "string",
              "gpa": "string"
            }
          ],
          "analysis": {
            "experienceLevel": "Entry-level | Mid-level | Senior-level | Executive",
            "totalExperience": "number (years)",
            "industryFocus": ["string"],
            "strengthsAnalysis": {
              "technicalSkills": ["string"],
              "softSkills": ["string"],
              "achievements": ["string"],
              "uniqueValue": "string"
            },
            "improvementSuggestions": [
              {
                "category": "string",
                "suggestion": "string",
                "priority": "High | Medium | Low",
                "impact": "string"
              }
            ],
            "keywords": ["string"]
          }
        }
        
        Resume Content:
        ${resumeText}
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert resume analyzer and career counselor. Analyze resumes thoroughly and provide structured, actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      const analysisResult = JSON.parse(response.choices[0].message.content);
      
      // Calculate additional metrics
      analysisResult.analysis.atsScore = this.calculateATSScore(analysisResult);
      analysisResult.analysis.marketPosition = this.determineMarketPosition(analysisResult);
      
      return analysisResult;
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw new Error('Failed to analyze resume with AI');
    }
  }

  // Generate a personalized cover letter for a specific job
  async generateCoverLetter(userProfile, job, tone = 'Professional') {
    try {
      const prompt = `
        Generate a personalized cover letter for the following job application:
        
        Job Details:
        - Title: ${job.title}
        - Company: ${job.company.name}
        - Description: ${job.description}
        - Requirements: ${job.requirements || 'Not specified'}
        
        Candidate Profile:
        - Name: ${userProfile.firstName} ${userProfile.lastName}
        - Summary: ${userProfile.summary || 'Not provided'}
        - Key Skills: ${userProfile.skills?.map(s => s.name).join(', ') || 'Not specified'}
        - Experience: ${userProfile.experience?.map(e => `${e.position} at ${e.company}`).join(', ') || 'Not specified'}
        
        Tone: ${tone}
        
        Requirements:
        1. Keep it concise (3-4 paragraphs)
        2. Highlight relevant experience and skills
        3. Show enthusiasm for the role and company
        4. Include a strong opening and closing
        5. Make it personal and specific to this job
        6. Use ${tone.toLowerCase()} tone throughout
        
        Return only the cover letter content, no additional formatting or explanations.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert career counselor and professional writer. Generate compelling, personalized cover letters that help candidates stand out.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw new Error('Failed to generate cover letter with AI');
    }
  }

  // Customize resume content for a specific job
  async customizeResume(resumeContent, job, customizationLevel = 'Moderate') {
    try {
      const prompt = `
        Customize the following resume for this specific job application:
        
        Job Details:
        - Title: ${job.title}
        - Company: ${job.company.name}
        - Required Skills: ${job.requiredSkills?.map(s => s.name).join(', ') || 'Not specified'}
        - Description: ${job.description}
        
        Current Resume Content:
        ${JSON.stringify(resumeContent, null, 2)}
        
        Customization Level: ${customizationLevel}
        
        Instructions:
        1. For Conservative: Make minimal changes, only emphasize existing relevant skills
        2. For Moderate: Reorder sections, emphasize relevant experience, add missing relevant skills if they exist in experience
        3. For Aggressive: Significantly rewrite descriptions to match job requirements, optimize keywords
        
        Return a JSON object with:
        {
          "customizedContent": { /* modified resume structure */ },
          "changes": [
            {
              "section": "string",
              "field": "string", 
              "originalContent": "string",
              "customizedContent": "string",
              "reason": "string"
            }
          ],
          "matchScore": "number (0-100)"
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert resume writer and ATS optimization specialist. Customize resumes to maximize job matching while maintaining authenticity."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error customizing resume:', error);
      throw new Error('Failed to customize resume with AI');
    }
  }

  // Analyze job posting and extract key information
  async analyzeJobPosting(jobDescription) {
    try {
      const prompt = `
        Analyze this job posting and extract structured information:
        
        Job Description:
        ${jobDescription}
        
        Return a JSON object with:
        {
          "requiredSkills": [
            {
              "name": "string",
              "importance": "Required | Preferred | Nice-to-have"
            }
          ],
          "experienceLevel": "Entry-level | Mid-level | Senior-level | Executive",
          "industryCategory": "string",
          "jobCategory": "string",
          "keyResponsibilities": ["string"],
          "benefits": ["string"],
          "companySize": "Startup | Small | Medium | Large | Enterprise",
          "workArrangement": "Remote | Hybrid | On-site",
          "sentimentScore": "number (-1 to 1, where 1 is very positive)",
          "difficultyLevel": "number (1-10)",
          "keywords": ["string"],
          "redFlags": ["string"],
          "opportunities": ["string"]
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert job market analyst. Extract comprehensive insights from job postings to help candidates make informed decisions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing job posting:', error);
      throw new Error('Failed to analyze job posting with AI');
    }
  }

  // Generate interview preparation content
  async generateInterviewPrep(userProfile, job) {
    try {
      const prompt = `
        Generate interview preparation content for:
        
        Candidate: ${userProfile.firstName} ${userProfile.lastName}
        Job: ${job.title} at ${job.company.name}
        
        User Background:
        - Skills: ${userProfile.skills?.map(s => s.name).join(', ') || 'Not specified'}
        - Experience: ${userProfile.experience?.map(e => `${e.position} at ${e.company}`).join(', ') || 'Not specified'}
        
        Job Details:
        ${job.description}
        
        Generate:
        {
          "companyResearch": "string (key points about the company)",
          "commonQuestions": [
            {
              "question": "string",
              "suggestedAnswer": "string",
              "tips": "string"
            }
          ],
          "questionsToAsk": ["string"],
          "strengths": ["string (candidate's strengths for this role)"],
          "potentialConcerns": [
            {
              "concern": "string",
              "response": "string"
            }
          ],
          "salaryNegotiation": {
            "marketRange": "string",
            "negotiationPoints": ["string"],
            "timing": "string"
          }
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert interview coach. Provide comprehensive, personalized interview preparation guidance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 2000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error generating interview prep:', error);
      throw new Error('Failed to generate interview preparation with AI');
    }
  }

  // Analyze application rejection and provide insights
  async analyzeRejection(applicationData, rejectionMessage = null) {
    try {
      const prompt = `
        Analyze this job application rejection and provide insights:
        
        Application Details:
        - Job: ${applicationData.job.title} at ${applicationData.job.company.name}
        - User Profile: ${JSON.stringify(applicationData.user, null, 2)}
        - Application Method: ${applicationData.applicationMethod}
        - Days in Process: ${applicationData.analytics?.totalProcessTime || 'Unknown'}
        
        ${rejectionMessage ? `Rejection Message: ${rejectionMessage}` : 'No specific rejection message provided'}
        
        Provide analysis in JSON format:
        {
          "likelyReasons": ["string"],
          "improvementSuggestions": [
            {
              "category": "Resume | Cover Letter | Skills | Experience | Application Timing",
              "suggestion": "string",
              "priority": "High | Medium | Low",
              "actionable": "boolean"
            }
          ],
          "marketInsights": "string",
          "nextSteps": ["string"],
          "skillGaps": ["string"],
          "positives": ["string (what went well)"]
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert career counselor specializing in job search optimization. Provide constructive, actionable feedback on job rejections."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1200
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing rejection:', error);
      throw new Error('Failed to analyze rejection with AI');
    }
  }

  // Calculate job matching score between user profile and job
  calculateJobMatchScore(userProfile, job) {
    let score = 0;
    let maxScore = 100;
    
    // Skills matching (40% weight)
    if (userProfile.skills && job.requiredSkills) {
      const userSkills = userProfile.skills.map(s => s.name.toLowerCase());
      const jobSkills = job.requiredSkills.map(s => s.name.toLowerCase());
      
      const matchingSkills = userSkills.filter(skill => 
        jobSkills.some(jobSkill => 
          jobSkill.includes(skill) || 
          skill.includes(jobSkill) ||
          this.stemmer.stem(skill) === this.stemmer.stem(jobSkill)
        )
      );
      
      const skillScore = (matchingSkills.length / Math.max(jobSkills.length, 1)) * 40;
      score += skillScore;
    }
    
    // Experience level matching (25% weight)
    if (userProfile.profileAnalysis?.marketPosition && job.experienceLevel) {
      const userLevel = userProfile.profileAnalysis.marketPosition;
      const jobLevel = job.experienceLevel;
      
      if (userLevel === jobLevel) {
        score += 25;
      } else {
        const levels = ['Entry-level', 'Mid-level', 'Senior-level', 'Executive'];
        const userIndex = levels.indexOf(userLevel);
        const jobIndex = levels.indexOf(jobLevel);
        
        if (Math.abs(userIndex - jobIndex) === 1) {
          score += 15; // Partial match for adjacent levels
        } else if (Math.abs(userIndex - jobIndex) === 2) {
          score += 5; // Small match for levels with one gap
        }
      }
    }
    
    // Location matching (15% weight)
    if (userProfile.jobPreferences?.locations && job.location) {
      const userLocations = userProfile.jobPreferences.locations;
      const jobLocation = job.location;
      
      let locationMatch = false;
      
      if (jobLocation.isRemote && userLocations.some(loc => loc.remote)) {
        locationMatch = true;
      } else {
        locationMatch = userLocations.some(loc => 
          (loc.city && loc.city.toLowerCase() === jobLocation.city?.toLowerCase()) ||
          (loc.state && loc.state.toLowerCase() === jobLocation.state?.toLowerCase())
        );
      }
      
      if (locationMatch) score += 15;
    }
    
    // Employment type matching (10% weight)
    if (userProfile.jobPreferences?.employmentType && job.employmentType) {
      if (userProfile.jobPreferences.employmentType.includes(job.employmentType)) {
        score += 10;
      }
    }
    
    // Salary matching (10% weight)
    if (userProfile.jobPreferences?.salaryRange && job.salary?.min) {
      const userMin = userProfile.jobPreferences.salaryRange.min || 0;
      const userMax = userProfile.jobPreferences.salaryRange.max || Infinity;
      const jobSalary = job.salary.min;
      
      if (jobSalary >= userMin && jobSalary <= userMax) {
        score += 10;
      } else if (jobSalary >= userMin * 0.8) {
        score += 5;
      }
    }
    
    return Math.min(Math.round(score), 100);
  }

  // Helper method to calculate ATS score
  calculateATSScore(resumeData) {
    let score = 0;
    
    // Contact information (20 points)
    if (resumeData.personalInfo) {
      const contactFields = ['name', 'email', 'phone'];
      const presentFields = contactFields.filter(field => resumeData.personalInfo[field]);
      score += (presentFields.length / contactFields.length) * 20;
    }
    
    // Experience section (30 points)
    if (resumeData.experience && resumeData.experience.length > 0) {
      const avgExperienceCompleteness = resumeData.experience.reduce((acc, exp) => {
        let expScore = 0;
        if (exp.company) expScore += 0.25;
        if (exp.position) expScore += 0.25;
        if (exp.startDate) expScore += 0.25;
        if (exp.description) expScore += 0.25;
        return acc + expScore;
      }, 0) / resumeData.experience.length;
      
      score += avgExperienceCompleteness * 30;
    }
    
    // Skills section (25 points)
    if (resumeData.skills && resumeData.skills.length >= 5) {
      score += 25;
    } else if (resumeData.skills && resumeData.skills.length > 0) {
      score += (resumeData.skills.length / 5) * 25;
    }
    
    // Education section (15 points)
    if (resumeData.education && resumeData.education.length > 0) {
      score += 15;
    }
    
    // Summary/Objective (10 points)
    if (resumeData.personalInfo?.summary && resumeData.personalInfo.summary.length > 50) {
      score += 10;
    }
    
    return Math.round(score);
  }

  // Helper method to determine market position
  determineMarketPosition(resumeData) {
    const totalExperience = resumeData.analysis?.totalExperience || 0;
    
    if (totalExperience === 0) return 'Entry-level';
    if (totalExperience <= 2) return 'Entry-level';
    if (totalExperience <= 5) return 'Mid-level';
    if (totalExperience <= 10) return 'Senior-level';
    return 'Executive';
  }

  // Extract keywords from text using NLP
  extractKeywords(text, maxKeywords = 20) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    const filteredTokens = tokens.filter(token => 
      token.length > 2 && 
      !stopWords.has(token) && 
      /^[a-zA-Z]+$/.test(token)
    );
    
    // Count frequency
    const frequency = {};
    filteredTokens.forEach(token => {
      const stemmed = this.stemmer.stem(token);
      frequency[stemmed] = (frequency[stemmed] || 0) + 1;
    });
    
    // Sort by frequency and return top keywords
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }
}

module.exports = new AIService();
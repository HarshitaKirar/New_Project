const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.isAvailable = !!process.env.OPENAI_API_KEY;
  }

  async checkStatus() {
    if (!this.isAvailable) return false;
    
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      console.error('AI Service status check failed:', error);
      return false;
    }
  }

  async parseResume(resumeText) {
    if (!this.isAvailable) {
      throw new Error('AI service is not available. Please check your OpenAI API key.');
    }

    try {
      const prompt = `
        Parse the following resume and extract structured information. Return a JSON object with the following structure:
        {
          "personalInfo": {
            "fullName": "string",
            "email": "string",
            "phone": "string",
            "address": {
              "city": "string",
              "state": "string",
              "country": "string"
            },
            "linkedin": "string",
            "github": "string",
            "website": "string"
          },
          "summary": "string",
          "experience": [
            {
              "company": "string",
              "position": "string",
              "startDate": {"month": "string", "year": "string"},
              "endDate": {"month": "string", "year": "string", "current": boolean},
              "description": "string",
              "responsibilities": ["string"],
              "achievements": ["string"],
              "technologies": ["string"]
            }
          ],
          "education": [
            {
              "institution": "string",
              "degree": "string",
              "field": "string",
              "graduationDate": {"month": "string", "year": "string"},
              "gpa": {"value": number, "scale": number}
            }
          ],
          "skills": {
            "technical": [{"name": "string", "level": "beginner|intermediate|advanced|expert", "category": "string"}],
            "soft": [{"name": "string", "level": "beginner|intermediate|advanced|expert"}],
            "languages": [{"name": "string", "proficiency": "basic|conversational|fluent|native"}]
          },
          "certifications": [
            {
              "name": "string",
              "issuer": "string",
              "issueDate": {"month": "string", "year": "string"}
            }
          ],
          "projects": [
            {
              "name": "string",
              "description": "string",
              "technologies": ["string"],
              "url": "string"
            }
          ]
        }

        Resume text:
        ${resumeText}
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume parser. Extract information accurately and return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const parsedData = JSON.parse(response.choices[0].message.content);
      return parsedData;
    } catch (error) {
      console.error('Resume parsing failed:', error);
      throw new Error('Failed to parse resume. Please try again.');
    }
  }

  async analyzeResume(resumeData) {
    if (!this.isAvailable) {
      throw new Error('AI service is not available. Please check your OpenAI API key.');
    }

    try {
      const prompt = `
        Analyze the following resume data and provide insights. Return a JSON object with:
        {
          "overallScore": number (0-100),
          "strengths": ["string"],
          "weaknesses": ["string"],
          "recommendations": ["string"],
          "industryMatch": [{"industry": "string", "matchScore": number, "reasons": ["string"]}],
          "roleMatch": [{"role": "string", "matchScore": number, "reasons": ["string"]}],
          "skillGaps": [{"skill": "string", "importance": "low|medium|high", "suggestion": "string"}],
          "careerLevel": "entry|mid|senior|executive",
          "experienceYears": number
        }

        Resume data:
        ${JSON.stringify(resumeData, null, 2)}
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career counselor and resume analyst. Provide actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      return analysis;
    } catch (error) {
      console.error('Resume analysis failed:', error);
      throw new Error('Failed to analyze resume. Please try again.');
    }
  }

  async generateCoverLetter(jobDescription, resumeData, customInstructions = '') {
    if (!this.isAvailable) {
      throw new Error('AI service is not available. Please check your OpenAI API key.');
    }

    try {
      const prompt = `
        Generate a professional cover letter based on the job description and candidate's resume.
        Make it personalized, compelling, and ATS-friendly.

        Job Description:
        ${jobDescription}

        Candidate Resume Data:
        ${JSON.stringify(resumeData, null, 2)}

        Custom Instructions:
        ${customInstructions}

        Requirements:
        - Keep it under 400 words
        - Highlight relevant experience and skills
        - Show enthusiasm for the role
        - Include specific examples
        - Professional tone
        - ATS-optimized keywords
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career writer specializing in compelling cover letters.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Cover letter generation failed:', error);
      throw new Error('Failed to generate cover letter. Please try again.');
    }
  }

  async analyzeJobDescription(jobDescription) {
    if (!this.isAvailable) {
      throw new Error('AI service is not available. Please check your OpenAI API key.');
    }

    try {
      const prompt = `
        Analyze the following job description and extract key information. Return a JSON object:
        {
          "keySkills": ["string"],
          "requiredSkills": ["string"],
          "preferredSkills": ["string"],
          "industryTags": ["string"],
          "seniorityLevel": "entry|mid|senior|executive",
          "difficultyScore": number (1-10),
          "competitiveness": "low|medium|high",
          "workLifeBalance": number (1-5),
          "cultureMatch": ["string"],
          "redFlags": ["string"],
          "highlights": ["string"],
          "salaryIndicators": ["string"]
        }

        Job Description:
        ${jobDescription}
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert job market analyst. Extract accurate insights from job descriptions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      return analysis;
    } catch (error) {
      console.error('Job description analysis failed:', error);
      throw new Error('Failed to analyze job description. Please try again.');
    }
  }

  async calculateJobMatch(resumeData, jobData) {
    if (!this.isAvailable) {
      return this.calculateBasicJobMatch(resumeData, jobData);
    }

    try {
      const prompt = `
        Calculate how well this candidate matches the job requirements. Return a JSON object:
        {
          "overallScore": number (0-100),
          "skillsMatch": number (0-100),
          "experienceMatch": number (0-100),
          "educationMatch": number (0-100),
          "matchReasons": ["string"],
          "missingSkills": ["string"],
          "recommendations": ["string"]
        }

        Candidate Resume:
        ${JSON.stringify(resumeData, null, 2)}

        Job Requirements:
        ${JSON.stringify(jobData, null, 2)}
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert recruiter. Analyze candidate-job fit accurately.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 800
      });

      const matchAnalysis = JSON.parse(response.choices[0].message.content);
      return matchAnalysis;
    } catch (error) {
      console.error('Job match calculation failed:', error);
      return this.calculateBasicJobMatch(resumeData, jobData);
    }
  }

  calculateBasicJobMatch(resumeData, jobData) {
    // Fallback method when AI is not available
    let score = 0;
    const maxScore = 100;

    // Skills matching (40% weight)
    if (resumeData.skills && jobData.requirements && jobData.requirements.skills) {
      const candidateSkills = [
        ...(resumeData.skills.technical || []).map(s => s.name.toLowerCase()),
        ...(resumeData.skills.soft || []).map(s => s.name.toLowerCase())
      ];
      
      const requiredSkills = (jobData.requirements.skills.required || []).map(s => s.name.toLowerCase());
      const preferredSkills = (jobData.requirements.skills.preferred || []).map(s => s.name.toLowerCase());
      
      const requiredMatches = requiredSkills.filter(skill => 
        candidateSkills.some(cSkill => cSkill.includes(skill) || skill.includes(cSkill))
      ).length;
      
      const preferredMatches = preferredSkills.filter(skill => 
        candidateSkills.some(cSkill => cSkill.includes(skill) || skill.includes(cSkill))
      ).length;
      
      const skillsScore = ((requiredMatches / Math.max(requiredSkills.length, 1)) * 30) + 
                         ((preferredMatches / Math.max(preferredSkills.length, 1)) * 10);
      score += skillsScore;
    }

    // Experience matching (30% weight)
    if (resumeData.experience && jobData.requirements && jobData.requirements.experience) {
      const candidateYears = resumeData.experience.length * 1.5; // Rough estimate
      const requiredYears = jobData.requirements.experience.min || 0;
      
      if (candidateYears >= requiredYears) {
        score += 30;
      } else {
        score += (candidateYears / requiredYears) * 30;
      }
    }

    // Education matching (20% weight)
    if (resumeData.education && jobData.requirements && jobData.requirements.education) {
      // Simplified education matching
      score += 20;
    }

    // Location matching (10% weight)
    if (jobData.remote === 'remote' || jobData.location) {
      score += 10;
    }

    return {
      overallScore: Math.round(Math.min(score, maxScore)),
      skillsMatch: Math.round(score * 0.4),
      experienceMatch: Math.round(score * 0.3),
      educationMatch: Math.round(score * 0.2),
      matchReasons: ['Basic matching algorithm used'],
      missingSkills: [],
      recommendations: ['Upgrade to premium for detailed AI analysis']
    };
  }

  async optimizeResumeForJob(resumeData, jobDescription) {
    if (!this.isAvailable) {
      throw new Error('AI service is not available. Please check your OpenAI API key.');
    }

    try {
      const prompt = `
        Provide specific recommendations to optimize this resume for the given job. Return a JSON object:
        {
          "optimizations": [
            {
              "section": "summary|experience|skills|education|overall",
              "priority": "low|medium|high|critical",
              "suggestion": "string",
              "impact": "string"
            }
          ],
          "keywordsToAdd": ["string"],
          "sectionsToImprove": ["string"],
          "overallScore": number (0-100)
        }

        Current Resume:
        ${JSON.stringify(resumeData, null, 2)}

        Target Job:
        ${jobDescription}
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume optimizer and ATS specialist.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1200
      });

      const optimization = JSON.parse(response.choices[0].message.content);
      return optimization;
    } catch (error) {
      console.error('Resume optimization failed:', error);
      throw new Error('Failed to optimize resume. Please try again.');
    }
  }
}

module.exports = new AIService();
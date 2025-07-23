const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const Job = require('../models/Job');
const aiService = require('./aiService');

class JobScrapingService {
  constructor() {
    this.browser = null;
    this.scrapers = {
      'LinkedIn': this.scrapeLinkedIn.bind(this),
      'Indeed': this.scrapeIndeed.bind(this),
      'Naukri': this.scrapeNaukri.bind(this),
      'Glassdoor': this.scrapeGlassdoor.bind(this)
    };
    
    // Rate limiting configuration
    this.rateLimits = {
      'LinkedIn': { delay: 2000, maxPerHour: 100 },
      'Indeed': { delay: 1500, maxPerHour: 150 },
      'Naukri': { delay: 1000, maxPerHour: 200 },
      'Glassdoor': { delay: 3000, maxPerHour: 80 }
    };
    
    this.requestCounts = {};
  }

  // Initialize browser for scraping
  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  // Close browser
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Main scraping method
  async scrapeJobs(searchParams) {
    const {
      keywords = '',
      location = '',
      platforms = ['LinkedIn', 'Indeed', 'Naukri'],
      experienceLevel = '',
      jobType = '',
      maxResults = 50
    } = searchParams;

    const results = [];
    
    try {
      await this.initBrowser();
      
      for (const platform of platforms) {
        if (this.scrapers[platform]) {
          console.log(`Scraping jobs from ${platform}...`);
          
          try {
            const platformResults = await this.scrapers[platform]({
              keywords,
              location,
              experienceLevel,
              jobType,
              maxResults: Math.ceil(maxResults / platforms.length)
            });
            
            results.push(...platformResults);
            
            // Rate limiting
            await this.delay(this.rateLimits[platform].delay);
          } catch (error) {
            console.error(`Error scraping ${platform}:`, error);
          }
        }
      }
      
      // Process and save jobs
      const processedJobs = await this.processScrapedJobs(results);
      return processedJobs;
      
    } finally {
      // Don't close browser immediately to allow reuse
      // await this.closeBrowser();
    }
  }

  // LinkedIn scraper
  async scrapeLinkedIn(params) {
    const { keywords, location, maxResults } = params;
    const jobs = [];
    
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to LinkedIn jobs
      const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Wait for job listings to load
      await page.waitForSelector('.jobs-search__results-list', { timeout: 10000 });
      
      // Extract job listings
      const jobElements = await page.$$('.jobs-search__results-list .result-card');
      
      for (let i = 0; i < Math.min(jobElements.length, maxResults); i++) {
        try {
          const jobElement = jobElements[i];
          
          const jobData = await page.evaluate((element) => {
            const titleElement = element.querySelector('.result-card__title');
            const companyElement = element.querySelector('.result-card__subtitle');
            const locationElement = element.querySelector('.job-result-card__location');
            const linkElement = element.querySelector('.result-card__full-card-link');
            const summaryElement = element.querySelector('.job-result-card__snippet');
            
            return {
              title: titleElement?.textContent?.trim(),
              company: companyElement?.textContent?.trim(),
              location: locationElement?.textContent?.trim(),
              url: linkElement?.href,
              summary: summaryElement?.textContent?.trim(),
              platform: 'LinkedIn'
            };
          }, jobElement);
          
          if (jobData.title && jobData.company && jobData.url) {
            // Get detailed job information
            const detailedJob = await this.getLinkedInJobDetails(page, jobData.url);
            jobs.push({ ...jobData, ...detailedJob });
          }
          
          // Small delay between jobs
          await this.delay(500);
        } catch (error) {
          console.error('Error extracting LinkedIn job:', error);
        }
      }
      
      await page.close();
    } catch (error) {
      console.error('LinkedIn scraping error:', error);
    }
    
    return jobs;
  }

  // Get detailed LinkedIn job information
  async getLinkedInJobDetails(page, jobUrl) {
    try {
      await page.goto(jobUrl, { waitUntil: 'networkidle2' });
      
      const details = await page.evaluate(() => {
        const descriptionElement = document.querySelector('.show-more-less-html__markup');
        const criteriaElements = document.querySelectorAll('.description__job-criteria-item');
        
        let employmentType = '';
        let experienceLevel = '';
        
        criteriaElements.forEach(item => {
          const label = item.querySelector('.description__job-criteria-subheader')?.textContent?.trim();
          const value = item.querySelector('.description__job-criteria-text')?.textContent?.trim();
          
          if (label?.includes('Employment type')) {
            employmentType = value;
          } else if (label?.includes('Seniority level')) {
            experienceLevel = value;
          }
        });
        
        return {
          description: descriptionElement?.textContent?.trim() || '',
          employmentType: employmentType,
          experienceLevel: experienceLevel
        };
      });
      
      return details;
    } catch (error) {
      console.error('Error getting LinkedIn job details:', error);
      return {};
    }
  }

  // Indeed scraper
  async scrapeIndeed(params) {
    const { keywords, location, maxResults } = params;
    const jobs = [];
    
    try {
      const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(keywords)}&l=${encodeURIComponent(location)}`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      $('.jobsearch-SerpJobCard').each((index, element) => {
        if (index >= maxResults) return false;
        
        const $job = $(element);
        const title = $job.find('[data-jk] h2 a').text().trim();
        const company = $job.find('.company').text().trim();
        const location = $job.find('.location').text().trim();
        const summary = $job.find('.summary').text().trim();
        const jobKey = $job.find('[data-jk]').attr('data-jk');
        const url = jobKey ? `https://www.indeed.com/viewjob?jk=${jobKey}` : '';
        
        if (title && company) {
          jobs.push({
            title,
            company,
            location,
            summary,
            url,
            platform: 'Indeed',
            jobId: jobKey,
            description: summary
          });
        }
      });
      
    } catch (error) {
      console.error('Indeed scraping error:', error);
    }
    
    return jobs;
  }

  // Naukri scraper
  async scrapeNaukri(params) {
    const { keywords, location, maxResults } = params;
    const jobs = [];
    
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      const searchUrl = `https://www.naukri.com/jobs-in-${location.toLowerCase().replace(/\s+/g, '-')}?k=${encodeURIComponent(keywords)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Wait for job listings
      await page.waitForSelector('.srp-jobtuple-wrapper', { timeout: 10000 });
      
      const jobElements = await page.$$('.srp-jobtuple-wrapper');
      
      for (let i = 0; i < Math.min(jobElements.length, maxResults); i++) {
        try {
          const jobData = await page.evaluate((element) => {
            const titleElement = element.querySelector('.title');
            const companyElement = element.querySelector('.comp-name');
            const locationElement = element.querySelector('.locWdth');
            const experienceElement = element.querySelector('.exp');
            const salaryElement = element.querySelector('.sal');
            const summaryElement = element.querySelector('.job-description');
            const linkElement = element.querySelector('.title');
            
            return {
              title: titleElement?.textContent?.trim(),
              company: companyElement?.textContent?.trim(),
              location: locationElement?.textContent?.trim(),
              experience: experienceElement?.textContent?.trim(),
              salary: salaryElement?.textContent?.trim(),
              summary: summaryElement?.textContent?.trim(),
              url: linkElement?.href,
              platform: 'Naukri'
            };
          }, jobElements[i]);
          
          if (jobData.title && jobData.company) {
            jobs.push({
              ...jobData,
              description: jobData.summary || '',
              jobId: this.extractJobIdFromUrl(jobData.url, 'Naukri')
            });
          }
        } catch (error) {
          console.error('Error extracting Naukri job:', error);
        }
      }
      
      await page.close();
    } catch (error) {
      console.error('Naukri scraping error:', error);
    }
    
    return jobs;
  }

  // Glassdoor scraper
  async scrapeGlassdoor(params) {
    const { keywords, location, maxResults } = params;
    const jobs = [];
    
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      const searchUrl = `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(keywords)}&locT=C&locId=1147401`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Handle potential popup
      try {
        await page.waitForSelector('[data-test="job-title"]', { timeout: 5000 });
      } catch (error) {
        console.log('Glassdoor: Job listings not found immediately');
      }
      
      const jobElements = await page.$$('[data-test="jobListing"]');
      
      for (let i = 0; i < Math.min(jobElements.length, maxResults); i++) {
        try {
          const jobData = await page.evaluate((element) => {
            const titleElement = element.querySelector('[data-test="job-title"]');
            const companyElement = element.querySelector('[data-test="employer-name"]');
            const locationElement = element.querySelector('[data-test="job-location"]');
            const salaryElement = element.querySelector('[data-test="detailSalary"]');
            
            return {
              title: titleElement?.textContent?.trim(),
              company: companyElement?.textContent?.trim(),
              location: locationElement?.textContent?.trim(),
              salary: salaryElement?.textContent?.trim(),
              platform: 'Glassdoor'
            };
          }, jobElements[i]);
          
          if (jobData.title && jobData.company) {
            jobs.push({
              ...jobData,
              url: `https://www.glassdoor.com/job-listing/${jobData.title.replace(/\s+/g, '-').toLowerCase()}`,
              jobId: `glassdoor-${Date.now()}-${i}`,
              description: `${jobData.title} position at ${jobData.company} in ${jobData.location}`
            });
          }
        } catch (error) {
          console.error('Error extracting Glassdoor job:', error);
        }
      }
      
      await page.close();
    } catch (error) {
      console.error('Glassdoor scraping error:', error);
    }
    
    return jobs;
  }

  // Process scraped jobs and save to database
  async processScrapedJobs(scrapedJobs) {
    const processedJobs = [];
    
    for (const scrapedJob of scrapedJobs) {
      try {
        // Check for duplicates
        const existingJob = await Job.findOne({
          'source.platform': scrapedJob.platform,
          'source.jobId': scrapedJob.jobId || scrapedJob.url
        });
        
        if (existingJob) {
          console.log(`Duplicate job found: ${scrapedJob.title} at ${scrapedJob.company}`);
          continue;
        }
        
        // Analyze job with AI
        let aiAnalysis = {};
        if (scrapedJob.description && scrapedJob.description.length > 50) {
          try {
            aiAnalysis = await aiService.analyzeJobPosting(scrapedJob.description);
          } catch (error) {
            console.error('AI analysis failed for job:', error);
          }
        }
        
        // Create job object
        const jobData = {
          title: scrapedJob.title,
          company: {
            name: scrapedJob.company,
            industry: aiAnalysis.industryCategory || ''
          },
          description: scrapedJob.description || scrapedJob.summary || '',
          location: this.parseLocation(scrapedJob.location),
          employmentType: this.normalizeEmploymentType(scrapedJob.employmentType || aiAnalysis.workArrangement),
          experienceLevel: this.normalizeExperienceLevel(scrapedJob.experienceLevel || aiAnalysis.experienceLevel),
          salary: this.parseSalary(scrapedJob.salary),
          requiredSkills: (aiAnalysis.requiredSkills || []).map(skill => ({
            name: skill.name,
            importance: skill.importance
          })),
          source: {
            platform: scrapedJob.platform,
            url: scrapedJob.url,
            jobId: scrapedJob.jobId || scrapedJob.url,
            scrapedAt: new Date()
          },
          aiAnalysis: {
            skillsExtracted: aiAnalysis.requiredSkills || [],
            sentimentScore: aiAnalysis.sentimentScore || 0,
            difficultyLevel: aiAnalysis.difficultyLevel || 5,
            keywords: aiAnalysis.keywords || [],
            jobCategory: aiAnalysis.jobCategory || '',
            lastAnalyzed: new Date()
          },
          status: 'Active'
        };
        
        // Save job to database
        const job = new Job(jobData);
        await job.save();
        processedJobs.push(job);
        
        console.log(`Saved job: ${job.title} at ${job.company.name}`);
        
      } catch (error) {
        console.error('Error processing job:', error);
      }
    }
    
    return processedJobs;
  }

  // Utility methods
  parseLocation(locationString) {
    if (!locationString) return { city: '', state: '', country: 'United States' };
    
    const parts = locationString.split(',').map(part => part.trim());
    
    if (parts.length >= 2) {
      return {
        city: parts[0],
        state: parts[1],
        country: parts[2] || 'United States',
        isRemote: locationString.toLowerCase().includes('remote')
      };
    }
    
    return {
      city: parts[0] || '',
      state: '',
      country: 'United States',
      isRemote: locationString.toLowerCase().includes('remote')
    };
  }

  normalizeEmploymentType(type) {
    if (!type) return 'Full-time';
    
    const normalized = type.toLowerCase();
    if (normalized.includes('full')) return 'Full-time';
    if (normalized.includes('part')) return 'Part-time';
    if (normalized.includes('contract')) return 'Contract';
    if (normalized.includes('freelance')) return 'Freelance';
    if (normalized.includes('intern')) return 'Internship';
    
    return 'Full-time';
  }

  normalizeExperienceLevel(level) {
    if (!level) return 'Mid-level';
    
    const normalized = level.toLowerCase();
    if (normalized.includes('entry') || normalized.includes('junior') || normalized.includes('associate')) {
      return 'Entry-level';
    }
    if (normalized.includes('senior') || normalized.includes('lead')) {
      return 'Senior-level';
    }
    if (normalized.includes('executive') || normalized.includes('director') || normalized.includes('vp')) {
      return 'Executive';
    }
    
    return 'Mid-level';
  }

  parseSalary(salaryString) {
    if (!salaryString) return {};
    
    const cleanSalary = salaryString.replace(/[,$]/g, '');
    const numbers = cleanSalary.match(/\d+/g);
    
    if (!numbers) return {};
    
    const salary = {
      currency: 'USD',
      period: 'Yearly'
    };
    
    if (numbers.length === 1) {
      salary.min = parseInt(numbers[0]) * (cleanSalary.includes('k') ? 1000 : 1);
    } else if (numbers.length >= 2) {
      salary.min = parseInt(numbers[0]) * (cleanSalary.includes('k') ? 1000 : 1);
      salary.max = parseInt(numbers[1]) * (cleanSalary.includes('k') ? 1000 : 1);
    }
    
    if (salaryString.toLowerCase().includes('hour')) {
      salary.period = 'Hourly';
    } else if (salaryString.toLowerCase().includes('month')) {
      salary.period = 'Monthly';
    }
    
    return salary;
  }

  extractJobIdFromUrl(url, platform) {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      
      switch (platform) {
        case 'LinkedIn':
          return urlObj.pathname.split('/').pop();
        case 'Indeed':
          return urlObj.searchParams.get('jk');
        case 'Naukri':
          return urlObj.pathname.split('/').pop();
        case 'Glassdoor':
          return urlObj.pathname.split('/').pop();
        default:
          return url;
      }
    } catch (error) {
      return url;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Rate limiting check
  checkRateLimit(platform) {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    if (!this.requestCounts[platform]) {
      this.requestCounts[platform] = [];
    }
    
    // Remove old requests
    this.requestCounts[platform] = this.requestCounts[platform].filter(time => time > hourAgo);
    
    // Check if we're at the limit
    return this.requestCounts[platform].length < this.rateLimits[platform].maxPerHour;
  }

  // Record request for rate limiting
  recordRequest(platform) {
    if (!this.requestCounts[platform]) {
      this.requestCounts[platform] = [];
    }
    this.requestCounts[platform].push(Date.now());
  }

  // Cleanup method
  async cleanup() {
    await this.closeBrowser();
  }
}

module.exports = new JobScrapingService();
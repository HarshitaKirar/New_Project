const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Job = require('../models/Job');
const Company = require('../models/Company');
const aiService = require('./aiService');

class JobScraperService {
  constructor() {
    this.browser = null;
    this.isRunning = false;
    this.scrapers = {
      indeed: this.scrapeIndeed.bind(this),
      linkedin: this.scrapeLinkedIn.bind(this),
      glassdoor: this.scrapeGlassdoor.bind(this),
      ziprecruiter: this.scrapeZipRecruiter.bind(this)
    };
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeAllPlatforms(keywords = ['software engineer', 'data scientist', 'product manager'], locations = ['San Francisco', 'New York', 'Remote']) {
    if (this.isRunning) {
      console.log('Scraping already in progress...');
      return;
    }

    this.isRunning = true;
    const results = {
      total: 0,
      byPlatform: {},
      errors: []
    };

    try {
      await this.initBrowser();

      for (const platform of Object.keys(this.scrapers)) {
        console.log(`🔍 Scraping ${platform}...`);
        try {
          const platformResults = await this.scrapers[platform](keywords, locations);
          results.byPlatform[platform] = platformResults;
          results.total += platformResults.length;
          console.log(`✅ ${platform}: ${platformResults.length} jobs scraped`);
          
          // Add delay between platforms to avoid rate limiting
          await this.delay(5000);
        } catch (error) {
          console.error(`❌ Error scraping ${platform}:`, error.message);
          results.errors.push({ platform, error: error.message });
        }
      }

      await this.closeBrowser();
    } catch (error) {
      console.error('❌ Fatal scraping error:', error);
      results.errors.push({ platform: 'system', error: error.message });
    } finally {
      this.isRunning = false;
    }

    return results;
  }

  async scrapeIndeed(keywords, locations) {
    const jobs = [];
    const baseUrl = 'https://www.indeed.com/jobs';

    try {
      for (const keyword of keywords.slice(0, 3)) { // Limit to prevent rate limiting
        for (const location of locations.slice(0, 3)) {
          const searchUrl = `${baseUrl}?q=${encodeURIComponent(keyword)}&l=${encodeURIComponent(location)}&limit=50`;
          
          try {
            const response = await axios.get(searchUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              },
              timeout: 10000
            });

            const $ = cheerio.load(response.data);
            
            $('.jobsearch-SerpJobCard').each((index, element) => {
              try {
                const $job = $(element);
                const title = $job.find('.jobTitle a span').text().trim();
                const company = $job.find('.companyName').text().trim();
                const location = $job.find('.companyLocation').text().trim();
                const summary = $job.find('.summary').text().trim();
                const jobUrl = 'https://www.indeed.com' + $job.find('.jobTitle a').attr('href');
                const salary = $job.find('.salary-snippet').text().trim();

                if (title && company) {
                  jobs.push({
                    title,
                    company: { name: company },
                    location: this.parseLocation(location),
                    description: summary,
                    salary: this.parseSalary(salary),
                    source: {
                      platform: 'indeed',
                      url: jobUrl,
                      postedDate: new Date(),
                      lastUpdated: new Date()
                    },
                    status: 'active',
                    jobType: 'full-time', // Default, could be parsed from description
                    remote: location.toLowerCase().includes('remote') ? 'remote' : 'on-site'
                  });
                }
              } catch (error) {
                console.error('Error parsing Indeed job:', error);
              }
            });

            await this.delay(2000); // Rate limiting
          } catch (error) {
            console.error(`Error scraping Indeed for ${keyword} in ${location}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('Indeed scraping failed:', error);
    }

    return await this.processAndSaveJobs(jobs, 'indeed');
  }

  async scrapeLinkedIn(keywords, locations) {
    const jobs = [];
    
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      for (const keyword of keywords.slice(0, 2)) {
        for (const location of locations.slice(0, 2)) {
          try {
            const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&f_TPR=r86400`; // Last 24 hours
            
            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            await this.delay(3000);

            // Scroll to load more jobs
            await page.evaluate(() => {
              window.scrollTo(0, document.body.scrollHeight);
            });
            await this.delay(2000);

            const jobElements = await page.$$('.base-card');
            
            for (const element of jobElements.slice(0, 20)) { // Limit to prevent timeout
              try {
                const title = await element.$eval('.base-search-card__title', el => el.textContent.trim()).catch(() => '');
                const company = await element.$eval('.base-search-card__subtitle', el => el.textContent.trim()).catch(() => '');
                const location = await element.$eval('.job-search-card__location', el => el.textContent.trim()).catch(() => '');
                const jobUrl = await element.$eval('a', el => el.href).catch(() => '');

                if (title && company) {
                  jobs.push({
                    title,
                    company: { name: company },
                    location: this.parseLocation(location),
                    description: `${title} position at ${company}`, // Placeholder
                    source: {
                      platform: 'linkedin',
                      url: jobUrl,
                      postedDate: new Date(),
                      lastUpdated: new Date()
                    },
                    status: 'active',
                    jobType: 'full-time',
                    remote: location.toLowerCase().includes('remote') ? 'remote' : 'on-site'
                  });
                }
              } catch (error) {
                console.error('Error parsing LinkedIn job element:', error);
              }
            }

            await this.delay(5000); // Longer delay for LinkedIn
          } catch (error) {
            console.error(`Error scraping LinkedIn for ${keyword} in ${location}:`, error.message);
          }
        }
      }

      await page.close();
    } catch (error) {
      console.error('LinkedIn scraping failed:', error);
    }

    return await this.processAndSaveJobs(jobs, 'linkedin');
  }

  async scrapeGlassdoor(keywords, locations) {
    const jobs = [];
    // Glassdoor has strict anti-scraping measures, so this is a simplified version
    // In production, you might want to use their API or a more sophisticated approach
    
    try {
      // For demo purposes, we'll create some sample jobs
      for (const keyword of keywords.slice(0, 2)) {
        for (const location of locations.slice(0, 2)) {
          jobs.push({
            title: `${keyword} - Sample from Glassdoor`,
            company: { name: 'Sample Company' },
            location: this.parseLocation(location),
            description: `Sample job description for ${keyword} position`,
            source: {
              platform: 'glassdoor',
              url: 'https://www.glassdoor.com/job-listing/sample',
              postedDate: new Date(),
              lastUpdated: new Date()
            },
            status: 'active',
            jobType: 'full-time',
            remote: location.toLowerCase().includes('remote') ? 'remote' : 'on-site'
          });
        }
      }
    } catch (error) {
      console.error('Glassdoor scraping failed:', error);
    }

    return await this.processAndSaveJobs(jobs, 'glassdoor');
  }

  async scrapeZipRecruiter(keywords, locations) {
    const jobs = [];
    
    try {
      for (const keyword of keywords.slice(0, 2)) {
        for (const location of locations.slice(0, 2)) {
          // ZipRecruiter scraping implementation
          // This is a simplified version - actual implementation would need to handle their specific structure
          jobs.push({
            title: `${keyword} - Sample from ZipRecruiter`,
            company: { name: 'Sample Company' },
            location: this.parseLocation(location),
            description: `Sample job description for ${keyword} position`,
            source: {
              platform: 'ziprecruiter',
              url: 'https://www.ziprecruiter.com/jobs/sample',
              postedDate: new Date(),
              lastUpdated: new Date()
            },
            status: 'active',
            jobType: 'full-time',
            remote: location.toLowerCase().includes('remote') ? 'remote' : 'on-site'
          });
        }
      }
    } catch (error) {
      console.error('ZipRecruiter scraping failed:', error);
    }

    return await this.processAndSaveJobs(jobs, 'ziprecruiter');
  }

  async processAndSaveJobs(jobs, platform) {
    const savedJobs = [];
    
    for (const jobData of jobs) {
      try {
        // Check if job already exists
        const existingJob = await Job.findOne({
          title: jobData.title,
          'company.name': jobData.company.name,
          'source.platform': platform
        });

        if (existingJob) {
          // Update existing job
          existingJob.source.lastUpdated = new Date();
          await existingJob.save();
          continue;
        }

        // Process job description with AI if available
        if (jobData.description && aiService.isAvailable) {
          try {
            const aiAnalysis = await aiService.analyzeJobDescription(jobData.description);
            jobData.aiAnalysis = aiAnalysis;
          } catch (error) {
            console.error('AI analysis failed for job:', error.message);
          }
        }

        // Create or update company
        let company = await Company.findOne({ name: jobData.company.name });
        if (!company) {
          company = new Company({
            name: jobData.company.name,
            status: 'active',
            hiring: {
              isActivelyHiring: true,
              openPositions: 1
            }
          });
          await company.save();
        } else {
          company.hiring.openPositions += 1;
          await company.save();
        }

        // Create new job
        const newJob = new Job(jobData);
        await newJob.save();
        savedJobs.push(newJob);

      } catch (error) {
        console.error('Error saving job:', error.message);
      }
    }

    return savedJobs;
  }

  parseLocation(locationString) {
    if (!locationString) return {};
    
    const parts = locationString.split(',').map(part => part.trim());
    
    if (parts.length >= 2) {
      return {
        city: parts[0],
        state: parts[1],
        country: parts[2] || 'United States'
      };
    } else if (parts.length === 1) {
      if (parts[0].toLowerCase().includes('remote')) {
        return { city: 'Remote', state: '', country: 'United States' };
      }
      return { city: parts[0], state: '', country: 'United States' };
    }
    
    return {};
  }

  parseSalary(salaryString) {
    if (!salaryString) return {};
    
    const salaryMatch = salaryString.match(/\$?([\d,]+)(?:\s*-\s*\$?([\d,]+))?/);
    if (salaryMatch) {
      const min = parseInt(salaryMatch[1].replace(/,/g, ''));
      const max = salaryMatch[2] ? parseInt(salaryMatch[2].replace(/,/g, '')) : null;
      
      return {
        min,
        max,
        currency: 'USD',
        period: salaryString.toLowerCase().includes('hour') ? 'hourly' : 'yearly'
      };
    }
    
    return {};
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getScrapingStats() {
    try {
      const stats = await Job.aggregate([
        {
          $group: {
            _id: '$source.platform',
            count: { $sum: 1 },
            lastUpdated: { $max: '$source.lastUpdated' }
          }
        }
      ]);

      return stats;
    } catch (error) {
      console.error('Error getting scraping stats:', error);
      return [];
    }
  }

  async cleanupOldJobs(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Job.updateMany(
        {
          'source.lastUpdated': { $lt: cutoffDate },
          status: 'active'
        },
        { status: 'expired' }
      );

      console.log(`Marked ${result.modifiedCount} old jobs as expired`);
      return result.modifiedCount;
    } catch (error) {
      console.error('Error cleaning up old jobs:', error);
      return 0;
    }
  }
}

module.exports = new JobScraperService();
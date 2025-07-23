# 🚀 SmartApply - AI-Powered Job Application Platform

A comprehensive web application that revolutionizes job searching through intelligent automation, making the job hunt effortless, efficient, and stress-free.

## 🎯 Features

### 📄 **Effortless Profile Setup**
- **One-Click Resume Upload**: Users upload their resume once, and our AI extracts skills, experience, and qualifications
- **Smart Profile Generation**: Automatically creates comprehensive user profiles from resume data
- **Skills Intelligence**: AI understands and categorizes technical and soft skills
- **Experience Mapping**: Intelligent parsing of work history, education, and achievements

### 🔍 **Intelligent Job Matching**
- **AI-Powered Matching**: Advanced algorithms find the most relevant job openings across major job boards
- **Multi-Platform Integration**: Searches LinkedIn, Indeed, Glassdoor, and other top job platforms
- **Smart Filtering**: Matches based on skills, experience level, location preferences, and salary expectations
- **Relevance Scoring**: Each job gets a compatibility score based on user profile

### 🤖 **Automated Applications**
- **One-Click Apply**: System applies to matched jobs automatically on behalf of users
- **Custom Cover Letters**: AI generates personalized cover letters for each application
- **Application Optimization**: Tailors applications to match job requirements
- **Bulk Processing**: Handles multiple applications simultaneously

### 📊 **Centralized Tracking Dashboard**
- **Application Status**: Real-time tracking of all job applications in one place
- **Response Analytics**: Monitor application success rates and feedback
- **Interview Scheduling**: Integrated calendar for managing interviews
- **Progress Insights**: Detailed analytics on job search performance

### 🎯 **Smart Job Recommendations**
- **Personalized Suggestions**: Daily job recommendations based on profile and preferences
- **Trending Opportunities**: Highlights growing industries and in-demand roles
- **Salary Insights**: Provides market salary data for positions
- **Company Intelligence**: Background information on potential employers

## 🛠️ Tech Stack

### **Backend**
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with secure token management
- **AI Integration**: OpenAI API for resume parsing and job matching
- **File Processing**: Advanced PDF parsing and text extraction
- **Job Board APIs**: Integration with major job platforms
- **Web Scraping**: Automated job data collection

### **Frontend**
- **Framework**: React 18 with modern hooks and components
- **State Management**: Zustand for global state management
- **UI Framework**: Tailwind CSS with custom design system
- **File Upload**: Drag-and-drop resume upload with preview
- **Data Visualization**: Interactive charts for application analytics
- **Real-time Updates**: Live status updates for applications

## 📦 Installation & Setup

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- OpenAI API key for AI features

### **Backend Setup**

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd smartapply
   npm run install-all
   ```

2. **Configure environment variables**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Update the `.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smartapply
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   CLIENT_URL=http://localhost:3000
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

## 🎯 Usage Guide

### **Getting Started**

1. **Sign Up**: Create your SmartApply account
2. **Upload Resume**: Upload your resume for AI analysis
3. **Profile Review**: Review and enhance your auto-generated profile
4. **Set Preferences**: Configure job search criteria and preferences
5. **Browse Matches**: Review AI-recommended job opportunities
6. **Auto-Apply**: Enable automated applications for matched jobs
7. **Track Progress**: Monitor applications in your centralized dashboard

### **Key Features**

#### **Resume Intelligence**
- Upload resume in PDF, DOC, or DOCX format
- AI extracts skills, experience, education, and achievements
- Smart categorization of technical and soft skills
- Automatic profile completion and optimization

#### **Job Discovery**
- AI scans thousands of job postings daily
- Intelligent matching based on your profile
- Real-time job alerts for new opportunities
- Customizable search filters and preferences

#### **Application Automation**
- Automated application submission to matched jobs
- AI-generated personalized cover letters
- Application tracking and status monitoring
- Success rate analytics and optimization tips

#### **Career Insights**
- Market analysis for your skills and experience
- Salary benchmarking and negotiation insights
- Industry trend analysis and recommendations
- Career path suggestions and skill gap analysis

## 🏗️ Project Structure

```
smartapply/
├── server/                  # Backend application
│   ├── models/             # Database schemas
│   │   ├── User.js         # User profiles and preferences
│   │   ├── Resume.js       # Resume data and analysis
│   │   ├── Job.js          # Job listings and metadata
│   │   ├── Application.js  # Job applications tracking
│   │   └── Company.js      # Company information
│   ├── routes/             # API endpoints
│   │   ├── auth.js         # Authentication routes
│   │   ├── resume.js       # Resume upload and parsing
│   │   ├── jobs.js         # Job search and matching
│   │   ├── applications.js # Application management
│   │   └── analytics.js    # Dashboard analytics
│   ├── services/           # Business logic
│   │   ├── aiService.js    # OpenAI integration
│   │   ├── jobScraper.js   # Job board scraping
│   │   ├── matcher.js      # Job matching algorithm
│   │   └── applicator.js   # Automated application service
│   └── index.js            # Server entry point
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   │   ├── Dashboard.js    # Main dashboard
│   │   │   ├── Profile.js      # User profile management
│   │   │   ├── Jobs.js         # Job browsing and matching
│   │   │   ├── Applications.js # Application tracking
│   │   │   └── Analytics.js    # Performance analytics
│   │   ├── store/          # State management
│   │   └── services/       # API integration
│   └── public/             # Static assets
└── package.json            # Project configuration
```

## 🔧 API Documentation

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### **Resume Management**
- `POST /api/resume/upload` - Upload and parse resume
- `GET /api/resume/profile` - Get parsed profile data
- `PUT /api/resume/profile` - Update profile information

### **Job Management**
- `GET /api/jobs/search` - Search jobs with filters
- `GET /api/jobs/matches` - Get AI-matched jobs
- `POST /api/jobs/save` - Save job for later
- `GET /api/jobs/saved` - Get saved jobs

### **Application Management**
- `POST /api/applications/apply` - Submit job application
- `GET /api/applications` - Get all applications
- `PUT /api/applications/:id/status` - Update application status
- `GET /api/applications/analytics` - Get application analytics

## 🚀 Deployment

### **Production Setup**
1. Build the frontend: `npm run build`
2. Configure production environment variables
3. Deploy to your preferred cloud platform
4. Set up MongoDB Atlas for production database
5. Configure job board API keys and webhooks

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License.

---

**Transform your job search with AI-powered automation** 🎯

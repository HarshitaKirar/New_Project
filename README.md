# 🌱 EcoTracker - Gamified Carbon Footprint Tracking Application

A comprehensive web application that helps users track, reduce, and offset their carbon footprint through gamification, community engagement, and real-world rewards.

## 🚀 Features

### 📊 **Personalized Carbon Tracking**
- **Smart Onboarding**: Users define their profession & lifestyle to establish a baseline carbon footprint
- **Automated Tracking**: Daily tracking of water, transport, food, electricity, and shopping emissions
- **Bill Upload Processing**: Upload utility bills to refine carbon footprint estimations
- **Real-time Analytics**: Beautiful visualizations of carbon impact and reduction progress

### 🎮 **Gamified Experience**
- **EcoCoin Rewards**: Earn coins for sustainable actions and eco-friendly choices
- **Daily/Weekly Challenges**: Complete eco-tasks like "Cycle to Work" or "Meatless Monday"
- **Level System**: Progress through levels based on experience points and achievements
- **Streak Tracking**: Maintain daily activity streaks for bonus rewards

### 🏆 **Real-World Incentives**
- **Eco-Brand Discounts**: Redeem EcoCoins for discounts at sustainable brands
- **Transport Vouchers**: E-rickshaw and public transport vouchers
- **Local Partnerships**: Discounts at plant nurseries and eco-friendly stores
- **Verified Rewards**: All partners and rewards are verified for authenticity

### 🌍 **Green Community**
- **Social Features**: Share achievements, post eco-tips, and engage with content
- **Discussion Forums**: Participate in environmental discussions and Q&A
- **Referral System**: Earn bonus coins by inviting friends to join
- **Leaderboards**: Compete with friends and global community

### 📈 **Comprehensive Analytics**
- **Progress Tracking**: Monitor carbon reduction over time with detailed charts
- **Category Breakdown**: See emissions by transportation, energy, food, etc.
- **Goal Setting**: Set and track personal carbon reduction targets
- **Comparative Analysis**: Compare your progress with community averages

## 🛠️ Tech Stack

### **Backend**
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **File Upload**: Multer with cloud storage support
- **Real-time**: Socket.IO for live updates
- **Security**: Helmet, rate limiting, input validation

### **Frontend**
- **Framework**: React 18 with functional components and hooks
- **Routing**: React Router v6
- **State Management**: Zustand for global state
- **API**: React Query for server state management
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth animations
- **UI Components**: Headless UI with custom components
- **Forms**: React Hook Form with validation
- **Charts**: Recharts for data visualization

### **Development Tools**
- **Package Manager**: npm
- **Development Server**: React Scripts with hot reload
- **Build Tool**: Create React App with custom configurations
- **CSS Processing**: PostCSS with Tailwind CSS
- **Code Quality**: ESLint and Prettier

## 📦 Installation & Setup

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

### **Backend Setup**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eco-tracker-app
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecotracker
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongodb
   
   # Or using MongoDB directly
   mongod
   ```

5. **Start the backend server**
   ```bash
   npm run server
   ```

### **Frontend Setup**

1. **Start the frontend development server**
   ```bash
   npm run client
   ```

2. **Or start both frontend and backend**
   ```bash
   npm run dev
   ```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/health

## 🎯 Usage Guide

### **Getting Started**

1. **Registration**: Create an account with email and basic information
2. **Onboarding**: Complete lifestyle assessment to set your carbon baseline
3. **Dashboard**: View your personalized dashboard with analytics and tasks
4. **Track Activities**: Log daily activities or upload utility bills
5. **Complete Tasks**: Take on eco-challenges to earn rewards
6. **Redeem Rewards**: Use EcoCoins for real-world incentives
7. **Engage Community**: Share tips and connect with other users

### **Key Features Walkthrough**

#### **Carbon Tracking**
- Navigate to "Carbon Tracking" to log daily activities
- Use the bill upload feature for accurate energy consumption data
- View detailed analytics in the "Analytics" section

#### **Eco Tasks**
- Check "Tasks" for daily and weekly challenges
- Complete tasks to earn EcoCoins and experience points
- Track your progress and streak in the user profile

#### **Rewards Marketplace**
- Browse available rewards in the "Rewards" section
- Filter by category, price, or partner
- Redeem rewards using your earned EcoCoins

#### **Community Engagement**
- Visit "Community" to see latest posts and discussions
- Share your eco-achievements and tips
- Follow other users and engage with their content

## 🏗️ Project Structure

```
eco-tracker-app/
├── server/                  # Backend application
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication and validation
│   ├── index.js            # Server entry point
│   └── .env                # Environment configuration
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── App.js          # Main React component
│   │   └── index.js        # Frontend entry point
│   ├── public/             # Static assets
│   └── tailwind.config.js  # Tailwind configuration
├── package.json            # Root package configuration
└── README.md              # This file
```

## 🔧 Configuration

### **Environment Variables**

#### **Backend (`server/.env`)**
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/ecotracker

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# Client URL
CLIENT_URL=http://localhost:3000

# Optional Services
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### **Frontend Environment**
Create `client/.env` for frontend-specific variables:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### **Production Build**

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   export MONGODB_URI=your_production_mongodb_uri
   export JWT_SECRET=your_production_jwt_secret
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

### **Deployment Options**

- **Heroku**: Use the provided `Procfile` for easy Heroku deployment
- **Digital Ocean**: Deploy on droplets with PM2 for process management
- **Vercel/Netlify**: Deploy frontend on static hosting platforms
- **AWS/GCP**: Use cloud platforms for scalable deployment

## 📚 API Documentation

### **Authentication Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### **Carbon Tracking Endpoints**
- `POST /api/carbon/entry` - Create carbon footprint entry
- `GET /api/carbon/entries` - Get user's carbon entries
- `GET /api/carbon/analytics` - Get carbon analytics
- `POST /api/carbon/upload-bill` - Upload and process utility bill

### **Task Management Endpoints**
- `GET /api/tasks` - Get available tasks
- `POST /api/tasks/:id/assign` - Assign task to user
- `POST /api/tasks/:id/complete` - Complete a task
- `GET /api/tasks/my-tasks` - Get user's assigned tasks

### **Rewards Endpoints**
- `GET /api/rewards` - Get available rewards
- `POST /api/rewards/:id/redeem` - Redeem a reward
- `GET /api/rewards/my-rewards` - Get user's redeemed rewards

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**
- Follow the existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 🐛 Troubleshooting

### **Common Issues**

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `sudo systemctl status mongodb`
   - Check connection string in `.env` file
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes: `lsof -ti:5000 | xargs kill -9`

3. **JWT Token Errors**
   - Regenerate JWT secrets in `.env`
   - Clear browser localStorage
   - Check token expiration settings

4. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Update dependencies: `npm update`

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Inspiration**: Climate change awareness and the need for individual action
- **Design**: Modern UI/UX principles and accessibility standards
- **Community**: Open source libraries and contributors
- **Environment**: Built with sustainability in mind

## 📞 Support

For support and questions:
- **Email**: support@ecotracker.app
- **Documentation**: [docs.ecotracker.app](https://docs.ecotracker.app)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

**Built with 💚 for a sustainable future** 🌍

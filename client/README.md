# EcoTracker - React Frontend

A comprehensive React application for carbon footprint tracking with gamification, rewards, and community features.

## Features

### 🏠 Home Page
- **Comprehensive Overview**: Beautiful landing page showcasing all features
- **Animated Elements**: Smooth animations and interactive components
- **Feature Highlights**: Detailed sections for each major functionality
- **Quick Stats**: Real-time display of user impact and community metrics

### 🎯 Personalized Onboarding
- **Multi-step Form**: 4-step onboarding process
- **Profession Analysis**: Tailored carbon footprint based on user profession
- **Lifestyle Assessment**: Detailed lifestyle questionnaire
- **Custom Baseline**: Calculate personalized carbon footprint baseline
- **Smart Recommendations**: AI-powered suggestions for improvement

### 📊 Carbon Tracking
- **Automated Tracking**: Smart notification parsing for daily activities
- **Bill Upload System**: Upload and parse electricity, gas, fuel, and grocery bills
- **Real-time Analytics**: Live tracking of carbon footprint across categories
- **Category Breakdown**: Transport, Energy, Food, and Shopping tracking
- **Progress Visualization**: Charts and graphs showing improvement over time

### 🏆 Gamification
- **Daily Eco-Tasks**: Complete daily challenges for EcoCoins
- **Weekly Challenges**: More complex tasks with higher rewards
- **Achievement System**: Unlock badges and trophies
- **Leaderboard**: Compete with friends and global community
- **Streak System**: Maintain daily activity streaks

### 🎁 Rewards System
- **EcoCoin Currency**: Earn coins for sustainable actions
- **Real-world Rewards**: Redeem for discounts and vouchers
- **Partner Network**: 100+ eco-friendly partners
- **Reward Categories**: Transport, Food, Shopping, Home & Garden, Experiences
- **Stock Management**: Limited quantity rewards for exclusive items

### 🌍 Green Community
- **Community Feed**: Share achievements and eco-friendly actions
- **Eco-Tips**: Daily environmental tips and educational content
- **Social Features**: Like, comment, and share posts
- **Referral System**: Earn bonus coins for inviting friends
- **Trending Topics**: Stay updated with popular eco-discussions

## Technology Stack

- **React 18**: Latest React with hooks and functional components
- **React Router**: Client-side routing for seamless navigation
- **Framer Motion**: Smooth animations and transitions
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Beautiful icon library
- **React Query**: Data fetching and caching
- **React Hot Toast**: Elegant notification system

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   └── Layout/
│   │       └── Header.js          # Main navigation header
│   ├── pages/
│   │   ├── HomePage.js             # Main landing page
│   │   ├── OnboardingPage.js       # User onboarding flow
│   │   ├── CarbonTrackingPage.js   # Carbon footprint tracking
│   │   ├── GamificationPage.js     # Eco-challenges and games
│   │   ├── RewardsPage.js          # Rewards marketplace
│   │   └── CommunityPage.js        # Social community features
│   ├── App.js                      # Main app component
│   ├── index.js                    # Entry point
│   └── index.css                   # Global styles
├── public/
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Removes the single build dependency

## Features Overview

### Navigation
- **Responsive Header**: Works on all device sizes
- **Interactive Navigation**: Smooth transitions between pages
- **Mobile Menu**: Hamburger menu for mobile devices

### User Experience
- **Smooth Animations**: Framer Motion animations throughout
- **Loading States**: Elegant loading indicators
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on desktop, tablet, and mobile

### Carbon Tracking Features
- **Smart Notifications**: Parse daily activity notifications
- **Bill Analysis**: Upload and analyze utility bills
- **Category Tracking**: Track emissions by category
- **Progress Visualization**: Charts showing improvement over time

### Gamification Features
- **Task Management**: Daily and weekly eco-tasks
- **Reward System**: EcoCoin currency system
- **Achievement Badges**: Unlock achievements for milestones
- **Social Competition**: Leaderboards and rankings

### Community Features
- **Social Feed**: Share and view eco-friendly actions
- **Educational Content**: Daily eco-tips and environmental facts
- **Referral Program**: Invite friends and earn rewards
- **Trending Topics**: Popular environmental discussions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.

---

**Built with 💚 for a sustainable future**
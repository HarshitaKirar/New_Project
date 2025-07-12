import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  Star, 
  Gift, 
  Coins, 
  Calendar, 
  Users,
  CheckCircle,
  Lock,
  Flame,
  Award,
  TrendingUp,
  Clock,
  MapPin,
  Zap,
  Leaf,
  Car,
  Bike,
  Recycle,
  TreePine,
  Lightbulb,
  Coffee,
  ArrowRight
} from 'lucide-react';
import Header from '../components/Layout/Header';

const GamificationPage = () => {
  const [selectedTab, setSelectedTab] = useState('daily');
  const [completedTasks, setCompletedTasks] = useState([]);

  const userStats = {
    level: 5,
    title: "Eco-Warrior",
    ecoCoins: 2450,
    streak: 7,
    totalTasks: 127,
    co2Saved: 1.2,
    rank: 23,
    nextLevel: 350
  };

  const dailyTasks = [
    { id: 1, title: "Cycle to Work", description: "Use bicycle instead of car", icon: Bike, coins: 25, co2: 2.5, completed: false, category: "transport" },
    { id: 2, title: "Meatless Monday", description: "Choose vegetarian meals today", icon: Coffee, coins: 15, co2: 1.8, completed: false, category: "food" },
    { id: 3, title: "Use Public Transport", description: "Take bus or metro", icon: Car, coins: 20, co2: 2.1, completed: true, category: "transport" },
    { id: 4, title: "Turn Off Lights", description: "Switch off unused lights", icon: Lightbulb, coins: 10, co2: 0.5, completed: false, category: "energy" },
    { id: 5, title: "Recycle Waste", description: "Sort and recycle plastic", icon: Recycle, coins: 15, co2: 1.0, completed: false, category: "waste" }
  ];

  const weeklyTasks = [
    { id: 6, title: "Plant a Tree", description: "Plant or sponsor a tree", icon: TreePine, coins: 100, co2: 22, completed: false, category: "environment" },
    { id: 7, title: "Zero Waste Day", description: "Produce minimal waste", icon: Recycle, coins: 50, co2: 5.5, completed: false, category: "waste" },
    { id: 8, title: "Carpool Challenge", description: "Share rides 3+ times", icon: Users, coins: 75, co2: 8.2, completed: false, category: "transport" },
    { id: 9, title: "Energy Saver", description: "Reduce energy usage by 20%", icon: Zap, coins: 60, co2: 6.8, completed: false, category: "energy" }
  ];

  const achievements = [
    { id: 1, title: "First Steps", description: "Complete your first eco-task", icon: Trophy, unlocked: true, rarity: "common" },
    { id: 2, title: "Streak Master", description: "Maintain 7-day streak", icon: Flame, unlocked: true, rarity: "rare" },
    { id: 3, title: "Green Commuter", description: "Use eco-transport 30 times", icon: Bike, unlocked: true, rarity: "epic" },
    { id: 4, title: "Tree Hugger", description: "Plant 10 trees", icon: TreePine, unlocked: false, rarity: "legendary" },
    { id: 5, title: "Carbon Saver", description: "Save 50kg CO2", icon: Leaf, unlocked: false, rarity: "legendary" },
    { id: 6, title: "Community Leader", description: "Invite 10 friends", icon: Users, unlocked: false, rarity: "epic" }
  ];

  const leaderboard = [
    { rank: 1, name: "EcoMaster", level: 12, coins: 5420, avatar: "👑" },
    { rank: 2, name: "GreenGuru", level: 11, coins: 4890, avatar: "🌱" },
    { rank: 3, name: "TreeLover", level: 10, coins: 4320, avatar: "🌳" },
    { rank: 4, name: "You", level: 5, coins: 2450, avatar: "⭐", isUser: true },
    { rank: 5, name: "EcoNewbie", level: 8, coins: 3210, avatar: "♻️" }
  ];

  const handleTaskComplete = (taskId) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId]);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const TaskCard = ({ task, isWeekly = false }) => {
    const Icon = task.icon;
    const isCompleted = completedTasks.includes(task.id) || task.completed;
    
    return (
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className={`bg-white rounded-xl p-6 shadow-sm border transition-all ${
          isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`font-semibold ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              <p className={`text-sm ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                {task.description}
              </p>
            </div>
          </div>
          {isCompleted && (
            <CheckCircle className="w-6 h-6 text-green-500" />
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900">+{task.coins}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Leaf className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-900">-{task.co2}kg</span>
            </div>
          </div>
          
          {!isCompleted && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTaskComplete(task.id)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Complete
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="mb-8"
          >
            <motion.div variants={fadeInUp} className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Eco-Challenges</h1>
              <p className="text-lg text-gray-600">Complete tasks, earn rewards, and make a difference!</p>
            </motion.div>
          </motion.div>

          {/* User Stats */}
          <motion.div 
            variants={fadeInUp}
            className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 mb-8 text-white"
          >
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{userStats.level}</div>
                <div className="text-green-100 text-sm">Level</div>
                <div className="text-xs text-green-200 mt-1">{userStats.title}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{userStats.ecoCoins}</div>
                <div className="text-green-100 text-sm">EcoCoins</div>
                <div className="text-xs text-green-200 mt-1">+{userStats.nextLevel} to next level</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{userStats.streak}</div>
                <div className="text-green-100 text-sm">Day Streak</div>
                <div className="flex items-center justify-center mt-1">
                  <Flame className="w-4 h-4 text-orange-300 mr-1" />
                  <span className="text-xs text-green-200">On fire!</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">#{userStats.rank}</div>
                <div className="text-green-100 text-sm">Rank</div>
                <div className="text-xs text-green-200 mt-1">{userStats.co2Saved}T CO2 saved</div>
              </div>
            </div>
          </motion.div>

          {/* Task Tabs */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center justify-center space-x-1 bg-white rounded-lg p-1 w-fit mx-auto">
              <button
                onClick={() => setSelectedTab('daily')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  selectedTab === 'daily' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Daily Tasks
              </button>
              <button
                onClick={() => setSelectedTab('weekly')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  selectedTab === 'weekly' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Weekly Challenges
              </button>
              <button
                onClick={() => setSelectedTab('achievements')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  selectedTab === 'achievements' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Achievements
              </button>
              <button
                onClick={() => setSelectedTab('leaderboard')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  selectedTab === 'leaderboard' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Leaderboard
              </button>
            </div>
          </motion.div>

          {/* Tasks Content */}
          {selectedTab === 'daily' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Today's Eco-Tasks</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Resets in 14 hours</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {dailyTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </motion.div>
          )}

          {selectedTab === 'weekly' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Weekly Challenges</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>5 days remaining</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {weeklyTasks.map((task) => (
                  <TaskCard key={task.id} task={task} isWeekly />
                ))}
              </div>
            </motion.div>
          )}

          {selectedTab === 'achievements' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div 
                      key={achievement.id}
                      whileHover={{ scale: 1.02 }}
                      className={`bg-white rounded-xl p-6 shadow-sm border transition-all ${
                        achievement.unlocked ? 'border-green-200' : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            achievement.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {achievement.unlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                              {achievement.title}
                            </h3>
                            <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </span>
                        {achievement.unlocked && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {selectedTab === 'leaderboard' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Global Leaderboard</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Updates daily</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm">
                {leaderboard.map((player, index) => (
                  <div 
                    key={player.rank}
                    className={`p-6 flex items-center justify-between ${
                      index < leaderboard.length - 1 ? 'border-b border-gray-200' : ''
                    } ${player.isUser ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        player.rank === 1 ? 'bg-yellow-100' :
                        player.rank === 2 ? 'bg-gray-100' :
                        player.rank === 3 ? 'bg-orange-100' :
                        player.isUser ? 'bg-blue-100' : 'bg-gray-50'
                      }`}>
                        {player.rank <= 3 ? (
                          <Trophy className={`w-5 h-5 ${
                            player.rank === 1 ? 'text-yellow-500' :
                            player.rank === 2 ? 'text-gray-500' :
                            'text-orange-500'
                          }`} />
                        ) : (
                          <span className="font-bold text-gray-600">#{player.rank}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{player.avatar}</span>
                          <h3 className={`font-semibold ${player.isUser ? 'text-blue-700' : 'text-gray-900'}`}>
                            {player.name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">Level {player.level}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-gray-900">{player.coins}</span>
                      </div>
                      <p className="text-xs text-gray-500">EcoCoins</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div 
            variants={fadeInUp}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mt-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Earn More Rewards?</h3>
                <p className="text-gray-600">
                  Check out our rewards store and redeem your EcoCoins for amazing eco-friendly prizes!
                </p>
              </div>
              <Link 
                to="/rewards" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center"
              >
                <Gift className="w-5 h-5 mr-2" />
                View Rewards
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPage;
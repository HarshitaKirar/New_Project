import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp,
  Calendar,
  MapPin,
  Star,
  BookOpen,
  Lightbulb,
  Award,
  Gift,
  UserPlus,
  Send,
  Image,
  Video,
  Smile,
  ThumbsUp,
  Eye,
  Clock,
  Leaf,
  Recycle,
  TreePine,
  Zap,
  Globe,
  Target,
  Coffee,
  Car,
  Home
} from 'lucide-react';
import Header from '../components/Layout/Header';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState([]);

  const userStats = {
    posts: 23,
    followers: 156,
    following: 89,
    ecoCoins: 2450,
    referrals: 5
  };

  const ecoTips = [
    {
      id: 1,
      title: "Reduce Water Usage",
      content: "Turn off the tap while brushing teeth to save up to 8 gallons per day. Small actions make a big difference!",
      category: "Water Conservation",
      impact: "Save 8 gallons daily",
      icon: "💧",
      readTime: "2 min",
      date: "Today"
    },
    {
      id: 2,
      title: "LED Light Benefits",
      content: "Switch to LED bulbs to reduce energy consumption by 75% and last 25 times longer than traditional bulbs.",
      category: "Energy Saving",
      impact: "75% less energy",
      icon: "💡",
      readTime: "3 min",
      date: "Yesterday"
    },
    {
      id: 3,
      title: "Composting at Home",
      content: "Turn kitchen scraps into nutrient-rich soil. Composting reduces waste and creates free fertilizer for plants.",
      category: "Waste Reduction",
      impact: "30% less waste",
      icon: "🌱",
      readTime: "5 min",
      date: "2 days ago"
    }
  ];

  const communityPosts = [
    {
      id: 1,
      author: "Sarah Green",
      avatar: "🌱",
      timeAgo: "2 hours ago",
      content: "Just completed my 30-day zero waste challenge! 🎉 Managed to fit all my non-recyclable waste in a small jar. The key was meal planning and buying from bulk stores. Anyone else trying this?",
      image: null,
      likes: 45,
      comments: 12,
      shares: 8,
      category: "Achievement",
      ecoCoins: 50,
      location: "Mumbai, India"
    },
    {
      id: 2,
      author: "Eco Warrior",
      avatar: "♻️",
      timeAgo: "5 hours ago",
      content: "Planted 10 trees today with my local environmental group! 🌳 Each tree will absorb about 48 pounds of CO2 per year. Who wants to join our next planting event?",
      image: "🌲",
      likes: 89,
      comments: 23,
      shares: 15,
      category: "Environment",
      ecoCoins: 100,
      location: "Delhi, India"
    },
    {
      id: 3,
      author: "Alex Johnson",
      avatar: "🚲",
      timeAgo: "1 day ago",
      content: "Cycled to work every day this week! 🚴‍♂️ Saved 15kg of CO2 emissions and improved my fitness. The morning fresh air is so refreshing compared to sitting in traffic.",
      image: null,
      likes: 34,
      comments: 8,
      shares: 5,
      category: "Transport",
      ecoCoins: 25,
      location: "Bangalore, India"
    },
    {
      id: 4,
      author: "Maya Patel",
      avatar: "🌞",
      timeAgo: "2 days ago",
      content: "Installed solar panels on my roof! ☀️ Now generating 80% of my electricity needs. Initial cost was high but will pay for itself in 3 years. Happy to answer questions!",
      image: "🔋",
      likes: 67,
      comments: 18,
      shares: 12,
      category: "Energy",
      ecoCoins: 75,
      location: "Pune, India"
    }
  ];

  const challenges = [
    {
      id: 1,
      title: "Plastic-Free Week",
      description: "Avoid single-use plastics for 7 days",
      participants: 1234,
      reward: 150,
      duration: "7 days",
      difficulty: "Medium",
      icon: "🚫",
      color: "bg-red-100 text-red-600"
    },
    {
      id: 2,
      title: "Green Commute Month",
      description: "Use eco-friendly transport options",
      participants: 856,
      reward: 300,
      duration: "30 days",
      difficulty: "Easy",
      icon: "🚌",
      color: "bg-green-100 text-green-600"
    },
    {
      id: 3,
      title: "Energy Saver Challenge",
      description: "Reduce electricity usage by 20%",
      participants: 567,
      reward: 200,
      duration: "14 days",
      difficulty: "Hard",
      icon: "⚡",
      color: "bg-yellow-100 text-yellow-600"
    }
  ];

  const topContributors = [
    { name: "EcoMaster", avatar: "👑", coins: 5420, posts: 89 },
    { name: "GreenGuru", avatar: "🌱", coins: 4890, posts: 67 },
    { name: "TreeLover", avatar: "🌳", coins: 4320, posts: 56 },
    { name: "RecycleQueen", avatar: "♻️", coins: 3890, posts: 45 }
  ];

  const handleLike = (postId) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
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

  const PostCard = ({ post }) => {
    const isLiked = likedPosts.includes(post.id);
    
    return (
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
      >
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
            {post.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{post.author}</h3>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{post.timeAgo}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{post.location}</span>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {post.category}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <Gift className="w-4 h-4" />
            <span>+{post.ecoCoins}</span>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">{post.content}</p>
        
        {post.image && (
          <div className="mb-4 h-48 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
            <div className="text-6xl">{post.image}</div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleLike(post.id)}
              className={`flex items-center space-x-1 text-sm ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              } transition-colors`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes + (isLiked ? 1 : 0)}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-500 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>{post.shares}</span>
            </button>
          </div>
          
          <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Green Community</h1>
              <p className="text-lg text-gray-600">Connect, share, and grow together on your eco journey</p>
            </motion.div>
          </motion.div>

          {/* User Stats */}
          <motion.div 
            variants={fadeInUp}
            className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 mb-8 text-white"
          >
            <div className="grid md:grid-cols-5 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold mb-1">{userStats.posts}</div>
                <div className="text-green-100 text-sm">Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">{userStats.followers}</div>
                <div className="text-green-100 text-sm">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">{userStats.following}</div>
                <div className="text-green-100 text-sm">Following</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">{userStats.ecoCoins}</div>
                <div className="text-green-100 text-sm">EcoCoins</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">{userStats.referrals}</div>
                <div className="text-green-100 text-sm">Referrals</div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center justify-center space-x-1 bg-white rounded-lg p-1 w-fit mx-auto">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'feed' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Community Feed
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'tips' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Eco Tips
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'challenges' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Challenges
              </button>
              <button
                onClick={() => setActiveTab('referrals')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'referrals' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Referrals
              </button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'feed' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Create Post */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">
                        🌱
                      </div>
                      <div className="flex-1">
                        <textarea
                          placeholder="Share your eco-friendly actions and inspire others..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows="3"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                          <Image className="w-5 h-5" />
                          <span>Photo</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                          <MapPin className="w-5 h-5" />
                          <span>Location</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                          <Smile className="w-5 h-5" />
                          <span>Emoji</span>
                        </button>
                      </div>
                      <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Post
                      </button>
                    </div>
                  </div>
                  
                  {/* Posts */}
                  <div className="space-y-6">
                    {communityPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'tips' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Eco-Tips</h2>
                    <p className="text-gray-600">Learn something new every day to help the planet</p>
                  </div>
                  
                  <div className="space-y-6">
                    {ecoTips.map((tip) => (
                      <motion.div 
                        key={tip.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center text-2xl">
                            {tip.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{tip.title}</h3>
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                {tip.category}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-4">{tip.content}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{tip.readTime}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Target className="w-4 h-4" />
                                <span>{tip.impact}</span>
                              </span>
                              <span>{tip.date}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'challenges' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Challenges</h2>
                    <p className="text-gray-600">Join challenges and compete with eco-warriors worldwide</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {challenges.map((challenge) => (
                      <motion.div 
                        key={challenge.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start space-x-4 mb-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${challenge.color}`}>
                            {challenge.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{challenge.title}</h3>
                            <p className="text-gray-600 text-sm">{challenge.description}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Duration</span>
                            <span className="font-medium">{challenge.duration}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Participants</span>
                            <span className="font-medium">{challenge.participants.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Reward</span>
                            <span className="font-medium text-green-600">{challenge.reward} EcoCoins</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Difficulty</span>
                            <span className={`font-medium ${
                              challenge.difficulty === 'Easy' ? 'text-green-600' :
                              challenge.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {challenge.difficulty}
                            </span>
                          </div>
                        </div>
                        
                        <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors mt-4">
                          Join Challenge
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'referrals' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white text-center">
                    <h2 className="text-3xl font-bold mb-4">Invite Friends & Earn!</h2>
                    <p className="text-lg mb-6">Get 100 EcoCoins for each friend who joins and completes their first eco-task</p>
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{userStats.referrals}</div>
                        <div className="text-sm text-purple-100">Friends Invited</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{userStats.referrals * 100}</div>
                        <div className="text-sm text-purple-100">Bonus Coins Earned</div>
                      </div>
                    </div>
                    <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                      <UserPlus className="w-5 h-5 inline mr-2" />
                      Invite Friends
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value="https://ecotracker.app/invite/user123"
                        readOnly
                        className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <button className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Benefits</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Gift className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">100 EcoCoins</div>
                            <div className="text-sm text-gray-500">Per successful referral</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">Community Growth</div>
                            <div className="text-sm text-gray-500">Help build our eco-community</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Award className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium">Special Badges</div>
                            <div className="text-sm text-gray-500">Unlock referral achievements</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                          <div>
                            <div className="font-medium">Share Your Link</div>
                            <div className="text-sm text-gray-500">Send your referral link to friends</div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                          <div>
                            <div className="font-medium">Friend Joins</div>
                            <div className="text-sm text-gray-500">They sign up using your link</div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                          <div>
                            <div className="font-medium">Earn Coins</div>
                            <div className="text-sm text-gray-500">Get 100 EcoCoins when they complete first task</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Contributors */}
              <motion.div 
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Top Contributors</h3>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                
                <div className="space-y-4">
                  {topContributors.map((contributor, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm">{contributor.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{contributor.name}</div>
                        <div className="text-sm text-gray-500">{contributor.posts} posts</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{contributor.coins}</div>
                        <div className="text-xs text-gray-500">coins</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Trending Topics */}
              <motion.div 
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Trending Topics</h3>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">#ZeroWaste</span>
                    <span className="text-xs text-gray-500">234 posts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">#SolarPower</span>
                    <span className="text-xs text-gray-500">189 posts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">#PlantTrees</span>
                    <span className="text-xs text-gray-500">156 posts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">#EcoTransport</span>
                    <span className="text-xs text-gray-500">134 posts</span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                variants={fadeInUp}
                className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link 
                    to="/gamification" 
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Target className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Complete Tasks</span>
                  </Link>
                  <Link 
                    to="/rewards" 
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Gift className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Redeem Rewards</span>
                  </Link>
                  <Link 
                    to="/carbon-tracking" 
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Leaf className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Track Carbon</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
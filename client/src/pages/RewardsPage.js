import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Gift, 
  Coins, 
  ShoppingCart, 
  Star, 
  Clock, 
  MapPin, 
  CheckCircle,
  ArrowRight,
  Filter,
  Search,
  Heart,
  Truck,
  Leaf,
  Zap,
  TreePine,
  Bike,
  Coffee,
  ShoppingBag,
  Car,
  Home,
  Sparkles,
  Tag,
  Users,
  TrendingUp
} from 'lucide-react';
import Header from '../components/Layout/Header';

const RewardsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [likedItems, setLikedItems] = useState([]);
  const [redeemedItems, setRedeemedItems] = useState([]);

  const userCoins = 2450;

  const categories = [
    { id: 'all', label: 'All Rewards', icon: Gift },
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'food', label: 'Food & Dining', icon: Coffee },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'home', label: 'Home & Garden', icon: Home },
    { id: 'experience', label: 'Experiences', icon: Sparkles }
  ];

  const rewards = [
    {
      id: 1,
      title: "E-Rickshaw Ride Voucher",
      description: "Free ride up to 5km with EcoRide",
      category: "transport",
      originalPrice: 100,
      coins: 150,
      discount: "Free Ride",
      image: "🛺",
      partner: "EcoRide",
      rating: 4.8,
      reviews: 234,
      validityDays: 30,
      popular: true,
      stock: 89
    },
    {
      id: 2,
      title: "Organic Food Store Discount",
      description: "20% off on all organic products",
      category: "food",
      originalPrice: 200,
      coins: 300,
      discount: "20% OFF",
      image: "🥬",
      partner: "GreenGrocer",
      rating: 4.9,
      reviews: 456,
      validityDays: 60,
      popular: false,
      stock: 156
    },
    {
      id: 3,
      title: "Plant Nursery Voucher",
      description: "₹500 worth of plants and seeds",
      category: "home",
      originalPrice: 500,
      coins: 400,
      discount: "₹500 Value",
      image: "🌱",
      partner: "GreenNursery",
      rating: 4.7,
      reviews: 189,
      validityDays: 90,
      popular: true,
      stock: 45
    },
    {
      id: 4,
      title: "Eco-Friendly Bags",
      description: "Set of 3 reusable shopping bags",
      category: "shopping",
      originalPrice: 299,
      coins: 250,
      discount: "Free Delivery",
      image: "🛍️",
      partner: "EcoBags Co",
      rating: 4.6,
      reviews: 78,
      validityDays: 45,
      popular: false,
      stock: 234
    },
    {
      id: 5,
      title: "Public Transport Pass",
      description: "1-week unlimited metro pass",
      category: "transport",
      originalPrice: 350,
      coins: 300,
      discount: "15% OFF",
      image: "🚇",
      partner: "Metro Services",
      rating: 4.8,
      reviews: 567,
      validityDays: 15,
      popular: true,
      stock: 78
    },
    {
      id: 6,
      title: "Solar Power Bank",
      description: "Eco-friendly portable charger",
      category: "shopping",
      originalPrice: 1200,
      coins: 800,
      discount: "35% OFF",
      image: "🔋",
      partner: "SolarTech",
      rating: 4.9,
      reviews: 123,
      validityDays: 120,
      popular: false,
      stock: 32
    },
    {
      id: 7,
      title: "Bicycle Rental Credit",
      description: "5 hours of bike rental free",
      category: "transport",
      originalPrice: 150,
      coins: 200,
      discount: "5 Hours Free",
      image: "🚲",
      partner: "CycleCiti",
      rating: 4.5,
      reviews: 234,
      validityDays: 30,
      popular: false,
      stock: 167
    },
    {
      id: 8,
      title: "Organic Cafe Voucher",
      description: "Free coffee + pastry combo",
      category: "food",
      originalPrice: 180,
      coins: 180,
      discount: "Free Combo",
      image: "☕",
      partner: "Green Cafe",
      rating: 4.7,
      reviews: 345,
      validityDays: 21,
      popular: true,
      stock: 89
    },
    {
      id: 9,
      title: "Nature Walk Experience",
      description: "Guided eco-tour with breakfast",
      category: "experience",
      originalPrice: 800,
      coins: 650,
      discount: "20% OFF",
      image: "🌲",
      partner: "EcoTours",
      rating: 4.9,
      reviews: 67,
      validityDays: 60,
      popular: true,
      stock: 15
    }
  ];

  const recentRedemptions = [
    { id: 1, user: "Alex", item: "E-Rickshaw Voucher", time: "2 hours ago", avatar: "🚀" },
    { id: 2, user: "Maria", item: "Organic Food Discount", time: "5 hours ago", avatar: "🌱" },
    { id: 3, user: "David", item: "Plant Nursery Voucher", time: "1 day ago", avatar: "🌳" },
    { id: 4, user: "Sarah", item: "Public Transport Pass", time: "1 day ago", avatar: "⭐" }
  ];

  const filteredRewards = rewards.filter(reward => {
    const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
    const matchesSearch = reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLike = (itemId) => {
    setLikedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleRedeem = (itemId) => {
    setRedeemedItems(prev => [...prev, itemId]);
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

  const RewardCard = ({ reward }) => {
    const isLiked = likedItems.includes(reward.id);
    const isRedeemed = redeemedItems.includes(reward.id);
    const canAfford = userCoins >= reward.coins;

    return (
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
      >
        <div className="relative">
          <div className="h-48 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
            <div className="text-6xl">{reward.image}</div>
          </div>
          
          {reward.popular && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Popular
            </div>
          )}
          
          <button 
            onClick={() => handleLike(reward.id)}
            className={`absolute top-3 right-3 p-2 rounded-full ${
              isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-400'
            } hover:bg-red-500 hover:text-white transition-colors`}
          >
            <Heart className="w-4 h-4" />
          </button>
          
          <div className="absolute bottom-3 right-3 bg-white rounded-full px-3 py-1 text-sm font-medium text-gray-900">
            {reward.stock} left
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{reward.title}</h3>
              <p className="text-sm text-gray-600">{reward.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-900">{reward.rating}</span>
              <span className="text-sm text-gray-500">({reward.reviews})</span>
            </div>
            <div className="text-sm text-gray-500">by {reward.partner}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-gray-900">{reward.coins} EcoCoins</span>
                </div>
                <div className="text-sm text-gray-500">Worth ₹{reward.originalPrice}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">{reward.discount}</div>
                <div className="text-xs text-gray-500">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {reward.validityDays} days
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRedeem(reward.id)}
              disabled={!canAfford || isRedeemed}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                isRedeemed 
                  ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                  : canAfford 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isRedeemed ? (
                <>
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Redeemed
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 inline mr-2" />
                  {canAfford ? 'Redeem Now' : 'Not Enough Coins'}
                </>
              )}
            </motion.button>
            
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <MapPin className="w-4 h-4 text-gray-600" />
            </button>
          </div>
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Rewards Store</h1>
              <p className="text-lg text-gray-600">Redeem your EcoCoins for amazing eco-friendly rewards!</p>
            </motion.div>
          </motion.div>

          {/* User Coins Display */}
          <motion.div 
            variants={fadeInUp}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-8 text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{userCoins}</div>
                  <div className="text-yellow-100">Your EcoCoins Balance</div>
                </div>
              </div>
              <div className="text-right">
                <Link 
                  to="/gamification" 
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Earn More Coins
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div 
            variants={fadeInUp}
            className="bg-white rounded-xl p-6 mb-8 shadow-sm"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rewards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Rewards Grid */}
            <div className="lg:col-span-3">
              <motion.div 
                variants={fadeInUp}
                className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredRewards.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </motion.div>
              
              {filteredRewards.length === 0 && (
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rewards found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Redemptions */}
              <motion.div 
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Redemptions</h3>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="space-y-3">
                  {recentRedemptions.map((redemption) => (
                    <div key={redemption.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm">{redemption.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{redemption.user}</p>
                        <p className="text-xs text-gray-500">{redemption.item}</p>
                      </div>
                      <p className="text-xs text-gray-400">{redemption.time}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Earning Tips */}
              <motion.div 
                variants={fadeInUp}
                className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Quick Tips</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full mt-0.5 flex-shrink-0"></div>
                    <p className="text-gray-700">Complete daily eco-tasks to earn 10-25 coins each</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mt-0.5 flex-shrink-0"></div>
                    <p className="text-gray-700">Weekly challenges offer 50-100 coins</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full mt-0.5 flex-shrink-0"></div>
                    <p className="text-gray-700">Refer friends to earn bonus coins</p>
                  </div>
                </div>
                
                <Link 
                  to="/gamification" 
                  className="block w-full bg-white text-center py-2 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition-colors mt-4"
                >
                  Start Earning →
                </Link>
              </motion.div>

              {/* Partner Spotlight */}
              <motion.div 
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🌟 Partner Spotlight</h3>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TreePine className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">GreenNursery</h4>
                  <p className="text-sm text-gray-600 mb-3">India's largest organic plant nursery</p>
                  <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>4.9 • 500+ reviews</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
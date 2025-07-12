import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Target, 
  Award, 
  Users, 
  TrendingDown, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  BarChart3,
  Gift,
  Globe,
  Recycle,
  TreePine,
  Coins,
  Camera,
  MapPin,
  Coffee,
  Car,
  Lightbulb,
  ShoppingBag,
  Trophy
} from 'lucide-react';
import Header from '../components/Layout/Header';

const HomePage = () => {
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

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Personalized Onboarding",
      description: "Define your profession & lifestyle to establish your unique carbon footprint baseline",
      color: "from-blue-500 to-cyan-500",
      items: ["Profession Analysis", "Lifestyle Assessment", "Custom Baseline", "Smart Recommendations"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Smart Carbon Tracking",
      description: "Automated daily tracking with bill uploads for accurate footprint calculation",
      color: "from-green-500 to-emerald-500",
      items: ["Daily Notifications", "Bill Upload System", "Smart Parsing", "Real-time Analytics"]
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Gamified Engagement",
      description: "Complete eco-tasks and earn EcoCoins for your sustainable actions",
      color: "from-purple-500 to-pink-500",
      items: ["Daily Challenges", "Weekly Tasks", "EcoCoin Rewards", "Achievement System"]
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Real-World Rewards",
      description: "Redeem EcoCoins for discounts, vouchers, and eco-friendly products",
      color: "from-orange-500 to-red-500",
      items: ["Eco-Brand Discounts", "Transport Vouchers", "Plant Nursery Deals", "Local Rewards"]
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Green Community",
      description: "Connect with eco-warriors, share tips, and participate in environmental campaigns",
      color: "from-teal-500 to-green-500",
      items: ["Daily Eco-Tips", "Community Posts", "Referral Rewards", "Environmental Awareness"]
    }
  ];

  const trackingCategories = [
    { icon: <Car className="w-6 h-6" />, label: "Transport", color: "text-blue-500" },
    { icon: <Lightbulb className="w-6 h-6" />, label: "Energy", color: "text-yellow-500" },
    { icon: <Coffee className="w-6 h-6" />, label: "Food", color: "text-green-500" },
    { icon: <ShoppingBag className="w-6 h-6" />, label: "Shopping", color: "text-purple-500" },
  ];

  const ecoTasks = [
    "🚴‍♂️ Cycle to work today",
    "🥗 Try Meatless Monday",
    "♻️ Recycle plastic waste",
    "🌱 Plant a tree",
    "💡 Use LED lights",
    "🚌 Take public transport"
  ];

  const rewardPartners = [
    "🌿 Organic Food Stores",
    "🚗 E-rickshaw Services",
    "🌱 Plant Nurseries",
    "♻️ Eco-friendly Brands",
    "🚊 Public Transport",
    "🏪 Local Green Shops"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div
              animate={floatingAnimation}
              className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center"
            >
              <Leaf className="w-16 h-16 text-white" />
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
            >
              Your Carbon Footprint
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">
                Tracking Journey
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Join thousands of eco-warriors in making a positive environmental impact. 
              Track your daily activities, earn rewards, and build a sustainable future together.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link 
                to="/onboarding" 
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center group"
              >
                Start Your Eco Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/carbon-tracking" 
                className="border-2 border-green-500 text-green-500 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-500 hover:text-white transition-all duration-300"
              >
                Track Now
              </Link>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">10K+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">50M+</div>
                <div className="text-gray-600">CO2 Saved (kg)</div>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-500 mb-2">2.5M+</div>
                <div className="text-gray-600">EcoCoins Earned</div>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">100+</div>
                <div className="text-gray-600">Reward Partners</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Everything You Need for Sustainable Living
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Comprehensive tools and engaging features to help you track, reduce, and offset your carbon footprint
            </motion.p>
          </motion.div>
          
          <div className="space-y-20">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 text-white`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {feature.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''} relative`}>
                  <div className={`bg-gradient-to-br ${feature.color} rounded-2xl p-8 text-white`}>
                    <div className="text-6xl mb-6">{feature.icon}</div>
                    <h4 className="text-2xl font-bold mb-4">Interactive Features</h4>
                    <div className="space-y-3">
                      {feature.items.map((item, itemIndex) => (
                        <motion.div
                          key={itemIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: itemIndex * 0.1 }}
                          className="flex items-center space-x-3 bg-white/20 rounded-lg p-3"
                        >
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          <span className="text-white/90">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracking Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Track Your Carbon Impact
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600"
            >
              Monitor your environmental impact across all aspects of daily life
            </motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trackingCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center ${category.color}`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.label}</h3>
                <p className="text-gray-600">Track and reduce your {category.label.toLowerCase()} emissions</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Make Sustainability Fun with Eco-Games
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Complete daily challenges, earn EcoCoins, and compete with friends while making a positive impact.
              </p>
              
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold text-gray-900">Daily Eco-Tasks:</h3>
                {ecoTasks.map((task, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 bg-green-50 p-4 rounded-lg"
                  >
                    <Coins className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{task}</span>
                    <span className="text-sm text-green-600 ml-auto">+10 EcoCoins</span>
                  </motion.div>
                ))}
              </div>
              
              <Link 
                to="/gamification" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 inline-flex items-center"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Start Playing
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
                <div className="text-center mb-6">
                  <Trophy className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">Your Eco-Level</h3>
                  <div className="text-4xl font-bold mt-2">Level 5</div>
                  <div className="text-purple-200">Eco-Warrior</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>EcoCoins Balance</span>
                    <span className="font-bold">2,450 🪙</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tasks Completed</span>
                    <span className="font-bold">127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CO2 Saved</span>
                    <span className="font-bold">1.2T</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Real Rewards for Real Impact
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600"
            >
              Redeem your EcoCoins for amazing discounts and eco-friendly rewards
            </motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rewardPartners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{partner.split(' ')[0]}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {partner.split(' ').slice(1).join(' ')}
                </h3>
                <p className="text-gray-600 mb-4">Up to 20% discount</p>
                <div className="text-sm text-green-600 font-medium">500 EcoCoins</div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link 
              to="/rewards" 
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 inline-flex items-center"
            >
              <Gift className="w-5 h-5 mr-2" />
              Explore All Rewards
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-500 to-blue-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Your Eco Journey?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join thousands of users who are already making a difference. Track your carbon footprint, earn rewards, and help save the planet!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/onboarding" 
                className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 inline-flex items-center justify-center"
              >
                <Zap className="w-5 h-5 mr-2" />
                Get Started Now
              </Link>
              <Link 
                to="/community" 
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-green-600 transition-all duration-300 inline-flex items-center justify-center"
              >
                <Users className="w-5 h-5 mr-2" />
                Join Community
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">EcoTracker</span>
              </div>
              <p className="text-gray-400">
                Making the world greener, one action at a time.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/carbon-tracking" className="hover:text-white">Carbon Tracking</Link></li>
                <li><Link to="/gamification" className="hover:text-white">Eco Games</Link></li>
                <li><Link to="/rewards" className="hover:text-white">Rewards</Link></li>
                <li><Link to="/community" className="hover:text-white">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">Instagram</a></li>
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white">Facebook</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EcoTracker. All rights reserved. Built with 💚 for the planet.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
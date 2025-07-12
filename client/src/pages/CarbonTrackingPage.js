import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Upload, 
  Car, 
  Lightbulb, 
  Coffee, 
  ShoppingBag, 
  Bell, 
  Calendar,
  TrendingDown,
  TrendingUp,
  Target,
  Plus,
  Camera,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  Zap
} from 'lucide-react';
import Header from '../components/Layout/Header';

const CarbonTrackingPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('');

  const trackingData = {
    week: {
      total: 12.5,
      change: -8.2,
      categories: {
        transport: { value: 4.2, change: -12.5 },
        energy: { value: 3.8, change: -5.3 },
        food: { value: 2.9, change: -15.2 },
        shopping: { value: 1.6, change: +8.7 }
      }
    },
    month: {
      total: 52.3,
      change: -12.1,
      categories: {
        transport: { value: 18.7, change: -10.2 },
        energy: { value: 16.2, change: -8.9 },
        food: { value: 11.8, change: -18.5 },
        shopping: { value: 5.6, change: +5.2 }
      }
    }
  };

  const currentData = trackingData[selectedPeriod];

  const categories = [
    { 
      id: 'transport', 
      label: 'Transport', 
      icon: Car, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      id: 'energy', 
      label: 'Energy', 
      icon: Lightbulb, 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    { 
      id: 'food', 
      label: 'Food', 
      icon: Coffee, 
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      id: 'shopping', 
      label: 'Shopping', 
      icon: ShoppingBag, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'transport', action: 'Took metro to work', impact: -0.8, time: '2 hours ago' },
    { id: 2, type: 'food', action: 'Ordered vegetarian lunch', impact: -0.5, time: '4 hours ago' },
    { id: 3, type: 'energy', action: 'Used AC for 3 hours', impact: +1.2, time: '6 hours ago' },
    { id: 4, type: 'shopping', action: 'Bought local groceries', impact: -0.3, time: '1 day ago' }
  ];

  const upcomingTasks = [
    { id: 1, text: 'Upload electricity bill', type: 'energy', urgent: true },
    { id: 2, text: 'Log weekend travel', type: 'transport', urgent: false },
    { id: 3, text: 'Track grocery shopping', type: 'food', urgent: false }
  ];

  const billTypes = [
    { id: 'electricity', label: 'Electricity Bill', icon: '⚡', description: 'Monthly power consumption' },
    { id: 'gas', label: 'Gas Bill', icon: '🔥', description: 'Cooking & heating gas' },
    { id: 'fuel', label: 'Fuel Receipt', icon: '⛽', description: 'Vehicle fuel purchases' },
    { id: 'grocery', label: 'Grocery Receipt', icon: '🛒', description: 'Food & household items' }
  ];

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

  const UploadModal = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={() => setShowUploadModal(false)}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Upload Bill</h3>
          <button 
            onClick={() => setShowUploadModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {billTypes.map((type) => (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUploadType(type.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  uploadType === type.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs text-gray-500 mt-1">{type.description}</div>
              </motion.button>
            ))}
          </div>
          
          {uploadType && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Drop your bill here or click to browse</p>
              <div className="flex gap-2 justify-center">
                <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload File
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

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
            <motion.div variants={fadeInUp} className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Carbon Footprint Tracking</h1>
                <p className="text-lg text-gray-600">Monitor your daily environmental impact</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Bill
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Activity
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Period Selector */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center justify-center space-x-1 bg-white rounded-lg p-1 w-fit mx-auto">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  selectedPeriod === 'week' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  selectedPeriod === 'month' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                This Month
              </button>
            </div>
          </motion.div>

          {/* Main Stats */}
          <motion.div 
            variants={fadeInUp}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Carbon Footprint</p>
                  <p className="text-3xl font-bold text-gray-900">{currentData.total} kg</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="flex items-center">
                {currentData.change < 0 ? (
                  <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  currentData.change < 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {Math.abs(currentData.change)}% {currentData.change < 0 ? 'reduction' : 'increase'}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last {selectedPeriod}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Daily Average</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {selectedPeriod === 'week' ? '1.8' : '1.7'} kg
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center">
                <Target className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-gray-600">Target: 1.5 kg/day</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">EcoCoins Earned</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {selectedPeriod === 'week' ? '145' : '620'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-green-600">+25 coins</span>
                <span className="text-sm text-gray-500 ml-1">from eco-actions</span>
              </div>
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div 
            variants={fadeInUp}
            className="bg-white rounded-xl p-6 shadow-sm mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Breakdown</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {categories.map((category) => {
                const Icon = category.icon;
                const data = currentData.categories[category.id];
                
                return (
                  <div key={category.id} className={`${category.bgColor} ${category.borderColor} border rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Icon className={`w-6 h-6 ${category.color} mr-2`} />
                        <span className="font-medium text-gray-900">{category.label}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{data.value} kg</div>
                    <div className="flex items-center">
                      {data.change < 0 ? (
                        <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        data.change < 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {Math.abs(data.change)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Activities */}
            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const category = categories.find(c => c.id === activity.type);
                  const Icon = category?.icon;
                  
                  return (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full ${category?.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${category?.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <div className={`font-medium ${
                        activity.impact < 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {activity.impact > 0 ? '+' : ''}{activity.impact} kg
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Upcoming Tasks */}
            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
                <span className="text-sm text-gray-500">3 pending</span>
              </div>
              
              <div className="space-y-4">
                {upcomingTasks.map((task) => {
                  const category = categories.find(c => c.id === task.type);
                  const Icon = category?.icon;
                  
                  return (
                    <div key={task.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className={`w-10 h-10 rounded-full ${category?.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${category?.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.text}</p>
                        {task.urgent && (
                          <div className="flex items-center mt-1">
                            <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-xs text-red-500">Urgent</span>
                          </div>
                        )}
                      </div>
                      <button className="text-blue-500 hover:text-blue-700 transition-colors">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Smart Tips */}
          <motion.div 
            variants={fadeInUp}
            className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mt-8"
          >
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Smart Tip for Today</h4>
                <p className="text-gray-700 mb-4">
                  Based on your patterns, taking public transport instead of driving could save you 2.5 kg CO2 this week. 
                  Plus, you'll earn 50 EcoCoins for each trip!
                </p>
                <Link 
                  to="/gamification" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Eco-Challenges
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && <UploadModal />}
    </div>
  );
};

export default CarbonTrackingPage;
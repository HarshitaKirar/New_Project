import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Home, 
  Car, 
  Utensils, 
  Zap, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Target,
  BarChart3,
  Globe
} from 'lucide-react';
import Header from '../components/Layout/Header';

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    profession: '',
    lifestyle: {
      travel: '',
      food: '',
      energy: '',
      housing: '',
      transportation: ''
    }
  });

  const professions = [
    { id: 'student', label: 'Student', icon: '🎓', footprint: 'Low' },
    { id: 'office-worker', label: 'Office Worker', icon: '💼', footprint: 'Medium' },
    { id: 'entrepreneur', label: 'Entrepreneur', icon: '🚀', footprint: 'Medium' },
    { id: 'freelancer', label: 'Freelancer', icon: '💻', footprint: 'Low' },
    { id: 'doctor', label: 'Doctor', icon: '👨‍⚕️', footprint: 'Medium' },
    { id: 'teacher', label: 'Teacher', icon: '👩‍🏫', footprint: 'Medium' },
    { id: 'engineer', label: 'Engineer', icon: '👨‍💻', footprint: 'Medium' },
    { id: 'other', label: 'Other', icon: '👤', footprint: 'Medium' }
  ];

  const lifestyleOptions = {
    travel: [
      { id: 'rare', label: 'Rarely travel', icon: '🏠', impact: 'Low' },
      { id: 'occasional', label: 'Occasional trips', icon: '✈️', impact: 'Medium' },
      { id: 'frequent', label: 'Frequent traveler', icon: '🌍', impact: 'High' }
    ],
    food: [
      { id: 'vegan', label: 'Vegan', icon: '🥬', impact: 'Low' },
      { id: 'vegetarian', label: 'Vegetarian', icon: '🥕', impact: 'Low' },
      { id: 'flexitarian', label: 'Flexitarian', icon: '🥗', impact: 'Medium' },
      { id: 'omnivore', label: 'Omnivore', icon: '🍖', impact: 'High' }
    ],
    energy: [
      { id: 'renewable', label: 'Renewable energy', icon: '☀️', impact: 'Low' },
      { id: 'efficient', label: 'Energy efficient', icon: '💡', impact: 'Medium' },
      { id: 'standard', label: 'Standard usage', icon: '⚡', impact: 'High' }
    ],
    housing: [
      { id: 'apartment', label: 'Apartment', icon: '🏢', impact: 'Low' },
      { id: 'house', label: 'House', icon: '🏠', impact: 'Medium' },
      { id: 'large-house', label: 'Large House', icon: '🏡', impact: 'High' }
    ],
    transportation: [
      { id: 'public', label: 'Public transport', icon: '🚌', impact: 'Low' },
      { id: 'bike', label: 'Bike/Walk', icon: '🚴', impact: 'Low' },
      { id: 'car', label: 'Personal car', icon: '🚗', impact: 'Medium' },
      { id: 'multiple', label: 'Multiple cars', icon: '🚗🚗', impact: 'High' }
    ]
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLifestyleChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        [category]: value
      }
    }));
  };

  const calculateBaseline = () => {
    // Simple baseline calculation based on selections
    let baseline = 0;
    const { profession, lifestyle } = formData;
    
    // Base profession impact
    const professionImpact = {
      'student': 2,
      'office-worker': 4,
      'entrepreneur': 5,
      'freelancer': 3,
      'doctor': 4,
      'teacher': 3,
      'engineer': 4,
      'other': 3
    };
    
    baseline += professionImpact[profession] || 3;
    
    // Lifestyle impacts
    const lifestyleImpacts = {
      travel: { rare: 1, occasional: 3, frequent: 6 },
      food: { vegan: 1, vegetarian: 2, flexitarian: 3, omnivore: 5 },
      energy: { renewable: 1, efficient: 2, standard: 4 },
      housing: { apartment: 2, house: 4, 'large-house': 6 },
      transportation: { public: 1, bike: 0.5, car: 3, multiple: 6 }
    };
    
    Object.entries(lifestyle).forEach(([category, value]) => {
      if (value && lifestyleImpacts[category]?.[value]) {
        baseline += lifestyleImpacts[category][value];
      }
    });
    
    return baseline.toFixed(1);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div {...fadeInUp} className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to EcoTracker!</h2>
              <p className="text-lg text-gray-600">Let's start by getting to know you better</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      
      case 2:
        return (
          <motion.div {...fadeInUp} className="space-y-6">
            <div className="text-center mb-8">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What's Your Profession?</h2>
              <p className="text-lg text-gray-600">This helps us understand your baseline carbon footprint</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {professions.map((prof) => (
                <motion.button
                  key={prof.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleInputChange('profession', prof.id)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.profession === prof.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{prof.icon}</div>
                  <div className="font-medium text-sm">{prof.label}</div>
                  <div className={`text-xs mt-1 ${
                    prof.footprint === 'Low' ? 'text-green-500' :
                    prof.footprint === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {prof.footprint} impact
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      
      case 3:
        return (
          <motion.div {...fadeInUp} className="space-y-8">
            <div className="text-center mb-8">
              <Globe className="w-16 h-16 mx-auto mb-4 text-purple-500" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Tell Us About Your Lifestyle</h2>
              <p className="text-lg text-gray-600">These choices significantly impact your carbon footprint</p>
            </div>
            
            <div className="space-y-8">
              {Object.entries(lifestyleOptions).map(([category, options]) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize flex items-center">
                    {category === 'travel' && <Globe className="w-5 h-5 mr-2" />}
                    {category === 'food' && <Utensils className="w-5 h-5 mr-2" />}
                    {category === 'energy' && <Zap className="w-5 h-5 mr-2" />}
                    {category === 'housing' && <Home className="w-5 h-5 mr-2" />}
                    {category === 'transportation' && <Car className="w-5 h-5 mr-2" />}
                    {category} Habits
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {options.map((option) => (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLifestyleChange(category, option.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.lifestyle[category] === option.id
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{option.icon}</span>
                            <div>
                              <div className="font-medium text-sm">{option.label}</div>
                              <div className={`text-xs ${
                                option.impact === 'Low' ? 'text-green-500' :
                                option.impact === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                              }`}>
                                {option.impact} impact
                              </div>
                            </div>
                          </div>
                          {formData.lifestyle[category] === option.id && (
                            <CheckCircle className="w-5 h-5 text-purple-500" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      
      case 4:
        const baseline = calculateBaseline();
        return (
          <motion.div {...fadeInUp} className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Carbon Footprint Baseline</h2>
              <p className="text-lg text-gray-600">Based on your lifestyle, here's your estimated annual carbon footprint</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 text-center">
              <div className="text-6xl font-bold text-green-500 mb-2">{baseline}</div>
              <div className="text-xl text-gray-600 mb-4">tonnes CO2 per year</div>
              <div className="text-sm text-gray-500">
                Global average: 4.8 tonnes • Target: 2.3 tonnes
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <BarChart3 className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
                <p className="text-gray-600 text-sm">Monitor your daily activities and see real-time impact on your footprint</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <Target className="w-8 h-8 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Goals</h3>
                <p className="text-gray-600 text-sm">Get personalized recommendations to reduce your environmental impact</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-yellow-500 mt-1">💡</div>
                <div>
                  <div className="font-medium text-yellow-800">Pro Tip</div>
                  <div className="text-sm text-yellow-700">
                    Start with small changes like using public transport or reducing meat consumption. Every action counts!
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {renderStep()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-6 py-3 rounded-lg text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!formData.name || !formData.location)) ||
                    (currentStep === 2 && !formData.profession) ||
                    (currentStep === 3 && Object.values(formData.lifestyle).some(v => !v))
                  }
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <Link
                  to="/carbon-tracking"
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
                >
                  Start Tracking
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
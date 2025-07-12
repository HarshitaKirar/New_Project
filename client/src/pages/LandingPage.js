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
  Zap
} from 'lucide-react';

const LandingPage = () => {
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

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Smart Carbon Tracking",
      description: "Automatically track your daily carbon footprint across transportation, energy, food, and shopping."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Gamified Rewards",
      description: "Earn EcoCoins for sustainable actions and redeem them for real-world eco-friendly rewards."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Green Community",
      description: "Connect with like-minded individuals, share tips, and participate in environmental challenges."
    },
    {
      icon: <TrendingDown className="w-6 h-6" />,
      title: "Impact Analytics",
      description: "Visualize your environmental impact with detailed analytics and progress tracking."
    }
  ];

  const benefits = [
    "Reduce your carbon footprint by up to 40%",
    "Join a community of 10,000+ eco-warriors",
    "Earn rewards for sustainable living",
    "Get personalized eco-tips daily",
    "Track progress with beautiful analytics",
    "Support verified eco-friendly brands"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Environmental Advocate",
      content: "EcoTracker helped me reduce my carbon footprint by 35% in just 3 months. The gamification makes sustainability fun!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      content: "Love the detailed analytics and community features. It's like having a personal environmental coach.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "College Student",
      content: "The EcoCoin rewards system motivated me to make sustainable choices. Already redeemed vouchers worth ₹500!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-eco-gradient rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EcoTracker</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn-primary"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-eco-light via-primary-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
            >
              Track Your 
              <span className="text-gradient-eco block">Carbon Impact</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Join thousands of eco-warriors in making a positive environmental impact. 
              Track, reduce, and offset your carbon footprint while earning rewards for sustainable living.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link 
                to="/register" 
                className="btn-primary btn-xl group"
              >
                Start Your Eco Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn-outline btn-xl">
                Watch Demo
              </button>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-500"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-eco" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-eco" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-eco" />
                <span>10,000+ users</span>
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
              Everything You Need to Go Green
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Powerful tools and engaging features to help you live more sustainably
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="card-hover text-center group"
              >
                <div className="w-12 h-12 bg-eco/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-eco group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose EcoTracker?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join the movement towards sustainable living with our comprehensive platform designed for real impact.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-eco flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-eco to-primary-600 rounded-2xl p-8 text-white">
                <Smartphone className="w-16 h-16 mb-6 animate-float" />
                <h3 className="text-2xl font-bold mb-4">Mobile-First Design</h3>
                <p className="text-eco-light mb-6">
                  Track your carbon footprint on the go with our beautiful, intuitive mobile interface.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>4.9/5</span>
                  </div>
                  <span>•</span>
                  <span>50k+ downloads</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
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
              Loved by Eco-Warriors Worldwide
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600"
            >
              See what our community is saying about their EcoTracker experience
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="card p-6"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-eco-gradient">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-eco-light mb-8">
              Join thousands of users who are already reducing their carbon footprint and earning rewards.
            </p>
            <Link 
              to="/register" 
              className="btn bg-white text-eco hover:bg-gray-100 btn-xl group"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Your Journey Today
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-eco-gradient rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">EcoTracker</span>
          </div>
          <p className="text-gray-400 mb-6">
            Making the world a greener place, one action at a time.
          </p>
          <div className="text-sm text-gray-500">
            © 2024 EcoTracker. All rights reserved. Built with 💚 for the planet.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
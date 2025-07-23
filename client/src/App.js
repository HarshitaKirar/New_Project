import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Applications from './pages/Applications';
import Resume from './pages/Resume';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Hooks and Store
import { useAuthStore } from './store/authStore';
import { useEffect, useState } from 'react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Page Transition Wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

function App() {
  const { initializeAuth, isLoading } = useAuthStore();
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setAppLoading(false);
      }
    };

    init();
  }, [initializeAuth]);

  if (appLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4"
          >
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-gray-800 mb-2"
          >
            SmartApply
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-600"
          >
            AI-Powered Job Application Platform
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/" 
                  element={
                    <PageTransition>
                      <Home />
                    </PageTransition>
                  } 
                />
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <PageTransition>
                        <Login />
                      </PageTransition>
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <PageTransition>
                        <Register />
                      </PageTransition>
                    </PublicRoute>
                  } 
                />

                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <Dashboard />
                      </PageTransition>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <Profile />
                      </PageTransition>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/jobs" 
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <Jobs />
                      </PageTransition>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/jobs/:jobId" 
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <JobDetails />
                      </PageTransition>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/applications" 
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <Applications />
                      </PageTransition>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/resume" 
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <Resume />
                      </PageTransition>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <Analytics />
                      </PageTransition>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <Settings />
                      </PageTransition>
                    </ProtectedRoute>
                  } 
                />

                {/* 404 Route */}
                <Route 
                  path="*" 
                  element={
                    <PageTransition>
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="text-9xl font-bold text-gray-300 mb-4"
                          >
                            404
                          </motion.div>
                          <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-bold text-gray-800 mb-2"
                          >
                            Page Not Found
                          </motion.h1>
                          <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-gray-600 mb-8"
                          >
                            The page you're looking for doesn't exist.
                          </motion.p>
                          <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.history.back()}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            Go Back
                          </motion.button>
                        </div>
                      </div>
                    </PageTransition>
                  } 
                />
              </Routes>
            </AnimatePresence>
          </main>

          <Footer />
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
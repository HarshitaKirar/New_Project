import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Pages
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import CarbonTrackingPage from './pages/CarbonTrackingPage';
import GamificationPage from './pages/GamificationPage';
import RewardsPage from './pages/RewardsPage';
import CommunityPage from './pages/CommunityPage';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/carbon-tracking" element={<CarbonTrackingPage />} />
              <Route path="/gamification" element={<GamificationPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/community" element={<CommunityPage />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
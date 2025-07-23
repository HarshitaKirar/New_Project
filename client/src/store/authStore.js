import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Initialize authentication on app start
      initializeAuth: async () => {
        const token = localStorage.getItem('smartapply_token');
        if (token) {
          try {
            set({ isLoading: true });
            
            // Set token in axios headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Verify token and get user data
            const response = await axios.get('/auth/me');
            
            set({
              user: response.data.user,
              token,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            console.error('Token verification failed:', error);
            // Clear invalid token
            localStorage.removeItem('smartapply_token');
            delete axios.defaults.headers.common['Authorization'];
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        } else {
          set({ isLoading: false });
        }
      },
      
      // Login
      login: async (email, password) => {
        try {
          set({ isLoading: true });
          
          const response = await axios.post('/auth/login', {
            email,
            password
          });
          
          const { user, token } = response.data;
          
          // Store token
          localStorage.setItem('smartapply_token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
          toast.success(`Welcome back, ${user.firstName}!`);
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Login failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },
      
      // Register
      register: async (userData) => {
        try {
          set({ isLoading: true });
          
          const response = await axios.post('/auth/register', userData);
          
          const { user, token } = response.data;
          
          // Store token
          localStorage.setItem('smartapply_token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
          toast.success(`Welcome to SmartApply, ${user.firstName}!`);
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Registration failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },
      
      // Logout
      logout: async () => {
        try {
          // Call logout endpoint if needed
          await axios.post('/auth/logout');
        } catch (error) {
          console.error('Logout API call failed:', error);
        } finally {
          // Clear local storage and state
          localStorage.removeItem('smartapply_token');
          delete axios.defaults.headers.common['Authorization'];
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
          
          toast.success('Logged out successfully');
        }
      },
      
      // Update user profile
      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true });
          
          const response = await axios.put('/users/profile', profileData);
          
          set({
            user: response.data.user,
            isLoading: false
          });
          
          toast.success('Profile updated successfully');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Profile update failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },
      
      // Update user preferences
      updatePreferences: async (preferences) => {
        try {
          const response = await axios.put('/users/preferences', preferences);
          
          set({
            user: {
              ...get().user,
              jobPreferences: response.data.preferences
            }
          });
          
          toast.success('Preferences updated successfully');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.error || 'Failed to update preferences';
          toast.error(message);
          return { success: false, error: message };
        }
      },
      
      // Change password
      changePassword: async (currentPassword, newPassword) => {
        try {
          set({ isLoading: true });
          
          await axios.put('/auth/change-password', {
            currentPassword,
            newPassword
          });
          
          set({ isLoading: false });
          toast.success('Password changed successfully');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Password change failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },
      
      // Forgot password
      forgotPassword: async (email) => {
        try {
          set({ isLoading: true });
          
          await axios.post('/auth/forgot-password', { email });
          
          set({ isLoading: false });
          toast.success('Password reset email sent');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Failed to send reset email';
          toast.error(message);
          return { success: false, error: message };
        }
      },
      
      // Reset password
      resetPassword: async (token, newPassword) => {
        try {
          set({ isLoading: true });
          
          await axios.post('/auth/reset-password', {
            token,
            newPassword
          });
          
          set({ isLoading: false });
          toast.success('Password reset successfully');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Password reset failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },
      
      // Refresh user data
      refreshUser: async () => {
        try {
          const response = await axios.get('/auth/me');
          set({ user: response.data.user });
          return { success: true };
        } catch (error) {
          console.error('Failed to refresh user data:', error);
          return { success: false };
        }
      },
      
      // Check if user has specific subscription plan
      hasSubscription: (requiredPlan = 'premium') => {
        const user = get().user;
        if (!user?.subscription?.isActive) return false;
        
        const planHierarchy = {
          'free': 0,
          'premium': 1,
          'enterprise': 2
        };
        
        const userPlanLevel = planHierarchy[user.subscription.plan] || 0;
        const requiredPlanLevel = planHierarchy[requiredPlan] || 1;
        
        return userPlanLevel >= requiredPlanLevel;
      },
      
      // Check if user can apply to more jobs
      canApplyToJobs: () => {
        const user = get().user;
        if (!user) return false;
        
        if (user.subscription?.plan === 'free') {
          return user.usage?.applicationsThisMonth < 10;
        } else if (user.subscription?.plan === 'premium') {
          return user.usage?.applicationsThisMonth < 100;
        }
        return true; // Enterprise plan - unlimited
      },
      
      // Get user's application limit
      getApplicationLimit: () => {
        const user = get().user;
        if (!user) return 0;
        
        if (user.subscription?.plan === 'free') {
          return 10;
        } else if (user.subscription?.plan === 'premium') {
          return 100;
        }
        return Infinity; // Enterprise plan - unlimited
      }
    }),
    {
      name: 'smartapply-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Axios interceptors for handling authentication errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const { logout } = useAuthStore.getState();
      logout();
    }
    return Promise.reject(error);
  }
);

export { useAuthStore };
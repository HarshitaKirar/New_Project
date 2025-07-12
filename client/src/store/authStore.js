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
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),

      login: async (email, password) => {
        try {
          set({ isLoading: true });
          
          const response = await axios.post('/auth/login', {
            email,
            password,
          });

          const { user, token, refreshToken } = response.data.data;

          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success(`Welcome back, ${user.name}! 🌱`);
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Login failed';
          toast.error(message);
          return { success: false, message };
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true });
          
          const response = await axios.post('/auth/register', userData);

          const { user, token, refreshToken } = response.data.data;

          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success(`Welcome to EcoTracker, ${user.name}! 🎉`);
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Registration failed';
          toast.error(message);
          return { success: false, message };
        }
      },

      logout: () => {
        // Clear axios header
        delete axios.defaults.headers.common['Authorization'];
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });

        toast.success('Logged out successfully');
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axios.post('/auth/refresh-token', {
            refreshToken,
          });

          const { token } = response.data.data;

          // Update axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({ token });
          return token;
        } catch (error) {
          // If refresh fails, logout the user
          get().logout();
          throw error;
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      fetchProfile: async () => {
        try {
          const response = await axios.get('/auth/me');
          const { user } = response.data.data;
          
          set({ user });
          return user;
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          return null;
        }
      },

      updateProfile: async (profileData) => {
        try {
          const response = await axios.put('/auth/profile', profileData);
          const { user } = response.data.data;
          
          set({ user });
          toast.success('Profile updated successfully! ✨');
          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to update profile';
          toast.error(message);
          return { success: false, message };
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        try {
          await axios.post('/auth/change-password', {
            currentPassword,
            newPassword,
          });

          toast.success('Password changed successfully! 🔒');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to change password';
          toast.error(message);
          return { success: false, message };
        }
      },

      // Initialize authentication state
      initializeAuth: async () => {
        const { token } = get();
        
        if (token) {
          // Set axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          try {
            // Verify token by fetching profile
            await get().fetchProfile();
            set({ isAuthenticated: true, isLoading: false });
          } catch (error) {
            // Token is invalid, clear auth state
            get().logout();
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'eco-tracker-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Axios interceptor for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh-token'
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await useAuthStore.getState().refreshAccessToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export { useAuthStore };
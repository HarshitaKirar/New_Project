import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { useAuthStore } from './store/authStore';

// Initialize auth on app start
const initializeApp = async () => {
  await useAuthStore.getState().initializeAuth();
};

// Initialize the app
initializeApp();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided, authorization denied' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Token is valid but user not found' 
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated' 
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error in authentication' 
    });
  }
};

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      // Check if user has admin privileges
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ 
          message: 'Access denied. Admin privileges required.' 
        });
      }
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ 
      message: 'Server error in admin authentication' 
    });
  }
};

// Middleware to check minimum level requirement
const levelAuth = (minimumLevel) => {
  return async (req, res, next) => {
    try {
      await auth(req, res, () => {
        if (req.user && req.user.level >= minimumLevel) {
          next();
        } else {
          res.status(403).json({ 
            message: `Access denied. Minimum level ${minimumLevel} required.`,
            currentLevel: req.user?.level || 0,
            requiredLevel: minimumLevel
          });
        }
      });
    } catch (error) {
      console.error('Level auth error:', error);
      res.status(500).json({ 
        message: 'Server error in level authentication' 
      });
    }
  };
};

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    req.user = null;
    next();
  }
};

// Middleware to verify email
const emailVerified = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }
    
    if (!req.user.emailVerified) {
      return res.status(403).json({ 
        message: 'Email verification required',
        action: 'verify_email'
      });
    }
    
    next();
  } catch (error) {
    console.error('Email verification check error:', error);
    res.status(500).json({ 
      message: 'Server error in email verification check' 
    });
  }
};

// Middleware to check account status
const activeAccount = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }
    
    if (!req.user.isActive) {
      return res.status(403).json({ 
        message: 'Account is deactivated. Please contact support.',
        action: 'contact_support'
      });
    }
    
    next();
  } catch (error) {
    console.error('Account status check error:', error);
    res.status(500).json({ 
      message: 'Server error in account status check' 
    });
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' }, 
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  auth,
  adminAuth,
  levelAuth,
  optionalAuth,
  emailVerified,
  activeAccount,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
};
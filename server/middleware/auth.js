const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token format.',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Access denied. User not found.',
          code: 'USER_NOT_FOUND'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({ 
          error: 'Access denied. Account is deactivated.',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Access denied. Token has expired.',
          code: 'TOKEN_EXPIRED'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Access denied. Invalid token.',
          code: 'INVALID_TOKEN'
        });
      } else {
        return res.status(401).json({ 
          error: 'Access denied. Token verification failed.',
          code: 'TOKEN_VERIFICATION_FAILED'
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error during authentication.',
      code: 'AUTH_INTERNAL_ERROR'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (jwtError) {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    // First run regular auth
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.',
        code: 'ADMIN_REQUIRED'
      });
    }

    next();
  } catch (error) {
    // Error already handled by authMiddleware
    return;
  }
};

// Subscription-based authentication middleware
const subscriptionAuth = (requiredPlan = 'premium') => {
  return async (req, res, next) => {
    try {
      // First run regular auth
      await new Promise((resolve, reject) => {
        authMiddleware(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Check subscription
      const user = req.user;
      
      if (!user.subscription || !user.subscription.isActive) {
        return res.status(403).json({ 
          error: 'Access denied. Active subscription required.',
          code: 'SUBSCRIPTION_REQUIRED'
        });
      }

      // Check subscription level
      const planHierarchy = {
        'free': 0,
        'premium': 1,
        'enterprise': 2
      };

      const userPlanLevel = planHierarchy[user.subscription.plan] || 0;
      const requiredPlanLevel = planHierarchy[requiredPlan] || 1;

      if (userPlanLevel < requiredPlanLevel) {
        return res.status(403).json({ 
          error: `Access denied. ${requiredPlan} subscription required.`,
          code: 'INSUFFICIENT_SUBSCRIPTION',
          requiredPlan,
          currentPlan: user.subscription.plan
        });
      }

      next();
    } catch (error) {
      // Error already handled by authMiddleware
      return;
    }
  };
};

// Rate limiting by user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return async (req, res, next) => {
    try {
      // First run regular auth
      await new Promise((resolve, reject) => {
        authMiddleware(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const userId = req.user.id;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean old entries
      if (userRequests.has(userId)) {
        const requests = userRequests.get(userId);
        const validRequests = requests.filter(timestamp => timestamp > windowStart);
        userRequests.set(userId, validRequests);
      }

      // Check current request count
      const currentRequests = userRequests.get(userId) || [];
      
      if (currentRequests.length >= maxRequests) {
        return res.status(429).json({
          error: 'Too many requests. Please try again later.',
          code: 'USER_RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      // Add current request
      currentRequests.push(now);
      userRequests.set(userId, currentRequests);

      next();
    } catch (error) {
      // Error already handled by authMiddleware
      return;
    }
  };
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};

module.exports = {
  authMiddleware,
  optionalAuth,
  adminAuth,
  subscriptionAuth,
  userRateLimit,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
};
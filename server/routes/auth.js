const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require('../models/User');
const { 
  auth, 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  // Validation middleware
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('profession')
    .isIn(['Student', 'Professional', 'Business Owner', 'Freelancer', 'Retired', 'Homemaker', 'Other'])
    .withMessage('Please select a valid profession')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      name, 
      email, 
      password, 
      profession, 
      lifestyle = {},
      referralCode 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Handle referral code
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by the pre-save middleware
      profession,
      lifestyle: {
        transportation: {
          primaryMode: lifestyle.transportation?.primaryMode || 'Mixed',
          hasPrivateVehicle: lifestyle.transportation?.hasPrivateVehicle || false,
          weeklyCommute: lifestyle.transportation?.weeklyCommute || 0
        },
        diet: {
          type: lifestyle.diet?.type || 'Omnivore',
          meatConsumption: lifestyle.diet?.meatConsumption || 'Weekly'
        },
        housing: {
          type: lifestyle.housing?.type || 'Apartment',
          size: lifestyle.housing?.size || 'Medium',
          energySource: lifestyle.housing?.energySource || 'Grid'
        },
        shopping: {
          frequency: lifestyle.shopping?.frequency || 'Weekly',
          preferLocalProducts: lifestyle.shopping?.preferLocalProducts || false,
          ecoFriendlyBrands: lifestyle.shopping?.ecoFriendlyBrands || false
        }
      },
      referredBy
    });

    await user.save();

    // Handle referral rewards
    if (referredBy) {
      const referrer = await User.findById(referredBy);
      if (referrer) {
        // Add referral bonus to referrer
        referrer.ecoCoins += 50; // Referral bonus
        referrer.referrals.push(user._id);
        await referrer.save();

        // Add referral bonus to new user
        user.ecoCoins += 25; // Welcome bonus for referred user
        await user.save();
      }
    }

    // Calculate initial carbon footprint baseline
    const baseline = calculateBaselineFootprint(user.lifestyle, user.profession);
    user.carbonFootprint.baseline = baseline;
    user.carbonFootprint.current = baseline;
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profession: user.profession,
          level: user.level,
          ecoCoins: user.ecoCoins,
          referralCode: user.referralCode
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .exists()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last login and streak
    user.lastLogin = new Date();
    await user.updateStreak();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profession: user.profession,
          level: user.level,
          ecoCoins: user.ecoCoins,
          streak: user.streak,
          emailVerified: user.emailVerified
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('referredBy', 'name')
      .populate('referrals', 'name email');

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('profession')
    .optional()
    .isIn(['Student', 'Professional', 'Business Owner', 'Freelancer', 'Retired', 'Homemaker', 'Other'])
    .withMessage('Please select a valid profession')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['name', 'profession', 'lifestyle', 'notifications'];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, [
  body('currentPassword')
    .exists()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password field
    const user = await User.findById(req.user._id);

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // Here we just confirm the logout
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Helper function to calculate baseline carbon footprint
function calculateBaselineFootprint(lifestyle, profession) {
  let baseline = 0;

  // Transportation baseline
  const transportationFactors = {
    'Car': 2.5,
    'Public Transport': 0.8,
    'Bicycle': 0.1,
    'Walking': 0.05,
    'Motorcycle': 1.8,
    'Mixed': 1.5
  };
  baseline += (transportationFactors[lifestyle.transportation.primaryMode] || 1.5) * 30; // Monthly

  // Diet baseline
  const dietFactors = {
    'Vegan': 1.0,
    'Vegetarian': 1.5,
    'Pescatarian': 2.0,
    'Omnivore': 3.0,
    'Keto': 3.5,
    'Other': 2.5
  };
  baseline += (dietFactors[lifestyle.diet.type] || 2.5) * 30; // Monthly

  // Housing baseline
  const housingFactors = {
    'Small': 50,
    'Medium': 80,
    'Large': 120
  };
  baseline += housingFactors[lifestyle.housing.size] || 80;

  // Energy source adjustment
  if (lifestyle.housing.energySource === 'Solar') {
    baseline *= 0.7; // 30% reduction for solar
  } else if (lifestyle.housing.energySource === 'Mixed') {
    baseline *= 0.85; // 15% reduction for mixed
  }

  // Profession factor
  const professionFactors = {
    'Student': 0.8,
    'Professional': 1.2,
    'Business Owner': 1.5,
    'Freelancer': 1.0,
    'Retired': 0.7,
    'Homemaker': 0.9,
    'Other': 1.0
  };
  baseline *= professionFactors[profession] || 1.0;

  return Math.round(baseline);
}

module.exports = router;
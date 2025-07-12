const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const router = express.Router();

const CarbonEntry = require('../models/CarbonEntry');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

// @route   POST /api/carbon/entry
// @desc    Create new carbon footprint entry
// @access  Private
router.post('/entry', auth, [
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('transportation.mode')
    .isIn(['Car', 'Public Transport', 'Bicycle', 'Walking', 'Motorcycle', 'Flight', 'Train', 'Bus', 'Metro'])
    .withMessage('Invalid transportation mode'),
  body('transportation.distance').isNumeric().withMessage('Distance must be a number'),
  body('transportation.emissions').isNumeric().withMessage('Emissions must be a number')
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

    const entryData = {
      user: req.user._id,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      transportation: req.body.transportation,
      energy: req.body.energy || {},
      food: req.body.food || { meals: [] },
      shopping: req.body.shopping || { items: [] },
      waste: req.body.waste || {},
      notes: req.body.notes,
      weather: req.body.weather,
      ecoActions: req.body.ecoActions || [],
      source: req.body.source || 'Manual'
    };

    // Calculate emissions for transportation if not provided
    if (!entryData.transportation.emissions) {
      entryData.transportation.emissions = calculateTransportationEmissions(
        entryData.transportation.mode,
        entryData.transportation.distance,
        entryData.transportation.fuelType
      );
    }

    // Calculate energy emissions if not provided
    if (entryData.energy.electricity || entryData.energy.gas || entryData.energy.water) {
      entryData.energy.totalEmissions = calculateEnergyEmissions(entryData.energy);
    }

    // Calculate food emissions if meals provided
    if (entryData.food.meals && entryData.food.meals.length > 0) {
      entryData.food.meals.forEach(meal => {
        if (!meal.emissions) {
          meal.emissions = calculateFoodEmissions(meal.category, meal.portions);
        }
      });
    }

    // Calculate shopping emissions if items provided
    if (entryData.shopping.items && entryData.shopping.items.length > 0) {
      entryData.shopping.items.forEach(item => {
        if (!item.emissions) {
          item.emissions = calculateShoppingEmissions(item.category, item.quantity, item.isLocal, item.isEcoFriendly);
        }
      });
    }

    const carbonEntry = new CarbonEntry(entryData);
    await carbonEntry.save();

    // Update user's current carbon footprint
    const user = await User.findById(req.user._id);
    user.carbonFootprint.current = await calculateUserCurrentFootprint(req.user._id);
    user.carbonFootprint.lastCalculated = new Date();
    await user.save();

    // Award eco coins for logging entry
    let ecoCoinsEarned = 5; // Base reward for logging
    
    // Bonus for low-emission transportation
    if (entryData.transportation.mode === 'Bicycle' || entryData.transportation.mode === 'Walking') {
      ecoCoinsEarned += 3;
    }
    
    // Bonus for eco actions
    if (entryData.ecoActions && entryData.ecoActions.length > 0) {
      ecoCoinsEarned += entryData.ecoActions.length * 2;
    }

    await user.addReward(10, ecoCoinsEarned); // 10 XP, variable coins

    res.status(201).json({
      success: true,
      message: 'Carbon entry created successfully',
      data: {
        entry: carbonEntry,
        ecoCoinsEarned
      }
    });

  } catch (error) {
    console.error('Carbon entry creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating carbon entry'
    });
  }
});

// @route   GET /api/carbon/entries
// @desc    Get user's carbon entries
// @access  Private
router.get('/entries', auth, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      category, 
      limit = 50, 
      skip = 0 
    } = req.query;

    const query = { user: req.user._id };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await CarbonEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json({
      success: true,
      data: {
        entries,
        count: entries.length
      }
    });

  } catch (error) {
    console.error('Get carbon entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching carbon entries'
    });
  }
});

// @route   GET /api/carbon/analytics
// @desc    Get carbon footprint analytics
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get footprint data for the period
    const footprintData = await CarbonEntry.getUserFootprint(req.user._id, startDate, endDate);
    
    // Get daily breakdown
    const dailyBreakdown = await CarbonEntry.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalEmissions: { $sum: '$totalEmissions' },
          transportationEmissions: { $sum: '$transportation.emissions' },
          energyEmissions: { $sum: '$energy.totalEmissions' },
          foodEmissions: { $sum: '$food.totalEmissions' },
          shoppingEmissions: { $sum: '$shopping.totalEmissions' },
          wasteEmissions: { $sum: '$waste.totalEmissions' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get category breakdown
    const categoryBreakdown = await CarbonEntry.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          transportation: { $sum: '$transportation.emissions' },
          energy: { $sum: '$energy.totalEmissions' },
          food: { $sum: '$food.totalEmissions' },
          shopping: { $sum: '$shopping.totalEmissions' },
          waste: { $sum: '$waste.totalEmissions' },
          total: { $sum: '$totalEmissions' }
        }
      }
    ]);

    // Get user's targets and achievements
    const user = await User.findById(req.user._id);
    
    // Calculate progress towards target
    const baseline = user.carbonFootprint.baseline;
    const current = user.carbonFootprint.current;
    const target = user.carbonFootprint.target; // percentage reduction
    const targetFootprint = baseline * (1 - target / 100);
    const reductionAchieved = baseline > 0 ? ((baseline - current) / baseline) * 100 : 0;

    res.json({
      success: true,
      data: {
        period,
        footprint: footprintData[0] || {
          totalEmissions: 0,
          avgDailyEmissions: 0,
          transportationEmissions: 0,
          energyEmissions: 0,
          foodEmissions: 0,
          shoppingEmissions: 0,
          wasteEmissions: 0,
          entryCount: 0
        },
        dailyBreakdown,
        categoryBreakdown: categoryBreakdown[0] || {
          transportation: 0,
          energy: 0,
          food: 0,
          shopping: 0,
          waste: 0,
          total: 0
        },
        targets: {
          baseline,
          current,
          target: targetFootprint,
          targetPercentage: target,
          reductionAchieved: Math.round(reductionAchieved),
          onTrack: current <= targetFootprint
        }
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

// @route   POST /api/carbon/upload-bill
// @desc    Upload and process utility bill
// @access  Private
router.post('/upload-bill', auth, upload.single('bill'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Bill file is required'
      });
    }

    const { billType, month, year } = req.body;

    if (!billType || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Bill type, month, and year are required'
      });
    }

    // Here you would typically:
    // 1. Upload file to cloud storage (AWS S3, Cloudinary, etc.)
    // 2. Use OCR to extract data from the bill
    // 3. Parse the extracted data to get consumption values
    // 4. Calculate carbon emissions based on consumption

    // For this example, we'll simulate the process
    const processedData = await processBillData(req.file, billType);

    // Create carbon entry from bill data
    const carbonEntry = new CarbonEntry({
      user: req.user._id,
      date: new Date(year, month - 1), // month is 0-indexed
      energy: {
        electricity: processedData.electricity || 0,
        gas: processedData.gas || 0,
        water: processedData.water || 0,
        totalEmissions: processedData.totalEmissions || 0
      },
      source: 'Bill Upload',
      verified: true,
      confidence: 95,
      notes: `Processed from ${billType} bill`
    });

    await carbonEntry.save();

    // Update user's carbon footprint
    const user = await User.findById(req.user._id);
    user.carbonFootprint.current = await calculateUserCurrentFootprint(req.user._id);
    user.carbonFootprint.lastCalculated = new Date();
    await user.save();

    // Award eco coins for bill upload
    await user.addReward(25, 15); // 25 XP, 15 coins for bill upload

    res.json({
      success: true,
      message: 'Bill processed successfully',
      data: {
        entry: carbonEntry,
        processedData,
        ecoCoinsEarned: 15
      }
    });

  } catch (error) {
    console.error('Bill upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing bill'
    });
  }
});

// @route   PUT /api/carbon/entry/:id
// @desc    Update carbon entry
// @access  Private
router.put('/entry/:id', auth, async (req, res) => {
  try {
    const entry = await CarbonEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Carbon entry not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['transportation', 'energy', 'food', 'shopping', 'waste', 'notes', 'weather', 'ecoActions'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedEntry = await CarbonEntry.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Recalculate user's carbon footprint
    const user = await User.findById(req.user._id);
    user.carbonFootprint.current = await calculateUserCurrentFootprint(req.user._id);
    user.carbonFootprint.lastCalculated = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Carbon entry updated successfully',
      data: {
        entry: updatedEntry
      }
    });

  } catch (error) {
    console.error('Update carbon entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating carbon entry'
    });
  }
});

// @route   DELETE /api/carbon/entry/:id
// @desc    Delete carbon entry
// @access  Private
router.delete('/entry/:id', auth, async (req, res) => {
  try {
    const entry = await CarbonEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Carbon entry not found'
      });
    }

    // Recalculate user's carbon footprint
    const user = await User.findById(req.user._id);
    user.carbonFootprint.current = await calculateUserCurrentFootprint(req.user._id);
    user.carbonFootprint.lastCalculated = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Carbon entry deleted successfully'
    });

  } catch (error) {
    console.error('Delete carbon entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting carbon entry'
    });
  }
});

// Helper functions for emission calculations

function calculateTransportationEmissions(mode, distance, fuelType = 'Petrol') {
  // Emission factors in kg CO2 per km
  const emissionFactors = {
    'Car': { 'Petrol': 0.21, 'Diesel': 0.25, 'Electric': 0.05, 'Hybrid': 0.12, 'CNG': 0.16, 'LPG': 0.18 },
    'Public Transport': { 'Default': 0.08 },
    'Bicycle': { 'Default': 0.01 },
    'Walking': { 'Default': 0.00 },
    'Motorcycle': { 'Petrol': 0.13, 'Electric': 0.03 },
    'Flight': { 'Default': 0.25 },
    'Train': { 'Default': 0.04 },
    'Bus': { 'Default': 0.10 },
    'Metro': { 'Default': 0.06 }
  };

  const factor = emissionFactors[mode]?.[fuelType] || emissionFactors[mode]?.['Default'] || 0.15;
  return Math.round((distance * factor) * 100) / 100;
}

function calculateEnergyEmissions(energy) {
  // Emission factors
  const electricityFactor = 0.82; // kg CO2 per kWh (India average)
  const gasFactor = 2.0; // kg CO2 per unit
  const waterFactor = 0.001; // kg CO2 per liter

  const electricityEmissions = (energy.electricity || 0) * electricityFactor;
  const gasEmissions = (energy.gas || 0) * gasFactor;
  const waterEmissions = (energy.water || 0) * waterFactor;

  return Math.round((electricityEmissions + gasEmissions + waterEmissions) * 100) / 100;
}

function calculateFoodEmissions(category, portions) {
  // Emission factors per portion in kg CO2
  const foodFactors = {
    'Vegetarian': 0.5,
    'Vegan': 0.3,
    'Meat': 2.5,
    'Seafood': 1.8,
    'Dairy': 1.0,
    'Processed': 1.2
  };

  const factor = foodFactors[category] || 1.0;
  return Math.round((portions * factor) * 100) / 100;
}

function calculateShoppingEmissions(category, quantity, isLocal, isEcoFriendly) {
  // Base emission factors
  const shoppingFactors = {
    'Clothing': 5.0,
    'Electronics': 10.0,
    'Books': 1.0,
    'Home & Garden': 3.0,
    'Personal Care': 2.0,
    'Food & Beverages': 1.5,
    'Other': 2.5
  };

  let factor = shoppingFactors[category] || 2.5;
  
  // Apply reductions for local and eco-friendly products
  if (isLocal) factor *= 0.8; // 20% reduction for local
  if (isEcoFriendly) factor *= 0.7; // 30% reduction for eco-friendly

  return Math.round((quantity * factor) * 100) / 100;
}

async function calculateUserCurrentFootprint(userId) {
  // Calculate average daily emissions for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const footprintData = await CarbonEntry.getUserFootprint(userId, thirtyDaysAgo, new Date());
  
  if (footprintData.length > 0) {
    // Convert to monthly average
    return Math.round(footprintData[0].avgDailyEmissions * 30);
  }
  
  return 0;
}

async function processBillData(file, billType) {
  // This would typically involve:
  // 1. OCR processing to extract text from the bill
  // 2. Natural language processing to identify consumption values
  // 3. Calculation of carbon emissions based on consumption

  // For demonstration, we'll return mock processed data
  const mockData = {
    electricity: Math.floor(Math.random() * 500) + 100, // 100-600 kWh
    gas: Math.floor(Math.random() * 50) + 10, // 10-60 units
    water: Math.floor(Math.random() * 5000) + 1000, // 1000-6000 liters
  };

  mockData.totalEmissions = calculateEnergyEmissions(mockData);

  return mockData;
}

module.exports = router;
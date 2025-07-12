const mongoose = require('mongoose');

const carbonEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Transportation
  transportation: {
    mode: {
      type: String,
      enum: ['Car', 'Public Transport', 'Bicycle', 'Walking', 'Motorcycle', 'Flight', 'Train', 'Bus', 'Metro'],
      required: true
    },
    distance: {
      type: Number, // in kilometers
      required: true,
      min: 0
    },
    emissions: {
      type: Number, // in kg CO2
      required: true,
      min: 0
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG', 'None'],
      default: 'None'
    }
  },
  
  // Energy Consumption
  energy: {
    electricity: {
      type: Number, // in kWh
      default: 0,
      min: 0
    },
    gas: {
      type: Number, // in units
      default: 0,
      min: 0
    },
    water: {
      type: Number, // in liters
      default: 0,
      min: 0
    },
    totalEmissions: {
      type: Number, // in kg CO2
      default: 0,
      min: 0
    }
  },
  
  // Food Consumption
  food: {
    meals: [{
      type: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        required: true
      },
      category: {
        type: String,
        enum: ['Vegetarian', 'Vegan', 'Meat', 'Seafood', 'Dairy', 'Processed'],
        required: true
      },
      portions: {
        type: Number,
        default: 1,
        min: 0.1
      },
      emissions: {
        type: Number, // in kg CO2
        required: true,
        min: 0
      }
    }],
    totalEmissions: {
      type: Number, // in kg CO2
      default: 0,
      min: 0
    }
  },
  
  // Shopping & Consumption
  shopping: {
    items: [{
      category: {
        type: String,
        enum: ['Clothing', 'Electronics', 'Books', 'Home & Garden', 'Personal Care', 'Food & Beverages', 'Other'],
        required: true
      },
      item: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1
      },
      price: {
        type: Number,
        min: 0
      },
      isLocal: {
        type: Boolean,
        default: false
      },
      isEcoFriendly: {
        type: Boolean,
        default: false
      },
      emissions: {
        type: Number, // in kg CO2
        required: true,
        min: 0
      }
    }],
    totalEmissions: {
      type: Number, // in kg CO2
      default: 0,
      min: 0
    }
  },
  
  // Waste Generation
  waste: {
    organic: {
      type: Number, // in kg
      default: 0,
      min: 0
    },
    recyclable: {
      type: Number, // in kg
      default: 0,
      min: 0
    },
    nonRecyclable: {
      type: Number, // in kg
      default: 0,
      min: 0
    },
    totalEmissions: {
      type: Number, // in kg CO2
      default: 0,
      min: 0
    }
  },
  
  // Total Daily Emissions
  totalEmissions: {
    type: Number, // in kg CO2
    required: true,
    min: 0
  },
  
  // Data Sources
  source: {
    type: String,
    enum: ['Manual', 'Bill Upload', 'Smart Parsing', 'Estimated'],
    default: 'Manual'
  },
  
  // Verification and Quality
  verified: {
    type: Boolean,
    default: false
  },
  
  confidence: {
    type: Number, // 0-100 percentage
    default: 80,
    min: 0,
    max: 100
  },
  
  // Notes and Context
  notes: {
    type: String,
    maxlength: 500
  },
  
  // Weather context (affects transportation choices)
  weather: {
    condition: {
      type: String,
      enum: ['Sunny', 'Rainy', 'Cloudy', 'Stormy', 'Snow', 'Other']
    },
    temperature: Number // in Celsius
  },
  
  // Eco-friendly actions taken
  ecoActions: [{
    action: {
      type: String,
      required: true
    },
    impact: {
      type: Number, // CO2 saved in kg
      default: 0
    },
    ecoCoinsEarned: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
carbonEntrySchema.index({ user: 1, date: -1 });
carbonEntrySchema.index({ user: 1, 'transportation.mode': 1 });
carbonEntrySchema.index({ totalEmissions: 1 });
carbonEntrySchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total emissions
carbonEntrySchema.pre('save', function(next) {
  // Calculate total emissions from all categories
  const transportationEmissions = this.transportation.emissions || 0;
  const energyEmissions = this.energy.totalEmissions || 0;
  const foodEmissions = this.food.totalEmissions || 0;
  const shoppingEmissions = this.shopping.totalEmissions || 0;
  const wasteEmissions = this.waste.totalEmissions || 0;
  
  this.totalEmissions = transportationEmissions + energyEmissions + foodEmissions + shoppingEmissions + wasteEmissions;
  
  // Calculate food total emissions if meals are provided
  if (this.food.meals && this.food.meals.length > 0) {
    this.food.totalEmissions = this.food.meals.reduce((total, meal) => total + meal.emissions, 0);
  }
  
  // Calculate shopping total emissions if items are provided
  if (this.shopping.items && this.shopping.items.length > 0) {
    this.shopping.totalEmissions = this.shopping.items.reduce((total, item) => total + item.emissions, 0);
  }
  
  // Calculate waste total emissions
  const organicEmissions = (this.waste.organic || 0) * 0.5; // 0.5 kg CO2 per kg organic waste
  const recyclableEmissions = (this.waste.recyclable || 0) * 0.1; // 0.1 kg CO2 per kg recyclable
  const nonRecyclableEmissions = (this.waste.nonRecyclable || 0) * 2.0; // 2.0 kg CO2 per kg non-recyclable
  
  this.waste.totalEmissions = organicEmissions + recyclableEmissions + nonRecyclableEmissions;
  
  // Recalculate total emissions
  this.totalEmissions = this.transportation.emissions + this.energy.totalEmissions + 
                       this.food.totalEmissions + this.shopping.totalEmissions + this.waste.totalEmissions;
  
  next();
});

// Static method to get user's carbon footprint for a date range
carbonEntrySchema.statics.getUserFootprint = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalEmissions: { $sum: '$totalEmissions' },
        avgDailyEmissions: { $avg: '$totalEmissions' },
        transportationEmissions: { $sum: '$transportation.emissions' },
        energyEmissions: { $sum: '$energy.totalEmissions' },
        foodEmissions: { $sum: '$food.totalEmissions' },
        shoppingEmissions: { $sum: '$shopping.totalEmissions' },
        wasteEmissions: { $sum: '$waste.totalEmissions' },
        entryCount: { $sum: 1 }
      }
    }
  ]);
};

// Instance method to calculate emission category breakdown
carbonEntrySchema.methods.getEmissionBreakdown = function() {
  const total = this.totalEmissions;
  if (total === 0) return null;
  
  return {
    transportation: {
      amount: this.transportation.emissions,
      percentage: Math.round((this.transportation.emissions / total) * 100)
    },
    energy: {
      amount: this.energy.totalEmissions,
      percentage: Math.round((this.energy.totalEmissions / total) * 100)
    },
    food: {
      amount: this.food.totalEmissions,
      percentage: Math.round((this.food.totalEmissions / total) * 100)
    },
    shopping: {
      amount: this.shopping.totalEmissions,
      percentage: Math.round((this.shopping.totalEmissions / total) * 100)
    },
    waste: {
      amount: this.waste.totalEmissions,
      percentage: Math.round((this.waste.totalEmissions / total) * 100)
    }
  };
};

module.exports = mongoose.model('CarbonEntry', carbonEntrySchema);
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const savedFundSchema = new mongoose.Schema({
  schemeCode: {
    type: String,
    required: true,
    trim: true
  },
  schemeName: {
    type: String,
    required: true,
    trim: true
  },
  fundHouse: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  nav: {
    type: Number
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  _id: true
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  savedFunds: [savedFundSchema],
  preferences: {
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    riskProfile: {
      type: String,
      enum: ['Conservative', 'Moderate', 'Aggressive'],
      default: 'Moderate'
    },
    investmentGoals: [{
      type: String,
      enum: ['Retirement', 'Education', 'House', 'Emergency Fund', 'Wealth Creation', 'Tax Saving']
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      priceAlerts: {
        type: Boolean,
        default: false
      }
    }
  },
  loginHistory: [{
    loginAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || '';
});

// Virtual for saved funds count
userSchema.virtual('savedFundsCount').get(function() {
  return this.savedFunds ? this.savedFunds.length : 0;
});

// Indexes for better performance
userSchema.index({ 'savedFunds.schemeCode': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Limit login history to last 10 entries
userSchema.pre('save', function(next) {
  if (this.loginHistory && this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user's saved fund by scheme code
userSchema.methods.getSavedFund = function(schemeCode) {
  return this.savedFunds.find(fund => fund.schemeCode === schemeCode);
};

// Check if fund is already saved
userSchema.methods.isFundSaved = function(schemeCode) {
  return this.savedFunds.some(fund => fund.schemeCode === schemeCode);
};

// Add fund to saved list
userSchema.methods.addSavedFund = function(fundData) {
  if (this.isFundSaved(fundData.schemeCode)) {
    throw new Error('Fund is already saved');
  }
  this.savedFunds.push(fundData);
  return this.save();
};

// Remove fund from saved list
userSchema.methods.removeSavedFund = function(schemeCode) {
  this.savedFunds = this.savedFunds.filter(fund => fund.schemeCode !== schemeCode);
  return this.save();
};

// Update saved fund
userSchema.methods.updateSavedFund = function(schemeCode, updateData) {
  const fund = this.getSavedFund(schemeCode);
  if (!fund) {
    throw new Error('Fund not found in saved list');
  }
  Object.assign(fund, updateData);
  return this.save();
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

export default mongoose.model('User', userSchema);

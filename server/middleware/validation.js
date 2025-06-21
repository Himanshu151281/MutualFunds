// Validation middleware for common use cases
import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User registration validation
export const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters'),
  handleValidationErrors
];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Fund saving validation
export const validateSaveFund = [
  body('schemeCode')
    .notEmpty()
    .trim()
    .withMessage('Scheme code is required'),
  body('schemeName')
    .notEmpty()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Scheme name is required and must not exceed 200 characters'),
  body('fundHouse')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Fund house name must not exceed 100 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must not exceed 50 characters'),
  body('subCategory')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Sub-category must not exceed 50 characters'),
  body('nav')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('NAV must be a positive number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  handleValidationErrors
];

// Scheme code parameter validation
export const validateSchemeCode = [
  param('schemeCode')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Valid scheme code is required'),
  handleValidationErrors
];

// User profile update validation
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters'),
  body('preferences.currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP'])
    .withMessage('Currency must be one of: INR, USD, EUR, GBP'),
  body('preferences.riskProfile')
    .optional()
    .isIn(['Conservative', 'Moderate', 'Aggressive'])
    .withMessage('Risk profile must be one of: Conservative, Moderate, Aggressive'),
  body('preferences.investmentGoals')
    .optional()
    .isArray()
    .withMessage('Investment goals must be an array'),
  body('preferences.investmentGoals.*')
    .optional()
    .isIn(['Retirement', 'Education', 'House', 'Emergency Fund', 'Wealth Creation', 'Tax Saving'])
    .withMessage('Invalid investment goal'),
  handleValidationErrors
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('New password must contain at least one letter and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  handleValidationErrors
];

// Search/pagination query validation
export const validateSearchQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
  handleValidationErrors
];

export default {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateSaveFund,
  validateSchemeCode,
  validateProfileUpdate,
  validatePasswordChange,
  validateSearchQuery
};

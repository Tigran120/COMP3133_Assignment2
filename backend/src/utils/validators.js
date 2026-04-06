const { body, validationResult } = require('express-validator');

const runValidation = (validations) => {
  return async (args) => {
    for (const v of validations) {
      await v.run({ body: args });
    }
    const result = validationResult({ body: args });
    if (result.isEmpty()) {
      return { errors: null, data: args };
    }
    return { errors: result.array(), data: null };
  };
};

const signupValidations = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidations = [
  body('usernameOrEmail').trim().notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const addEmployeeValidations = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  body('salary').isFloat({ min: 1000 }).withMessage('Salary must be at least 1000'),
  body('date_of_joining').notEmpty().withMessage('Date of joining is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
];

const updateEmployeeValidations = [
  body('first_name').optional().trim().notEmpty(),
  body('last_name').optional().trim().notEmpty(),
  body('email').optional().trim().isEmail(),
  body('gender').optional().isIn(['Male', 'Female', 'Other']),
  body('designation').optional().trim().notEmpty(),
  body('salary').optional().isFloat({ min: 1000 }),
  body('date_of_joining').optional().notEmpty(),
  body('department').optional().trim().notEmpty(),
];

module.exports = {
  runValidation,
  signupValidations,
  loginValidations,
  addEmployeeValidations,
  updateEmployeeValidations,
};

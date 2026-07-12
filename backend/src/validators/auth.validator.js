import {body, validationResult} from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const validateRegister = [
    body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({min: 3}).withMessage('Username must be at least 3 characters long'),
    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
    body('phoneNumber')
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('any').withMessage('Invalid phone number format')
    .isLength({min: 10, max: 13}).withMessage('Phone number must be between 10 and 15 digits'),
    body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
    
    
    validate
]

export const validateLogin = [
    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
    body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({min: 6}).withMessage('Password must be at least 6 characters long'),

    validate
]


import {body, validationResult} from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}


export const validateMpin = [
    body('mpin')
    .notEmpty().withMessage('mpin is required')
    .isString().withMessage('mpin must be a string')
    .isLength({ min: 4, max: 6 }).withMessage('mpin must be 4 to 6 digits')
    .matches(/^\d+$/).withMessage('mpin must contain only numbers'),

    validate
]
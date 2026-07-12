import {body, validationResult} from 'express-validator';
    
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const validateTransaction = [
    body('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom(value => value > 0)
        .withMessage('Amount must be greater than 0'),

    body('receiverIdentifier')
        .notEmpty()
        .withMessage('Receiver ID is required for transfers Money')
        .withMessage('Invalid Receiver ID format'),

    body('mpin')
        .notEmpty()
        .withMessage('MPIN is required'),
    
    
    validate
]


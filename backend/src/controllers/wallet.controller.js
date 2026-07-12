import walletModel from '../models/wallet.model.js';
import asyncHandler from '../utils/async.handler.js';


export const checkBalance = asyncHandler(async (req, res, next) => {

    const userId = req.user.id;

    const wallet = await walletModel.findOne({
        userid: userId
    })

    if (!wallet) {
        return res.status(404).json({
            success: false,
            message: 'Wallet not found'
        });
    }
    
    return res.status(200).json({
        success: true,
        balance: wallet.balance
    });
});
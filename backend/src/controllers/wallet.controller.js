import asyncHandler from '../utils/async.handler.js';
import { pool } from '../config/database.js';


export const checkBalance = asyncHandler(async (req, res, next) => {

    const userId = req.user.id;

    const wallet = await pool.query(
        'select * from wallets where user_id =$1',
        [userId]
    );

    if (!wallet.rows.length > 0) {
        return res.status(404).json({
            success: false,
            message: 'Wallet not found'
        });
    }
    
    return res.status(200).json({
        success: true,
        wallet: {
            id: wallet.rows[0].id,
            balance: wallet.rows[0].balance
        }
    });
});
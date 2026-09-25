import asyncHandler from '../utils/async.handler.js';
import { pool } from '../config/database.js';
import bcrypt from 'bcrypt';


export const sendMoney = asyncHandler(async (req, res, next) => {
    const { receiverIdentifier, amount, mpin } = req.body;
    const senderId = req.user.id;

    if (!mpin) {
        return res.status(400).json({
            success: false, 
            message: 'MPIN is required' 
        });
    }

    const parsedAmount = Number(amount);
    
    if (!parsedAmount || parsedAmount <= 0) { 
        return res.status(400).json({ 
            success: false, 
            message: 'Amount must be a positive number' 
        });
    }

    if (parsedAmount > 1000000) {
        return res.status(400).json({ 
            success: false, 
            message: 'Amount exceeds the maximum limit of 10,00,000' 
        });
    }

    const senderUser = await pool.query(
        'select * from users where id = $1',
        [senderId]
    );

    if (!senderUser.rows.length > 0) {
        return res.status(404).json({ 
            success: false, 
            message: 'Sender user not found' 
        });
    }

    const senderMpin = await pool.query(
        'select * from mpins where user_id = $1',
        [senderId]
    );

    if (!senderMpin.rows.length > 0) {
        return res.status(404).json({ 
            success: false, 
            message: 'Please set your MPIN before making a transaction' 
        });
    }

    const isMpinValid = await bcrypt.compare(String(mpin), senderMpin.rows[0].mpin_hash);

    if (!isMpinValid) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid MPIN' 
        });
    }

    const receiverUser = await pool.query(
        `select id from users where upi_id =$1 OR phone_number =$1 LIMIT 1`,
        [receiverIdentifier]
    );

    if (receiverUser.rows.length === 0) {
        return res.status(404).json({ 
            success: false, 
            message: 'Receiver user not found' 
        });
    }

    const receiverId = receiverUser.rows[0].id;

    if (receiverId === senderId) {
        return res.status(400).json({ success: false, message: 'You cannot send money to yourself' });
    }

    const receiverWallet = await pool.query(
        'select * from wallets where user_id = $1',
        [receiverId]
    );

    if (!receiverWallet.rows.length > 0) {
        return res.status(404).json({ 
            success: false, 
            message: 'Receiver wallet not found' 
        });
    }

    if (receiverWallet.status === 'inactive') { 
        return res.status(400).json({ 
            success: false, 
            message: 'Receiver wallet is inactive' 
        });
    }

    const client = await pool.connect();

    try{
        await client.query('BEGIN');

        const { rows: wallets } = await
        client.query(
            `select user_id, status from wallets
            where user_id = ANY($1::uuid[])
            order by user_id
            for update`,
            [[senderId, receiverId]]
        );

        const senderWallet = wallets.find(w => w.user_id === senderId);
        const receiverWallet = wallets.find(w => w.user_id === receiverId);

        if (!senderWallet || senderWallet.status !== 'active') {
            throw Object.assign(new Error('Sender wallet is inactive or not found'), { statusCode: 400 });
        }

        if (!receiverWallet || receiverWallet.status !== 'active') {
            throw Object.assign(new Error('Receiver wallet is inactive or not found'), { statusCode: 400 });
        }

        const debit = await client.query(
            `update wallets
            set balance = balance -$1
            where user_id =$2 AND balance >= $1
            returning balance`,
            [amount,senderId]
        );

        if (debit.rowCount === 0) {
            throw Object.assign(new Error('Insufficient balance in sender wallet'), { statusCode: 400 });
        }

        await client.query(
            `UPDATE wallets SET balance = balance + $1 WHERE user_id = $2`,
            [amount, receiverId]
        );

        const { rows } = await client.query(
            `INSERT INTO transactions
                (sender_id, receiver_id, amount, currency, status, type)
            VALUES ($1, $2, $3, 'INR', 'success', 'transfer')
            RETURNING *`,
            [senderId, receiverId, amount]
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Money sent successfully',
            transaction: rows[0],
        });
    }
    catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    } 
});

export const getTransactions = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const { rows: transactions } = await pool.query(
        `SELECT
            t.amount,
            t.currency,
            t.status,
            t.type,
            t.created_at,
            s.id            AS sender_id,
            s.username          AS sender_name,
            s.email         AS sender_email,
            s.phone_number  AS sender_phone_number,
            r.id            AS receiver_id,
            r.username          AS receiver_name,
            r.email         AS receiver_email,
            r.phone_number  AS receiver_phone_number
         FROM transactions t
         JOIN users s ON s.id = t.sender_id
         JOIN users r ON r.id = t.receiver_id
         WHERE t.sender_id = $1 OR t.receiver_id = $1
         ORDER BY t.created_at DESC
         LIMIT 20`,
        [userId]
    );

    if (transactions.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'No transactions found for this user'
        });
    }

    return res.status(200).json({
        success: true,
        transactions
    });
});
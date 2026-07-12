import mongoose from 'mongoose'; // ✅ Bug 1 fix
import userModel from '../models/user.model.js';
import transactionModel from '../models/transaction.model.js';
import walletModel from '../models/wallet.model.js';
import asyncHandler from '../utils/async.handler.js';
import mPinModel from '../models/mpin.model.js';


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

    if (parsedAmount > 100000) {
        return res.status(400).json({ 
            success: false, 
            message: 'Amount exceeds the maximum limit of 1,00,000' 
        });
    }

    const senderUser = await userModel.findById(senderId);
    if (!senderUser) {
        return res.status(404).json({ 
            success: false, 
            message: 'Sender user not found' 
        });
    }

    const senderMpin = await mPinModel.findOne({ userid: senderId }).select('+mpin');
    if (!senderMpin) {
        return res.status(404).json({ 
            success: false, 
            message: 'Please set your MPIN before making a transaction' 
        });
    }

    const isMpinValid = await senderMpin.compareMpin(mpin);
    if (!isMpinValid) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid MPIN' 
        });
    }

    const receiverUser = await userModel.findOne({
        $or: [{ upiId: receiverIdentifier }, { phoneNumber: receiverIdentifier }]
    });

    if (!receiverUser) {
        return res.status(404).json({ 
            success: false, 
            message: 'Receiver user not found' 
        });
    }

    if (senderUser._id.equals(receiverUser._id)) {
        return res.status(400).json({ 
            success: false, 
            message: 'You cannot send money to yourself' 
        });
    }

    const receiverWallet = await walletModel.findOne({ userid: receiverUser._id });
    if (!receiverWallet) {
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

    const session = await mongoose.startSession();
    let transaction;

    try {
        await session.withTransaction(async () => {

            const updatedSenderWallet = await walletModel.findOneAndUpdate(
                { userid: senderUser._id, balance: { $gte: parsedAmount }, status: 'active' },
                { $inc: { balance: -parsedAmount } },
                { new: true, session }
            );

            if (!updatedSenderWallet) {
                const senderWallet = await walletModel.findOne({ userid: senderUser._id }).session(session);
                const msg = !senderWallet || senderWallet.status === 'inactive'
                    ? 'Sender wallet is inactive or not found'
                    : 'Insufficient balance in sender wallet';
                throw Object.assign(new Error(msg), { statusCode: 400 });
            }

            await walletModel.findOneAndUpdate(
                { userid: receiverUser._id },
                { $inc: { balance: parsedAmount } },
                { session }
            );

            [transaction] = await transactionModel.create([{
                sender: senderUser._id,
                receiver: receiverUser._id,
                amount: parsedAmount,
                currency: 'INR',
                status: 'success',
                type: 'transfer',
            }], { session });
        });

        res.status(200).json({ 
            success: true, 
            message: 'Money sent successfully', 
            transaction 
        });

    } catch (error) {
        next(error);
    } finally {
        await session.endSession();
    }
});

export const getTransactions = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const transactions = await transactionModel.find({
        $or:[
            { sender: userId },
            { receiver: userId }
        ]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name email phoneNumber')
    .populate('receiver', 'name email phoneNumber')
    .limit(20);

    if(!transactions || transactions.length === 0){
        return res.status(404).json({
            success: false,
            message: "No transactions found for this user"
        })
    }

    return res.status(200).json({
        success: true,
        transactions
    })

});
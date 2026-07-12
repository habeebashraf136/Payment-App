import mongoose from 'mongoose';


const walletSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    balance: {
        type: Number,
        default: 1000,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD']
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
}, { timestamps: true });

const walletModel = mongoose.model('Wallet', walletSchema);
export default walletModel;

// i donot have to create any api related to wallet it onlt transation thing left is correct or not.
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        enum: ["INR", "USD"],
        required: true
    },
    status: {
        type: String,
        enum: ["success", "failed", "pending"],
        default: "success"
    },
    type: {
        type: String,
        enum: ["transfer"],
        required: true
    }
}, { timestamps: true });


const transactionModel = mongoose.model("Transaction", transactionSchema);
export default transactionModel;
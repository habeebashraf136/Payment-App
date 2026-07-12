import mongoose from "mongoose";
import bcrypt from "bcrypt";


const mPinSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    mpin: {
        type: String,   
        required: true,
        select: false  
    }
}, { timestamps: true });

mPinSchema.pre("save", async function() {
    if (!this.isModified("mpin")) return;
    this.mpin = await bcrypt.hash(this.mpin, 10);
})

mPinSchema.methods.compareMpin = async function(candidateMpin) {
    return await bcrypt.compare(candidateMpin, this.mpin);
}

const mPinModel = mongoose.model("mPin", mPinSchema);
export default mPinModel;
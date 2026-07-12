import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false
  },
  upiId: {
    type: String,
    unique: true  
  },
  status: {
    type: String,
    enum: ["active", "inactive", "blocked"],
    default: "active"
  }
}, { timestamps: true }); 

userSchema.pre('save',async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
}

const userModel = mongoose.model('User', userSchema);
export default userModel;
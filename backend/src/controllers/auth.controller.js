import userModel from '../models/user.model.js';
import asyncHandler from '../utils/async.handler.js';
import bcrypt from 'bcrypt';
import walletModel from '../models/wallet.model.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import redis from '../config/cache.js';
import logger from '../utils/logger.js';



const generateAccessToken = (id) => {
    return jwt.sign({
        id
    }, config.JWT_SECRET_KEY, {
        expiresIn: '15m'
    })
}

const generateRefreshToken = (id) => {
    return jwt.sign({
        id
    }, config.JWT_SECRET, {
        expiresIn: '30d'
    })
}


export const registerUser = asyncHandler(async (req, res, next) => {

    const {username, email, password, phoneNumber} = req.body;

    if (!username || !email || !password || !phoneNumber) {
        return res.status(400).json({ success: false, message: "All fields required" });
    }

    const existingUser = await userModel.findOne({
        $or: [
            {email},
            {phoneNumber}
        ]
    });

    if(existingUser) {
        return res.status(400).json({
            success: false,
            message: "User with this email or phone number already exists"
        });
    }

    const sanitizedPhone = phoneNumber.replace(/\s/g, '').toLowerCase();
    const upicode = `${sanitizedPhone}@phonepe`;

    const user = await userModel.create({
        username,
        email,
        password,
        phoneNumber,
        upiId: upicode
    })

    const wallet = await walletModel.create({
        userid: user._id,
        balance: 1000
    });

    const accessToken = generateAccessToken(user._id);

    const refreshToken = generateRefreshToken(user._id);

    await redis.set(`refresh:${user._id}`, refreshToken, 'EX', 2592000);

    res.cookie('token', refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(201).json({
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            upiId: user.upiId
        },
        wallet,
        message: "User registered successfully",
        accessToken
    });
});

export const loginUser = asyncHandler(async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({
            success: false, 
            message: "All fields required"
        });
    }

    const userExist = await userModel.findOne({email}).select("+password");

    if(!userExist){
        return res.status(404).json({
            success: false,
            message: "User not found"
        })
    }

    const isPasswordMatch = await userExist.comparePassword(password);

    if(!isPasswordMatch){
        return res.status(401).json({
            success: false,
            message: "Invalid credentials or email or password is incorrect"
        })
    }

    const accessToken = generateAccessToken(userExist._id);

    const refreshToken = generateRefreshToken(userExist._id);

    await redis.set(`refresh:${userExist._id}`, refreshToken, 'EX', 2592000);

    res.cookie('token', refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({
        success: true,
        user:{
            id: userExist._id,
            username: userExist.username,
            email: userExist.email,
            phoneNumber: userExist.phoneNumber,
            upiId: userExist.upiId
        },
        message: "User logged in successfully",
        accessToken
    })

});

export const getAccessToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const stored = await redis.get(`refresh:${decoded.id}`);

    if(stored !== token){
        return res.status(401).json({
            success: false,
            message: "invalid token"
        })
    }

    const newAccessToken = generateAccessToken(decoded.id);

    return res.status(200).json({
        success: true,
        accessToken: newAccessToken
    })
})

export const getUser = asyncHandler(async (req, res, next) => {

    const userId = req.user.id;

    const user = await userModel.findById(userId);

    if(!user){
        return res.status(404).json({
            success: false,
            message: "User not found"
        })
    }

    return res.status(200).json({
        success: true,
        user
    })
});

export const logoutUser = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies.token;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    try {
        const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
        await redis.del(`refresh:${decoded.id}`);

        const accessToken = req.headers.authorization?.split(' ')[1];
        if (accessToken) {
            const decodedAccess = jwt.verify(accessToken, config.JWT_SECRET_KEY);
            const remainingTime = decodedAccess.exp - Math.floor(Date.now() / 1000);
            if(remainingTime > 0){
                await redis.set(`blacklist:${accessToken}`, 'true', 'EX', remainingTime);
            }
        }
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }

    res.clearCookie('token', {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({
        success: true,
        message: "User logged out successfully"
    });
});
 


import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import redis from '../config/cache.js';



export const isAuthenticated = async (req, res, next) => {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if(!accessToken){
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    try{
        const isBlacklisted = await redis.get(`blacklist:${accessToken}`);
        if(isBlacklisted){
            return res.status(401).json({
                 success: false, 
                 message: "Token invalidated, please login again" 
            });
        }

        const decoded = jwt.verify(accessToken, config.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    }catch(err){
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        })
    }
}
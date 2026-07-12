import mongoose from 'mongoose';
import config from './config.js';
import logger from '../utils/logger.js';


const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        logger.info('Connected : to MongoDB database successfully');
    } catch (error) {
        logger.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

export default connectDB;

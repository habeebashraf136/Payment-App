import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
import config from './config.js';
import logger from '../utils/logger.js';

const { Pool } = pg;

const pool = new Pool({
    connectionString: config.DATABASE_URL,
    // ssl: { rejectUnauthorized: false },
})

const connectDB = async () => {
    try {
        await pool.connect();
        logger.info('Connected : to PostgreSQL database successfully');
    } catch (error) {
        logger.error('Error connecting to PostgreSQL:', error);
        process.exit(1);
    }
};

export default connectDB;
export { pool };
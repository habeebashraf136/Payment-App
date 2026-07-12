import Redis from 'ioredis';
import config from './config.js';
import logger from '../utils/logger.js';

const redis = new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD
});

redis.on('connect', () => {
    try{
        logger.info('Connected : to Redis database successfully');
    }
    catch(err) {
        logger.error('Error connecting to Redis:', err);
        process.exit(1);
    }
})

export default redis;
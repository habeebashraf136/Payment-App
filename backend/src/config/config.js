import dotenv from 'dotenv';
dotenv.config();
import logger from '../utils/logger.js';


if (!process.env.MONGO_URI) {
  const err = new Error('MONGO_URI is not defined in environment variables');
  logger.error(err.message); 
  process.exit(1);           
}

if(!process.env.NODE_ENV) {
  const err = new Error('NODE_ENV is not defined in environment variables');
  logger.error(err.message); 
  process.exit(1);           
}

if(!process.env.JWT_SECRET) {
  const err = new Error('JWT_SECRET is not defined in environment variables');
  logger.error(err.message); 
  process.exit(1);           
}

if(!process.env.JWT_SECRET_KEY) {
  const err = new Error('JWT_SECRET_KEY is not defined in environment variables');
  logger.error(err.message); 
  process.exit(1);           
}

if(!process.env.REDIS_HOST) {
  const err = new Error('REDIS_HOST is not defined in environment variables');
  logger.error(err.message); 
  process.exit(1);           
}

if(!process.env.REDIS_PORT) {
  const err = new Error('REDIS_PORT is not defined in environment variables');
  logger.error(err.message); 
  process.exit(1);           
}

if(!process.env.REDIS_PASSWORD) {
  const err = new Error('REDIS_PASSWORD is not defined in environment variables');
  logger.error(err.message); 
  process.exit(1);           
} 

if(!process.env.FRONTEND_URL) {
  const err = new Error('FRONTEND_URL is not defined in environment variables');
  logger.error(err.message); 
  process.exit(1);           
}


const config = {
    MONGO_URI: process.env.MONGO_URI,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    FRONTEND_URL: process.env.FRONTEND_URL
}

export default config;

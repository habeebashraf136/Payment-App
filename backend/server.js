import app from './src/app.js';
import connectDB from './src/config/database.js';
import logger from './src/utils/logger.js';


const PORT = process.env.PORT || 4000;
connectDB()




app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
import express from 'express';
import authRouter from './routes/auth.routes.js';
import mPinRouter from './routes/mpin.routes.js';
import transactionRouter from './routes/transaction.routes.js';
import walletRouter from './routes/wallet.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
import { apiLimiter } from './utils/rate.limit.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/config.js';

const app = express();

app.use(helmet());
app.use(cors({
    origin: config.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(apiLimiter);
app.use(cookieParser());


app.get('/healthcheck', (req, res) => {
    res.send('server is running');
});


app.use('/api/auth', authRouter);
app.use('/api/mpin', mPinRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/transactions', transactionRouter);



app.use(errorMiddleware);

export default app;


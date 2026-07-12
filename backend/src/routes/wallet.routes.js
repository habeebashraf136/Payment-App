import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { checkBalance } from '../controllers/wallet.controller.js';


const walletRouter = Router();


// @Route: get /api/wallet/check-balance
// @Desc: Check wallet balance
// @Access: Private
walletRouter.get('/check-balance', isAuthenticated, checkBalance);


export default walletRouter;
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { sendMoney, getTransactions } from '../controllers/transaction.controller.js';
import { validateTransaction} from '../validators/transaction.validator.js';


const transactionRouter = Router();


// @Router get /api/transactions/sendMoney
// @Desc get all transactions for the authenticated user
// @Access private

transactionRouter.post('/sendMoney', isAuthenticated, validateTransaction, sendMoney);


// @Router get /api/transactions/getTransactions
// @Desc get all transactions for the authenticated user
// @Access private
transactionRouter.get('/getTransactions', isAuthenticated, getTransactions);



export default transactionRouter;
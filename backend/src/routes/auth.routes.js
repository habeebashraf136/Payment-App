import { Router } from 'express';
import { validateRegister, validateLogin} from '../validators/auth.validator.js';
import { registerUser, loginUser, getAccessToken, getUser, logoutUser } from '../controllers/auth.controller.js';
import { authLimiter } from '../utils/rate.limit.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';


const authRouter = Router();


// @Router POST /api/auth/register
// @desc Register user
// @access Public
authRouter.post('/register', authLimiter, validateRegister, registerUser);

// @Router post /api/auth/login
// @desc Login user
// @access Public
authRouter.post('/login', authLimiter, validateLogin, loginUser);

// @Route post /api/auth/get-AccessToken
// @desc to Get AccessToken
// @access Public
authRouter.post('/get-AccessToken', getAccessToken);

// @Router get /api/auth/get-User
// @desc getUser
// @access private
authRouter.get('/get-User', isAuthenticated, getUser);

// @Router post /api/auth/logout
// @desc logout the user
// @access private
authRouter.post('/logout', isAuthenticated, logoutUser);

 
export default authRouter;
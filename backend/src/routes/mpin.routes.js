import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { validateMpin } from '../validators/mpin.validator.js';
import { createMpin, updateMpin } from '../controllers/mpin.controller.js';


const mPinRouter = Router();


// @Router post /api/mpin/createMpin
// @desc create a mPin
// @access private
mPinRouter.post('/createMpin', validateMpin, isAuthenticated, createMpin);

// @Router put /api/mpin/updateMpin
// @desc update a mPin
// @access private
mPinRouter.put('/updateMpin', validateMpin, isAuthenticated, updateMpin);



export default mPinRouter;
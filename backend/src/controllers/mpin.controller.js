import mPinModel from "../models/mpin.model.js";
import asyncHandler from '../utils/async.handler.js'
import bcrypt from "bcrypt";


export const createMpin = asyncHandler(async (req, res, next) => {
    const { mpin } = req.body;
    const userId = req.user.id;

    if (!mpin || !/^\d{4,6}$/.test(mpin.toString())) {
        return res.status(400).json({
            success: false,
            message: "MPIN must be 4 to 6 digits"
        });
    }

    const existingMpin = await mPinModel.findOne({
        userid:userId
    });

    if(existingMpin){
        return res.status(400).json({
            success: false,
            message: "Mpin already exists"
        })
    }

    const newMpin = await mPinModel.create({
        userid:userId,
        mpin:mpin
    })
    
    return res.status(201).json({
        success: true,
        message: "Mpin created successfully"
    })

});

export const updateMpin = asyncHandler(async (req, res, next) => {
    const { mpin,oldmpin } = req.body;
    const userId = req.user.id;

    if (!mpin || !/^\d{4,6}$/.test(mpin.toString())) {
        return res.status(400).json({
            success: false,
            message: "MPIN must be 4 to 6 digits"
        });
    }

    if (!oldmpin || !/^\d{4,6}$/.test(oldmpin.toString())) {
        return res.status(400).json({
            success: false,
            message: "MPIN must be 4 to 6 digits"
        });
    }

    const existingMpin = await mPinModel.findOne({userid:userId}).select("+mpin");

    if(!existingMpin){
        return res.status(400).json({
            success: false,
            message: "Mpin not found"
        })
    }

    const oldMpinMatch = await bcrypt.compare(oldmpin.toString(), existingMpin.mpin);
    if(!oldMpinMatch){
        return res.status(400).json({
            success: false,
            message: "Old Mpin is incorrect"
        })
    }

    const isSameMpin = await existingMpin.compareMpin(mpin);
    if(isSameMpin){
        return res.status(400).json({
            success: false,
            message: "New Mpin is same as old Mpin"
        })
    }

    const hashedMpin = await bcrypt.hash(mpin.toString(), 10);

    await mPinModel.findOneAndUpdate(
        {userid:userId}, 
        {mpin:hashedMpin},
        { new: true }
    );

    return res.status(200).json({
        success: true,
        message: "Mpin updated successfully"
    })
});
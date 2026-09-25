import asyncHandler from '../utils/async.handler.js'
import bcrypt from "bcrypt";
import { pool } from "../config/database.js";


export const createMpin = asyncHandler(async (req, res, next) => {
    const { mpin } = req.body;
    const userId = req.user.id;

    if (!mpin || !/^\d{4,6}$/.test(mpin.toString())) {
        return res.status(400).json({
            success: false,
            message: "MPIN must be 4 to 6 digits"
        });
    }

    const existingMpin = await pool.query(
        'select * from mpins where user_id = $1',
        [userId]
    );

    if(existingMpin.rows.length > 0){
        return res.status(400).json({
            success: false,
            message: "Mpin already exists"
        })
    }

    const hashedMpin = await bcrypt.hash(mpin.toString(), 10);


    const newMpin = await pool.query(
        'insert into mpins (user_id, mpin_hash) values ($1, $2) returning *',
        [userId, hashedMpin]
    );
    
    return res.status(201).json({
        success: true,
        message: "Mpin created successfully"
    })

});

export const updateMpin = asyncHandler(async (req, res, next) => {
    const { mpin, oldmpin } = req.body;
    const userId = req.user.id;

    if (!mpin || !/^\d{4,6}$/.test(mpin.toString())) {
        return res.status(400).json({ success: false, message: "MPIN must be 4 to 6 digits" });
    }

    if (!oldmpin || !/^\d{4,6}$/.test(oldmpin.toString())) {
        return res.status(400).json({ success: false, message: "MPIN must be 4 to 6 digits" });
    }

    const existingMpin = await pool.query(
        'SELECT mpin_hash FROM mpins WHERE user_id = $1',
        [userId]
    );

    if (existingMpin.rows.length === 0) {
        return res.status(400).json({ success: false, message: "Mpin not found" });
    }

    const storedHash = existingMpin.rows[0].mpin_hash;

    const oldMpinMatch = await bcrypt.compare(oldmpin.toString(), storedHash);

    if (!oldMpinMatch) {
        return res.status(400).json({ success: false, message: "Old Mpin is incorrect" });
    }

    const isSameMpin = await bcrypt.compare(mpin.toString(), storedHash);
    
    if (isSameMpin) {
        return res.status(400).json({ success: false, message: "New Mpin is same as old Mpin" });
    }

    const hashedMpin = await bcrypt.hash(mpin.toString(), 10);

    await pool.query(
        'UPDATE mpins SET mpin_hash = $1, updated_at = NOW() WHERE user_id = $2',
        [hashedMpin, userId]
    );

    return res.status(200).json({ success: true, message: "Mpin updated successfully" });
});
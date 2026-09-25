import asyncHandler from "../utils/async.handler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import redis from "../config/cache.js";
import logger from "../utils/logger.js";
import { pool } from "../config/database.js";

const generateAccessToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    config.JWT_SECRET_KEY,
    {
      expiresIn: "15m",
    },
  );
};

const generateRefreshToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "30d",
    },
  );
};

export const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, password, phoneNumber } = req.body;

  if (!username || !email || !password || !phoneNumber) {
    return res
      .status(400)
      .json({ success: false, message: "All fields required" });
  }

  const existingUser = await pool.query(
    "select * from users where email = $1 or phone_number = $2",
    [email, phoneNumber],
  );

  if (existingUser.rows.length > 0) {
    return res.status(400).json({
      success: false,
      message: "User with this email or phone number already exists",
    });
  }

  const sanitizedPhone = phoneNumber.replace(/\s/g, "").toLowerCase();
  const upicode = `${sanitizedPhone}@phonepe`;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    "insert into users (username, email, password_hash, phone_number, upi_id) values ($1, $2, $3, $4, $5) returning id, username, email, phone_number, upi_id, status, created_at",
    [username, email, hashedPassword, phoneNumber, upicode],
  );


   const user = result.rows[0];

  const wallet = await pool.query(
    'insert into wallets (user_id, balance) values ($1, $2) returning *',
    [user.id, 1000]
  );

  const walletData = wallet.rows[0];

  const accessToken = generateAccessToken(user.id);

  const refreshToken = generateRefreshToken(user.id);

  await redis.set(`refresh:${user.id}`, refreshToken, "EX", 2592000);

  res.cookie("token", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
        id: user.id,
        username: user.username,
        email: user.email,
        upiId: user.upi_id
    },
    wallet: {
        id: walletData.id,
        balance: walletData.balance,
    },
    accessToken,
  });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields required",
    });
  }

  const userExist = await pool.query(
    'select * from users where email = $1',
    [email]
  );

  if (!userExist.rows.length > 0) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const isPasswordMatch = await bcrypt.compare(password, userExist.rows[0].password_hash);

  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials or email or password is incorrect",
    });
  }

  const accessToken = generateAccessToken(userExist.rows[0].id);

  const refreshToken = generateRefreshToken(userExist.rows[0].id);

  await redis.set(`refresh:${userExist.rows[0].id}`, refreshToken, "EX", 2592000);

  res.cookie("token", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    user: {
      id: userExist.rows[0].id,
      username: userExist.rows[0].username,
      email: userExist.rows[0].email,
      phoneNumber: userExist.rows[0].phone_number,
    },
    accessToken,
  });
});

export const getAccessToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);

  const stored = await redis.get(`refresh:${decoded.id}`);

  if (stored !== token) {
    return res.status(401).json({
      success: false,
      message: "invalid token",
    });
  }

  const newAccessToken = generateAccessToken(decoded.id);

  return res.status(200).json({
    success: true,
    accessToken: newAccessToken,
  });
});

export const getUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const user = await pool.query(
    'select id, username, email, phone_number, upi_id from users where id = $1',
    [userId]
  );

  if (!user.rows.length > 0) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    user: user.rows[0],
  });
});

export const logoutUser = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.token;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
    await redis.del(`refresh:${decoded.id}`);

    const accessToken = req.headers.authorization?.split(" ")[1];
    if (accessToken) {
      const decodedAccess = jwt.verify(accessToken, config.JWT_SECRET_KEY);
      const remainingTime = decodedAccess.exp - Math.floor(Date.now() / 1000);
      if (remainingTime > 0) {
        await redis.set(
          `blacklist:${accessToken}`,
          "true",
          "EX",
          remainingTime,
        );
      }
    }
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});

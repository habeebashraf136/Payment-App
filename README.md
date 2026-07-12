# PaySwift — UPI Payments Platform

A full-stack digital payments platform inspired by PhonePe, featuring a modern React frontend and a robust Express.js backend. This project handles UPI-based money transfers, wallet management, secure authentication, and a complete UI system.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Frontend Details (React + Vite)](#frontend-details-react--vite)
- [Backend Details (Node.js + Express)](#backend-details-nodejs--express)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Security](#security)

---

## Project Overview

This is a complete MERN-stack application (MongoDB, Express, React, Node.js) that powers a digital payments platform with the following core functionalities:

- **User Authentication**: Secure registration and login with JWT tokens and HttpOnly cookies.
- **Wallet Management**: Digital wallet with balance tracking (Default ₹1000).
- **UPI Transactions**: Send and receive money using UPI ID or phone number.
- **MPIN Security**: Additional layer of security for transactions.
- **Atomic Transactions**: Ensures data integrity during money transfers using MongoDB sessions.
- **Modern UI**: A responsive, mobile-first design system with glass-morphism and animations.

---

## Frontend Details (React + Vite)

The frontend is a clean, modern UI built for mobile-first experiences, using a custom design system.

### 🎨 UI & Design System
- **Framework**: React + Vite for fast HMR and optimized builds.
- **Styling**: Tailwind CSS v4 with a custom design system.
- **Palette**: Deep purple (`#6739B7` range) primary colors with warm orange accents.
- **Components**: Reusable glass-panel cards, shimmer loading states, bottom-sheet modals.
- **Icons**: Monochrome/dual-tone `lucide-react` icons.

### 📱 Screens & Features
- **Authentication**: Modern Register and Login pages with floating glass form cards.
- **MPIN Setup**: Dedicated secure PIN entry screen with auto-focus inputs.
- **Dashboard**: Gradient header, wallet balance card, 4-column quick action grid, recent transactions list, and bottom navigation.
- **Send Money**: 4-step interactive flow (Recipient → Amount → Confirm → Bottom-Sheet MPIN → Status).
- **Transaction History**: Date-grouped transactions (Today, Yesterday, This Week) with expandable details and search filtering.
- **Profile**: User details, UPI ID badge, settings menu, and secure logout.
- **Route Guards**: Protected routes (`/dashboard`, `/send-money`) and public-only routes (`/login`, `/register`).

---

## Backend Details (Node.js + Express)

The backend is built for speed, security, and data consistency.

### 🔐 Authentication & Wallet
- User registration with username, email, phone, and password.
- Auto-created wallet on user registration (Default balance: ₹1000).
- JWT-based authentication with short-lived access tokens (15m) and long-lived refresh tokens (30d).

### 💸 Transactions & MPIN
- Send money using UPI ID or phone number.
- MPIN verification for each transaction (hashed with bcrypt).
- Atomic MongoDB transactions to ensure money is reliably deducted and credited.

### ⚡ Infrastructure
- **Redis Integration**: User session caching and token blacklisting for logout functionality.
- **Rate Limiting**: Protects authentication and standard API endpoints.

### API Endpoints
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/get-AccessToken`
- `POST /api/mpin/createMpin`, `PUT /api/mpin/updateMpin`
- `GET /api/wallet/check-balance`
- `POST /api/transactions/sendMoney`, `GET /api/transactions/getTransactions`

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend Runtime** | React 18, Vite |
| **Frontend Styling** | Tailwind CSS v4 |
| **Routing** | React Router DOM |
| **Backend Runtime** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Cache** | Redis (ioredis) |
| **Authentication** | JWT (Access + Refresh tokens) |
| **Security** | bcrypt, Helmet, CORS |

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB & Redis (or cloud equivalents like Atlas and Redis Labs)

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/phonepe
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
JWT_SECRET=your_refresh_token_secret
JWT_SECRET_KEY=your_access_token_secret
```
Start the backend:
```bash
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Start the frontend:
```bash
npm run dev
```
The app will run at `http://localhost:5173`.

---

## Security

- **Tokens**: Access tokens are stored in-memory in the frontend (immune to XSS). Refresh tokens are `HttpOnly` cookies.
- **Interceptor**: Axios interceptor silently handles token rotation on 401 errors.
- **Password & MPIN**: All hashed using bcrypt with cost factor 10.
- **HTTP Security**: Helmet middleware adds security headers.
- **API Security**: Rate limiting prevents brute force and abuse.
- **Validation**: All inputs are validated using `express-validator`.

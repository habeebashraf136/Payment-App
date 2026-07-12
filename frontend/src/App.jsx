import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import SetMpin from './pages/Auth/SetMpin';
import Dashboard from './pages/Dashboard/Dashboard';
import SendMoney from './pages/SendMoney/SendMoney';
import History from './pages/History/History';
import Profile from './pages/Profile/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen max-w-md mx-auto bg-gray-50 shadow-2xl overflow-hidden relative">
          <Routes>
            {/* Root: redirect based on auth status */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public routes: redirect to dashboard if already logged in */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Semi-protected: needs to be accessible right after register, before MPIN */}
            <Route path="/set-mpin" element={<SetMpin />} />

            {/* Protected routes: require authentication */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/send-money" element={<ProtectedRoute><SendMoney /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

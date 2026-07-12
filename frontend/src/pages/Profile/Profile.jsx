import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import BottomNav from '../../components/BottomNav';
import { ArrowLeft, Shield, LogOut, ChevronRight, CreditCard, HelpCircle } from 'lucide-react';

const Profile = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Change MPIN',      desc: 'Update your 4-digit security PIN', icon: Shield,      color: 'text-primary-600 bg-primary-50',  action: () => navigate('/set-mpin') },
    { label: 'Linked Accounts',  desc: 'Manage your bank accounts',        icon: CreditCard,  color: 'text-blue-600 bg-blue-50',        action: null },
    { label: 'Help & Support',   desc: 'FAQs and contact us',              icon: HelpCircle,  color: 'text-amber-600 bg-amber-50',      action: null },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface-dim pb-20">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100">
        <button onClick={() => navigate('/dashboard')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-base text-gray-800">Profile</h2>
      </div>

      {/* ── Profile Card ── */}
      <div className="px-5 pt-6 fade-up">
        <div className="glass-panel p-6 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-md shadow-primary-600/20">
            {(user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user?.username || 'User'}</h2>
          <p className="text-gray-500 text-sm mt-0.5">{user?.phoneNumber || user?.email}</p>
          <div className="mt-3 bg-gray-100 px-4 py-1.5 rounded-lg text-xs font-mono text-gray-600 tracking-wide">
            {user?.upiId || '—'}
          </div>
        </div>
      </div>

      {/* ── Settings Menu ── */}
      <div className="px-5 mt-5 space-y-2 fade-up" style={{ animationDelay: '60ms' }}>
        {menuItems.map(({ label, desc, icon: Icon, color, action }) => (
          <button
            key={label}
            onClick={action}
            disabled={!action}
            className="w-full glass-panel p-4 flex items-center gap-4 text-left hover:bg-gray-50 transition group disabled:opacity-50"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 truncate">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition" />
          </button>
        ))}
      </div>

      {/* ── Logout ── */}
      <div className="px-5 mt-6 fade-up" style={{ animationDelay: '120ms' }}>
        <button
          onClick={handleLogout}
          className="w-full glass-panel p-4 flex items-center gap-4 text-left hover:bg-red-50 transition group"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 text-red-500">
            <LogOut size={20} />
          </div>
          <p className="font-semibold text-sm text-red-500">Logout</p>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;

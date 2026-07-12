import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Clock, User } from 'lucide-react';

const tabs = [
  { label: 'Home',    icon: Home,  path: '/dashboard' },
  { label: 'History', icon: Clock, path: '/history'   },
  { label: 'Profile', icon: User,  path: '/profile'   },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 z-40">
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ label, icon: Icon, path }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? 'nav-active' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
              <span className="text-[10px] tracking-wide">{label}</span>
            </button>
          );
        })}
      </div>
      {/* Safe-area bottom spacer for notched phones */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  );
};

export default BottomNav;

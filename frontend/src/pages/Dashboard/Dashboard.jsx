import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { walletService } from '../../infrastructure/services/wallet.service';
import { transactionService } from '../../infrastructure/services/transaction.service';
import BottomNav from '../../components/BottomNav';
import {
  Send, ScanLine, Smartphone, ReceiptText,
  IndianRupee, ArrowUpRight, ArrowDownLeft,
  Bell, LogOut, PlusCircle,
} from 'lucide-react';

/* ── quick-action grid items ── */
const quickActions = [
  { label: 'Send Money',  icon: Send,        color: 'bg-primary-100 text-primary-600', route: '/send-money' },
  { label: 'Scan & Pay',  icon: ScanLine,    color: 'bg-blue-50 text-blue-600',        route: null },
  { label: 'Recharge',    icon: Smartphone,  color: 'bg-emerald-50 text-emerald-600',  route: null },
  { label: 'Bills',       icon: ReceiptText, color: 'bg-amber-50 text-amber-600',      route: null },
];

const Dashboard = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const [balance, setBalance]         = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => { await logoutUser(); navigate('/login'); };

  /* ── Fetch wallet + recent txns ── */
  useEffect(() => {
    (async () => {
      try { const w = await walletService.checkBalance(); if (w.success) setBalance(w.wallet.balance ?? 0) }
      catch (_) {}
      try { const t = await transactionService.getTransactions(); if (t.success) setTransactions((t.transactions ?? []).slice(0, 5)); }
      catch (_) {}
      finally { setLoading(false); }
    })();
  }, []);

  /* ── Helpers ── */
  const myId     = String(user?._id || user?.id || '');
  const isSent   = (tx) => String(tx.sender?._id || tx.sender || '') === myId;
  const fmtDate  = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  return (
    <div className="flex flex-col min-h-screen bg-surface-dim pb-20">
      {/* ━━━ Header ━━━ */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 text-white px-5 pt-6 pb-8 rounded-b-[2rem] shadow-lg shadow-primary-700/20 fade-up">
        {/* top row */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold uppercase tracking-wider">
              {(user?.username || 'U').charAt(0)}
            </div>
            <div>
              <p className="text-[11px] text-primary-200 leading-none">Welcome back</p>
              <h2 className="font-bold text-base leading-tight mt-0.5">{user?.username || 'User'}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition">
              <Bell size={18} />
            </button>
            <button onClick={handleLogout} title="Logout" className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-red-500/80 transition">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Balance card */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/[0.06] rounded-full blur-2xl" />
          <p className="text-[11px] font-medium text-primary-200 uppercase tracking-wider mb-1">Wallet Balance</p>
          <div className="flex items-baseline gap-1">
            <IndianRupee size={22} className="text-white/80" />
            {loading ? (
              <span className="shimmer w-24 h-8 inline-block" />
            ) : (
              <span className="text-3xl font-extrabold tracking-tight">
                {console.log(balance)}
                {(balance ?? 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <p className="text-[11px] text-primary-200 mt-2 font-mono">UPI ID: {user?.upi_id || '-'}</p>

          {/* Add money pill */}
          <button className="absolute right-4 bottom-4 flex items-center gap-1 bg-white/20 hover:bg-white/30 text-[11px] font-semibold px-3 py-1.5 rounded-full transition">
            <PlusCircle size={14} /> Add Money
          </button>
        </div>
      </div>

      {/* ━━━ Quick Actions ━━━ */}
      <div className="px-5 -mt-4 z-10 fade-up" style={{ animationDelay: '60ms' }}>
        <div className="glass-panel p-4">
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map(({ label, icon: Icon, color, route }) => (
              <button
                key={label}
                onClick={() => route && navigate(route)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-105 transition-transform`}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <span className="text-[11px] font-medium text-gray-600 leading-tight text-center">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ━━━ Recent Transactions ━━━ */}
      <div className="px-5 mt-6 flex-1 fade-up" style={{ animationDelay: '120ms' }}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800 text-sm">Recent Transactions</h3>
          <button onClick={() => navigate('/history')} className="text-primary-500 text-xs font-semibold hover:underline">See all</button>
        </div>

        <div className="glass-panel divide-y divide-gray-50">
          {loading ? (
            <div className="p-5 flex justify-center">
              <svg className="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm">No recent transactions</div>
          ) : (
            transactions.map(tx => {
              const sent = isSent(tx);
              const other = sent ? tx.receiver : tx.sender;
              const name  = other?.username || other?.email || 'Unknown';
              return (
                <div key={tx._id} className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${sent ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {sent ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 leading-tight">{sent ? 'Paid to' : 'Received from'}</p>
                      <p className="text-[11px] text-gray-400">{name} · {fmtDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${sent ? 'text-gray-700' : 'text-emerald-600'}`}>
                    {sent ? '−' : '+'}₹{Number(tx.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ━━━ Bottom Nav ━━━ */}
      <BottomNav />
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../../infrastructure/services/transaction.service';
import { AuthContext } from '../../context/AuthContext';
import BottomNav from '../../components/BottomNav';
import {
  ArrowLeft, ArrowUpRight, ArrowDownLeft,
  Search, ReceiptText, ChevronDown, ChevronUp, Copy,
} from 'lucide-react';

/* ── Date-group helper ── */
const groupByDate = (txns) => {
  const today     = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const weekStart = new Date(today); weekStart.setDate(weekStart.getDate() - 6);

  const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };

  txns.forEach(tx => {
    const d = new Date(tx.created_at); d.setHours(0,0,0,0);
    if (d.getTime() === today.getTime())          groups['Today'].push(tx);
    else if (d.getTime() === yesterday.getTime())  groups['Yesterday'].push(tx);
    else if (d >= weekStart)                        groups['This Week'].push(tx);
    else                                            groups['Earlier'].push(tx);
  });
  return Object.entries(groups).filter(([, v]) => v.length > 0);
};

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState(null);  // expanded tx._id
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await transactionService.getTransactions();
        if (res.success) setTransactions(res.transactions ?? []);
      } catch (err) {
        if (err?.response?.status !== 404) console.error(err);
        setTransactions([]);
      } finally { setLoading(false); }
    })();
  }, []);

  /* ── Helpers ── */
  const myId   = String(user?._id || user?.id || '');
  const isSent = (tx) => String(tx.sender_id || '') === myId;

  const filteredTx = transactions
    .filter(tx => {
      if (filter === 'sent')     return isSent(tx);
      if (filter === 'received') return !isSent(tx);
      return true;
    })
    .filter(tx => {
      if (!search.trim()) return true;
      const name = (isSent(tx) ? tx.receiver_name : tx.sender_name || '').toLowerCase();
      return name.includes(search.toLowerCase());
    });

  const grouped = groupByDate(filteredTx);

  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

  return (
    <div className="flex flex-col min-h-screen bg-surface-dim pb-20">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-20">
        <button onClick={() => navigate('/dashboard')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-base text-gray-800">Transaction History</h2>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="px-5 pt-4 pb-3 bg-white border-b border-gray-100 sticky top-[57px] z-10">
        <div className="flex bg-gray-100 rounded-xl p-1 mb-3">
          {['all', 'sent', 'received'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition
                ${filter === f ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
          />
        </div>
      </div>

      {/* ── Transactions ── */}
      <div className="flex-1 overflow-y-auto px-5 pt-4">
        {loading ? (
          <div className="flex justify-center pt-20">
            <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
          </div>
        ) : filteredTx.length === 0 ? (
          <div className="flex flex-col items-center pt-20 text-gray-400">
            <ReceiptText size={48} className="mb-3 opacity-40" />
            <p className="font-semibold text-gray-500">No transactions yet</p>
            <p className="text-xs mt-1">Your payment history will appear here</p>
          </div>
        ) : (
          grouped.map(([label, txns]) => (
            <div key={label} className="mb-5 fade-up">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
              <div className="glass-panel divide-y divide-gray-50 overflow-hidden">
                {txns.map(tx => {
                  const sent = isSent(tx);
                  const name = sent
                    ? (tx.receiver_name || tx.receiver_email || 'Unknown')
                    : (tx.sender_name || tx.sender_email || 'Unknown');
                  const open = expanded === tx._id;

                  return (
                    <div key={tx._id}>
                      {/* Row */}
                      <button
                        onClick={() => setExpanded(open ? null : tx._id)}
                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50/70 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${sent ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                            {sent ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{sent ? 'Paid to' : 'Received from'} {name}</p>
                            <p className="text-[11px] text-gray-400">{fmtTime(tx.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${sent ? 'text-gray-700' : 'text-emerald-600'}`}>
                            {sent ? '−' : '+'}₹{Number(tx.amount).toLocaleString('en-IN')}
                          </span>
                          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                        </div>
                      </button>

                      {/* Expanded Detail */}
                      {open && (
                        <div className="px-4 pb-4 pt-1 bg-gray-50/50 text-xs text-gray-500 space-y-1 fade-up">
                          <div className="flex justify-between"><span>Transaction ID</span><span className="font-mono text-gray-600 flex items-center gap-1">{tx._id?.slice(-10)}<Copy size={11} className="cursor-pointer hover:text-primary-500" /></span></div>
                          <div className="flex justify-between"><span>Date</span><span>{new Date(tx.created_at).toLocaleString('en-IN')}</span></div>
                          <div className="flex justify-between"><span>Status</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                              {tx.status?.toUpperCase() || 'SUCCESS'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default History;
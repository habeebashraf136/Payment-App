import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mpinService } from '../../infrastructure/services/mpin.service';
import { ShieldCheck } from 'lucide-react';

const SetMpin = () => {
  const [mpin, setMpin]       = useState(['', '', '', '']);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate  = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (val, i) => {
    const digit = val.replace(/[^0-9]/, '');
    const next  = [...mpin]; next[i] = digit; setMpin(next);
    if (digit && i < 3) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !mpin[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pin = mpin.join('');
    if (pin.length < 4) { setError('Enter a 4-digit MPIN'); return; }

    setError(''); setLoading(true);
    try {
      await mpinService.createMpin(pin);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to set MPIN');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-dim">
      {/* ── Purple hero ── */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 px-6 pt-16 pb-14 rounded-b-[2.5rem] shadow-lg shadow-primary-700/20">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={30} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-center text-white">Set Your MPIN</h1>
        <p className="text-center text-primary-200 text-sm mt-1">Create a 4-digit PIN to secure your payments</p>
      </div>

      {/* ── MPIN Form ── */}
      <div className="flex-1 px-6 -mt-6 z-10 flex flex-col items-center">
        <div className="glass-panel p-8 w-full fade-up">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="flex justify-center gap-4 mb-10">
              {mpin.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-primary-600/20 transition flex justify-center items-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              ) : 'Confirm MPIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetMpin;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../../infrastructure/services/transaction.service';
import { ArrowLeft, User, IndianRupee, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

const SendMoney = () => {
  const [step, setStep]       = useState(1);  // 1 Recipient → 2 Amount → 3 Confirm → 4 Status
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount]   = useState('');
  const [showMpin, setShowMpin] = useState(false);  // bottom-sheet visibility
  const [mpin, setMpin]       = useState(['', '', '', '']);
  const [status, setStatus]   = useState(null);      // 'success' | 'failed'
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate  = useNavigate();
  const mpinRefs  = useRef([]);

  /* Auto-focus first MPIN box when sheet opens */
  useEffect(() => { if (showMpin) mpinRefs.current[0]?.focus(); }, [showMpin]);

  /* ── Navigation ── */
  const goBack = () => {
    if (step === 1) return navigate('/dashboard');
    setError('');
    setStep(step - 1);
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (step === 1 && !recipient.trim()) { setError('Enter a UPI ID or phone number'); return; }
    if (step === 2 && (!amount || Number(amount) <= 0)) { setError('Enter a valid amount'); return; }
    setError('');
    if (step === 2) { setStep(3); return; }          // → confirm screen
    setStep(step + 1);
  };

  /* ── Open bottom sheet from confirm screen ── */
  const openMpinSheet = () => { setShowMpin(true); setMpin(['','','','']); setError(''); };

  /* ── MPIN input handler ── */
  const handleMpinChange = (val, i) => {
    const digit = val.replace(/[^0-9]/, '');
    const next  = [...mpin]; next[i] = digit; setMpin(next);
    if (digit && i < 3) mpinRefs.current[i + 1]?.focus();
  };
  const handleMpinKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !mpin[i] && i > 0) mpinRefs.current[i - 1]?.focus();
  };

  /* ── Submit Payment ── */
  const handlePay = async (e) => {
    e.preventDefault();
    const pin = mpin.join('');
    if (pin.length < 4) { setError('Enter 4-digit MPIN'); return; }

    setLoading(true); setError('');
    try {
      const res = await transactionService.sendMoney({
        receiverIdentifier: recipient,
        amount: Number(amount),
        mpin: pin,
      });
      setStatus(res.success ? 'success' : 'failed');
      if (!res.success) setError(res.message);
    } catch (err) {
      setStatus('failed');
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
      setShowMpin(false);
      setStep(4);
    }
  };

  /* ════════════ RENDER ════════════ */
  return (
    <div className="flex flex-col min-h-screen bg-surface-dim relative">

      {/* ── Header ── */}
      {step < 4 && (
        <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100">
          <button onClick={goBack} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-base text-gray-800">
            {step === 1 ? 'Send Money' : step === 2 ? 'Enter Amount' : 'Confirm Payment'}
          </h2>
        </div>
      )}

      {/* ── Step 1: Recipient ── */}
      {step === 1 && (
        <div className="flex-1 flex flex-col px-5 pt-8 fade-up">
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-1">Send money to</p>
            <h3 className="text-lg font-bold text-gray-800">Enter UPI ID or Phone</h3>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <form onSubmit={nextStep} className="flex flex-col gap-4 flex-1">
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="e.g. 9876543210@phonepe"
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mt-auto pb-6">
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-primary-600/20 transition transform hover:-translate-y-0.5 active:translate-y-0">
                Continue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Step 2: Amount ── */}
      {step === 2 && (
        <div className="flex-1 flex flex-col items-center justify-center px-5 fade-up">
          <p className="text-sm text-gray-400 mb-1">Sending to</p>
          <p className="font-semibold text-gray-700 mb-10">{recipient}</p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form onSubmit={nextStep} className="w-full flex flex-col items-center flex-1">
            <div className="flex items-baseline justify-center gap-1 mb-10">
              <span className="text-2xl text-gray-300">₹</span>
              <input
                type="number"
                className="w-40 bg-transparent text-center text-5xl font-extrabold text-gray-800 focus:outline-none placeholder-gray-200"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div className="w-full mt-auto pb-6">
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-primary-600/20 transition">
                Proceed to Pay
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Step 3: Confirm ── */}
      {step === 3 && (
        <div className="flex-1 flex flex-col items-center justify-center px-5 fade-up">
          <div className="glass-panel p-8 w-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-5">
              <User size={28} className="text-primary-600" />
            </div>
            <p className="text-sm text-gray-500">Paying to</p>
            <p className="font-bold text-gray-800 text-lg mb-4">{recipient}</p>
            <div className="flex items-center justify-center gap-1 mb-6">
              <IndianRupee size={20} className="text-gray-400" />
              <span className="text-3xl font-extrabold text-gray-800">{Number(amount).toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={openMpinSheet}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-primary-600/20 transition"
            >
              Pay ₹{Number(amount).toLocaleString('en-IN')}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Status ── */}
      {step === 4 && (
        <div className="flex-1 flex flex-col items-center justify-center px-5 fade-up">
          {status === 'success' ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={44} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Payment Successful!</h3>
              <p className="text-gray-500 text-sm mb-8">₹{Number(amount).toLocaleString('en-IN')} sent to {recipient}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <XCircle size={44} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Payment Failed</h3>
              <p className="text-red-500 text-sm mb-8">{error || 'Something went wrong'}</p>
            </div>
          )}
          <button onClick={() => navigate('/dashboard')} className="w-full max-w-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-2xl transition">
            Back to Home
          </button>
        </div>
      )}

      {/* ════ Bottom-Sheet MPIN Modal ════ */}
      {showMpin && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMpin(false)} />

          {/* Sheet */}
          <div className="absolute bottom-0 inset-x-0 max-w-md mx-auto slide-up">
            <div className="bg-white rounded-t-3xl px-6 pt-6 pb-8 shadow-xl">
              {/* Drag handle */}
              <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-5" />

              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={20} className="text-primary-600" />
                <h3 className="font-bold text-base text-gray-800">Enter UPI MPIN</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">To pay ₹{Number(amount).toLocaleString('en-IN')} to {recipient}</p>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <form onSubmit={handlePay}>
                <div className="flex justify-center gap-4 mb-8">
                  {mpin.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => mpinRefs.current[i] = el}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleMpinChange(e.target.value, i)}
                      onKeyDown={(e) => handleMpinKeyDown(e, i)}
                      className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-primary-600/20 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  ) : 'Confirm Payment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendMoney;

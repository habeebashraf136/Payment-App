import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../infrastructure/services/auth.service';
import { AuthContext } from '../../context/AuthContext';
import { UserPlus, Mail, Phone, Lock, User } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', phoneNumber: '', password: ''
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authService.register(formData);
      if (res.success) { loginUser(res.user, res.accessToken); navigate('/set-mpin'); }
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { name: 'username',    type: 'text',     placeholder: 'Username',             icon: User  },
    { name: 'email',       type: 'email',    placeholder: 'Email Address',        icon: Mail  },
    { name: 'phoneNumber', type: 'tel',      placeholder: 'Phone Number (10 digits)', icon: Phone },
    { name: 'password',    type: 'password', placeholder: 'Password (min 6 chars)', icon: Lock  },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface-dim">
      {/* ── Purple hero ── */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 px-6 pt-14 pb-10 rounded-b-[2.5rem] shadow-lg shadow-primary-700/20">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-5">
          <UserPlus size={30} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-center text-white">Create Account</h1>
        <p className="text-center text-primary-200 text-sm mt-1">Join to start making fast payments</p>
      </div>

      {/* ── Form ── */}
      <div className="flex-1 px-6 -mt-5 z-10">
        <div className="glass-panel p-6 fade-up">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-5 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            {fields.map(({ name, type, placeholder, icon: Icon }) => (
              <div key={name} className="relative">
                <Icon className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                  value={formData[name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-primary-600/20 transition transform hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center mt-1"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-gray-500 text-sm pb-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

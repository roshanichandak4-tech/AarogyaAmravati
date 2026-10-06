import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Hospital, ArrowRight, ShieldCheck } from 'lucide-react';

export const AdminLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setError('');
    setLoading(true);
    try {
      const res = await login(quickEmail, quickPassword);
      if (res.success) {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-2">
            <Hospital className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Hospital Admin Login</h2>
          <p className="text-xs text-slate-500">
            Sign in to manage your hospital profile, doctors, and real-time patient token queue.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Demo Login Credentials Hint */}
        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1">
          <span className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            Demo Hospital Admin Credentials:
          </span>
          <p>Email: <strong className="font-mono text-sky-950">irwin@amravatihospitals.gov.in</strong></p>
          <p>Password: <strong className="font-mono text-sky-950">admin123</strong></p>
          <button
            type="button"
            onClick={() => handleQuickLogin('irwin@amravatihospitals.gov.in', 'admin123')}
            className="mt-2 w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] shadow-sm transition-colors flex items-center justify-center gap-1"
          >
            <span>1-Click Auto Fill & Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Hospital Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="irwin@amravatihospitals.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Not registered yet?{' '}
          <Link to="/admin/register" className="font-bold text-sky-600 hover:underline">
            Register Hospital
          </Link>
        </div>

      </div>
    </div>
  );
};

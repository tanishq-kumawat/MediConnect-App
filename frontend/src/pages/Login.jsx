import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, LogIn, Sparkles, UserCheck, KeyRound } from 'lucide-react';

export const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      if (res.data.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.message);
    }
  };

  const fillDemoAccount = async (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    const res = await login(demoEmail, 'password123');
    if (res.success) {
      if (demoRole === 'doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-p-3 bg-teal-500/20 text-teal-400 p-3 rounded-2xl mb-2 inline-block">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to Jaipur MediConnect</h2>
          <p className="text-xs text-slate-400">Access real-time appointments & consultation rooms</p>
        </div>

        {/* Demo Quick Login Bar */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-2">
          <span className="text-teal-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> One-Click Demo Sign In:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('patient@jaipurmed.com', 'patient')}
              className="py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> Demo Patient
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('doctor@jaipurmed.com', 'doctor')}
              className="py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1"
            >
              <Stethoscope className="w-3.5 h-3.5" /> Demo Doctor
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@jaipurmed.com"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-400 font-bold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

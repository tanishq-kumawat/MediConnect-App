import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Stethoscope, LogIn, Sparkles, UserCheck, ShieldAlert, KeyRound, Globe, PhoneCall } from 'lucide-react';

export const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState('password'); // 'password' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpStep, setOtpStep] = useState(1); // 1 = enter email to send OTP, 2 = enter 6-digit OTP
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else if (res.data.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.message);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setOtpLoading(true);
    try {
      const res = await authAPI.sendOTP(email);
      setInfoMessage(res.data.message);
      if (res.data.demoOtpCode) {
        setDemoOtp(res.data.demoOtpCode);
      }
      setOtpStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch 2FA OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);
    try {
      const res = await authAPI.verifyOTP(email, otpCode);
      localStorage.setItem('user', JSON.stringify(res.data));
      window.location.href = res.data.role === 'admin' ? '/admin' : res.data.role === 'doctor' ? '/doctor-dashboard' : '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleLogin = async (simulatedEmail = 'patient@jaipurmed.com', name = 'Google User') => {
    setError('');
    try {
      const res = await authAPI.googleLogin({
        email: simulatedEmail,
        name: name,
        googleId: `google_id_${Date.now()}`
      });
      localStorage.setItem('user', JSON.stringify(res.data));
      window.location.href = res.data.role === 'admin' ? '/admin' : res.data.role === 'doctor' ? '/doctor-dashboard' : '/dashboard';
    } catch (err) {
      setError('Google OAuth verification failed.');
    }
  };

  const fillDemoAccount = async (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    const res = await login(demoEmail, 'password123');
    if (res.success) {
      if (demoRole === 'admin') {
        navigate('/admin');
      } else if (demoRole === 'doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl mb-1 inline-block border border-teal-500/30">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to MediConnect</h2>
          <p className="text-xs text-slate-400">Access appointments, AI Triage & Admin Control Center</p>
        </div>

        {/* Demo Quick Sign-In Bar */}
        <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-2">
          <span className="text-teal-400 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> One-Click Demo Login:
            </span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('patient@jaipurmed.com', 'patient')}
              className="py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3" /> Patient
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('doctor@jaipurmed.com', 'doctor')}
              className="py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1"
            >
              <Stethoscope className="w-3 h-3" /> Doctor
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@jaipurmed.com', 'admin')}
              className="py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1"
            >
              <ShieldAlert className="w-3 h-3" /> Admin
            </button>
          </div>
        </div>

        {/* Google OAuth & 2FA OTP Mode Selector */}
        <div className="flex border-b border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setError(''); }}
            className={`flex-1 pb-2.5 text-center transition-colors ${authMode === 'password' ? 'text-teal-400 border-b-2 border-teal-500' : 'text-slate-400'}`}
          >
            Password Sign-In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setError(''); setOtpStep(1); }}
            className={`flex-1 pb-2.5 text-center transition-colors ${authMode === 'otp' ? 'text-teal-400 border-b-2 border-teal-500' : 'text-slate-400'}`}
          >
            2FA 6-Digit OTP Mode
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-300 text-xs text-center font-medium">
            {infoMessage}
          </div>
        )}

        {/* MODE 1: Standard Password */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@jaipurmed.com or admin@jaipurmed.com"
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
        )}

        {/* MODE 2: 2FA 6-Digit OTP */}
        {authMode === 'otp' && (
          <div className="space-y-4">
            {otpStep === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Enter Email to Receive 6-Digit OTP</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@jaipurmed.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" /> {otpLoading ? 'Dispatching OTP...' : 'Send 6-Digit OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                {demoOtp && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs text-center font-mono font-bold">
                    Demo OTP Code Dispatched: {demoOtp}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Enter 6-Digit Security OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-lg font-mono font-bold tracking-widest text-teal-400 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" /> {otpLoading ? 'Verifying OTP...' : 'Verify OTP & Log In'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Google OAuth Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => handleGoogleLogin('patient@jaipurmed.com', 'Google User')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:border-slate-600"
          >
            <Globe className="w-4 h-4 text-teal-400" /> Continue with Google OAuth Verification
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800 text-center space-y-2">
          <a
            href="http://localhost:5000/api-docs"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
          >
            Backend Swagger OpenAPI Documentation (`/api-docs`) ↗
          </a>
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 font-bold hover:underline">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

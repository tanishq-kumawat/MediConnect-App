import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, LogOut, Calendar, Building2, Bot } from 'lucide-react';

export const Navbar = ({ onOpenTriage }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2 bg-gradient-to-tr from-teal-600 to-cyan-500 rounded-xl shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-teal-400 bg-clip-text text-transparent">
              Jaipur<span className="text-teal-400">MediConnect</span>
            </span>
            <span className="block text-[10px] text-teal-400/80 font-mono font-medium tracking-wider uppercase">
              Pink City Health Network
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-full border border-slate-700/50">
          <Link
            to="/"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isActive('/')
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Home
          </Link>
          <Link
            to="/doctors"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isActive('/doctors')
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Find Doctors
          </Link>
          <Link
            to="/hospitals"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isActive('/hospitals')
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Jaipur Hospitals
          </Link>
        </nav>

        {/* Action Buttons & Auth */}
        <div className="flex items-center gap-3">
          {/* AI Symptom Bot Quick Launcher */}
          <button
            onClick={onOpenTriage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-all"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Symptom Checker</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={user.role === 'doctor' ? '/doctor-dashboard' : '/dashboard'}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 rounded-lg text-xs font-semibold transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>{user.role === 'doctor' ? 'Doctor Portal' : 'My Appointments'}</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-teal-500/20 transition-all hover:scale-105"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

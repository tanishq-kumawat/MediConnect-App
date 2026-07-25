import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, LogOut, Calendar, Building2, Bot, ShieldAlert, FileText, Menu, X } from 'lucide-react';

export const Navbar = ({ onOpenTriage }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 group">
          <div className="p-2 bg-gradient-to-tr from-teal-600 to-cyan-500 rounded-xl shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-teal-400 bg-clip-text text-transparent">
              Jaipur<span className="text-teal-400">MediConnect</span>
            </span>
            <span className="block text-[9px] sm:text-[10px] text-teal-400/80 font-mono font-medium tracking-wider uppercase">
              Pink City Health Network
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
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
          <a
            href="http://localhost:5000/api-docs"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/50 transition-all flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" /> Swagger Docs
          </a>
        </nav>

        {/* Action Buttons & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Symptom Bot Quick Launcher */}
          <button
            onClick={onOpenTriage}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-all"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Symptom Checker</span>
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              {user.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-all"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Admin Panel</span>
                </Link>
              ) : (
                <Link
                  to={user.role === 'doctor' ? '/doctor-dashboard' : '/dashboard'}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 rounded-lg text-xs font-semibold transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{user.role === 'doctor' ? 'Doctor Portal' : 'My Appointments'}</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
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

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-800/80 rounded-lg border border-slate-700"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2 text-xs font-bold">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl ${isActive('/') ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-300'}`}
            >
              Home
            </Link>
            <Link
              to="/doctors"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl ${isActive('/doctors') ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-300'}`}
            >
              Find Doctors
            </Link>
            <Link
              to="/hospitals"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl ${isActive('/hospitals') ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-300'}`}
            >
              Jaipur Hospitals
            </Link>
            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl text-cyan-400 hover:bg-slate-800 flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" /> Swagger Docs
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-400" /> Admin Control Panel
                  </Link>
                ) : (
                  <Link
                    to={user.role === 'doctor' ? '/doctor-dashboard' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-slate-800 text-teal-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> {user.role === 'doctor' ? 'Doctor OPD Portal' : 'My Appointments'}
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-950/50 text-red-400 border border-red-900/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Log Out ({user.email})
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 bg-slate-800 text-slate-200 rounded-xl text-xs font-bold text-center border border-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 bg-teal-500 text-slate-950 rounded-xl text-xs font-extrabold text-center shadow-md shadow-teal-500/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

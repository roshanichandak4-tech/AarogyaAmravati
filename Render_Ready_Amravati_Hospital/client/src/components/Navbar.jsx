import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Hospital, PhoneCall, QrCode, Bot, Droplet, Activity, LogIn, UserCheck, HeartPulse } from 'lucide-react';

export const Navbar = ({ onOpenQRModal }) => {
  const { admin } = useContext(AuthContext);
  const { isConnected } = useContext(SocketContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 glass-nav border-b border-slate-200/80 shadow-sm transition-all">
      {/* Live status badge inside navbar container */}


      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 via-sky-900 to-emerald-800 bg-clip-text text-transparent">
                Aarogya Amravati
              </span>
              <span className="block text-[11px] font-medium text-sky-600 -mt-1 tracking-wide">
                Hospital Management & Live Token Queue System
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/') ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
              }`}
            >
              <Hospital className="w-4 h-4" />
              Hospitals
            </Link>

            <Link
              to="/blood-bank"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/blood-bank') ? 'bg-red-50 text-red-600 font-semibold' : 'text-slate-600 hover:text-red-600 hover:bg-slate-50'
              }`}
            >
              <Droplet className="w-4 h-4 text-red-500" />
              Blood Bank
            </Link>

            <Link
              to="/ai-chatbot"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/ai-chatbot') ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-600" />
              AI Assistant
            </Link>

            <Link
              to="/emergency"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/emergency') ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-amber-600" />
              Helplines
            </Link>

            <button
              onClick={onOpenQRModal}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-purple-600" />
              QR Codes
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {admin ? (
              <Link
                to="/admin/dashboard"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 text-white font-medium text-sm shadow-md shadow-sky-600/20 hover:opacity-95 transition-all flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>{admin.name.split(' ')[0]} Admin</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Hospital Login</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

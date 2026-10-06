import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ShieldAlert, Phone, MapPin, ExternalLink, Bot, CheckCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide">
                Aarogya Amravati
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official Digital Token Queue Management System for hospitals in Amravati District, Maharashtra. Engineered to eradicate long OPD waiting lines and empower patients with real-time token tracking.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Verified District Portal</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-sky-400 transition-colors">Registered Amravati Hospitals</Link>
              </li>
              <li>
                <Link to="/blood-bank" className="hover:text-sky-400 transition-colors">District Blood Availability Tracker</Link>
              </li>
              <li>
                <Link to="/ai-chatbot" className="hover:text-sky-400 transition-colors">AI Healthcare & Voice Assistant</Link>
              </li>
              <li>
                <Link to="/emergency" className="hover:text-sky-400 transition-colors">Emergency Helplines (108 Ambulance)</Link>
              </li>
              <li>
                <Link to="/qr-scanner" className="hover:text-sky-400 transition-colors">Scan Hospital QR Code</Link>
              </li>
            </ul>
          </div>

          {/* Hospital Admin Portal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">For Amravati Hospitals</h4>
            <p className="text-xs text-slate-400">
              Are you a licensed hospital, clinic, or medical center in Amravati? Register your facility to manage token queues digitally.
            </p>
            <div className="pt-1">
              <Link
                to="/admin/register"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
              >
                Register Your Hospital
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Key Emergency Contacts */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Amravati Helplines</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Emergency Ambulance:</span> 108 (24x7 Free)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Irwin General Hospital:</span> +91 721 2662301
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">District Region:</span> Amravati, Maharashtra 444601
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* AI Medical Disclaimer Notice */}
        <div className="mt-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-400 font-semibold">Important Medical Disclaimer:</strong> AI features and recommendations provide general information guidance only and are not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified physician for emergencies.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Aarogya Amravati. Designed for second-year engineering project demonstration.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-400">About System</Link>
            <Link to="/terms" className="hover:text-slate-400">Privacy Policy & Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

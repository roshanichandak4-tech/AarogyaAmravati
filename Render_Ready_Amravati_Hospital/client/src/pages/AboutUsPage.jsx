import React from 'react';
import { HeartPulse, CheckCircle, Shield, Award, Users } from 'lucide-react';

export const AboutUsPage = () => {
  return (
    <div className="min-h-screen pb-16 space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="bg-gradient-to-r from-sky-800 to-emerald-800 rounded-3xl p-8 text-white shadow-xl space-y-3 text-center">
        <h1 className="text-3xl font-extrabold">About Hospital Management System for Amravati</h1>
        <p className="text-xs text-sky-100 max-w-2xl mx-auto leading-relaxed">
          Designed and developed for second-year engineering project demonstration to solve the critical problem of hospital OPD overcrowding across Amravati District.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Project Purpose & Features</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Multi-Tenant Hospital Isolation:</strong> Registered hospital admins securely access and control only their own hospital token system.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Live WebSocket Real-Time Queue Updates:</strong> Zero-latency token status broadcasts to patients without refreshing pages.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Strict Patient Privacy:</strong> Public portal displays only Token Numbers and status; personal names and phone numbers remain strictly confidential.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Voice AI Assistant & Gemini Integration:</strong> Hands-free speech recognition and synthesis for medical guidance.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

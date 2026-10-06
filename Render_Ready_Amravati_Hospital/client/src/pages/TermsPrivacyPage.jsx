import React from 'react';
import { Shield, Lock, FileText } from 'lucide-react';

export const TermsPrivacyPage = () => {
  return (
    <div className="min-h-screen pb-16 space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl space-y-2">
        <h1 className="text-3xl font-extrabold">Privacy Policy & Terms of Service</h1>
        <p className="text-xs text-slate-400">Aarogya Amravati Token System Guidelines</p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
        <h3 className="text-base font-bold text-slate-900">1. Data Privacy</h3>
        <p>
          Patient identity information including full names and mobile numbers are stored securely for SMS notification dispatch. They are never published on the public interface or shared with third parties. Public users can only see anonymized Token Numbers.
        </p>

        <h3 className="text-base font-bold text-slate-900">2. AI Medical Disclaimer</h3>
        <p className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
          "AI provides general guidance only and is not a substitute for professional medical advice." Always consult licensed medical practitioners during emergencies.
        </p>
      </div>
    </div>
  );
};

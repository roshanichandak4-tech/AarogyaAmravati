import React from 'react';
import { PhoneCall, AlertTriangle, ShieldCheck, Ambulance, HeartPulse, MapPin } from 'lucide-react';

export const EmergencyHelplines = () => {
  const helplines = [
    { title: 'Government Emergency Ambulance', number: '108', desc: 'Free 24x7 Emergency Medical Response Service across Amravati', icon: Ambulance, color: 'bg-red-500' },
    { title: 'Irwin Casualty & Emergency Room', number: '+91 721 2662309', desc: 'Camp Area, Near Collector Office, Amravati', icon: PhoneCall, color: 'bg-rose-600' },
    { title: 'PDMC Emergency & ICU Control', number: '+91 721 2552099', desc: 'Rajapeth, Shivaji Nagar, Amravati', icon: PhoneCall, color: 'bg-sky-600' },
    { title: 'Apex Trauma & Cardiac Emergency', number: '+91 721 2674499', desc: 'Badnera Road, Opp. Engineering College', icon: PhoneCall, color: 'bg-emerald-600' },
    { title: 'Police Control Room Amravati', number: '112 / 100', desc: 'District Police Headquarters', icon: ShieldCheck, color: 'bg-indigo-600' },
    { title: 'District Women & Child Helpline', number: '1091', desc: '24x7 Special Protection & Medical Assistance', icon: HeartPulse, color: 'bg-purple-600' }
  ];

  return (
    <div className="min-h-screen pb-16 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      
      <div className="bg-gradient-to-r from-red-800 to-rose-900 rounded-3xl p-8 text-white shadow-xl space-y-3">
        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase">24x7 Emergency Help</span>
        <h1 className="text-3xl font-extrabold">Amravati Emergency Helplines</h1>
        <p className="text-xs text-red-100 max-w-xl">
          Tap any hotline number below to connect immediately during medical casualties or accidents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {helplines.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className={`h-12 w-12 rounded-2xl ${item.color} text-white flex items-center justify-center`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>

              <a
                href={`tel:${item.number}`}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Call {item.number}</span>
              </a>
            </div>
          );
        })}
      </div>

    </div>
  );
};

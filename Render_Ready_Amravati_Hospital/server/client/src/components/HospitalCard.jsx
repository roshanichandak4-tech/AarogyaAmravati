import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, ArrowRight, QrCode, ShieldCheck, Star } from 'lucide-react';

export const HospitalCard = ({ hospital, onOpenQR }) => {
  const {
    _id,
    name,
    slug,
    bannerUrl,
    logoUrl,
    area,
    address,
    openingTime,
    closingTime,
    is24Hours,
    specializations,
    rating,
    reviewCount,
    liveQueue
  } = hospital;

  const waitingCount = liveQueue ? liveQueue.waitingCount : 0;
  const currentToken = liveQueue ? liveQueue.currentCalledToken : 'None';
  const estWait = liveQueue ? liveQueue.estimatedWaitMinutes : 0;

  return (
    <div className="group rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      
      <div>
        {/* Banner Container */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img
            src={bannerUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=800'}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent"></div>

          {/* Open/Closed Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold glass-card text-emerald-700 border-emerald-200 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{is24Hours ? '24x7 Emergency' : `${openingTime} - ${closingTime}`}</span>
          </div>

          {/* Hospital Logo */}
          <div className="absolute -bottom-4 left-4 h-14 w-14 rounded-2xl bg-white p-1 shadow-md border border-slate-100">
            <img
              src={logoUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=200'}
              alt={`${name} logo`}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>

        {/* Card Body */}
        <div className="pt-6 px-5 pb-4 space-y-3">
          
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                {name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="line-clamp-1">{area || address}</span>
              </p>
            </div>

            {rating && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/60 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rating}</span>
              </div>
            )}
          </div>

          {/* Specialization Tags */}
          <div className="flex flex-wrap gap-1.5">
            {(specializations || ['General Medicine', 'Emergency']).slice(0, 3).map((spec, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[11px] font-medium border border-sky-100">
                {spec}
              </span>
            ))}
            {specializations && specializations.length > 3 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                +{specializations.length - 3} more
              </span>
            )}
          </div>

          {/* Live Token Queue Widget */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-2 text-center my-3">
            <div>
              <span className="block text-[10px] font-medium text-slate-500 uppercase">Serving Token</span>
              <span className="text-sm font-extrabold text-sky-700">#{currentToken}</span>
            </div>
            <div className="border-x border-slate-200">
              <span className="block text-[10px] font-medium text-slate-500 uppercase">Waiting</span>
              <span className="text-sm font-extrabold text-amber-600">{waitingCount} Patients</span>
            </div>
            <div>
              <span className="block text-[10px] font-medium text-slate-500 uppercase">Est. Wait</span>
              <span className="text-sm font-extrabold text-emerald-600">{estWait} min</span>
            </div>
          </div>

        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 pb-5 pt-2 flex items-center gap-2 border-t border-slate-100">
        <Link
          to={`/hospital/${slug || _id}`}
          className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-sky-600/20"
        >
          <span>View Details & Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={() => onOpenQR(hospital)}
          title="Show Hospital QR Code"
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-600 transition-colors border border-slate-200 hover:border-purple-200"
        >
          <QrCode className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

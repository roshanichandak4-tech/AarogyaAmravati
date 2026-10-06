import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, AlertCircle, Clock, ArrowRight, QrCode, Star, Navigation } from 'lucide-react';

export const HospitalCard = ({ hospital, onOpenQR }) => {
  const {
    _id,
    name,
    slug,
    bannerUrl,
    logoUrl,
    area,
    address,
    phone,
    emergencyPhone,
    openingTime,
    closingTime,
    is24Hours,
    specializations,
    facilities,
    mapLink,
    rating
  } = hospital;

  return (
    <div className="group rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      
      <div>
        {/* Banner Photo Container */}
        <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
          <img
            src={bannerUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=800'}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=800'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

          {/* Open/Closed Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold glass-card text-emerald-700 border-emerald-200 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{is24Hours ? '24x7 Emergency' : `${openingTime || '08:00 AM'} - ${closingTime || '08:00 PM'}`}</span>
          </div>

          {/* Hospital Logo */}
          <div className="absolute -bottom-4 left-4 h-14 w-14 rounded-2xl bg-white p-1 shadow-md border border-slate-100">
            <img
              src={logoUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=200'}
              alt={`${name} logo`}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=200'; }}
            />
          </div>
        </div>

        {/* Card Body - Hospital Info */}
        <div className="pt-6 px-5 pb-4 space-y-3.5">
          
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                {name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="line-clamp-1">{address || area || 'Amravati, Maharashtra'}</span>
              </p>
            </div>

            {rating && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/60 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rating}</span>
              </div>
            )}
          </div>

          {/* Contact Numbers */}
          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            {phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="font-semibold text-slate-700">Phone:</span>
                <span>{phone}</span>
              </div>
            )}
            {emergencyPhone && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="font-semibold text-red-600">Emergency:</span>
                <span className="font-medium">{emergencyPhone}</span>
              </div>
            )}
          </div>

          {/* Specialization Tags */}
          <div className="flex flex-wrap gap-1.5">
            {(specializations || ['General Medicine', 'Emergency']).slice(0, 3).map((spec, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-[11px] font-semibold border border-sky-100">
                {spec}
              </span>
            ))}
            {specializations && specializations.length > 3 && (
              <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium">
                +{specializations.length - 3} more
              </span>
            )}
          </div>

          {/* GPS Location Link Button */}
          {mapLink && (
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-sky-50 text-sky-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200 hover:border-sky-200"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
              <span>Google Maps GPS Location</span>
            </a>
          )}

        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 pb-5 pt-2 flex items-center gap-2 border-t border-slate-100">
        <Link
          to={`/hospital/${slug || _id}`}
          className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-sky-600/20"
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

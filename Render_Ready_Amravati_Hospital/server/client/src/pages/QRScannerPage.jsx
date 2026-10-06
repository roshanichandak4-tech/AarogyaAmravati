import React, { useState } from 'react';
import { QrCode, Camera, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QRScannerPage = ({ onOpenQRModal }) => {
  const [manualCode, setManualCode] = useState('');
  const navigate = useNavigate();

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const cleanCode = manualCode.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '');
    navigate(`/hospital/${cleanCode}`);
  };

  return (
    <div className="min-h-screen pb-16 space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
      
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-8 text-white shadow-xl space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mx-auto text-purple-300">
          <QrCode className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold">Hospital QR Code Portal</h1>
        <p className="text-xs sm:text-sm text-purple-200 max-w-xl mx-auto">
          Scan any hospital's official poster QR code using your phone camera to jump directly to its live OPD token queue!
        </p>

        <div className="pt-2">
          <button
            onClick={() => onOpenQRModal(null)}
            className="px-5 py-3 rounded-2xl bg-white text-purple-900 font-extrabold text-xs shadow-lg hover:bg-purple-50 transition-colors"
          >
            Generate Portal QR Code
          </button>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 max-w-lg mx-auto">
        <h3 className="text-base font-bold text-slate-900 flex items-center justify-center gap-2">
          <Search className="w-5 h-5 text-purple-600" />
          Direct QR Code / Slug Lookup
        </h3>

        <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
          <input
            type="text"
            placeholder="Enter Hospital Slug (e.g. irwin-district-general-hospital)"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none text-center font-mono"
            required
          />

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>Open Hospital Queue Page</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};

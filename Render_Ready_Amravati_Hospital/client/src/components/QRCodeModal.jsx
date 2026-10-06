import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Share2, Hospital, QrCode } from 'lucide-react';

export const QRCodeModal = ({ isOpen, onClose, hospital }) => {
  if (!isOpen) return null;

  const targetUrl = hospital
    ? `${window.location.origin}/hospital/${hospital.slug || hospital._id}`
    : window.location.origin;

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${hospital ? hospital.slug : 'amravati-hospital-portal'}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {hospital ? hospital.name : 'Amravati Token Portal QR Code'}
          </h3>
          <p className="text-xs text-slate-500">
            Scan with smartphone camera to instantly access live OPD token status
          </p>
        </div>

        {/* QR Display Frame */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100">
            <QRCodeSVG
              id="qr-code-svg"
              value={targetUrl}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: hospital?.logoUrl || "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=200",
                x: undefined,
                y: undefined,
                height: 36,
                width: 36,
                excavate: true,
              }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500 break-all text-center max-w-xs">
            {targetUrl}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={downloadQR}
            className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(targetUrl);
              alert('Link copied to clipboard!');
            }}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Copy Link</span>
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { QRCodeModal } from './components/QRCodeModal';
import { VoiceAIChatbot } from './components/VoiceAIChatbot';

import { PublicDashboard } from './pages/PublicDashboard';
import { HospitalDetails } from './pages/HospitalDetails';
import { AdminLogin } from './pages/AdminLogin';
import { AdminRegister } from './pages/AdminRegister';
import { AdminDashboard } from './pages/AdminDashboard';
import { BloodBankPage } from './pages/BloodBankPage';
import { EmergencyHelplines } from './pages/EmergencyHelplines';
import { QRScannerPage } from './pages/QRScannerPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { TermsPrivacyPage } from './pages/TermsPrivacyPage';

export const App = () => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedHospitalForQR, setSelectedHospitalForQR] = useState(null);

  const handleOpenQRModal = (hospital = null) => {
    setSelectedHospitalForQR(hospital);
    setQrModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenQRModal={() => handleOpenQRModal(null)} />

      {/* Main Content Router */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<PublicDashboard onOpenQRModal={handleOpenQRModal} />} />
          <Route path="/hospital/:idOrSlug" element={<HospitalDetails onOpenQRModal={handleOpenQRModal} />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/blood-bank" element={<BloodBankPage />} />
          <Route path="/ai-chatbot" element={<div className="max-w-4xl mx-auto p-4 sm:p-8"><div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200"><h2 className="text-xl font-bold mb-4 text-sky-700">Amravati Healthcare Voice & Text AI Assistant</h2><VoiceAIChatbot currentHospitalId={null} /></div></div>} />
          <Route path="/emergency" element={<EmergencyHelplines />} />
          <Route path="/qr-scanner" element={<QRScannerPage onOpenQRModal={handleOpenQRModal} />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/terms" element={<TermsPrivacyPage />} />
        </Routes>
      </main>

      {/* Floating AI Voice Chatbot widget */}
      <VoiceAIChatbot currentHospitalId={null} />

      {/* QR Code Download / Share Modal */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        hospital={selectedHospitalForQR}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;

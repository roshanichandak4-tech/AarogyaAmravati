import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { HospitalCard } from '../components/HospitalCard';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { Search, MapPin, Filter, Activity, Clock, ShieldCheck, HeartPulse, SearchCode, Sparkles, Building2, PhoneCall, Lock, LogOut } from 'lucide-react';

export const PublicDashboard = ({ onOpenQRModal }) => {
  const { admin, logout } = useContext(AuthContext);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  // Patient Token Lookup state
  const [patientIdQuery, setPatientIdQuery] = useState('');
  const [searchedTokenResult, setSearchedTokenResult] = useState(null);
  const [tokenSearchLoading, setTokenSearchLoading] = useState(false);
  const [tokenSearchError, setTokenSearchError] = useState('');

  const { socket } = useContext(SocketContext);

  const fetchHospitals = async () => {
    try {
      const res = await axios.get('/api/hospitals', {
        params: {
          search: searchTerm,
          department: selectedDept,
          specialization: selectedSpec,
          area: selectedArea
        }
      });
      if (res.data.success) {
        setHospitals(res.data.hospitals);
      }
    } catch (err) {
      console.error('Error loading hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [searchTerm, selectedDept, selectedSpec, selectedArea]);

  // Socket listener for real-time queue updates
  useEffect(() => {
    if (!socket) return;
    socket.on('global_hospitals_update', fetchHospitals);
    socket.on('global_queue_change', fetchHospitals);

    return () => {
      socket.off('global_hospitals_update', fetchHospitals);
      socket.off('global_queue_change', fetchHospitals);
    };
  }, [socket]);

  const handlePatientTokenSearch = async (e) => {
    e.preventDefault();
    if (!patientIdQuery.trim()) return;
    setTokenSearchLoading(true);
    setTokenSearchError('');
    setSearchedTokenResult(null);

    try {
      const res = await axios.get(`/api/tokens/search/${patientIdQuery.trim()}`);
      if (res.data.success) {
        setSearchedTokenResult(res.data.token);
      }
    } catch (err) {
      setTokenSearchError(err.response?.data?.message || 'Patient Token not found.');
    } finally {
      setTokenSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen space-y-12 pb-16">
      
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-900 via-sky-800 to-slate-900 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-radial-gradient opacity-30"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-sky-200 shadow-inner">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Digital Token Queue Portal for Amravati District</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Skip Long Hospital Queues.<br />
            <span className="bg-gradient-to-r from-sky-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Track Your Live OPD Token Anywhere.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            View real-time token counters, estimated waiting times, doctor rosters, and blood bank availability across registered hospitals in Amravati.
          </p>

          {/* Quick Search Bar */}
          <div className="max-w-3xl mx-auto mt-8 bg-white p-2 rounded-2xl shadow-2xl border border-white/20 text-slate-800 flex flex-col sm:flex-row items-center gap-2">
            
            <div className="flex-1 flex items-center gap-2 px-3 py-2 w-full">
              <Search className="w-5 h-5 text-sky-600 shrink-0" />
              <input
                type="text"
                placeholder="Search hospital name, department, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm outline-none text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2 px-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 hidden sm:block" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full sm:w-auto text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none font-medium"
              >
                <option value="">All Amravati Areas</option>
                <option value="Camp Area">Camp Area</option>
                <option value="Rajapeth">Rajapeth</option>
                <option value="Badnera Road">Badnera Road</option>
                <option value="Jaistambh Square">Jaistambh Square</option>
              </select>
            </div>

          </div>

          {/* Live Quick Stats Counters */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="block text-[11px] font-medium text-sky-200">Registered Hospitals</span>
              <span className="text-2xl font-bold text-white mt-1 block">{hospitals.length} Active</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="block text-[11px] font-medium text-emerald-200">Live OPD Queues</span>
              <span className="text-2xl font-bold text-emerald-300 mt-1 block">Real-Time</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="block text-[11px] font-medium text-amber-200">Est. Wait / Patient</span>
              <span className="text-2xl font-bold text-amber-300 mt-1 block">~10 Mins</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="block text-[11px] font-medium text-purple-200">District Blood Banks</span>
              <span className="text-2xl font-bold text-purple-300 mt-1 block">Live Stock</span>
            </div>

          </div>

        </div>
      </section>

      {/* Patient Token Status Search Bar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="space-y-2 text-left max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-white">
              <SearchCode className="w-4 h-4" />
              Patient Token Tracker
            </span>
            <h2 className="text-xl sm:text-2xl font-bold">Search Your Token Status</h2>
            <p className="text-xs text-sky-100 leading-relaxed">
              Enter your Patient ID (e.g. <strong>AMR-1003</strong>) printed on your OPD token receipt to view your exact queue position.
            </p>
          </div>

          <div className="w-full md:w-auto max-w-md">
            <form onSubmit={handlePatientTokenSearch} className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-md">
              <input
                type="text"
                placeholder="Enter Patient ID (e.g. AMR-1003)"
                value={patientIdQuery}
                onChange={(e) => setPatientIdQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-sm text-slate-800 outline-none font-semibold uppercase placeholder-slate-400 placeholder:normal-case"
              />
              <button
                type="submit"
                disabled={tokenSearchLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shrink-0"
              >
                {tokenSearchLoading ? 'Searching...' : 'Check Status'}
              </button>
            </form>

            {tokenSearchError && (
              <p className="mt-2 text-xs text-amber-200 font-medium bg-red-900/40 p-2 rounded-xl border border-red-400/30">
                ⚠️ {tokenSearchError}
              </p>
            )}

            {searchedTokenResult && (
              <div className="mt-3 p-4 rounded-2xl bg-white text-slate-800 shadow-lg space-y-2 text-left border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-600">{searchedTokenResult.hospitalName}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    searchedTokenResult.status === 'Called' ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
                    searchedTokenResult.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {searchedTokenResult.status}
                  </span>
                </div>
                
                <div className="text-[11px] font-medium text-slate-600 bg-sky-50 px-2.5 py-1.5 rounded-xl border border-sky-100/60">
                  📅 Appointment Slot: <strong>{searchedTokenResult.date}</strong> at <strong>{searchedTokenResult.opdTime || '09:00 AM'}</strong>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2 rounded-xl">
                  <div>
                    <span className="block text-[10px] text-slate-500">Token</span>
                    <span className="text-sm font-extrabold text-sky-700">#{searchedTokenResult.tokenNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Ahead of You</span>
                    <span className="text-sm font-extrabold text-amber-600">{searchedTokenResult.waitingBeforeMe} Patients</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Est. Wait</span>
                    <span className="text-sm font-extrabold text-emerald-600">~{searchedTokenResult.estimatedWaitMinutes} Mins</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Main Directory Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Logged in Admin Privacy Notice Banner */}
        {admin && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                🔒 Logged in as <strong>{admin.name}</strong>. In Admin Mode, only your hospital card is visible. Other hospital cards are hidden from your view.
              </span>
            </div>
            <button
              onClick={logout}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out to View All Hospitals</span>
            </button>
          </div>
        )}

        {/* Section Title & Specialty Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-sky-600" />
              {admin ? `My Hospital Profile (${admin.name})` : 'Registered Amravati Hospitals'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {admin ? 'Viewing your registered hospital card only' : 'Showing live status for hospitals with active digital OPD token counters'}
            </p>
          </div>

          {/* Quick Specialty Filters */}
          {!admin && (
            <div className="flex flex-wrap items-center gap-2">
              {['All', 'General Medicine', 'Pediatrics', 'Orthopedics', 'Cardiology', 'Neurology'].map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpec(spec === 'All' ? '' : spec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    (spec === 'All' && !selectedSpec) || selectedSpec === spec
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hospitals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : (
          (() => {
            const visibleHospitals = admin
              ? hospitals.filter(h => h._id === admin._id || h.email?.toLowerCase() === admin.email?.toLowerCase())
              : hospitals;

            if (visibleHospitals.length === 0) {
              return (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                    🏥
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">No Hospitals Registered Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    The database is 100% clean with 0 hospitals. Click the button below to register your real hospital and go live instantly!
                  </p>
                  <a
                    href="/admin/register"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all"
                  >
                    ➕ Register New Real Hospital
                  </a>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleHospitals.map((hospital) => (
                  <HospitalCard
                    key={hospital._id}
                    hospital={hospital}
                    onOpenQR={onOpenQRModal}
                  />
                ))}
              </div>
            );
          })()
        )}

      </section>

    </div>
  );
};

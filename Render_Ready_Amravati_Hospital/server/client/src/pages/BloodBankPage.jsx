import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext';
import { Droplet, Phone, MapPin, Search, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BloodBankPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [loading, setLoading] = useState(true);

  const { socket } = useContext(SocketContext);

  const fetchBloodData = async () => {
    try {
      const res = await axios.get('/api/hospitals');
      if (res.data.success) {
        setHospitals(res.data.hospitals);
      }
    } catch (err) {
      console.error('Error fetching blood stock:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('global_blood_update', fetchBloodData);
    return () => {
      socket.off('global_blood_update', fetchBloodData);
    };
  }, [socket]);

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <div className="min-h-screen pb-16 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-900 rounded-3xl p-8 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-xs font-semibold text-white">
          <Droplet className="w-4 h-4 text-white fill-white" />
          <span>Amravati Live Blood Availability Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold">District Blood Bank Tracker</h1>
        <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
          Real-time unit availability updated directly by hospital blood banks across Amravati District.
        </p>

        {/* Group Filter Chips */}
        <div className="pt-4 flex flex-wrap items-center gap-2">
          {bloodGroups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                selectedGroup === grp
                  ? 'bg-white text-red-700 shadow-md'
                  : 'bg-red-800/60 hover:bg-red-800 text-white border border-red-500/30'
              }`}
            >
              {grp} {grp !== 'All' ? 'Units' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Hospital Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hosp) => (
          <div key={hosp._id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={hosp.logoUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=200'}
                    alt={hosp.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{hosp.name}</h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" />
                      {hosp.area}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-4 text-center">
                {Object.entries(hosp.bloodStock || {}).map(([group, units]) => {
                  if (selectedGroup !== 'All' && selectedGroup !== group) return null;
                  return (
                    <div
                      key={group}
                      className={`p-2.5 rounded-xl border ${
                        units > 5
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : units > 0
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      <span className="block text-xs font-extrabold">{group}</span>
                      <span className="text-sm font-black">{units} U</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <a
                href={`tel:${hosp.emergencyPhone || hosp.phone}`}
                className="font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{hosp.emergencyPhone || hosp.phone}</span>
              </a>
              <Link
                to={`/hospital/${hosp.slug || hosp._id}`}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
              >
                View Hospital
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

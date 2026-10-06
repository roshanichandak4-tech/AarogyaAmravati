import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';
import { NotificationToast } from '../components/NotificationToast';
import { Users, UserPlus, PhoneCall, RotateCcw, CheckCircle, SkipForward, UserCheck, Settings, Droplet, Bell, Trash2, Edit3, Shield, Clock, MapPin, Save, Plus, RefreshCw, LogIn } from 'lucide-react';

export const AdminDashboard = () => {
  const { admin, token, logout, updateAdminState, loading } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'doctors', 'profile', 'blood'

  // Queue state
  const [tokens, setTokens] = useState([]);
  const [selectedDept, setSelectedDept] = useState('OPD Desk 1 (General)');
  
  // Register Patient Form State
  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [registerDept, setRegisterDept] = useState('OPD Desk 1 (General)');
  const [registerDate, setRegisterDate] = useState(new Date().toISOString().split('T')[0]);
  const [registerOpdTime, setRegisterOpdTime] = useState('09:30 AM');
  const [registering, setRegistering] = useState(false);

  // Notification Toast State
  const [notification, setNotification] = useState(null);

  // Doctor Form State
  const [doctors, setDoctors] = useState([]);
  const [docName, setDocName] = useState('');
  const [docPhoto, setDocPhoto] = useState('');
  const [docQual, setDocQual] = useState('');
  const [docExp, setDocExp] = useState('');
  const [docDept, setDocDept] = useState('OPD Desk 1 (General)');
  const [docSpec, setDocSpec] = useState('');
  const [docAvail, setDocAvail] = useState('Available');
  const [editingDocId, setEditingDocId] = useState(null);

  // Profile Editor State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    emergencyPhone: '',
    address: '',
    area: '',
    openingTime: '',
    closingTime: '',
    is24Hours: true,
    bannerUrl: '',
    logoUrl: '',
    mapLink: '',
    announcements: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Blood Stock State
  const [bloodStock, setBloodStock] = useState({});
  const [bloodSaving, setBloodSaving] = useState(false);

  // Developer / Admin All Hospitals Management State
  const [allRegisteredHospitals, setAllRegisteredHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);

  const fetchAllRegisteredHospitals = async () => {
    setHospitalsLoading(true);
    try {
      const res = await axios.get('/api/hospitals');
      if (res.data.success) {
        setAllRegisteredHospitals(res.data.hospitals);
      }
    } catch (err) {
      console.error('Error fetching registered hospitals:', err);
    } finally {
      setHospitalsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'manage-hospitals') {
      fetchAllRegisteredHospitals();
    }
  }, [activeTab]);

  const handleDeleteHospitalRegistration = async (hospitalId, hospitalName) => {
    if (!window.confirm(`⚠️ CONFIRM DELETE:\nAre you sure you want to permanently delete "${hospitalName}" registration?\n\nThis will remove the hospital card and its live data immediately!`)) {
      return;
    }

    try {
      const res = await axios.delete(`/api/hospitals/${hospitalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setNotification({
          title: '🗑️ Hospital Registration Deleted',
          patientName: hospitalName,
          tokenNumber: 'REMOVED',
          department: 'System Cleanup'
        });
        fetchAllRegisteredHospitals();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting hospital registration.');
    }
  };

  // Fetch admin tokens
  const fetchTokens = async () => {
    try {
      const res = await axios.get('/api/tokens/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTokens(res.data.tokens);
      }
    } catch (err) {
      console.error('Error fetching admin tokens:', err);
    }
  };

  // Fetch doctors
  const fetchDoctors = async () => {
    if (!admin) return;
    try {
      const res = await axios.get(`/api/doctors/hospital/${admin._id}`);
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin/login');
    }
  }, [admin, loading, navigate]);

  useEffect(() => {
    if (admin) {
      fetchTokens();
      fetchDoctors();
    }

    if (admin && !admin.isSuperAdmin) {
      setProfileForm({
        name: admin.name || '',
        phone: admin.phone || '',
        emergencyPhone: admin.emergencyPhone || '',
        address: admin.address || '',
        area: admin.area || '',
        openingTime: admin.openingTime || '08:00 AM',
        closingTime: admin.closingTime || '08:00 PM',
        is24Hours: admin.is24Hours ?? true,
        bannerUrl: admin.bannerUrl || '',
        logoUrl: admin.logoUrl || '',
        mapLink: admin.mapLink || '',
        announcements: (admin.announcements || []).join('\n')
      });
      setBloodStock(admin.bloodStock || { 'A+': 10, 'B+': 10, 'O+': 10, 'AB+': 5 });
    }
  }, [admin]);

  // Real-time socket events for admin
  useEffect(() => {
    if (!socket || !admin) return;

    if (admin.isSuperAdmin) {
      const handleNewRegistration = (newHosp) => {
        fetchSuperHospitals();
        setNotification({
          title: '🆕 New Hospital Registered!',
          patientName: newHosp.name,
          tokenNumber: 'PENDING',
          department: 'Main Admin Review Required'
        });
      };
      socket.on('superadmin_new_registration', handleNewRegistration);
      return () => {
        socket.off('superadmin_new_registration', handleNewRegistration);
      };
    } else {
      const handleQueueUpdate = () => {
        fetchTokens();
      };
      socket.on(`queue_update_${admin._id}`, handleQueueUpdate);
      return () => {
        socket.off(`queue_update_${admin._id}`, handleQueueUpdate);
      };
    }
  }, [socket, admin]);

  const handleLogoutSession = () => {
    logout();
    navigate('/admin/login');
  };

  // Queue Handlers
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    if (!patientName || !phoneNumber) return;
    setRegistering(true);

    try {
      const res = await axios.post(
        '/api/tokens/register',
        { patientName, phoneNumber, department: registerDept, date: registerDate, opdTime: registerOpdTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setNotification(res.data.notification);
        const waLink = res.data.whatsappLink;
        setPatientName('');
        setPhoneNumber('');
        // Instantly trigger WhatsApp Web click-to-chat prefilled window
        if (waLink) {
          window.open(waLink, '_blank');
        }
        fetchTokens();
      }
    } catch (err) {
      console.error('Error generating token:', err);
    } finally {
      setRegistering(false);
    }
  };

  const handleCallNext = async () => {
    try {
      const res = await axios.put(
        '/api/tokens/call-next',
        { department: selectedDept },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setNotification(res.data.notification);
        const waLink = res.data.whatsappLink;
        if (waLink) {
          window.open(waLink, '_blank');
        }
        fetchTokens();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error calling next token.');
    }
  };

  const handleUpdateStatus = async (tokenId, newStatus) => {
    try {
      const res = await axios.put(
        `/api/tokens/status/${tokenId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setNotification(res.data.notification);
        fetchTokens();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleResetQueue = async () => {
    if (!window.confirm("Are you sure you want to reset today's patient token queue?")) return;
    try {
      const res = await axios.post(
        '/api/tokens/reset-daily',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchTokens();
        alert("Today's queue reset successfully.");
      }
    } catch (err) {
      console.error('Error resetting queue:', err);
    }
  };

  // Doctor Handlers
  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    if (!docName || !docQual) return;

    try {
      const payload = {
        name: docName,
        photoUrl: docPhoto,
        qualification: docQual,
        experience: docExp,
        department: docDept,
        specialization: docSpec || docDept,
        availability: docAvail
      };

      if (editingDocId) {
        await axios.put(`/api/doctors/${editingDocId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/doctors', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setDocName('');
      setDocPhoto('');
      setDocQual('');
      setDocExp('');
      setDocSpec('');
      setEditingDocId(null);
      fetchDoctors();
    } catch (err) {
      console.error('Error saving doctor:', err);
    }
  };

  const handleDeleteDoctor = async (docId) => {
    if (!window.confirm('Delete doctor profile?')) return;
    try {
      await axios.delete(`/api/doctors/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDoctors();
    } catch (err) {
      console.error('Error deleting doctor:', err);
    }
  };

  // Profile Save Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');

    try {
      const payload = {
        ...profileForm,
        announcements: profileForm.announcements.split('\n').filter(a => a.trim() !== '')
      };

      const res = await axios.put('/api/hospitals/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        updateAdminState(res.data.hospital);
        setProfileSuccess('Profile details saved successfully!');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setProfileSaving(false);
    }
  };

  // Blood Stock Handler
  const handleSaveBloodStock = async () => {
    setBloodSaving(true);
    try {
      const res = await axios.put(
        '/api/hospitals/blood-stock',
        { bloodStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert('Blood bank availability updated!');
      }
    } catch (err) {
      console.error('Error updating blood stock:', err);
    } finally {
      setBloodSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-600 border-t-transparent mx-auto"></div>
        <p className="text-slate-600 font-bold text-sm">Authenticating Admin Session...</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Session Expired or Not Logged In</h2>
          <p className="text-xs text-slate-500">Please sign in as a Hospital Admin or Main Admin to access the workspace.</p>
          <button
            onClick={() => navigate('/admin/login')}
            className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Go to Admin Login Page</span>
          </button>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTokens = tokens.filter(t => t.date === todayStr);
  const waitingTokens = todayTokens.filter(t => t.status === 'Waiting');
  const calledTokens = todayTokens.filter(t => t.status === 'Called');
  const completedTokens = todayTokens.filter(t => t.status === 'Completed');

  return (
    <div className="min-h-screen pb-16 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      
      <NotificationToast notification={notification} onClose={() => setNotification(null)} />

      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white p-1 shadow-md border border-white/20 shrink-0">
            <img
              src={admin.logoUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=200'}
              alt={admin.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Shield className="w-4 h-4" />
              <span>Authenticated Hospital Admin Workspace</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white">{admin.name}</h1>
            <p className="text-xs text-slate-300">{admin.address}</p>
          </div>
        </div>

        <button
          onClick={handleLogoutSession}
          className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-semibold text-xs transition-colors shrink-0"
        >
          Logout Session
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'queue' ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Live Token Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'doctors' ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Doctors Roster</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'profile' ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Hospital Info</span>
        </button>

        <button
          onClick={() => setActiveTab('blood')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'blood' ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Droplet className="w-4 h-4 text-red-500" />
          <span>Blood Availability</span>
        </button>

        <button
          onClick={() => setActiveTab('manage-hospitals')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'manage-hospitals' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
          <span>Delete Registrations</span>
        </button>
      </div>

      {/* TAB 1: LIVE TOKEN QUEUE MANAGER */}
      {activeTab === 'queue' && (
        <div className="space-y-8">
          
          {/* Quick Counter Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <span className="text-xs text-slate-500 font-semibold block">Today Total Tokens</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{todayTokens.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm text-center">
              <span className="text-xs text-amber-700 font-semibold block">Waiting Line</span>
              <span className="text-2xl font-extrabold text-amber-800 mt-1 block">{waitingTokens.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm text-center">
              <span className="text-xs text-emerald-700 font-semibold block">Currently Called</span>
              <span className="text-2xl font-extrabold text-emerald-800 mt-1 block">{calledTokens.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 shadow-sm text-center">
              <span className="text-xs text-sky-700 font-semibold block">Completed Visits</span>
              <span className="text-2xl font-extrabold text-sky-800 mt-1 block">{completedTokens.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Patient Registration & Call Controls */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* Call Next Button Widget */}
              <div className="p-6 rounded-3xl bg-gradient-to-tr from-sky-800 to-sky-950 text-white shadow-lg space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-emerald-400" />
                  OPD Queue Action Controls
                </h3>

                <div className="space-y-2">
                  <label className="text-xs text-sky-200 block font-medium">Select Department Desk:</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-white outline-none"
                  >
                    {(admin.departments || ['OPD Desk 1 (General)', 'OPD Desk 2 (Pediatrics)']).map(d => (
                      <option key={d} value={d} className="text-slate-900">{d}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCallNext}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Next Patient Token</span>
                </button>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handleResetQueue}
                    className="text-xs text-red-300 hover:text-red-200 font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Daily Queue
                  </button>
                </div>
              </div>

              {/* Generate New Patient Token Form */}
              <form onSubmit={handleRegisterPatient} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <UserPlus className="w-5 h-5 text-sky-600" />
                  Register Patient & Issue Token
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kale"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone Number (For SMS Alerts)</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9823456789"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Select Department</label>
                    <select
                      value={registerDept}
                      onChange={(e) => setRegisterDept(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none"
                    >
                      {(admin.departments || ['OPD Desk 1 (General)', 'OPD Desk 2 (Pediatrics)']).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Appointment Date</label>
                    <input
                      type="date"
                      value={registerDate}
                      onChange={(e) => setRegisterDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">OPD Time Slot</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:30 AM"
                      value={registerOpdTime}
                      onChange={(e) => setRegisterOpdTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={registering}
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  {registering ? 'Generating Token...' : 'Generate Token & Send SMS'}
                </button>
              </form>

            </div>

            {/* Right: Patient Records Queue Table */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Today's Patient Tokens</h3>
                  <p className="text-xs text-slate-500">Confidential admin view with patient contact information</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Token #</th>
                      <th className="p-3">Patient ID</th>
                      <th className="p-3">Patient Name</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">OPD Date & Time</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {todayTokens.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-400">
                          No tokens issued today yet.
                        </td>
                      </tr>
                    ) : (
                      todayTokens.map((tok) => (
                        <tr key={tok._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-extrabold text-sky-700">#{tok.tokenNumber}</td>
                          <td className="p-3 font-mono text-slate-500">{tok.patientId}</td>
                          <td className="p-3 font-bold text-slate-900">{tok.patientName}</td>
                          <td className="p-3 text-slate-600">{tok.phoneNumber}</td>
                          <td className="p-3 text-slate-600">{tok.date} | {tok.opdTime || '09:00 AM'}</td>
                          <td className="p-3 text-slate-600">{tok.department}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tok.status === 'Called' ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
                              tok.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                              tok.status === 'Skipped' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {tok.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => handleUpdateStatus(tok._id, 'Completed')}
                              title="Mark Complete"
                              className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold"
                            >
                              Done
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(tok._id, 'Skipped')}
                              title="Skip Patient"
                              className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-semibold"
                            >
                              Skip
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: DOCTOR MANAGEMENT */}
      {activeTab === 'doctors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add / Edit Doctor Form */}
          <form onSubmit={handleSaveDoctor} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              {editingDocId ? 'Edit Doctor Profile' : 'Add New Doctor'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Doctor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajeshwar Deshmukh"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Photo Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={docPhoto}
                  onChange={(e) => setDocPhoto(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. MBBS, MD (General Medicine)"
                  value={docQual}
                  onChange={(e) => setDocQual(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Experience</label>
                <input
                  type="text"
                  placeholder="e.g. 15 Years Experience"
                  value={docExp}
                  onChange={(e) => setDocExp(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <select
                  value={docDept}
                  onChange={(e) => setDocDept(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none"
                >
                  {(admin.departments || ['OPD Desk 1 (General)', 'OPD Desk 2 (Pediatrics)']).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Availability Status</label>
                <select
                  value={docAvail}
                  onChange={(e) => setDocAvail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="In OPD">In OPD</option>
                  <option value="On Call">On Call</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
              >
                {editingDocId ? 'Update Doctor' : 'Save Doctor'}
              </button>
              {editingDocId && (
                <button
                  type="button"
                  onClick={() => { setEditingDocId(null); setDocName(''); setDocQual(''); }}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Doctor Roster List */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Existing Doctors Roster
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div key={doc._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={doc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300'}
                      alt={doc.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-sky-600 font-medium">{doc.qualification}</p>
                      <p className="text-slate-500">{doc.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingDocId(doc._id);
                        setDocName(doc.name);
                        setDocPhoto(doc.photoUrl || '');
                        setDocQual(doc.qualification);
                        setDocExp(doc.experience || '');
                        setDocDept(doc.department);
                        setDocAvail(doc.availability || 'Available');
                      }}
                      className="p-1.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doc._id)}
                      className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: HOSPITAL PROFILE & INFO EDITOR */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Edit Hospital Public Profile</span>
            {profileSuccess && <span className="text-xs text-emerald-600 font-bold">{profileSuccess}</span>}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hospital Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Area / Locality</label>
              <input
                type="text"
                value={profileForm.area}
                onChange={(e) => setProfileForm({ ...profileForm, area: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">General Phone</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Emergency Casualty Hotline</label>
              <input
                type="text"
                value={profileForm.emergencyPhone}
                onChange={(e) => setProfileForm({ ...profileForm, emergencyPhone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Opening Time</label>
              <input
                type="text"
                value={profileForm.openingTime}
                onChange={(e) => setProfileForm({ ...profileForm, openingTime: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Closing Time</label>
              <input
                type="text"
                value={profileForm.closingTime}
                onChange={(e) => setProfileForm({ ...profileForm, closingTime: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Full Address</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              />
            </div>

            {/* Hospital Photo (File Upload or URL) */}
            <div className="sm:col-span-2 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="font-bold text-slate-800 block text-xs">
                📸 Hospital Photo (Upload File or Change URL)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Upload New Photo File from Computer</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfileForm({ ...profileForm, bannerUrl: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-100 file:text-sky-800 hover:file:bg-sky-200 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Or Paste Image URL Link</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=800"
                    value={profileForm.bannerUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, bannerUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 outline-none text-xs"
                  />
                </div>
              </div>

              {profileForm.bannerUrl && (
                <div className="mt-2 relative h-36 w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-200">
                  <img
                    src={profileForm.bannerUrl}
                    alt="Hospital Photo Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=800'; }}
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm">
                    ✨ Current Hospital Photo Preview
                  </span>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Google Maps Embed / URL</label>
              <input
                type="text"
                value={profileForm.mapLink}
                onChange={(e) => setProfileForm({ ...profileForm, mapLink: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Announcements (One per line)</label>
              <textarea
                rows={3}
                value={profileForm.announcements}
                onChange={(e) => setProfileForm({ ...profileForm, announcements: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={profileSaving}
            className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            {profileSaving ? 'Saving Changes...' : 'Save Hospital Profile'}
          </button>
        </form>
      )}

      {/* TAB 4: BLOOD BANK STOCK MANAGER */}
      {activeTab === 'blood' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-red-500" />
              Update Hospital Blood Stock Units
            </h3>
            <button
              onClick={handleSaveBloodStock}
              disabled={bloodSaving}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm"
            >
              {bloodSaving ? 'Saving...' : 'Update Blood Bank'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((group) => (
              <div key={group} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <label className="font-extrabold text-slate-800 block text-center">{group}</label>
                <input
                  type="number"
                  min={0}
                  value={bloodStock[group] ?? 0}
                  onChange={(e) => setBloodStock({ ...bloodStock, [group]: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 rounded-xl bg-white border border-slate-200 text-center font-bold text-slate-900 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DEVELOPER & ADMIN - DELETE SPAM / UNNECESSARY HOSPITAL REGISTRATIONS */}
      {activeTab === 'manage-hospitals' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 max-w-5xl mx-auto">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Manage & Delete Hospital Registrations
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Developer/Admin tool to delete duplicate, fake, or test hospital registrations instantly.
              </p>
            </div>

            <button
              onClick={fetchAllRegisteredHospitals}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh List</span>
            </button>
          </div>

          {hospitalsLoading ? (
            <div className="text-center py-8 text-xs text-slate-500">Loading registered hospitals...</div>
          ) : allRegisteredHospitals.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No registered hospitals found.</div>
          ) : (
            <div className="space-y-3">
              {allRegisteredHospitals.map((hosp) => (
                <div
                  key={hosp._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={hosp.logoUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=200'}
                      alt={hosp.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{hosp.name}</h4>
                        {admin && hosp._id === admin._id && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Current Logged In
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-0.5">
                        <span>📧 {hosp.email}</span>
                        <span>📞 {hosp.phone}</span>
                        <span>📍 {hosp.area || hosp.address}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteHospitalRegistration(hosp._id, hosp.name)}
                    className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Registration</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

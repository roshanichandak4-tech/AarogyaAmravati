import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext';
import { MapPin, Phone, Clock, AlertCircle, Droplet, UserCheck, QrCode, Star, MessageSquare, ShieldCheck, CheckCircle2, Search, ArrowUpRight } from 'lucide-react';

export const HospitalDetails = ({ onOpenQRModal }) => {
  const { idOrSlug } = useParams();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [queueStats, setQueueStats] = useState({ currentToken: 0, nextToken: 'None', waitingCount: 0, estimatedWaitTimeMinutes: 0 });
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Token State
  const [searchPatientId, setSearchPatientId] = useState('');
  const [searchedResult, setSearchedResult] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Feedback Submission Form
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const { socket } = useContext(SocketContext);

  const fetchHospitalDetails = async () => {
    try {
      const res = await axios.get(`/api/hospitals/${idOrSlug}`);
      if (res.data.success) {
        setHospital(res.data.hospital);
        setDoctors(res.data.doctors || []);
        setQueueStats(res.data.queueStats || {});
        fetchFeedbacks(res.data.hospital._id);
      }
    } catch (err) {
      console.error('Error loading hospital detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async (hospitalId) => {
    try {
      const res = await axios.get(`/api/feedback/hospital/${hospitalId}`);
      if (res.data.success) {
        setFeedbacks(res.data.feedbacks || []);
      }
    } catch (err) {
      console.error('Error loading feedbacks:', err);
    }
  };

  useEffect(() => {
    fetchHospitalDetails();
  }, [idOrSlug]);

  // Real-time socket events for public unauthenticated visitors
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdate = (data) => {
      setQueueStats({
        currentToken: data.currentToken,
        nextToken: data.nextToken,
        waitingCount: data.waitingCount,
        estimatedWaitTimeMinutes: data.estimatedWaitTimeMinutes
      });
    };

    const handleBloodUpdate = (data) => {
      setHospital(prev => (prev ? { ...prev, bloodStock: data } : prev));
    };

    const handleDoctorsUpdate = () => {
      fetchHospitalDetails();
    };

    const handleFeedbackUpdate = () => {
      if (hospital?._id) fetchFeedbacks(hospital._id);
    };

    const handleHospitalProfileUpdate = (updatedData) => {
      if (updatedData) {
        setHospital(prev => (prev ? { ...prev, ...updatedData } : updatedData));
      }
      fetchHospitalDetails();
    };

    const handleGlobalUpdate = () => {
      fetchHospitalDetails();
    };

    if (hospital?._id) {
      socket.emit('join_hospital', hospital._id);
      socket.on(`queue_update_${hospital._id}`, handleQueueUpdate);
      socket.on(`blood_update_${hospital._id}`, handleBloodUpdate);
      socket.on(`doctors_update_${hospital._id}`, handleDoctorsUpdate);
      socket.on(`feedback_update_${hospital._id}`, handleFeedbackUpdate);
      socket.on(`hospital_update_${hospital._id}`, handleHospitalProfileUpdate);
    }

    socket.on('global_hospitals_update', handleGlobalUpdate);
    socket.on('global_blood_update', handleGlobalUpdate);

    return () => {
      if (hospital?._id) {
        socket.off(`queue_update_${hospital._id}`, handleQueueUpdate);
        socket.off(`blood_update_${hospital._id}`, handleBloodUpdate);
        socket.off(`doctors_update_${hospital._id}`, handleDoctorsUpdate);
        socket.off(`feedback_update_${hospital._id}`, handleFeedbackUpdate);
        socket.off(`hospital_update_${hospital._id}`, handleHospitalProfileUpdate);
      }
      socket.off('global_hospitals_update', handleGlobalUpdate);
      socket.off('global_blood_update', handleGlobalUpdate);
    };
  }, [socket, hospital?._id, idOrSlug]);

  const handleTokenSearch = async (e) => {
    e.preventDefault();
    if (!searchPatientId.trim()) return;
    setSearchedResult(null);
    setSearchError('');

    try {
      const res = await axios.get(`/api/tokens/search/${searchPatientId.trim()}`);
      if (res.data.success) {
        setSearchedResult(res.data.token);
      }
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Patient ID not found.');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!hospital || !feedbackComment.trim()) return;
    setFeedbackSubmitting(true);
    setFeedbackSuccess('');

    try {
      const res = await axios.post('/api/feedback', {
        hospitalId: hospital._id,
        patientName: feedbackName.trim() || 'Anonymous Patient',
        rating: feedbackRating,
        comment: feedbackComment.trim()
      });

      if (res.data.success) {
        setFeedbackSuccess('Thank you! Your feedback has been published.');
        setFeedbackComment('');
        setFeedbackName('');
        fetchFeedbacks(hospital._id);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-64 rounded-3xl bg-slate-200 animate-pulse"></div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Hospital Not Found</h2>
        <p className="text-xs text-slate-500">The requested hospital profile could not be located.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 space-y-8">
      
      {/* Banner & Title Header */}
      <div className="relative bg-slate-900 text-white">
        <div className="h-72 w-full overflow-hidden relative">
          <img
            src={hospital.bannerUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1200'}
            alt={hospital.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="h-28 w-28 rounded-3xl bg-white p-2 shadow-2xl border-2 border-white/20 shrink-0">
              <img
                src={hospital.logoUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=200'}
                alt={`${hospital.name} logo`}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {hospital.is24Hours ? '24x7 Emergency Services' : `${hospital.openingTime} - ${hospital.closingTime}`}
                </span>
                {hospital.rating && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {hospital.rating} ({hospital.reviewCount || 1} Reviews)
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {hospital.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{hospital.address}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenQRModal(hospital)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <QrCode className="w-4 h-4 text-purple-300" />
              <span>Hospital QR</span>
            </button>

            {hospital.mapLink && (
              <a
                href={hospital.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-sky-600/30"
              >
                <span>Google Maps Direction</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Live Token Queue Dashboard */}
        <section className="bg-gradient-to-r from-sky-900 via-sky-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                Live Real-Time OPD Queue Counter
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                Current Token Status
              </h2>
            </div>
            <div className="text-xs text-sky-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              Updated Live via WebSockets
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="block text-xs font-semibold text-sky-200 uppercase tracking-wider">Now Serving</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-white mt-2 block">
                #{queueStats.currentToken || 0}
              </span>
              <span className="text-[10px] text-sky-200 mt-1 block">OPD Consultation Desk</span>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="block text-xs font-semibold text-amber-200 uppercase tracking-wider">Next Token</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-300 mt-2 block">
                #{queueStats.nextToken}
              </span>
              <span className="text-[10px] text-amber-200 mt-1 block">Please be ready</span>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider">Waiting Line</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-300 mt-2 block">
                {queueStats.waitingCount || 0}
              </span>
              <span className="text-[10px] text-emerald-200 mt-1 block">Patients in queue</span>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="block text-xs font-semibold text-purple-200 uppercase tracking-wider">Est. Waiting Time</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-purple-300 mt-2 block">
                ~{queueStats.estimatedWaitTimeMinutes || 0}m
              </span>
              <span className="text-[10px] text-purple-200 mt-1 block">Approx 10 mins / patient</span>
            </div>

          </div>

          {/* Search Token by Patient ID inside Hospital Detail */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-sm font-bold text-white">Check Your Token Position</h4>
              <p className="text-xs text-sky-200">Enter your Patient ID to view how many patients are ahead of you.</p>
            </div>
            <form onSubmit={handleTokenSearch} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Patient ID (e.g. AMR-1003)"
                value={searchPatientId}
                onChange={(e) => setSearchPatientId(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-white text-slate-800 font-semibold uppercase outline-none"
              />
              <button type="submit" className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs">
                Search
              </button>
            </form>
          </div>

          {searchedResult && (
            <div className="p-4 rounded-2xl bg-white text-slate-900 shadow-xl space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-600">Patient ID: {searchedResult.patientId}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {searchedResult.status}
                </span>
              </div>
              
              <div className="text-[11px] font-medium text-slate-600 bg-sky-50 px-2.5 py-1.5 rounded-xl border border-sky-100/60">
                📅 Appointment Slot: <strong>{searchedResult.date}</strong> at <strong>{searchedResult.opdTime || '09:00 AM'}</strong>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500">Token</span>
                  <p className="font-extrabold text-sky-700">#{searchedResult.tokenNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500">Patients Ahead</span>
                  <p className="font-extrabold text-amber-600">{searchedResult.waitingBeforeMe}</p>
                </div>
                <div>
                  <span className="text-slate-500">Est. Wait</span>
                  <p className="font-extrabold text-emerald-600">~{searchedResult.estimatedWaitMinutes} min</p>
                </div>
              </div>
            </div>
          )}

          {searchError && (
            <p className="text-xs text-amber-300 font-medium">{searchError}</p>
          )}

        </section>

        {/* Content Grid: Info & Doctors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Hospital Info, Facilities, Blood Stock */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Quick Contacts */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Hospital Information
              </h3>
              
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">General Reception:</span>
                    <span>{hospital.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-red-600 block">Emergency Casualty Hotline:</span>
                    <span>{hospital.emergencyPhone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">OPD Hours:</span>
                    <span>{hospital.openingTime} - {hospital.closingTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blood Availability */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-red-500" />
                  Blood Stock
                </h3>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  LIVE UPDATED
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {Object.entries(hospital.bloodStock || {}).map(([group, units]) => (
                  <div key={group} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="block text-xs font-bold text-slate-700">{group}</span>
                    <span className={`text-sm font-extrabold ${units > 5 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {units} U
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities & Departments */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Facilities & OPD Desks
              </h3>
              
              <div className="space-y-2">
                {(hospital.facilities || []).map((fac, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{fac}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Doctors Roster & Patient Reviews */}
          <div className="space-y-8 lg:col-span-2">
            
            {/* Doctor Management List */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-sky-600" />
                    Consultant Doctor Roster
                  </h3>
                  <p className="text-xs text-slate-500">
                    Active doctors available for OPD consultation today
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 font-bold text-xs">
                  {doctors.length} Doctors
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {doctors.map((doc) => (
                  <div key={doc._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 hover:border-sky-300 transition-colors">
                    <img
                      src={doc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300'}
                      alt={doc.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-sky-600 font-medium">{doc.qualification}</p>
                      <p className="text-slate-500">{doc.experience}</p>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {doc.availability || 'Available'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Patient Feedback Section */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    Patient Reviews & Feedback
                  </h3>
                  <p className="text-xs text-slate-500">Real feedback submitted by patients after OPD visits</p>
                </div>
              </div>

              {/* Submit Feedback Form */}
              <form onSubmit={handleFeedbackSubmit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Leave Patient Feedback</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 outline-none"
                  />
                  <select
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(Number(e.target.value))}
                    className="px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 outline-none font-medium"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5 Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5 Good)</option>
                    <option value={3}>⭐⭐⭐ (3/5 Average)</option>
                    <option value={2}>⭐⭐ (2/5 Needs Improvement)</option>
                    <option value={1}>⭐ (1/5 Poor)</option>
                  </select>
                </div>

                <textarea
                  placeholder="Share your experience regarding queue waiting times, doctor consultation, and cleanliness..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  rows={2}
                  className="w-full p-3 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 outline-none"
                  required
                />

                <div className="flex items-center justify-between pt-1">
                  {feedbackSuccess && (
                    <span className="text-xs text-emerald-600 font-semibold">{feedbackSuccess}</span>
                  )}
                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors ml-auto"
                  >
                    {feedbackSubmitting ? 'Posting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {feedbacks.map((fb) => (
                  <div key={fb._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{fb.patientName}</span>
                      <span className="text-amber-500 font-bold">{'⭐'.repeat(fb.rating)}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{fb.comment}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

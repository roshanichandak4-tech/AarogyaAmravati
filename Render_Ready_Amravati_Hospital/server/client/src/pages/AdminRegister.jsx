import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Building2, Mail, Lock, Phone, MapPin, ArrowRight } from 'lucide-react';

export const AdminRegister = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    emergencyPhone: '',
    address: '',
    bannerUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=800',
    area: 'Camp Area',
    openingTime: '08:00 AM',
    closingTime: '08:00 PM',
    specializations: ['General Medicine', 'Emergency']
  });

  const presetPhotos = [
    { label: '🏥 Modern Medical Center', url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=800' },
    { label: '🏬 Multispecialty Hospital', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800' },
    { label: '🏨 Emergency Care Center', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800' }
  ];

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(formData);
      if (res.success) {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Register New Amravati Hospital</h2>
          <p className="text-xs text-slate-500">
            Create an administrator account to digitize your hospital token queue system.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Hospital Name</label>
            <input
              type="text"
              placeholder="e.g. Sunrise Superspecialty Hospital Amravati"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Admin Email</label>
              <input
                type="email"
                placeholder="admin@sunrisehospital.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+91 721 2550011"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Emergency Casualty Hotline</label>
              <input
                type="text"
                placeholder="+91 721 2550099"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Area / Region</label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none"
              >
                <option value="Camp Area">Camp Area</option>
                <option value="Rajapeth">Rajapeth</option>
                <option value="Badnera Road">Badnera Road</option>
                <option value="Jaistambh Square">Jaistambh Square</option>
                <option value="Shivaji Nagar">Shivaji Nagar</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Address</label>
              <input
                type="text"
                placeholder="Badnera Road, Amravati"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                required
              />
            </div>
          </div>

          {/* HIGH VISIBILITY HOSPITAL PHOTO SECTION */}
          <div className="space-y-4 bg-emerald-50/90 p-5 rounded-3xl border-2 border-emerald-400 shadow-md">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-emerald-900 block text-sm flex items-center gap-2">
                <span className="text-xl">📸</span>
                <span>HOSPITAL PHOTO (Upload File or Enter Image Link)</span>
              </label>
              <span className="text-xs bg-emerald-200 text-emerald-900 font-extrabold px-3 py-1 rounded-full border border-emerald-300">
                Visible on Hospital Card
              </span>
            </div>

            <div className="space-y-3">
              {/* File Upload Option */}
              <div className="bg-white p-3.5 rounded-2xl border border-emerald-200">
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  1️⃣ Upload Photo File directly from Computer / Device:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, bannerUrl: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer shadow-xs"
                />
              </div>

              {/* Photo URL Option */}
              <div className="bg-white p-3.5 rounded-2xl border border-emerald-200">
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  2️⃣ Or Enter Direct Image Web Link / URL:
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=800"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none text-xs font-medium"
                />
              </div>

              {/* Presets */}
              <div className="bg-white p-3.5 rounded-2xl border border-emerald-200">
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  3️⃣ Or Choose a Sample Hospital Photo:
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetPhotos.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, bannerUrl: preset.url })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        formData.bannerUrl === preset.url
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Image Preview */}
            {formData.bannerUrl && (
              <div className="mt-3 relative h-40 w-full rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-900">
                <img
                  src={formData.bannerUrl}
                  alt="Hospital Photo Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=800'; }}
                />
                <div className="absolute bottom-2 left-2 px-3 py-1 rounded-xl bg-emerald-950/80 text-emerald-200 text-xs font-bold backdrop-blur-md flex items-center gap-1.5 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live Selected Hospital Photo Preview</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Hospital Profile...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/admin/login" className="font-bold text-sky-600 hover:underline">
            Log In Here
          </Link>
        </div>

      </div>
    </div>
  );
};

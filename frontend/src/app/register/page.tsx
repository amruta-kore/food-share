'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, Role } from '../context/AuthProvider';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<Role>('DONOR');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Location state (Available for DONOR & NGO)
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Browser Geolocation API to fetch GPS coordinates with instant IP fallback on timeout
  const handleUseCurrentLocation = () => {
    setGpsLoading(true);
    setGpsStatus('Detecting your location...');

    const applyCoordsAndReverseGeocode = async (lat: number, lng: number, source: 'GPS' | 'Network') => {
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
      setGpsLoading(false);
      setGpsStatus(`✓ ${source} Location Captured: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);

      // Reverse geocode via OpenStreetMap Nominatim
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.display_name) {
            setAddress(data.display_name);
          }
        }
      } catch {
        // Non-blocking reverse geocode
      }
    };

    const fallbackToIpLocation = async () => {
      setGpsStatus('Fetching network location...');
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data && data.latitude && data.longitude) {
            applyCoordsAndReverseGeocode(data.latitude, data.longitude, 'Network');
            if (data.city && !address) {
              setAddress(`${data.city}, ${data.region || ''}, ${data.country_name || ''}`);
            }
            return;
          }
        }
      } catch (_) {}

      // Final fallback if IP lookup also fails
      setGpsLoading(false);
      setGpsStatus('⚠️ Location could not be detected automatically. Please type your street address below.');
    };

    if (!navigator.geolocation) {
      fallbackToIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyCoordsAndReverseGeocode(position.coords.latitude, position.coords.longitude, 'GPS');
      },
      (err) => {
        console.warn('Browser GPS error, falling back to IP location:', err.message);
        fallbackToIpLocation();
      },
      {
        enableHighAccuracy: false, // Prevents satellite hang on PCs/laptops without GPS chip
        timeout: 6000,
        maximumAge: 60000, // Accepts cached location from last 60 seconds
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!documentFile) {
      setError('Please upload an official legal document (ID / FSSAI / NGO Registration Certificate / Driving License) for Admin verification.');
      return;
    }

    if (role === 'NGO' && !address.trim() && !latitude) {
      setError('Please provide your NGO shelter location (either by clicking "Use My Current Location" or typing an address).');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email.trim().toLowerCase());
    formData.append('password', password.trim());
    formData.append('role', role);
    if (organization) formData.append('organization', organization);
    if (phone) formData.append('phone', phone);
    if (address) formData.append('address', address);
    if (latitude) formData.append('latitude', latitude);
    if (longitude) formData.append('longitude', longitude);
    formData.append('document', documentFile);

    const res = await register(formData);
    if (!res.success) {
      setError(res.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 items-center justify-center text-2xl mb-3 shadow-inner">
            🌱
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Join AnnaSetu</h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose your role and submit legal documents for administrative verification
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('DONOR')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition ${
              role === 'DONOR'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👨‍🍳 Donor
          </button>
          <button
            type="button"
            onClick={() => setRole('NGO')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition ${
              role === 'NGO'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏢 NGO / Shelter
          </button>
          <button
            type="button"
            onClick={() => setRole('VOLUNTEER')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition ${
              role === 'VOLUNTEER'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚴 Volunteer
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2">
            <span>⚠️</span>
            <div className="flex-1">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Contact Person Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                {role === 'DONOR' ? 'Restaurant / Caterer Name' : role === 'NGO' ? 'NGO / Organization Name' : 'Vehicle Type / Handle'}
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder={role === 'DONOR' ? 'Spice Garden Banquet' : role === 'NGO' ? 'Care For All Foundation' : 'Two-Wheeler / Scooter'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
              />
            </div>
          </div>

          {/* Location Section (Available for DONOR & NGO for pickup and delivery routing) */}
          {(role === 'NGO' || role === 'DONOR') && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              role === 'DONOR' ? 'border-emerald-200 bg-emerald-50/40' : 'border-blue-200 bg-blue-50/40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📍</span>
                  <label className={`block text-xs font-bold uppercase ${
                    role === 'DONOR' ? 'text-emerald-950' : 'text-blue-950'
                  }`}>
                    {role === 'DONOR' ? 'Kitchen / Food Pickup Location' : 'Shelter Location & Delivery Destination *'}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={gpsLoading}
                  className={`px-3 py-1.5 rounded-lg text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer ${
                    role === 'DONOR' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <span>{gpsLoading ? '⏳ Fetching GPS...' : '🎯 Detect My Current Location'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-600">
                {role === 'DONOR'
                  ? 'Auto-detect or type your food pickup address. Volunteer couriers will use this to navigate to your kitchen/restaurant for food pickup.'
                  : 'Share your current shelter GPS coordinates or enter the address manually. Volunteer couriers will use this to navigate to your facility.'}
              </p>

              {gpsStatus && (
                <div className={`text-xs p-2 rounded-lg bg-white border font-medium ${
                  role === 'DONOR' ? 'border-emerald-200 text-emerald-900' : 'border-blue-200 text-blue-900'
                }`}>
                  {gpsStatus}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {role === 'DONOR' ? 'Pickup Street Address / Kitchen Location' : 'Shelter Full Street Address *'}
                </label>
                <textarea
                  rows={2}
                  required={role === 'NGO'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    role === 'DONOR'
                      ? 'e.g. Spice Garden Restaurant, Main Road, Indiranagar, Bengaluru'
                      : 'e.g. 124 Hope Foundation Shelter, 5th Cross, Indiranagar, Bengaluru'
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Latitude (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 12.9716"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Longitude (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 77.5946"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Create Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer select-none text-base"
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          {/* Legal Document Upload */}
          <div className="p-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📄</span>
              <label className="block text-xs font-bold uppercase text-emerald-900">
                Verification Legal Document (PDF or Image) *
              </label>
            </div>
            <p className="text-[11px] text-slate-600">
              {role === 'DONOR'
                ? 'Upload FSSAI License, Food Safety Certificate, or Commercial Tax ID (PDF, JPG, PNG)'
                : role === 'NGO'
                ? 'Upload 12A/80G Certificate, Trust Deed, or NGO Darpan Registration (PDF, JPG, PNG)'
                : 'Upload Government Photo ID, Driving License, or Volunteer Badge (PDF, JPG, PNG)'}
            </p>
            <input
              type="file"
              required
              accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setDocumentFile(e.target.files[0]);
                }
              }}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
            {documentFile && (
              <div className="text-[11px] text-emerald-700 font-medium">
                Selected: 📎 {documentFile.name} ({(documentFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            🛡️ <strong>Admin Verification Policy:</strong> Your account will be reviewed by the platform administrator before full access to surplus food redistribution is unlocked.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition shadow-md shadow-emerald-600/20 disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Uploading & Registering...' : `Submit Application for ${role}`}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

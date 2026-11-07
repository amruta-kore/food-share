'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, Role } from '../context/AuthProvider';
import { useLanguage } from '../context/LanguageProvider';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { register } = useAuth();
  const { language } = useLanguage();
  const isMarathi = language === 'mr';
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
    setGpsStatus(
      isMarathi ? 'तुमचे स्थान शोधत आहे...' : 'Detecting your location...'
    );

    const applyCoordsAndReverseGeocode = async (lat: number, lng: number, source: 'GPS' | 'Network') => {
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
      setGpsLoading(false);
      setGpsStatus(
        isMarathi
          ? `✓ ${source === 'GPS' ? 'GPS' : 'नेटवर्क'} स्थान मिळाले: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
          : `✓ ${source} Location Captured: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
      );

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
      setGpsStatus(isMarathi ? 'नेटवर्क स्थान शोधत आहे...' : 'Fetching network location...');
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
      setGpsStatus(
        isMarathi
          ? '⚠️ स्थान आपोआप शोधता आले नाही. कृपया खाली पत्ता मॅन्युअली टाइप करा.'
          : '⚠️ Location could not be detected automatically. Please type your street address below.'
      );
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
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 60000,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!documentFile) {
      setError(
        isMarathi
          ? 'प्रशासक पडताळणीसाठी कृपया अधिकृत कायदेशीर कागदपत्र (ID / FSSAI / संस्था नोंदणी प्रमाणपत्र / ड्रायव्हिंग लायसन्स) अपलोड करा.'
          : 'Please upload an official legal document (ID / FSSAI / NGO Registration Certificate / Driving License) for Admin verification.'
      );
      return;
    }

    if (role === 'NGO' && !address.trim() && !latitude) {
      setError(
        isMarathi
          ? 'कृपया तुमच्या शेल्टरचे स्थान द्या ("माझे चालू स्थान शोधा" वर क्लिक करा किंवा पत्ता टाइप करा).'
          : 'Please provide your NGO shelter location (either by clicking "Use My Current Location" or typing an address).'
      );
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
      setError(
        res.message ||
          (isMarathi ? 'नोंदणी अयशस्वी झाली. माहिती पुन्हा तपासा.' : 'Registration failed')
      );
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
          <h1 className="text-2xl font-bold text-slate-900">
            {isMarathi ? 'अन्नसेतूशी जोडा' : 'Join AnnaSetu'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isMarathi
              ? 'तुमची भूमिका निवडा आणि प्रशासकीय पडताळणीसाठी कायदेशीर कागदपत्रे जोडा'
              : 'Choose your role and submit legal documents for administrative verification'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('DONOR')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition cursor-pointer ${
              role === 'DONOR'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMarathi ? '🍲 अन्नदाता' : '🍲 Donor'}
          </button>
          <button
            type="button"
            onClick={() => setRole('NGO')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition cursor-pointer ${
              role === 'NGO'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMarathi ? '🏢 संस्था / शेल्टर' : '🏢 NGO / Shelter'}
          </button>
          <button
            type="button"
            onClick={() => setRole('VOLUNTEER')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition cursor-pointer ${
              role === 'VOLUNTEER'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMarathi ? '🚴 स्वयंसेवक' : '🚴 Volunteer'}
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
                {isMarathi ? 'संपर्क व्यक्तीचे नाव *' : 'Contact Person Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isMarathi ? 'उदा. राहुल पाटील' : 'John Doe'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                {role === 'DONOR'
                  ? isMarathi
                    ? 'हॉटेल / केटररचे नाव'
                    : 'Restaurant / Caterer Name'
                  : role === 'NGO'
                  ? isMarathi
                    ? 'संस्था / फाउंडेशनचे नाव'
                    : 'NGO / Organization Name'
                  : isMarathi
                  ? 'वाहन प्रकार / ओळख'
                  : 'Vehicle Type / Handle'}
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder={
                  role === 'DONOR'
                    ? isMarathi
                      ? 'उदा. स्पाइस गार्डन बँक्वेट'
                      : 'Spice Garden Banquet'
                    : role === 'NGO'
                    ? isMarathi
                      ? 'उदा. सेवा फाउंडेशन निवारा'
                      : 'Care For All Foundation'
                    : isMarathi
                    ? 'उदा. दुचाकी / स्कूटर'
                    : 'Two-Wheeler / Scooter'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                {isMarathi ? 'ईमेल पत्ता *' : 'Email Address *'}
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
                {isMarathi ? 'फोन नंबर' : 'Phone Number'}
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
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                role === 'DONOR'
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : 'border-blue-200 bg-blue-50/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📍</span>
                  <label
                    className={`block text-xs font-bold uppercase ${
                      role === 'DONOR' ? 'text-emerald-950' : 'text-blue-950'
                    }`}
                  >
                    {role === 'DONOR'
                      ? isMarathi
                        ? 'स्वयंपाकघर / अन्न पिकअप पत्ता'
                        : 'Kitchen / Food Pickup Location'
                      : isMarathi
                      ? 'शेल्टर पत्ता आणि अन्न पोहोचवण्याचे ठिकाण *'
                      : 'Shelter Location & Delivery Destination *'}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={gpsLoading}
                  className={`px-3 py-1.5 rounded-lg text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer ${
                    role === 'DONOR'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <span>
                    {gpsLoading
                      ? isMarathi
                        ? 'स्थान शोधत आहे...'
                        : 'Fetching GPS...'
                      : isMarathi
                      ? '🎯 माझे चालू स्थान शोधा'
                      : '🎯 Detect My Current Location'}
                  </span>
                </button>
              </div>

              <p className="text-[11px] text-slate-600">
                {role === 'DONOR'
                  ? isMarathi
                    ? 'अन्न पिकअप पत्ता प्रविष्ट करा किंवा आपोआप शोधा. स्वयंसेवक अन्न घेण्यासाठी या पत्त्यावर येतील.'
                    : 'Auto-detect or type your food pickup address. Volunteer couriers will use this to navigate to your kitchen/restaurant for food pickup.'
                  : isMarathi
                  ? 'तुमच्या निवाऱ्याचे GPS स्थान निवडा किंवा पत्ता टाका. स्वयंसेवक येथे अन्न पोहोचवतील.'
                  : 'Share your current shelter GPS coordinates or enter the address manually. Volunteer couriers will use this to navigate to your facility.'}
              </p>

              {gpsStatus && (
                <div
                  className={`text-xs p-2 rounded-lg bg-white border font-medium ${
                    role === 'DONOR'
                      ? 'border-emerald-200 text-emerald-900'
                      : 'border-blue-200 text-blue-900'
                  }`}
                >
                  {gpsStatus}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {role === 'DONOR'
                    ? isMarathi
                      ? 'पिकअप रस्त्याचा पत्ता / स्वयंपाकघर स्थान'
                      : 'Pickup Street Address / Kitchen Location'
                    : isMarathi
                    ? 'निवारा संपूर्ण पत्ता *'
                    : 'Shelter Full Street Address *'}
                </label>
                <textarea
                  rows={2}
                  required={role === 'NGO'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    role === 'DONOR'
                      ? isMarathi
                        ? 'उदा. स्पाइस गार्डन रेस्टॉरंट, फर्ग्युसन कॉलेज रोड, पुणे'
                        : 'e.g. Spice Garden Restaurant, FC Road, Pune'
                      : isMarathi
                      ? 'उदा. १२४ सेवा फाऊंडेशन शेल्टर, कर्वे नगर, पुणे'
                      : 'e.g. 124 Seva Foundation Shelter, Karve Nagar, Pune'
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {isMarathi ? 'अक्षांश (Latitude GPS)' : 'Latitude (GPS)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 18.5204"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {isMarathi ? 'रेखांश (Longitude GPS)' : 'Longitude (GPS)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 73.8567"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              {isMarathi ? 'पासवर्ड तयार करा *' : 'Create Password *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isMarathi ? 'किमान ६ अक्षरे' : 'Minimum 6 characters'}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={
                  isMarathi
                    ? showPassword
                      ? 'पासवर्ड लपवा'
                      : 'पासवर्ड दाखवा'
                    : showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
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
                {isMarathi
                  ? 'पडताळणी कायदेशीर कागदपत्र (PDF किंवा फोटो) *'
                  : 'Verification Legal Document (PDF or Image) *'}
              </label>
            </div>
            <p className="text-[11px] text-slate-600">
              {role === 'DONOR'
                ? isMarathi
                  ? 'FSSAI परवाना, अन्न सुरक्षा प्रमाणपत्र किंवा कर नोंदणी (PDF, JPG, PNG)'
                  : 'Upload FSSAI License, Food Safety Certificate, or Commercial Tax ID (PDF, JPG, PNG)'
                : role === 'NGO'
                ? isMarathi
                  ? '१२A/८०G प्रमाणपत्र, ट्रस्ट डीड किंवा NGO दर्पण नोंदणी (PDF, JPG, PNG)'
                  : 'Upload 12A/80G Certificate, Trust Deed, or NGO Darpan Registration (PDF, JPG, PNG)'
                : isMarathi
                ? 'शासकीय ओळखपत्र, ड्रायव्हिंग लायसन्स किंवा स्वयंसेवक बॅज (PDF, JPG, PNG)'
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
                {isMarathi ? 'निवडलेली फाईल: ' : 'Selected: '} 📄 {documentFile.name} (
                {(documentFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            🛡️ <strong>{isMarathi ? 'प्रशासक पडताळणी धोरण:' : 'Admin Verification Policy:'}</strong>{' '}
            {isMarathi
              ? 'अन्न पुनर्वितरणाचे पूर्ण अधिकार मिळण्यापूर्वी प्लॅटफॉर्म प्रशासकाद्वारे तुमच्या खात्याची व कागदपत्रांची पडताळणी केली जाईल.'
              : 'Your account will be reviewed by the platform administrator before full access to surplus food redistribution is unlocked.'}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition shadow-md shadow-emerald-600/20 disabled:opacity-50 text-sm mt-2 cursor-pointer"
          >
            {loading
              ? isMarathi
                ? 'कागदपत्रे अपलोड आणि नोंदणी होत आहे...'
                : 'Uploading & Registering...'
              : isMarathi
              ? `${role === 'DONOR' ? 'अन्नदाता' : role === 'NGO' ? 'संस्था / निवारा' : 'स्वयंसेवक'} म्हणून अर्ज सादर करा`
              : `Submit Application for ${role}`}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          {isMarathi ? 'आधीच खाते आहे का? ' : 'Already have an account? '}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 underline">
            {isMarathi ? 'साइन इन करा' : 'Sign in'}
          </Link>
        </div>
      </div>
    </div>
  );
}

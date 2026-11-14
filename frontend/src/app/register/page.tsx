'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, Role } from '../context/AuthProvider';
import { useLanguage } from '../context/LanguageProvider';
import { useRouter } from 'next/navigation';
import {
  BrandLogoIcon,
  UtensilsIcon,
  BuildingIcon,
  TruckIcon,
  MapPinIcon,
  CrosshairIcon,
  EyeIcon,
  EyeOffIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  FileTextIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '../../components/Icons';

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
      isMarathi ? 'तुमचे स्थान शोधत आहे...' : 'Detecting your coordinates...'
    );

    const applyCoordsAndReverseGeocode = async (lat: number, lng: number, source: 'GPS' | 'Network') => {
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
      setGpsLoading(false);
      setGpsStatus(
        isMarathi
          ? `✓ ${source === 'GPS' ? 'GPS' : 'नेटवर्क'} स्थान मिळाले: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
          : `✓ ${source} Location Locked: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
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
      setGpsStatus(isMarathi ? 'नेटवर्क स्थान शोधत आहे...' : 'Fetching network coordinates...');
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
          ? 'स्थान आपोआप शोधता आले नाही. कृपया खाली पत्ता मॅन्युअली टाइप करा.'
          : 'Location could not be auto-detected. Please type your street address below.'
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
          ? 'कृपया तुमच्या शेल्टरचे स्थान द्या ("चालू स्थान शोधा" वर क्लिक करा किंवा पत्ता टाइप करा).'
          : 'Please provide your NGO shelter location (either by clicking "Locate GPS Coordinates" or typing an address).'
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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-grid-subtle">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-crafted border border-stone-200/90 p-7 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 items-center justify-center border border-emerald-200/70 shadow-xs mb-1">
            <BrandLogoIcon className="text-2xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
            {isMarathi ? 'अन्नसेतूशी जोडा' : 'Join AnnaSetu Platform'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-normal max-w-md mx-auto">
            {isMarathi
              ? 'तुमची भूमिका निवडा आणि अधिकृत पडताळणीसाठी कायदेशीर कागदपत्रे सादर करा'
              : 'Choose your stakeholder role and provide official verification documents'}
          </p>
        </div>

        {/* Role Selector Tabs (Font Awesome Icons) */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-stone-100/80 rounded-2xl border border-stone-200">
          <button
            type="button"
            onClick={() => setRole('DONOR')}
            className={`py-2.5 px-3 rounded-xl transition flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 cursor-pointer ${
              role === 'DONOR'
                ? 'bg-white text-emerald-900 font-bold shadow-xs border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-950 font-medium'
            }`}
          >
            <i className={`fa-solid fa-utensils ${role === 'DONOR' ? 'text-emerald-700' : 'text-stone-400'}`} />
            <span className="text-xs">{isMarathi ? 'अन्नदाता' : 'Donor'}</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('NGO')}
            className={`py-2.5 px-3 rounded-xl transition flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 cursor-pointer ${
              role === 'NGO'
                ? 'bg-white text-cyan-950 font-bold shadow-xs border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-950 font-medium'
            }`}
          >
            <i className={`fa-solid fa-hand-holding-heart ${role === 'NGO' ? 'text-cyan-700' : 'text-stone-400'}`} />
            <span className="text-xs">{isMarathi ? 'संस्था / निवारा' : 'NGO Shelter'}</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('VOLUNTEER')}
            className={`py-2.5 px-3 rounded-xl transition flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 cursor-pointer ${
              role === 'VOLUNTEER'
                ? 'bg-white text-amber-950 font-bold shadow-xs border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-950 font-medium'
            }`}
          >
            <i className={`fa-solid fa-truck-fast ${role === 'VOLUNTEER' ? 'text-amber-700' : 'text-stone-400'}`} />
            <span className="text-xs">{isMarathi ? 'स्वयंसेवक' : 'Volunteer'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2 shadow-xs">
            <i className="fa-solid fa-triangle-exclamation fa-beat text-rose-600 text-sm mt-0.5 shrink-0" />
            <div className="flex-1 font-medium leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                <i className="fa-solid fa-user mr-1.5 text-stone-400" />
                <span>{isMarathi ? 'संपर्क व्यक्तीचे नाव *' : 'Contact Person Name *'}</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isMarathi ? 'उदा. राहुल पाटील' : 'e.g. Rahul Patil'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 text-sm bg-stone-50/40 text-stone-900 transition font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                <i className="fa-solid fa-building mr-1.5 text-stone-400" />
                <span>
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
                </span>
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder={
                  role === 'DONOR'
                    ? isMarathi
                      ? 'उदा. स्पाइस गार्डन बँक्वेट'
                      : 'e.g. Spice Garden Banquets'
                    : role === 'NGO'
                    ? isMarathi
                      ? 'उदा. सेवा फाउंडेशन निवारा'
                      : 'e.g. Seva Foundation Shelter'
                    : isMarathi
                    ? 'उदा. दुचाकी / स्कूटर'
                    : 'e.g. Two-Wheeler / Courier Van'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 text-sm bg-stone-50/40 text-stone-900 transition font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                <i className="fa-solid fa-envelope mr-1.5 text-stone-400" />
                <span>{isMarathi ? 'ईमेल पत्ता *' : 'Email Address *'}</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@organization.org"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 text-sm bg-stone-50/40 text-stone-900 transition font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                <i className="fa-solid fa-phone mr-1.5 text-stone-400" />
                <span>{isMarathi ? 'फोन नंबर' : 'Phone Number'}</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 text-sm bg-stone-50/40 text-stone-900 transition font-medium"
              />
            </div>
          </div>

          {/* Location Section */}
          {(role === 'NGO' || role === 'DONOR') && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border space-y-3 transition-colors ${
                role === 'DONOR'
                  ? 'border-emerald-200/90 bg-emerald-50/30'
                  : 'border-cyan-200/90 bg-cyan-50/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <i className={`fa-solid fa-location-dot ${role === 'DONOR' ? 'text-emerald-700' : 'text-cyan-700'}`} />
                  <label
                    className={`block text-[11px] font-bold uppercase tracking-wider ${
                      role === 'DONOR' ? 'text-emerald-950' : 'text-cyan-950'
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
                  className={`px-3 py-1.5 rounded-xl text-white font-bold text-xs transition inline-flex items-center justify-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer ${
                    role === 'DONOR'
                      ? 'bg-emerald-800 hover:bg-emerald-700'
                      : 'bg-cyan-800 hover:bg-cyan-700'
                  }`}
                >
                  <i className={gpsLoading ? 'fa-solid fa-circle-notch fa-spin text-xs' : 'fa-solid fa-crosshairs text-xs'} />
                  <span>
                    {gpsLoading
                      ? isMarathi
                        ? 'स्थान शोधत आहे...'
                        : 'Detecting Coordinates...'
                      : isMarathi
                      ? 'चालू GPS स्थान मिळवा'
                      : 'Locate GPS Coordinates'}
                  </span>
                </button>
              </div>

              <p className="text-[11px] text-stone-600 leading-relaxed">
                {role === 'DONOR'
                  ? isMarathi
                    ? 'अन्न पिकअप पत्ता प्रविष्ट करा किंवा आपोआप शोधा. स्वयंसेवक अन्न घेण्यासाठी या पत्त्यावर येतील.'
                    : 'Auto-detect or type your food pickup address. Volunteer couriers will use this to navigate to your kitchen for pickup.'
                  : isMarathi
                  ? 'तुमच्या निवाऱ्याचे GPS स्थान निवडा किंवा पत्ता टाका. स्वयंसेवक येथे अन्न पोहोचवतील.'
                  : 'Share your shelter GPS coordinates or enter the address manually. Volunteers will deliver food here.'}
              </p>

              {gpsStatus && (
                <div
                  className={`text-xs p-2.5 rounded-xl bg-white/90 border font-medium flex items-center space-x-2 ${
                    role === 'DONOR'
                      ? 'border-emerald-200 text-emerald-900'
                      : 'border-cyan-200 text-cyan-900'
                  }`}
                >
                  <i className="fa-solid fa-circle-check text-emerald-700 text-xs shrink-0" />
                  <span>{gpsStatus}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
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
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 text-xs bg-white text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    {isMarathi ? 'अक्षांश (Latitude GPS)' : 'Latitude (GPS)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 18.5204"
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 text-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    {isMarathi ? 'रेखांश (Longitude GPS)' : 'Longitude (GPS)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 73.8567"
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 text-xs bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              <i className="fa-solid fa-key mr-1.5 text-stone-400" />
              <span>{isMarathi ? 'पासवर्ड तयार करा *' : 'Create Password *'}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isMarathi ? 'किमान ६ अक्षरे' : 'Minimum 6 characters'}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 text-sm bg-stone-50/40 text-stone-900 font-mono tracking-wider transition"
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
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer select-none text-sm"
              >
                <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
              </button>
            </div>
          </div>

          {/* Legal Document Upload Box (Font Awesome File & Upload Icons) */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/30 space-y-2">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-file-shield text-emerald-800 text-sm" />
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-950">
                {isMarathi
                  ? 'पडताळणी कायदेशीर कागदपत्र (PDF किंवा फोटो) *'
                  : 'Verification Legal Document (PDF or Photo) *'}
              </label>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed font-normal">
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
              className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-800 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
            {documentFile && (
              <div className="text-[11px] text-emerald-900 font-semibold flex items-center space-x-1.5 pt-1">
                <i className="fa-solid fa-circle-check text-emerald-700 text-xs" />
                <span>
                  {isMarathi ? 'निवडलेली फाईल: ' : 'Selected: '} {documentFile.name} (
                  {(documentFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-stone-600 bg-stone-100/70 p-3.5 rounded-xl border border-stone-200/80 flex items-start space-x-2">
            <i className="fa-solid fa-shield-halved text-emerald-800 text-sm mt-0.5 shrink-0" />
            <div className="leading-relaxed font-normal">
              <strong>{isMarathi ? 'प्रशासक पडताळणी धोरण:' : 'Platform Safety Policy:'}</strong>{' '}
              {isMarathi
                ? 'अन्न पुनर्वितरणाचे पूर्ण अधिकार मिळण्यापूर्वी प्लॅटफॉर्म प्रशासकाद्वारे तुमच्या खात्याची व कागदपत्रांची पडताळणी केली जाईल.'
                : 'Your submission will be reviewed and verified by an authorized platform administrator before donations and collections are unlocked.'}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-emerald-800 hover:bg-emerald-700 active:scale-[0.99] transition shadow-xs disabled:opacity-50 text-sm mt-3 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin text-sm" />
                <span>
                  {isMarathi
                    ? 'कागदपत्रे अपलोड आणि नोंदणी होत आहे...'
                    : 'Uploading & Registering Account...'}
                </span>
              </>
            ) : (
              <>
                <span>
                  {isMarathi
                    ? `${role === 'DONOR' ? 'अन्नदाता' : role === 'NGO' ? 'संस्था / निवारा' : 'स्वयंसेवक'} म्हणून अर्ज सादर करा`
                    : `Submit Verified Application for ${role}`}
                </span>
                <i className="fa-solid fa-arrow-right text-xs" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-3 border-t border-stone-200/80">
          {isMarathi ? 'आधीच खाते आहे का? ' : 'Already have an account? '}
          <Link href="/login" className="font-bold text-emerald-800 hover:text-emerald-900 underline underline-offset-2">
            {isMarathi ? 'साइन इन करा' : 'Sign in directly'}
          </Link>
        </div>
      </div>
    </div>
  );
}

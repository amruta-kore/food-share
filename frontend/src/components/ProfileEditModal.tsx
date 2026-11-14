'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, User } from '../app/context/AuthProvider';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (updatedUser: User) => void;
}

export default function ProfileEditModal({ isOpen, onClose, onUpdated }: ProfileEditModalProps) {
  const { user, setUserDirectly } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Password Change State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Document Upload State
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [newDocPreview, setNewDocPreview] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  // Status State
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize form fields when modal opens or user changes
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setOrganization(user.organization || '');
      setAddress(user.address || '');
      setLatitude(user.latitude !== null && user.latitude !== undefined ? String(user.latitude) : '');
      setLongitude(user.longitude !== null && user.longitude !== undefined ? String(user.longitude) : '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      setNewDocFile(null);
      setNewDocPreview(null);
      setDocError(null);
      setError(null);
      setSuccessMsg(null);
      setGpsStatus(null);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const getApiUrl = (endpoint: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (base && typeof window !== 'undefined') {
      return `${base}${endpoint}`;
    }
    return endpoint;
  };

  // Browser Geolocation with Network / IP fallback
  const handleDetectLocation = () => {
    setGpsLoading(true);
    setGpsStatus('Detecting your GPS location...');
    setError(null);

    const applyCoordsAndReverseGeocode = async (lat: number, lng: number, source: string) => {
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
      setGpsLoading(false);
      setGpsStatus(`✓ ${source} captured: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.display_name && !address.trim()) {
            setAddress(data.display_name);
          }
        }
      } catch {
        // Non-blocking reverse geocoding
      }
    };

    const fallbackToIp = async () => {
      setGpsStatus('Trying network location...');
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data?.latitude && data?.longitude) {
            applyCoordsAndReverseGeocode(data.latitude, data.longitude, 'Network IP');
            if (data.city && !address.trim()) {
              setAddress(`${data.city}, ${data.region || ''}, ${data.country_name || ''}`);
            }
            return;
          }
        }
      } catch (_) {}
      setGpsLoading(false);
      setGpsStatus('Could not detect location. Please enter coordinates manually.');
    };

    if (!navigator.geolocation) {
      fallbackToIp();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => applyCoordsAndReverseGeocode(pos.coords.latitude, pos.coords.longitude, 'Browser GPS'),
      (err) => {
        console.warn('GPS error, falling back to IP:', err.message);
        fallbackToIp();
      },
      { timeout: 6000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  };

  // Document file selection handler
  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setDocError('File size exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setDocError('Only PDF, JPG, PNG, and WEBP files are accepted.');
      return;
    }

    setNewDocFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setNewDocPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (showPasswordChange && newPassword.trim()) {
      if (!currentPassword) {
        setError('Please enter your current password to set a new password.');
        return;
      }
      if (newPassword.trim().length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword.trim() !== confirmPassword.trim()) {
        setError('New password and confirmation do not match.');
        return;
      }
    }

    setSaving(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        setSaving(false);
        return;
      }

      const payload: Record<string, any> = {
        name: name.trim(),
        phone: phone.trim(),
        organization: organization.trim(),
        address: address.trim(),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      };

      if (showPasswordChange && newPassword.trim()) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword.trim();
      }

      const res = await fetch(getApiUrl('/api/auth/profile'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payload,
          ...(newDocFile && newDocPreview ? { documentUrl: newDocPreview, documentType: newDocFile.type, documentName: newDocFile.name } : {}),
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUserDirectly(data.user);
        onUpdated?.(data.user);
        const docChanged = !!(newDocFile && newDocPreview);
        setSuccessMsg(
          docChanged
            ? 'Profile updated! Your new document is submitted for admin review. Verification status is now Pending.'
            : 'Profile updated successfully!'
        );
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordChange(false);
        setNewDocFile(null);
        setNewDocPreview(null);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(data.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setError(err?.message || 'Server connection error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'DONOR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'NGO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'VOLUNTEER':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-circle-user text-xl text-emerald-400" />
              <h2 className="text-xl font-bold font-serif">Edit Profile & Account Settings</h2>
            </div>
            <p className="text-xs text-stone-300">
              Update your contact details, organization name, address, and password
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getRoleBadge(user.role)}`}>
                {user.role}
              </span>
              {user.verified ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-flex items-center space-x-1">
                  <i className="fa-solid fa-circle-check text-[10px]" />
                  <span>Verified Account</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 inline-flex items-center space-x-1">
                  <i className="fa-solid fa-hourglass-half text-[10px]" />
                  <span>Verification Pending</span>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-stone-400 hover:text-white rounded-lg text-base font-bold transition cursor-pointer"
            title="Close modal"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <i className="fa-solid fa-triangle-exclamation text-rose-600 text-sm shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
              <i className="fa-solid fa-circle-check text-emerald-700 text-sm shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Basic & Contact Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              1. Basic & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address <span className="text-stone-400 text-[10px] font-normal">(Login Identifier)</span>
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  title="Registered login email cannot be changed"
                  className="w-full px-3.5 py-2 text-xs border border-stone-200 rounded-xl bg-stone-100 text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {user.role === 'DONOR'
                    ? 'Restaurant / Kitchen / Donor Name'
                    : user.role === 'NGO'
                    ? 'NGO / Shelter Name'
                    : user.role === 'VOLUNTEER'
                    ? 'Volunteer Team / Vehicle Mode'
                    : 'Department / Organization'}
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder={
                    user.role === 'DONOR'
                      ? 'e.g. Grand Regency Banquets'
                      : user.role === 'NGO'
                      ? 'e.g. Hope Shelter Foundation'
                      : 'e.g. Two-Wheeler Courier / Individual'
                  }
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Operating Address & GPS */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                2. Operating Location & Address
              </h3>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={gpsLoading}
                className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
              >
                <i className={gpsLoading ? 'fa-solid fa-circle-notch fa-spin text-xs' : 'fa-solid fa-crosshairs text-xs'} />
                <span>{gpsLoading ? 'Detecting...' : 'Auto-Detect Current GPS'}</span>
              </button>
            </div>

            {gpsStatus && (
              <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200 flex items-center space-x-1.5">
                <i className="fa-solid fa-location-dot text-emerald-700 text-xs" />
                <span>{gpsStatus}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Street Address / Landmark
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Building, street, landmark, area, city"
                className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 18.5204"
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-700/30 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 73.8567"
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-700/30 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Security & Password Change */}
          <div className="pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="w-full py-2 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center space-x-1.5">
                <i className="fa-solid fa-lock text-stone-500 text-xs" />
                <span>Change Account Password (Optional)</span>
              </span>
              <i className={showPasswordChange ? 'fa-solid fa-chevron-up text-xs text-stone-500' : 'fa-solid fa-chevron-down text-xs text-stone-500'} />
            </button>

            {showPasswordChange && (
              <div className="mt-3 p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3.5 top-2.5 text-xs text-stone-400 hover:text-stone-600"
                    >
                      <i className={showCurrentPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      New Password (min 6 chars) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 pr-10 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3.5 top-2.5 text-xs text-stone-400 hover:text-stone-600"
                      >
                        <i className={showNewPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Update Legal Document */}
          {user.role !== 'ADMIN' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center space-x-1.5">
                <i className="fa-solid fa-file-shield text-emerald-800 text-xs" />
                <span>Legal Verification Document</span>
              </h3>

              {/* Current document */}
              {user.documentUrl && !newDocPreview && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 border border-sky-200">
                  <div className="flex items-center space-x-2 min-w-0">
                    <i className={user.documentType?.startsWith('image') ? 'fa-solid fa-file-image text-sky-700 text-lg' : 'fa-solid fa-file-pdf text-sky-700 text-lg'} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-sky-950 truncate">{user.documentName || 'Uploaded Document'}</p>
                      <p className="text-[11px] text-sky-700">
                        {user.verified ? '✓ Verified by platform admin' : '⏳ Pending admin verification'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={user.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sky-800 font-semibold hover:underline flex-shrink-0 ml-2 inline-flex items-center space-x-1"
                  >
                    <span>View</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                  </a>
                </div>
              )}

              {/* New document preview */}
              {newDocPreview && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-emerald-900">New document ready to upload:</p>
                    <button
                      type="button"
                      onClick={() => { setNewDocFile(null); setNewDocPreview(null); setDocError(null); }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer inline-flex items-center space-x-1"
                    >
                      <i className="fa-solid fa-xmark text-xs" />
                      <span>Remove</span>
                    </button>
                  </div>
                  {newDocFile?.type.startsWith('image') ? (
                    <img src={newDocPreview} alt="Preview" className="max-h-32 rounded-lg object-contain border border-emerald-200" />
                  ) : (
                    <div className="flex items-center space-x-2 text-emerald-900">
                      <i className="fa-solid fa-file-lines text-lg" />
                      <span className="text-xs font-medium truncate">{newDocFile?.name}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-amber-800 mt-2 font-medium">
                    ⚠️ Uploading a new document will reset your verification status to "Pending Review".
                  </p>
                </div>
              )}

              {/* Upload button */}
              <div>
                <label
                  htmlFor="doc-upload-input"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-xs font-semibold text-stone-700 cursor-pointer transition"
                >
                  <i className="fa-solid fa-paperclip text-stone-500" />
                  <span>{newDocFile ? 'Change Selected File' : user.documentUrl ? 'Replace Document' : 'Upload Document'}</span>
                </label>
                <input
                  id="doc-upload-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleDocFileChange}
                  className="hidden"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Accepted: JPG, PNG, WEBP, PDF · Max 5 MB. Admin will re-verify after upload.
                </p>
              </div>

              {docError && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2">
                  {docError}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk text-xs" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

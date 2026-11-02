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
            applyCoordsAndReverseGeocode(data.latitude, data.longitude, 'Network Location');
            if (data.city && !address.trim()) {
              setAddress(`${data.city}, ${data.region || ''}, ${data.country_name || ''}`);
            }
            return;
          }
        }
      } catch (_) {}
      setGpsLoading(false);
      setGpsStatus('⚠️ Could not auto-detect location. Please type your street address below.');
    };

    if (!navigator.geolocation) {
      fallbackToIp();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => applyCoordsAndReverseGeocode(pos.coords.latitude, pos.coords.longitude, 'GPS Location'),
      () => fallbackToIp(),
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }

    if (showPasswordChange && newPassword) {
      if (!currentPassword) {
        setError('Please enter your current password to set a new password.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirmation do not match.');
        return;
      }
    }

    setSaving(true);
    const token = localStorage.getItem('accessToken');

    try {
      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
        organization: organization.trim(),
        address: address.trim(),
        latitude: latitude.trim(),
        longitude: longitude.trim(),
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
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUserDirectly(data.user);
        onUpdated?.(data.user);
        setSuccessMsg('✓ Profile information updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordChange(false);
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
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👤</span>
              <h2 className="text-xl font-bold">Edit Profile & Account Settings</h2>
            </div>
            <p className="text-xs text-slate-300">
              Update your contact details, organization name, address, and password
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getRoleBadge(user.role)}`}>
                {user.role}
              </span>
              {user.verified ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  ✓ Verified Account
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  ⏳ Verification Pending
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg text-lg font-bold transition"
            title="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
              <span>✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Basic & Contact Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Basic & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-slate-400 text-[10px] font-normal">(Login Identifier)</span>
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  title="Registered login email cannot be changed"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Operating Address & GPS */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Operating Location & Address
              </h3>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={gpsLoading}
                className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center space-x-1 cursor-pointer"
              >
                <span>{gpsLoading ? '⏳' : '📍'}</span>
                <span>{gpsLoading ? 'Detecting...' : 'Auto-Detect Current GPS'}</span>
              </button>
            </div>

            {gpsStatus && (
              <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                {gpsStatus}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street Address / Landmark
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Building, street, landmark, area, city"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 18.5204"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 73.8567"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Security & Password Change */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center space-x-1.5">
                <span>🔐</span>
                <span>Change Account Password (Optional)</span>
              </span>
              <span>{showPasswordChange ? '▲ Hide' : '▼ Expand'}</span>
            </button>

            {showPasswordChange && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPass ? '👁️' : '🔒'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password (min 6 chars) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                      >
                        {showNewPass ? '👁️' : '🔒'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-xl transition shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
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


'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '../../components/RoleGuard';
import CountdownTimer from '../../components/CountdownTimer';

interface Donation {
  id: number;
  foodName: string;
  category: string;
  isVegetarian: boolean;
  quantity: number;
  servings: number;
  preparedAt: string;
  consumeBefore: string;
  storage: string;
  imageUrl?: string | null;
  pickupAddress: string;
  city: string;
  area: string;
  contactPerson: string;
  contactPhone: string;
  status: string;
  createdAt: string;
  request?: {
    id: number;
    quantity: number;
    status: string;
    notes?: string;
    ngo: {
      id: number;
      name: string;
      organization?: string;
      email: string;
      phone?: string;
    };
  } | null;
  volunteer?: {
    id: number;
    name: string;
    phone?: string;
  } | null;
}

function DonorDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form State
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [quantity, setQuantity] = useState('');
  const [servings, setServings] = useState('');
  const [storage, setStorage] = useState('Room Temperature');
  const [pickupAddress, setPickupAddress] = useState('');
  const [city, setCity] = useState('Pune');
  const [area, setArea] = useState('Kothrud');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Expiry Date & Time State (Default 6 hours from current time)
  const getDefaultExpiryTime = () => {
    const d = new Date(Date.now() + 6 * 3600 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const [consumeBefore, setConsumeBefore] = useState(getDefaultExpiryTime());

  // Food Image State
  const [foodImageFile, setFoodImageFile] = useState<File | null>(null);
  const [foodImagePreview, setFoodImagePreview] = useState<string | null>(null);
  const [imageCompressing, setImageCompressing] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const loadDonations = async (isInitial = false) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      if (isInitial) setFetching(false);
      return;
    }
    try {
      const res = await fetch('/api/donor/my-donations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDonations(data);
      }
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      if (isInitial) setFetching(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'DONOR') {
      loadDonations(true);
      if (user.name) setContactPerson(user.name);
      if (user.phone) setContactPhone(user.phone);
    }
  }, [user]);

  // Client-side image optimization to ensure fast uploads even for 48MP phone cameras
  const compressImage = async (file: File): Promise<File> => {
    if (file.size <= 1.5 * 1024 * 1024) return file;
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIM = 1920;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressed);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85
          );
        } catch {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setActionError('Please select a valid image file (JPG, PNG, WEBP).');
        return;
      }
      setActionError(null);
      setImageCompressing(true);
      try {
        const processedFile = await compressImage(file);
        setFoodImageFile(processedFile);
        const previewUrl = URL.createObjectURL(processedFile);
        setFoodImagePreview(previewUrl);
      } catch {
        setFoodImageFile(file);
        setFoodImagePreview(URL.createObjectURL(file));
      } finally {
        setImageCompressing(false);
      }
    }
  };

  const clearImage = () => {
    setFoodImageFile(null);
    if (foodImagePreview) URL.revokeObjectURL(foodImagePreview);
    setFoodImagePreview(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setSubmitting(true);
    const token = localStorage.getItem('accessToken');

    try {
      const formData = new FormData();
      formData.append('foodName', foodName);
      formData.append('category', category);
      formData.append('isVegetarian', String(isVegetarian));
      formData.append('quantity', quantity);
      formData.append('servings', servings);
      formData.append('storage', storage);
      formData.append('pickupAddress', pickupAddress);
      formData.append('city', city);
      formData.append('area', area);
      formData.append('contactPerson', contactPerson);
      formData.append('contactPhone', contactPhone);
      formData.append('consumeBefore', new Date(consumeBefore).toISOString());
      if (foodImageFile) {
        formData.append('image', foodImageFile);
      }

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setShowCreateModal(false);
        // Reset form
        setFoodName('');
        setQuantity('');
        setServings('');
        setPickupAddress('');
        setConsumeBefore(getDefaultExpiryTime());
        clearImage();
        loadDonations(false);
      } else {
        setActionError(data.error || data.message || 'Failed to post donation');
      }
    } catch (err: any) {
      setActionError(err?.message || 'Error communicating with server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`/api/donor/accept-request/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadDonations(false);
      } else {
        alert('Failed to accept request');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`/api/donor/reject-request/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadDonations(false);
      } else {
        alert('Failed to reject request');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REQUESTED':
        return 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse';
      case 'ACCEPTED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'VOLUNTEER_ASSIGNED':
      case 'PICKED_UP':
      case 'OUT_FOR_DELIVERY':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading donor portal...</p>
      </div>
    );
  }

  const totalServings = donations.reduce((sum, d) => sum + (d.servings || 0), 0);
  const activeCount = donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'REQUESTED').length;
  const pendingRequests = donations.filter((d) => d.status === 'REQUESTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Unverified Notice Banner */}
      {!user?.verified && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start space-x-3 text-amber-900 shadow-xs">
          <span className="text-xl">⏳</span>
          <div className="text-xs">
            <h3 className="font-bold text-sm">Account Awaiting Administrative Verification</h3>
            <p className="mt-0.5 text-amber-800">
              Your registration and legal documents are currently being inspected by platform administrators. Once verified, you will be able to post surplus food donations and connect with NGOs.
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <div>
          <span className="px-3 py-1 bg-white/20 text-xs font-semibold uppercase tracking-wider rounded-full backdrop-blur-xs">
            👨‍🍳 Donor Portal {user?.verified ? '• Verified ✓' : '• Verification Pending ⏳'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Welcome, {user?.name}</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            {user?.organization || 'Caterer / Restaurant'} • Manage your surplus food donations and review requests
          </p>
        </div>

        <button
          onClick={() => {
            if (!user?.verified) {
              alert('Your account is awaiting administrative verification. You will be able to post donations once verified.');
              return;
            }
            setShowCreateModal(true);
          }}
          className={`self-start sm:self-auto px-5 py-3 rounded-xl font-bold transition shadow-md flex items-center space-x-2 text-sm ${
            user?.verified
              ? 'bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95'
              : 'bg-emerald-700/60 text-emerald-200 cursor-not-allowed opacity-80'
          }`}
        >
          <span>➕</span>
          <span>Post Surplus Food</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold shrink-0">
            🍲
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalServings}</div>
            <div className="text-xs text-slate-500 font-medium">Estimated Meals Saved</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold shrink-0">
            📦
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{activeCount}</div>
            <div className="text-xs text-slate-500 font-medium">Active Food Listings</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold shrink-0">
            🔔
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{pendingRequests}</div>
            <div className="text-xs text-slate-500 font-medium">Pending NGO Requests</div>
          </div>
        </div>
      </div>

      {/* Donations List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Your Surplus Food Donations</h2>
          <span className="text-xs text-slate-500 font-medium">{donations.length} total entries</span>
        </div>

        {fetching ? (
          <div className="p-12 text-center text-slate-400">Loading your donation records...</div>
        ) : donations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="text-4xl">🥗</div>
            <h3 className="text-base font-semibold text-slate-700">No surplus donations yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Whenever you have safe, edible surplus food after an event, buffet, or service, post it here!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
            >
              Post First Donation
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {donations.map((d) => (
              <div key={d.id} className="p-4 sm:p-6 hover:bg-slate-50/60 transition space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    {/* Food Photo / Thumbnail */}
                    {d.imageUrl ? (
                      <a
                        href={d.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 hover:opacity-90 transition block"
                      >
                        <img
                          src={d.imageUrl}
                          alt={d.foodName}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                        {d.category.includes('Bakery') ? '🍞' : d.isVegetarian ? '🥬' : '🍗'}
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{d.foodName}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadge(d.status)}`}>
                          {d.status.replace(/_/g, ' ')}
                        </span>
                        {d.isVegetarian && (
                          <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-semibold">
                            VEG
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {d.category} • {d.quantity} kg (~{d.servings} servings) • Storage: {d.storage}
                      </p>
                      <div className="text-xs text-slate-600 mt-1 flex items-center space-x-1.5">
                        <span>📍</span>
                        <span className="truncate">{d.pickupAddress}, {d.city}</span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <CountdownTimer consumeBefore={d.consumeBefore} status={d.status} />
                        <span className="text-[11px] text-slate-500 font-medium">
                          Expires: {new Date(d.consumeBefore).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(d.consumeBefore).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 sm:text-right shrink-0">
                    <div className="text-[11px] text-slate-400">
                      Posted: {new Date(d.createdAt).toLocaleDateString()}
                    </div>
                    {d.volunteer && (
                      <div className="mt-1 text-emerald-700 font-medium">
                        Courier: {d.volunteer.name} {d.volunteer.phone && `(${d.volunteer.phone})`}
                      </div>
                    )}
                  </div>
                </div>

                {/* NGO Request Action Box */}
                {d.status === 'REQUESTED' && d.request && (
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                        <span>📢</span>
                        <span>NGO Claim Request from {d.request.ngo?.organization || d.request.ngo?.name}</span>
                      </div>
                      <p className="text-xs text-amber-800 mt-1">
                        Requested Quantity: <span className="font-bold">{d.request.quantity} kg</span>
                        {d.request.notes && ` • Notes: "${d.request.notes}"`}
                      </p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Contact: {d.request.ngo?.email} {d.request.ngo?.phone && `| ${d.request.ngo.phone}`}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(d.request!.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Accept Claim
                      </button>
                      <button
                        onClick={() => handleRejectRequest(d.request!.id)}
                        className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Donation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Post Surplus Food</h3>
                <p className="text-xs text-slate-500">Provide details & a photo so NGOs can verify and coordinate pickup</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateDonation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Food Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g., Vegetable Biryani & Paneer Curry"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Food Image Uploader (Direct Mobile Camera or Gallery Picker) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Food Image / Photo (Mobile Camera or Gallery)
                  </label>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Mobile Camera Supported
                  </span>
                </div>

                {/* 1. Direct Mobile Camera Input (Launches rear camera viewfinder on phones) */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                  id="cameraUploadInput"
                />

                {/* 2. Gallery / File System Input */}
                <input
                  type="file"
                  ref={galleryInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="galleryUploadInput"
                />

                {!foodImagePreview ? (
                  <div className="space-y-2">
                    {/* Visual Tap Area */}
                    <div
                      onClick={() => cameraInputRef.current?.click()}
                      className="cursor-pointer border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-4 text-center transition bg-emerald-50/20 hover:bg-emerald-50/50 group"
                    >
                      <div className="flex items-center justify-center space-x-2 text-2xl mb-1">
                        <span className="p-1.5 bg-emerald-100 rounded-full">📷</span>
                        <span className="p-1.5 bg-slate-100 rounded-full">🖼️</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                        Tap to Take Photo or Upload Image
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Works on mobile phone camera, mobile gallery, and laptop files
                      </p>
                    </div>

                    {/* Dedicated 1-Tap Action Buttons for Phones and Laptops */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs shadow-xs transition"
                      >
                        <span className="text-sm">📷</span>
                        <span>Take Live Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs shadow-xs transition"
                      >
                        <span className="text-sm">🖼️</span>
                        <span>Photo Gallery</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={foodImagePreview}
                        alt="Food preview"
                        className="w-14 h-14 object-cover rounded-lg border border-emerald-200 shrink-0 shadow-xs"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800 truncate max-w-[160px] sm:max-w-[200px]">
                          {foodImageFile?.name || 'Selected Food Photo'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {foodImageFile ? `${(foodImageFile.size / 1024).toFixed(1)} KB` : ''} {imageCompressing ? '(optimizing...)' : '• Ready'}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1 mt-0.5">
                          <span>✓</span> <span>Photo captured & ready</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-2 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-medium transition"
                        title="Take another photo"
                      >
                        📷 Retake
                      </button>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-lg font-medium transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option>Cooked Meals</option>
                    <option>Bakery & Bread</option>
                    <option>Fresh Produce / Fruits</option>
                    <option>Dairy & Sweets</option>
                    <option>Packaged Food</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary Type</label>
                  <select
                    value={isVegetarian ? 'true' : 'false'}
                    onChange={(e) => setIsVegetarian(e.target.value === 'true')}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="true">🥬 Pure Vegetarian</option>
                    <option value="false">🍗 Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Approx Quantity (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g., 15"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Servings *
                  </label>
                  <input
                    type="number"
                    required
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="e.g., 40"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Condition</label>
                <select
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option>Room Temperature (Safe for 4-6 hrs)</option>
                  <option>Refrigerated (Kept at 4°C)</option>
                  <option>Hot Box / Bain-Marie</option>
                </select>
              </div>

              {/* Expiry Date & Time Input with Presets */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-900">
                    ⏰ Food Expiry Date & Time (Consume Before) *
                  </label>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded">
                    Countdown Live
                  </span>
                </div>
                <input
                  type="datetime-local"
                  required
                  value={consumeBefore}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setConsumeBefore(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-mono font-medium"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-amber-800">Quick Presets:</span>
                  {[
                    { label: '+2h', hours: 2 },
                    { label: '+4h', hours: 4 },
                    { label: '+6h', hours: 6 },
                    { label: '+12h', hours: 12 },
                    { label: 'Tomorrow (+24h)', hours: 24 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + preset.hours * 3600 * 1000);
                        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                        setConsumeBefore(d.toISOString().slice(0, 16));
                      }}
                      className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-md transition shadow-2xs"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-amber-700/80">
                  A real-time countdown timer will display on the dashboard so NGOs and volunteers know the exact window for pickup.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Address *</label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g., Kitchen Gate 2, Hotel Grand Orchid, JM Road"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Area / Locality</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
                >
                  {submitting ? 'Posting...' : 'Publish Surplus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DonorDashboard() {
  return (
    <RoleGuard allowedRoles={['DONOR']} dashboardName="Donor Dashboard">
      <DonorDashboardContent />
    </RoleGuard>
  );
}

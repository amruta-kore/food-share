'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useRouter } from 'next/navigation';

import CountdownTimer from '../../components/CountdownTimer';
import HandoverQRCode from '../../components/HandoverQRCode';

interface AvailableFood {
  id: number;
  foodName: string;
  category: string;
  isVegetarian: boolean;
  quantity: number;
  servings: number;
  consumeBefore: string;
  imageUrl?: string | null;
  storage: string;
  pickupAddress: string;
  city: string;
  area: string;
  contactPerson: string;
  contactPhone: string;
  status: string;
  donor?: {
    id: number;
    name: string;
    organization?: string;
  };
  request?: {
    ngo?: {
      id: number;
      name: string;
      organization?: string;
    };
  } | null;
}

interface NGORequest {
  id: number;
  quantity: number;
  status: string;
  notes?: string;
  createdAt: string;
  donation: {
    id: number;
    foodName: string;
    category: string;
    isVegetarian: boolean;
    imageUrl?: string | null;
    pickupAddress: string;
    city: string;
    contactPhone: string;
    status: string;
    consumeBefore: string;
    dropoffOtp?: string | null;
    donor?: {
      name: string;
      organization?: string;
    };
    volunteer?: {
      name: string;
      phone?: string;
    } | null;
  };
}

import { RoleGuard } from '../../components/RoleGuard';

function NGODashboardContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'browse' | 'requests'>('browse');
  const [availableFood, setAvailableFood] = useState<AvailableFood[]>([]);
  const [myRequests, setMyRequests] = useState<NGORequest[]>([]);
  const [fetching, setFetching] = useState(true);

  // Claim modal state
  const [selectedDonation, setSelectedDonation] = useState<AvailableFood | null>(null);
  const [requestQuantity, setRequestQuantity] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'DELIVERED'>('ALL');
  const [vegOnly, setVegOnly] = useState(false);

  const loadData = async (isInitial = false) => {
    if (isInitial) setFetching(true);
    const token = localStorage.getItem('accessToken');
    try {
      // 1. Fetch food listings (both available and delivered)
      const foodRes = await fetch('/api/donations');
      if (foodRes.ok) {
        const foodData = await foodRes.json();
        setAvailableFood(foodData);
      }

      // 2. Fetch NGO's own requests
      if (token) {
        const reqRes = await fetch('/api/ngo/my-requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          setMyRequests(reqData);
        }
      }
    } catch (err) {
      console.error('Error loading NGO data:', err);
    } finally {
      if (isInitial) setFetching(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'NGO') {
      loadData(true);
      // Auto-poll silently in background without blinking/spinner
      const interval = setInterval(() => {
        loadData(false);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonation) return;
    setClaimError(null);
    setClaiming(true);
    const token = localStorage.getItem('accessToken');

    try {
      const res = await fetch('/api/ngo/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          donationId: selectedDonation.id,
          quantity: Number(requestQuantity) || selectedDonation.quantity,
          notes: requestNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedDonation(null);
        setRequestQuantity('');
        setRequestNotes('');
        setActiveTab('requests');
        loadData(false);
      } else {
        setClaimError(data.error || data.message || 'Failed to submit request');
      }
    } catch (err: any) {
      setClaimError(err?.message || 'Server connection error');
    } finally {
      setClaiming(false);
    }
  };

  const handleConfirmReceived = async (donationId: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`/api/ngo/receive/${donationId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('🎉 Delivery receipt confirmed! The donation is now marked as Completed.');
        loadData(false);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to confirm receipt');
      }
    } catch (err) {
      console.error(err);
      alert('Error communicating with server');
    }
  };

  const filteredFood = availableFood.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (vegOnly && !item.isVegetarian) return false;
    if (statusFilter === 'AVAILABLE' && item.status !== 'AVAILABLE') return false;
    if (statusFilter === 'DELIVERED' && item.status !== 'DELIVERED' && item.status !== 'COMPLETED') return false;
    return true;
  });

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading NGO portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Unverified Notice Banner */}
      {!user?.verified && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start space-x-3 text-amber-900 shadow-xs">
          <span className="text-xl">⏳</span>
          <div className="text-xs">
            <h3 className="font-bold text-sm">NGO Account Awaiting Administrative Verification</h3>
            <p className="mt-0.5 text-amber-800">
              Your organization registration and legal documents are currently being inspected by platform administrators. Once approved, you will be authorized to request and accept surplus food.
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 text-xs font-semibold uppercase tracking-wider rounded-full backdrop-blur-xs">
            🏢 NGO & Shelter Hub {user?.verified ? '• Verified ✓' : '• Verification Pending ⏳'}
          </span>
          <h1 className="text-3xl font-extrabold mt-2">{user?.organization || user?.name}</h1>
          <p className="text-blue-100 text-sm mt-1">
            Browse real-time edible surplus food donations in your city and request immediate distribution
          </p>
        </div>

        <button
          onClick={() => loadData(false)}
          className="self-start sm:self-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center space-x-2 border border-white/20"
        >
          <span>🔄</span>
          <span>Refresh Listings</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'browse'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>🥗</span>
          <span>Available Surplus ({filteredFood.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>📋</span>
          <span>Our Claims & Deliveries ({myRequests.length})</span>
        </button>
      </div>

      {/* Tab 1: Available Food Browse */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-600 uppercase">Filters:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Cooked Meals">Cooked Meals</option>
                <option value="Bakery & Bread">Bakery & Bread</option>
                <option value="Fresh Produce / Fruits">Fresh Produce</option>
                <option value="Dairy & Sweets">Dairy & Sweets</option>
                <option value="Packaged Food">Packaged Goods</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none font-semibold text-slate-700"
              >
                <option value="ALL">All Food (Active & Rescued)</option>
                <option value="AVAILABLE">🟢 Available for Claim</option>
                <option value="DELIVERED">✅ Delivered / Rescued</option>
              </select>

              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vegOnly}
                  onChange={(e) => setVegOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>🥦 Vegetarian Only</span>
              </label>
            </div>

            <div className="text-xs text-slate-500">
              Showing <strong>{filteredFood.length}</strong> donations
            </div>
          </div>

          {/* Cards Grid */}
          {fetching ? (
            <div className="p-12 text-center text-slate-400">Loading available surplus food...</div>
          ) : filteredFood.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <div className="text-4xl mb-2">🍽️</div>
              <h3 className="text-base font-bold text-slate-800">No surplus food currently listed</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Check back soon or refresh. Food donors regularly post excess meals after lunch and dinner services.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFood.map((food) => {
                const isDelivered = food.status === 'DELIVERED' || food.status === 'COMPLETED';
                const isClaimedByOther = food.status !== 'AVAILABLE' && !isDelivered;

                return (
                  <div
                    key={food.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Food Photo Banner */}
                      {food.imageUrl ? (
                        <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                          <img
                            src={food.imageUrl}
                            alt={food.foodName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md ${food.isVegetarian ? 'bg-emerald-600/95 text-white' : 'bg-red-600/95 text-white'}`}>
                              {food.isVegetarian ? '🥬 VEG' : '🍗 NON-VEG'}
                            </span>
                            {isDelivered ? (
                              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md bg-teal-600 text-white border border-white/20">
                                ✅ DELIVERED
                              </span>
                            ) : food.status === 'AVAILABLE' ? (
                              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md bg-emerald-600 text-white border border-white/20">
                                🟢 AVAILABLE
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md bg-amber-600 text-white border border-white/20">
                                🚚 IN TRANSIT
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full h-20 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between px-5 border-b border-slate-100">
                          <div className="text-2xl">
                            {food.category.includes('Bakery') ? '🥖' : food.category.includes('Produce') ? '🍎' : food.category.includes('Dairy') ? '🥛' : '🍲'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${food.isVegetarian ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                              {food.isVegetarian ? 'VEG' : 'NON-VEG'}
                            </span>
                            {isDelivered && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                                DELIVERED
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="p-5 space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-base text-slate-900 leading-tight">
                              {food.foodName}
                            </h3>
                            {isDelivered && (
                              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                                ✓ Rescued
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {food.donor?.organization || food.donor?.name || 'Local Donor'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity</span>
                            <span className="font-semibold text-slate-800">{food.quantity} kg</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Servings</span>
                            <span className="font-semibold text-slate-800">{food.servings} people</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Storage</span>
                            <span className="font-semibold text-slate-800 truncate block">{food.storage}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                            <span className="font-semibold text-slate-800 truncate block">{food.category}</span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 space-y-2">
                          <div className="flex items-center space-x-1.5">
                            <span>📍</span>
                            <span className="truncate">{food.pickupAddress}, {food.city}</span>
                          </div>

                          {/* Live Expiry Countdown Timer */}
                          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase text-slate-400">
                                {isDelivered ? 'Delivery State:' : 'Expiry Countdown:'}
                              </span>
                              <CountdownTimer consumeBefore={food.consumeBefore} status={food.status} />
                            </div>
                            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                              <span>⏰</span>
                              <span>
                                Consume before: {new Date(food.consumeBefore).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(food.consumeBefore).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Action / Locked for delivered or claimed */}
                    {isDelivered ? (
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-200">
                          DELIVERED
                        </span>
                        <div
                          className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 select-none flex items-center space-x-1"
                          title="This food donation has already been delivered and completed. Other NGOs cannot access or claim it."
                        >
                          <span>🔒</span>
                          <span>Delivered • Closed to other NGOs</span>
                        </div>
                      </div>
                    ) : isClaimedByOther ? (
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                          {food.status.replace('_', ' ')}
                        </span>
                        <div
                          className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 select-none flex items-center space-x-1"
                          title="This food donation is currently being fulfilled by another NGO."
                        >
                          <span>⏳</span>
                          <span>Claimed • In Transit</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <button
                          onClick={() => {
                            if (!user?.verified) {
                              alert('Your NGO account is awaiting administrative verification. You can claim surplus food once approved by Admin.');
                              return;
                            }
                            setSelectedDonation(food);
                            setRequestQuantity(food.quantity.toString());
                          }}
                          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition shadow-sm ${
                            user?.verified
                              ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-blue-600/20'
                              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {user?.verified ? 'Request / Claim Food' : 'Verification Required to Claim'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Claims & Requests */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Your Organization's Food Requests</h2>
            <p className="text-xs text-slate-500">Track claim approval from donors and volunteer delivery progress</p>
          </div>

          {myRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              You haven't requested any food donations yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myRequests.map((req) => (
                <div key={req.id} className="p-6 hover:bg-slate-50/60 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-start space-x-3">
                      {req.donation.imageUrl ? (
                        <a
                          href={req.donation.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0 hover:opacity-90 transition block"
                        >
                          <img
                            src={req.donation.imageUrl}
                            alt={req.donation.foodName}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ) : (
                        <div className="w-14 h-14 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-xl shrink-0">
                          🍲
                        </div>
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900">
                            {req.donation.foodName}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                            req.status === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : req.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Donor: <strong>{req.donation.donor?.organization || req.donation.donor?.name}</strong> • Requested: {req.quantity} kg
                        </p>
                        {req.donation.consumeBefore && (
                          <div className="mt-1.5 flex items-center space-x-2">
                            <CountdownTimer consumeBefore={req.donation.consumeBefore} status={req.donation.status} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 text-left sm:text-right">
                      <div>📍 {req.donation.pickupAddress}, {req.donation.city}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Date: {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Status Banner & Action */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      {req.status === 'PENDING' && (
                        <span>⏳ Waiting for donor review and acceptance...</span>
                      )}
                      {req.status === 'ACCEPTED' && (
                        <div>
                          <span className="text-emerald-700 font-semibold">
                            ✅ Claim Approved by Donor!
                          </span>
                          <span className="text-slate-500 ml-1">
                            {req.donation.status === 'AVAILABLE' && 'Awaiting courier assignment.'}
                            {req.donation.status === 'VOLUNTEER_ASSIGNED' && 'Volunteer assigned to pick up food from donor.'}
                            {req.donation.status === 'PICKED_UP' && 'Volunteer has picked up the food from donor.'}
                            {req.donation.status === 'OUT_FOR_DELIVERY' && 'Food is on the road! Courier is arriving at your shelter.'}
                            {req.donation.status === 'DELIVERED' && 'Food has arrived! Handover successfully verified.'}
                            {req.donation.status === 'COMPLETED' && 'Delivery completed and confirmed!'}
                          </span>
                        </div>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="text-red-700">
                          ❌ Request declined by donor.
                        </span>
                      )}

                      {req.donation.volunteer && (
                        <div className="text-[11px] text-slate-600">
                          <span className="font-bold text-blue-700">Courier:</span> {req.donation.volunteer.name} ({req.donation.volunteer.phone || 'Phone verified'})
                        </div>
                      )}
                    </div>

                    {/* NGO Mark as Done / Received Button */}
                    {(req.donation.status === 'DELIVERED' || req.donation.status === 'OUT_FOR_DELIVERY') && (
                      <button
                        onClick={() => handleConfirmReceived(req.donation.id)}
                        className="self-start sm:self-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center space-x-1.5 whitespace-nowrap"
                      >
                        <span>✓</span>
                        <span>Confirm Food Receipt (Complete)</span>
                      </button>
                    )}

                    {req.donation.status === 'COMPLETED' && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs whitespace-nowrap border border-emerald-300">
                        🏆 Handover Complete & Verified
                      </span>
                    )}
                  </div>

                  {/* Secure Handover Verification Box for NGO Drop-off */}
                  {(req.donation.status === 'OUT_FOR_DELIVERY' || req.donation.status === 'PICKED_UP') && req.donation.dropoffOtp && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center md:text-left">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wide">
                          Step 2 • Drop-off Gate Verification
                        </span>
                        <h4 className="font-bold text-sm text-amber-950">
                          Share this Code or QR with Courier {req.donation.volunteer?.name || ''} Upon Arrival
                        </h4>
                        <p className="text-xs text-amber-800 max-w-md">
                          When the volunteer delivers the food to your shelter gate, ask them to enter this 4-digit code on their phone to officially complete the chain of custody.
                        </p>
                      </div>

                      <HandoverQRCode
                        value={req.donation.dropoffOtp}
                        label="Shelter Drop-off Code"
                        size={120}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Claim Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Request Food Claim</h3>
                <p className="text-xs text-slate-500">{selectedDonation.foodName}</p>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {claimError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                {claimError}
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity Needed (kg) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  max={selectedDonation.quantity}
                  required
                  value={requestQuantity}
                  onChange={(e) => setRequestQuantity(e.target.value)}
                  placeholder={`Available: ${selectedDonation.quantity} kg`}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Total available is {selectedDonation.quantity} kg (~{selectedDonation.servings} servings)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Distribution Notes / Beneficiary Count
                </label>
                <textarea
                  rows={3}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="e.g., Feeding 40 children at our shelter in Kothrud; our volunteer can pick up by 3 PM."
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedDonation(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claiming}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {claiming ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NGODashboard() {
  return (
    <RoleGuard allowedRoles={['NGO']} dashboardName="NGO Claim Hub">
      <NGODashboardContent />
    </RoleGuard>
  );
}

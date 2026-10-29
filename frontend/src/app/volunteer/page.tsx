'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useRouter } from 'next/navigation';

import CountdownTimer from '../../components/CountdownTimer';

interface DeliveryTask {
  id: number;
  foodName: string;
  category: string;
  isVegetarian: boolean;
  quantity: number;
  servings: number;
  storage: string;
  consumeBefore?: string;
  imageUrl?: string | null;
  pickupAddress: string;
  city: string;
  contactPerson: string;
  contactPhone: string;
  status: string;
  createdAt: string;
  donor?: {
    id: number;
    name: string;
    organization?: string;
  };
  request?: {
    id: number;
    quantity: number;
    notes?: string;
    ngo?: {
      id: number;
      name: string;
      organization?: string;
      phone?: string;
      email?: string;
    };
  } | null;
}

import { RoleGuard } from '../../components/RoleGuard';

function VolunteerDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [availableForPickup, setAvailableForPickup] = useState<DeliveryTask[]>([]);
  const [myTasks, setMyTasks] = useState<DeliveryTask[]>([]);
  const [fetching, setFetching] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTasks = async (isInitial = false) => {
    if (isInitial) setFetching(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      if (isInitial) setFetching(false);
      return;
    }

    try {
      const res = await fetch('/api/volunteer/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableForPickup(data.availableForPickup || []);
        setMyTasks(data.myTasks || []);
      }
    } catch (err) {
      console.error('Error fetching volunteer tasks:', err);
    } finally {
      if (isInitial) setFetching(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'VOLUNTEER') {
      loadTasks(true);
      // Auto-poll silently in background without blinking
      const interval = setInterval(() => {
        loadTasks(false);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleClaim = async (donationId: number) => {
    setActionLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`/api/volunteer/claim/${donationId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadTasks(false);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to claim task');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (donationId: number, nextStatus: string) => {
    setActionLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`/api/volunteer/status/${donationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        loadTasks(false);
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading volunteer dashboard...</p>
      </div>
    );
  }

  const completedCount = myTasks.filter((t) => t.status === 'COMPLETED' || t.status === 'DELIVERED').length;
  const activeCount = myTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'DELIVERED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Unverified Notice Banner */}
      {!user?.verified && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start space-x-3 text-amber-900 shadow-xs">
          <span className="text-xl">⏳</span>
          <div className="text-xs">
            <h3 className="font-bold text-sm">Volunteer Courier Account Pending Admin Verification</h3>
            <p className="mt-0.5 text-amber-800">
              Your government ID / driving license submission is currently undergoing administrative review. Once verified, you will be able to claim surplus delivery missions across the city.
            </p>
          </div>
        </div>
      )}

      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-700 to-orange-700 text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 text-xs font-semibold uppercase tracking-wider rounded-full backdrop-blur-xs">
            🚴 Delivery Partner Hub {user?.verified ? '• Verified ✓' : '• Verification Pending ⏳'}
          </span>
          <h1 className="text-3xl font-extrabold mt-2">Welcome, {user?.name}</h1>
          <p className="text-amber-100 text-sm mt-1">
            Pick up safe surplus meals from restaurants and transport them directly to nearby shelters
          </p>
        </div>

        <button
          onClick={() => loadTasks(false)}
          className="self-start sm:self-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center space-x-2 border border-white/20"
        >
          <span>🔄</span>
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold">
            🛵
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{activeCount}</div>
            <div className="text-xs text-slate-500 font-medium">Deliveries in Progress</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
            🏁
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{completedCount}</div>
            <div className="text-xs text-slate-500 font-medium">Completed Rescues</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
            📍
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{availableForPickup.length}</div>
            <div className="text-xs text-slate-500 font-medium">Open Pickup Tasks</div>
          </div>
        </div>
      </div>

      {/* My Active Deliveries */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Your Current Delivery Missions</h2>
          <p className="text-xs text-slate-500">Update progress as you pick up and deliver the surplus food</p>
        </div>

        {myTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            You don't have any active deliveries. Claim one below to get started!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myTasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-slate-50/50 transition space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    {task.imageUrl ? (
                      <a
                        href={task.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0 hover:opacity-90 transition block"
                      >
                        <img
                          src={task.imageUrl}
                          alt={task.foodName}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ) : (
                      <div className="w-14 h-14 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center text-xl shrink-0">
                        🍲
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{task.foodName}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-300 uppercase">
                          {task.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {task.quantity} kg (~{task.servings} servings) • Category: {task.category}
                      </p>
                      {task.consumeBefore && (
                        <div className="mt-1.5 flex items-center space-x-2">
                          <CountdownTimer consumeBefore={task.consumeBefore} status={task.status} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-slate-600 sm:text-right">
                    Pickup: {task.pickupAddress}, {task.city}
                  </div>
                </div>

                {/* Routing Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Pickup from Donor</span>
                    <strong className="text-slate-900 block text-sm mt-0.5">{task.donor?.organization || task.donor?.name}</strong>
                    <div className="text-slate-600 mt-1">📍 {task.pickupAddress}</div>
                    <div className="text-slate-600">📞 Contact: {task.contactPhone}</div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">2. Deliver to NGO</span>
                    <strong className="text-slate-900 block text-sm mt-0.5">{task.request?.ngo?.organization || task.request?.ngo?.name || 'Partner Shelter'}</strong>
                    <div className="text-slate-600 mt-1">📞 NGO Phone: {task.request?.ngo?.phone || 'On File'}</div>
                    {task.request?.notes && (
                      <div className="text-slate-500 italic mt-0.5">Note: "{task.request.notes}"</div>
                    )}
                  </div>
                </div>

                {/* Stepper Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {task.status === 'VOLUNTEER_ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'PICKED_UP')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1"
                    >
                      <span>✓</span>
                      <span>Mark Pickup as Done (Food Picked Up)</span>
                    </button>
                  )}

                  {task.status === 'PICKED_UP' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'OUT_FOR_DELIVERY')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1"
                    >
                      <span>🚀</span>
                      <span>Mark Out for Delivery to Shelter</span>
                    </button>
                  )}

                  {task.status === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'DELIVERED')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1"
                    >
                      <span>📦</span>
                      <span>Mark as Dropped Off at NGO (Awaiting Confirmation)</span>
                    </button>
                  )}

                  {task.status === 'DELIVERED' && (
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                      ⏳ Food Delivered to Shelter — Awaiting NGO to Confirm Receipt
                    </span>
                  )}

                  {task.status === 'COMPLETED' && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      🏆 Delivery Confirmed & Completed by NGO! Thank you for your service!
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Pickups */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Available Deliveries Needing Pickup</h2>
            <p className="text-xs text-slate-500">Donations approved by donors that need a courier partner</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
            {availableForPickup.length} open
          </span>
        </div>

        {availableForPickup.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No pending deliveries right now. Check back when donors accept new claims!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {availableForPickup.map((task) => (
              <div key={task.id} className="p-5 rounded-2xl border border-slate-200 hover:border-amber-400 transition bg-white space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    {task.imageUrl ? (
                      <a
                        href={task.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 hover:opacity-90 transition block"
                      >
                        <img
                          src={task.imageUrl}
                          alt={task.foodName}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ) : (
                      <div className="w-12 h-12 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center text-lg shrink-0">
                        🍲
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{task.foodName}</h3>
                      <p className="text-xs text-slate-500">
                        Donor: <strong>{task.donor?.organization || task.donor?.name}</strong>
                      </p>
                      {task.consumeBefore && (
                        <div className="mt-1 flex items-center space-x-2">
                          <CountdownTimer consumeBefore={task.consumeBefore} status={task.status} />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    {task.quantity} kg
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>📍 <strong>Pickup:</strong> {task.pickupAddress}, {task.city}</div>
                  <div>🏢 <strong>Destination NGO:</strong> {task.request?.ngo?.organization || task.request?.ngo?.name || 'Local NGO Shelter'}</div>
                </div>

                <button
                  onClick={() => {
                    if (!user?.verified) {
                      alert('Your volunteer courier account is awaiting administrative verification. You will be able to claim deliveries once approved by Admin.');
                      return;
                    }
                    handleClaim(task.id);
                  }}
                  disabled={actionLoading}
                  className={`w-full py-2.5 font-bold text-xs rounded-xl transition shadow-xs ${
                    user?.verified
                      ? 'bg-amber-600 hover:bg-amber-700 active:scale-95 text-white'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {user?.verified ? 'Claim This Delivery Mission' : 'Verification Required to Claim'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VolunteerDashboard() {
  return (
    <RoleGuard allowedRoles={['VOLUNTEER']} dashboardName="Volunteer Courier Board">
      <VolunteerDashboardContent />
    </RoleGuard>
  );
}

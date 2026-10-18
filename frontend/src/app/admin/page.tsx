'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '../../components/RoleGuard';

interface AdminStats {
  totalUsers: number;
  donorsCount: number;
  ngosCount: number;
  volunteersCount: number;
  pendingVerifications: number;
  totalDonations: number;
  availableDonations: number;
  completedDonations: number;
  totalKgSaved: number;
  totalServingsSaved: number;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  organization?: string;
  phone?: string;
  verified: boolean;
  documentUrl?: string | null;
  documentType?: string | null;
  documentName?: string | null;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

interface DonationItem {
  id: number;
  foodName: string;
  category: string;
  quantity: number;
  servings: number;
  city: string;
  status: string;
  imageUrl?: string | null;
  donor?: { name: string; organization?: string };
  volunteer?: { name: string };
  createdAt: string;
}

function AdminContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'donations'>('users');
  const [fetching, setFetching] = useState(true);

  // Document inspection modal state
  const [inspectingUserDoc, setInspectingUserDoc] = useState<UserItem | null>(null);

  // Rejection modal state
  const [rejectingUser, setRejectingUser] = useState<UserItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Helper to ensure URL correctly points to static proxy
  const resolveDocUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  };

  const loadAdminData = async (isInitial = false) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      if (isInitial) setFetching(false);
      return;
    }
    if (isInitial) setFetching(true);

    try {
      const [statsRes, usersRes, donationsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/donations', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (statsRes.ok) {
        try { setStats(await statsRes.json()); } catch (e) { console.error('Stats parse error:', e); }
      }
      if (usersRes.ok) {
        try { setUsers(await usersRes.json()); } catch (e) { console.error('Users parse error:', e); }
      }
      if (donationsRes.ok) {
        try { setDonations(await donationsRes.json()); } catch (e) { console.error('Donations parse error:', e); }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      if (isInitial) setFetching(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAdminData(true);
      const interval = setInterval(() => {
        loadAdminData(false);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleVerifyUser = async (userId: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (inspectingUserDoc && inspectingUserDoc.id === userId) {
          setInspectingUserDoc(null);
        }
        loadAdminData(false);
      } else {
        const text = await res.text();
        let errorMsg = 'Failed to verify user';
        try {
          const data = JSON.parse(text);
          errorMsg = data.error || data.message || errorMsg;
        } catch {
          errorMsg = text.length < 200 ? text : errorMsg;
        }
        alert(errorMsg);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      alert(err?.message || 'Error communicating with server');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingUser) return;
    setRejectLoading(true);
    const token = localStorage.getItem('accessToken');

    try {
      const res = await fetch(`/api/admin/users/${rejectingUser.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (res.ok) {
        setRejectingUser(null);
        setRejectReason('');
        if (inspectingUserDoc && inspectingUserDoc.id === rejectingUser.id) {
          setInspectingUserDoc(null);
        }
        loadAdminData(false);
      } else {
        const text = await res.text();
        let errorMsg = 'Failed to reject user';
        try {
          const data = JSON.parse(text);
          errorMsg = data.error || data.message || errorMsg;
        } catch {
          errorMsg = text.length < 200 ? text : errorMsg;
        }
        alert(errorMsg);
      }
    } catch (err: any) {
      console.error('Rejection error:', err);
      alert(err?.message || 'Error communicating with server');
    } finally {
      setRejectLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading platform administration data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 text-xs font-semibold uppercase tracking-wider rounded-full backdrop-blur-xs">
            🛡️ Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">FoodShare Control Center</h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-1">
            System overview, ecosystem metrics, legal document inspection, and user verification workflows
          </p>
        </div>

        <button
          onClick={() => loadAdminData(false)}
          className="self-start sm:self-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center space-x-2 border border-white/20"
        >
          <span>🔄</span>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 block">Total Meals Saved</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {stats?.totalServingsSaved || 0}
          </div>
          <span className="text-[11px] sm:text-xs text-slate-500 mt-0.5 block">
            ~{stats?.totalKgSaved || 0} kg edible food
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 block">Total Donations</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {stats?.totalDonations || 0}
          </div>
          <span className="text-[11px] sm:text-xs text-slate-500 mt-0.5 block">
            {stats?.availableDonations || 0} active currently
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 block">Pending Verifications</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
            {stats?.pendingVerifications || users.filter((u) => !u.verified && u.role !== 'ADMIN').length}
          </div>
          <span className="text-[11px] sm:text-xs text-slate-500 mt-0.5 block">
            Awaiting Admin review
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 block">Completed Deliveries</span>
          <div className="text-xl sm:text-2xl font-black text-purple-600 mt-1">
            {stats?.completedDonations || 0}
          </div>
          <span className="text-[11px] sm:text-xs text-slate-500 mt-0.5 block">
            {stats?.volunteersCount || 0} active couriers
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Users Management & Document Verification ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition ${
            activeTab === 'donations'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Surplus Donations ({donations.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Legal Document</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const docUrl = resolveDocUrl(u.documentUrl);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 font-medium text-slate-900">
                        <div>{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                        {u.phone && <div className="text-[11px] text-slate-500">📞 {u.phone}</div>}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                          u.role === 'DONOR'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : u.role === 'NGO'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : u.role === 'VOLUNTEER'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{u.organization || '—'}</td>
                      <td className="p-4">
                        {docUrl ? (
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => setInspectingUserDoc(u)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold transition"
                              title="Inspect document inside viewer"
                            >
                              <span>🔍</span>
                              <span className="truncate max-w-[120px]">{u.documentName || 'Inspect Document'}</span>
                            </button>
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                              title="Open in new window"
                            >
                              ↗
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No document</span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.verified ? (
                          <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                            <span>✓</span> <span>Verified</span>
                          </span>
                        ) : (
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Pending Review
                            </span>
                            {u.rejectionReason && (
                              <div className="text-[10px] text-red-600 mt-1 max-w-xs truncate" title={u.rejectionReason}>
                                Rejected: {u.rejectionReason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <div className="flex items-center justify-end space-x-2">
                            {!u.verified ? (
                              <>
                                <button
                                  onClick={() => handleVerifyUser(u.id)}
                                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-xs whitespace-nowrap"
                                >
                                  Approve & Verify
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectingUser(u);
                                    setRejectReason('Uploaded document does not meet verification requirements.');
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition whitespace-nowrap"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setRejectingUser(u);
                                  setRejectReason('Account revoked upon administrative review.');
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-red-700 transition whitespace-nowrap"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Donations Tab */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-4">Food Item</th>
                  <th className="p-4">Photo</th>
                  <th className="p-4">Donor</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Volunteer</th>
                  <th className="p-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-medium text-slate-900">
                      <div>{d.foodName}</div>
                      <div className="text-[11px] text-slate-400">{d.category}</div>
                    </td>
                    <td className="p-4">
                      {d.imageUrl ? (
                        <a
                          href={d.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-12 h-12 rounded-lg overflow-hidden border border-slate-200 hover:opacity-80 transition"
                        >
                          <img
                            src={d.imageUrl}
                            alt={d.foodName}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-base text-slate-400">
                          🍲
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-700">{d.donor?.organization || d.donor?.name || '—'}</td>
                    <td className="p-4 text-slate-700 font-semibold">{d.quantity} kg (~{d.servings} meals)</td>
                    <td className="p-4 text-slate-600">{d.city}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-slate-100 text-slate-800 border border-slate-300 whitespace-nowrap">
                        {d.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{d.volunteer?.name || 'Unassigned'}</td>
                    <td className="p-4 text-right text-slate-400 whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Inspection Modal */}
      {inspectingUserDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">📄</span>
                  <h3 className="text-base sm:text-lg font-bold">
                    {inspectingUserDoc.documentName || 'Legal Verification Document'}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Submitted by <strong>{inspectingUserDoc.name}</strong> ({inspectingUserDoc.role})
                  {inspectingUserDoc.organization ? ` • ${inspectingUserDoc.organization}` : ''}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={resolveDocUrl(inspectingUserDoc.documentUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                >
                  <span>Open Fullscreen</span>
                  <span>↗</span>
                </a>
                <button
                  onClick={() => setInspectingUserDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Viewer Body */}
            <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-y-auto flex items-center justify-center min-h-[50vh]">
              {resolveDocUrl(inspectingUserDoc.documentUrl) ? (
                inspectingUserDoc.documentUrl?.toLowerCase().endsWith('.pdf') ||
                inspectingUserDoc.documentType?.includes('pdf') ? (
                  <iframe
                    src={resolveDocUrl(inspectingUserDoc.documentUrl)}
                    className="w-full h-[65vh] rounded-xl border border-slate-300 bg-white shadow-inner"
                    title="Document Inspection Viewer"
                  />
                ) : (
                  <div className="max-h-[65vh] overflow-auto flex items-center justify-center">
                    <img
                      src={resolveDocUrl(inspectingUserDoc.documentUrl)}
                      alt="Verification document"
                      className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-md border border-slate-200"
                    />
                  </div>
                )
              ) : (
                <div className="p-8 text-center text-slate-500">
                  Document path not available.
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <a
                  href={resolveDocUrl(inspectingUserDoc.documentUrl)}
                  download={inspectingUserDoc.documentName || 'verification-document'}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center space-x-1.5"
                >
                  <span>⬇</span>
                  <span>Download Document</span>
                </a>
              </div>

              <div className="flex items-center space-x-2">
                {!inspectingUserDoc.verified ? (
                  <>
                    <button
                      onClick={() => handleVerifyUser(inspectingUserDoc.id)}
                      className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
                    >
                      ✓ Approve & Verify User
                    </button>
                    <button
                      onClick={() => {
                        setRejectingUser(inspectingUserDoc);
                        setRejectReason('Uploaded document does not meet verification requirements.');
                      }}
                      className="px-4 py-2 text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-xl transition"
                    >
                      ✕ Reject Document
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                    ✓ User Verified & Approved
                  </span>
                )}
                <button
                  onClick={() => setInspectingUserDoc(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Reject Verification</h3>
            <p className="text-xs text-slate-600">
              Provide a reason for rejecting <strong>{rejectingUser.name}</strong> ({rejectingUser.role}). An official rejection notification email will be dispatched automatically.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why the legal document was rejected..."
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRejectingUser(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']} dashboardName="Admin Control Center">
      <AdminContent />
    </RoleGuard>
  );
}

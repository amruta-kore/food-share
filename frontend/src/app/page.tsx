'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, Role } from './context/AuthProvider';
import { useRouter } from 'next/navigation';
import FeedbackModal from '../components/FeedbackModal';
import CountdownTimer from '../components/CountdownTimer';

interface Donation {
  id: number;
  foodName: string;
  category: string;
  isVegetarian: boolean;
  quantity: number;
  servings: number;
  consumeBefore: string;
  imageUrl?: string | null;
  pickupAddress: string;
  city: string;
  status: string;
  donor?: {
    name: string;
    organization?: string;
  };
  request?: {
    ngo?: {
      name: string;
      organization?: string;
    };
  } | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Community Ratings & Feedback State
  const [homeReviews, setHomeReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [totalRatingCount, setTotalRatingCount] = useState<number>(0);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);

  const loadFeedback = () => {
    fetch('/api/feedback?limit=6')
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) setHomeReviews(data.reviews);
        if (data.averageRating) setAvgRating(data.averageRating);
        if (data.totalCount) setTotalRatingCount(data.totalCount);
      })
      .catch((err) => console.error('Error fetching home reviews:', err));
  };

  const loadDonations = () => {
    // Fetch all active and delivered donations so they do not disappear
    fetch('/api/donations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDonations(data);
      })
      .catch((err) => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDonations();
    loadFeedback();

    const handleUpdate = () => {
      loadFeedback();
      loadDonations();
    };
    window.addEventListener('foodshare:feedback-submitted', handleUpdate);
    return () => window.removeEventListener('foodshare:feedback-submitted', handleUpdate);
  }, []);

  const filtered = donations.filter((d) => {
    const matchSearch =
      d.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.donor?.organization || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchVeg = !vegOnly || d.isVegetarian;
    const matchStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'AVAILABLE'
        ? d.status === 'AVAILABLE'
        : statusFilter === 'DELIVERED'
        ? d.status === 'DELIVERED' || d.status === 'COMPLETED'
        : true;
    return matchSearch && matchCat && matchVeg && matchStatus;
  });

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>LIVE SURPLUS FOOD REDISTRIBUTION NETWORK</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Safe Surplus Food From <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Kitchens & Banquets</span> To People In Need.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Restaurants and caterers post excess safe meals. Verified NGOs claim them in minutes. Volunteer couriers handle rapid delivery. Zero food waste.
        </p>

        {/* Platform Portals & Dashboards Navigation */}
        <div className="pt-4 max-w-3xl mx-auto">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              🚀 Platform Portals & Dashboards:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Link
                href="/donor"
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold transition flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-xl">👨‍🍳</span>
                <span>Food Donor</span>
                <span className="text-[10px] text-emerald-600 font-normal">Post Surplus</span>
              </Link>

              <Link
                href="/ngo"
                className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-800 text-xs font-bold transition flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-xl">🏢</span>
                <span>NGO / Shelter</span>
                <span className="text-[10px] text-blue-600 font-normal">Claim Food</span>
              </Link>

              <Link
                href="/volunteer"
                className="p-3 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 text-amber-800 text-xs font-bold transition flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-xl">🚴</span>
                <span>Volunteer</span>
                <span className="text-[10px] text-amber-600 font-normal">Delivery Board</span>
              </Link>

              <Link
                href="/admin"
                className="p-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-purple-800 text-xs font-bold transition flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-xl">🛡️</span>
                <span>Admin Panel</span>
                <span className="text-[10px] text-purple-600 font-normal">Restricted (Admin Only)</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-900 text-white rounded-3xl shadow-xl">
          <div className="text-center p-3">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">1,850+</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Meals Rescued</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl sm:text-4xl font-black text-blue-400">42</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Partner Restaurants</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl sm:text-4xl font-black text-amber-400">28</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Shelters & NGOs</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl sm:text-4xl font-black text-purple-400">100%</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Free & Non-Profit</div>
          </div>
        </div>
      </section>

      {/* Live Surplus Food Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Live Surplus Food Feed</h2>
            <p className="text-xs text-slate-500 mt-1">
              Active donations posted by registered restaurants, bakeries, and banquet halls
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by food or city..."
              className="px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Cooked Meals">Cooked Meals</option>
              <option value="Bakery & Bread">Bakery & Bread</option>
              <option value="Fresh Produce / Fruits">Fresh Produce</option>
              <option value="Dairy & Sweets">Dairy & Sweets</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none font-semibold text-slate-700"
            >
              <option value="ALL">All Food (Active & Rescued)</option>
              <option value="AVAILABLE">🟢 Available for Claim</option>
              <option value="DELIVERED">✅ Delivered / Rescued</option>
            </select>

            <label className="flex items-center space-x-1.5 text-xs text-slate-700 bg-white px-3 py-2 border border-slate-300 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>🥦 Veg Only</span>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400">Loading surplus listings...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div className="text-4xl">🥗</div>
            <h3 className="font-bold text-slate-800">No surplus food currently matches your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Donors can post new donations directly through the <strong>Donor Dashboard</strong>.
            </p>
            <Link
              href="/donor"
              className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
            >
              Post a Food Listing Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((d) => {
              const isDelivered = d.status === 'DELIVERED' || d.status === 'COMPLETED';
              return (
                <div
                  key={d.id}
                  className={`bg-white rounded-2xl border transition overflow-hidden flex flex-col justify-between group ${
                    isDelivered ? 'border-teal-200 bg-slate-50/40' : 'border-slate-200 hover:border-emerald-400 hover:shadow-lg'
                  }`}
                >
                  <div>
                    {/* Food Image Banner */}
                    {d.imageUrl ? (
                      <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                        <img
                          src={d.imageUrl}
                          alt={d.foodName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md ${d.isVegetarian ? 'bg-emerald-600/95 text-white' : 'bg-red-600/95 text-white'}`}>
                            {d.isVegetarian ? '🥬 VEG' : '🍗 NON-VEG'}
                          </span>
                          {isDelivered ? (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md bg-teal-600 text-white border border-white/20">
                              ✅ DELIVERED
                            </span>
                          ) : d.status === 'AVAILABLE' ? (
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
                      <div className="relative w-full h-24 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between px-5 border-b border-slate-100">
                        <div className="text-3xl">
                          {d.category.includes('Bakery') ? '🥖' : d.category.includes('Produce') ? '🍎' : d.category.includes('Dairy') ? '🥛' : '🍲'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${d.isVegetarian ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                            {d.isVegetarian ? 'VEG' : 'NON-VEG'}
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
                          <h3 className="font-bold text-base text-slate-900 leading-tight">{d.foodName}</h3>
                          {isDelivered && (
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                              ✓ Rescued
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {d.donor?.organization || d.donor?.name || 'Local Kitchen'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Quantity</span>
                          <strong className="text-slate-800">{d.quantity} kg</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Servings</span>
                          <strong className="text-slate-800">~{d.servings} people</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
                          <span className="text-slate-700 truncate block">{d.category}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">City</span>
                          <span className="text-slate-700 truncate block">{d.city}</span>
                        </div>
                      </div>

                      {/* Expiry Countdown Timer & Details */}
                      <div className="text-xs text-slate-600 space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <span>📍</span>
                          <span className="truncate">{d.pickupAddress}</span>
                        </div>

                        {/* Live Countdown Timer */}
                        <div className="pt-2 border-t border-slate-100 flex flex-col space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-slate-400">
                              {isDelivered ? 'Delivery State:' : 'Expiry Countdown:'}
                            </span>
                            <CountdownTimer consumeBefore={d.consumeBefore} status={d.status} />
                          </div>
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                            <span>⏰</span>
                            <span>
                              Expires: {new Date(d.consumeBefore).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(d.consumeBefore).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom / Action Area */}
                  {isDelivered ? (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-200">
                          DELIVERED
                        </span>
                        {d.request?.ngo && (
                          <span className="text-[11px] text-slate-600 font-medium truncate max-w-[130px]">
                            To: {d.request.ngo.organization || d.request.ngo.name}
                          </span>
                        )}
                      </div>

                      <div
                        className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 select-none flex items-center space-x-1"
                        title="This food donation has already been delivered and completed. Other NGOs cannot access or claim it."
                      >
                        <span>🔒</span>
                        <span>Delivered • Closed to other NGOs</span>
                      </div>
                    </div>
                  ) : d.status === 'AVAILABLE' ? (
                    <div className="p-4 bg-emerald-50/40 border-t border-emerald-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                        AVAILABLE
                      </span>

                      <Link
                        href="/ngo"
                        className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl shadow-xs transition"
                      >
                        Claim via NGO Hub →
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50/50 border-t border-amber-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        CLAIMED / IN TRANSIT
                      </span>
                      <span className="text-xs font-semibold text-amber-700 truncate max-w-[170px]">
                        {d.request?.ngo ? `Claimed by ${d.request.ngo.organization || d.request.ngo.name}` : 'Reserved'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Community Ratings & Feedback Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <span>⭐ COMMUNITY RATINGS & TESTIMONIALS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Loved by Donors, NGOs, Couriers & Visitors
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Any type of user can rate and review FoodShare. See what our community has to say about rescuing food and feeding communities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10">
                <span className="text-2xl font-black text-emerald-400">{avgRating.toFixed(1)}</span>
                <div className="text-left">
                  <div className="text-amber-400 text-xs">★★★★★</div>
                  <div className="text-[10px] text-slate-300">{totalRatingCount} ratings</div>
                </div>
              </div>

              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
              >
                <span>⭐ Give Feedback</span>
              </button>

              <Link
                href="/feedback"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition"
              >
                View All Reviews →
              </Link>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {homeReviews.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-3 hover:bg-white/10 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-amber-400 text-sm">
                      {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                    </div>
                    <span className="text-[10px] font-medium text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 italic line-clamp-3 leading-relaxed">
                    "{item.feedback}"
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div className="text-xs font-bold text-white truncate">
                    {item.name}
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-200 border border-white/10">
                    {item.userType || 'COMMUNITY'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSuccess={() => loadFeedback()}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthProvider';
import FeedbackModal from '../../components/FeedbackModal';

interface ReviewItem {
  id: number;
  rating: number;
  feedback: string;
  category: string;
  userType: string;
  name: string;
  createdAt: string;
  user?: {
    role: string;
    organization?: string;
  };
}

interface RatingMetrics {
  totalCount: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

export default function FeedbackPage() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [metrics, setMetrics] = useState<RatingMetrics>({
    totalCount: 0,
    averageRating: 5.0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterRating, setFilterRating] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterRole !== 'ALL') params.append('userType', filterRole);
      if (filterRating !== 'ALL') params.append('rating', filterRating);

      const res = await fetch(`/api/feedback?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load feedback');

      const data = await res.json();
      setReviews(data.reviews || []);
      setMetrics({
        totalCount: data.totalCount || 0,
        averageRating: data.averageRating || 5.0,
        ratingDistribution: data.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackData();
  }, [filterRole, filterRating]);

  useEffect(() => {
    const handleGlobalUpdate = () => {
      fetchFeedbackData();
    };
    window.addEventListener('foodshare:feedback-submitted', handleGlobalUpdate);
    return () => window.removeEventListener('foodshare:feedback-submitted', handleGlobalUpdate);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role.toUpperCase()) {
      case 'DONOR':
        return { label: 'Food Donor', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', emoji: '👨‍🍳' };
      case 'NGO':
        return { label: 'NGO / Shelter', color: 'bg-blue-100 text-blue-800 border-blue-300', emoji: '🏢' };
      case 'VOLUNTEER':
        return { label: 'Volunteer Courier', color: 'bg-amber-100 text-amber-800 border-amber-300', emoji: '🚴' };
      case 'ADMIN':
        return { label: 'Platform Admin', color: 'bg-purple-100 text-purple-800 border-purple-300', emoji: '🛡️' };
      default:
        return { label: 'Community Visitor', color: 'bg-slate-100 text-slate-800 border-slate-300', emoji: '👥' };
    }
  };

  const getPercentage = (count: number) => {
    if (!metrics.totalCount) return 0;
    return Math.round((count / metrics.totalCount) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 sm:py-14 space-y-12">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide border border-emerald-200">
            <span>⭐ COMMUNITY VOICES & TRANSPARENCY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Ratings & Feedback for{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              FoodShare
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600">
            Every user matters! Donors, NGOs, volunteers, and visitors can all share ratings and suggestions to help us improve surplus food distribution across the city.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 hover:shadow-lg transition flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>⭐ Write a Review / Give Rating</span>
            </button>
            <Link
              href="/"
              className="px-5 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition shadow-xs"
            >
              Browse Surplus Food →
            </Link>
          </div>
        </div>
      </div>

      {/* Rating Scorecard Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Big Rating Number */}
            <div className="text-center lg:text-left lg:border-r border-slate-200 lg:pr-8 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Community Satisfaction Score
              </div>
              <div className="flex items-baseline justify-center lg:justify-start space-x-3">
                <span className="text-5xl sm:text-6xl font-black text-slate-900">
                  {metrics.averageRating.toFixed(1)}
                </span>
                <span className="text-slate-400 font-medium text-xl">/ 5.0</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-1 text-2xl text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>★</span>
                ))}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Based on <strong className="text-slate-800">{metrics.totalCount}</strong> community reviews from donors, NGOs, volunteers, and visitors
              </p>
            </div>

            {/* Star Distribution Bars */}
            <div className="space-y-2 lg:px-4">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = metrics.ratingDistribution[star] || 0;
                const pct = getPercentage(count);
                return (
                  <div key={star} className="flex items-center space-x-3 text-xs">
                    <span className="w-12 text-slate-600 font-bold flex items-center justify-end space-x-1">
                      <span>{star}</span>
                      <span className="text-amber-400 text-sm">★</span>
                    </span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-slate-400 font-medium">{pct}%</span>
                  </div>
                );
              })}
            </div>

            {/* Impact Highlights */}
            <div className="grid grid-cols-2 gap-3 text-center bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100">
                <div className="text-2xl mb-1">🤝</div>
                <div className="text-xs font-bold text-slate-800">All Users Welcome</div>
                <div className="text-[10px] text-slate-500">Donors, NGOs, Couriers, Visitors</div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-xs font-bold text-slate-800">Instant Updates</div>
                <div className="text-[10px] text-slate-500">Real-time community feedback</div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100">
                <div className="text-2xl mb-1">🌱</div>
                <div className="text-xs font-bold text-slate-800">100% Non-Profit</div>
                <div className="text-[10px] text-slate-500">Dedicated to zero food waste</div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100">
                <div className="text-2xl mb-1">🛡️</div>
                <div className="text-xs font-bold text-slate-800">Admin Monitored</div>
                <div className="text-[10px] text-slate-500">Safe, respectful platform</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Reviews List Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Community Reviews & Suggestions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Read real experiences from people using the FoodShare platform
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">All User Types</option>
              <option value="DONOR">👨‍🍳 Food Donors Only</option>
              <option value="NGO">🏢 NGOs / Shelters Only</option>
              <option value="VOLUNTEER">🚴 Volunteers Only</option>
              <option value="VISITOR">👥 Community Visitors Only</option>
            </select>

            {/* Rating Filter */}
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars ★★★★★</option>
              <option value="4">4 Stars ★★★★☆</option>
              <option value="3">3 Stars ★★★☆☆</option>
              <option value="2">2 Stars ★★☆☆☆</option>
              <option value="1">1 Star ★☆☆☆☆</option>
            </select>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition flex items-center space-x-1"
            >
              <span>+ Add Feedback</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-xs font-medium">Loading community reviews...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <div className="text-4xl">💬</div>
            <h3 className="font-bold text-slate-800 text-base">No reviews match the selected filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first to share your rating and review for this category!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
            >
              Submit Your Review Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => {
              const roleInfo = getRoleBadge(rev.userType || rev.user?.role || 'VISITOR');
              return (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Stars and Category */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-amber-400 text-base">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= rev.rating ? 'text-amber-400' : 'text-slate-200'}>
                            ★
                          </span>
                        ))}
                      </div>

                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {rev.category}
                      </span>
                    </div>

                    {/* Feedback Comment */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                      "{rev.feedback}"
                    </p>
                  </div>

                  {/* Bottom Row: Author details */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                        {rev.name ? rev.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {rev.name}
                        </div>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleInfo.color}`}>
                            {roleInfo.emoji} {roleInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-medium">
                      {new Date(rev.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Call to action at bottom */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center space-y-4 shadow-xl">
          <h3 className="text-2xl font-black">Help Us Make Food Waste History</h3>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto">
            Whether you are a chef, restaurant manager, shelter coordinator, volunteer rider, or caring citizen, your thoughts guide our mission.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-white text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-50 transition shadow-md hover:scale-105"
          >
            ⭐ Share Your Rating & Feedback
          </button>
        </div>
      </div>

      {/* Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchFeedbackData()}
      />
    </div>
  );
}

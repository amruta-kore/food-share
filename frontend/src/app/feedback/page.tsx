'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthProvider';
import { useLanguage } from '../context/LanguageProvider';
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
  const { language } = useLanguage();
  const isMarathi = language === 'mr';

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
    window.addEventListener('annasetu:feedback-submitted', handleGlobalUpdate);
    window.addEventListener('foodshare:feedback-submitted', handleGlobalUpdate);
    return () => {
      window.removeEventListener('annasetu:feedback-submitted', handleGlobalUpdate);
      window.removeEventListener('foodshare:feedback-submitted', handleGlobalUpdate);
    };
  }, []);

  const getCategoryLabel = (cat: string) => {
    if (!isMarathi) return cat;
    const map: Record<string, string> = {
      'Website & Usability': 'वेबसाइट आणि सुलभता',
      'Food Redistribution Flow': 'अन्न वितरण प्रक्रिया',
      'Donation & Listing': 'अन्नदान आणि नोंदणी',
      'NGO Food Claiming': 'संस्था अन्न मागणी',
      'Volunteer Delivery': 'स्वयंसेवक डिलिव्हरी',
      'Platform Reliability': 'प्लॅटफॉर्म विश्वसनीयता',
      'General Suggestion': 'सामान्य सूचना',
      'Bug Report': 'तांत्रिक त्रुटी (Bug)',
    };
    return map[cat] || cat;
  };

  const renderRoleBadge = (role: string) => {
    switch (role.toUpperCase()) {
      case 'DONOR':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            <i className="fa-solid fa-utensils text-emerald-700 text-xs" />
            <span>{isMarathi ? 'अन्नदाता' : 'Food Donor'}</span>
          </span>
        );
      case 'NGO':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
            <i className="fa-solid fa-hand-holding-heart text-cyan-700 text-xs" />
            <span>{isMarathi ? 'संस्था / निवारा' : 'NGO / Shelter'}</span>
          </span>
        );
      case 'VOLUNTEER':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            <i className="fa-solid fa-truck-fast text-amber-700 text-xs" />
            <span>{isMarathi ? 'स्वयंसेवक' : 'Volunteer Courier'}</span>
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
            <i className="fa-solid fa-shield-halved text-purple-700 text-xs" />
            <span>{isMarathi ? 'प्रशासक' : 'Admin'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
            <i className="fa-solid fa-circle-user text-stone-500 text-xs" />
            <span>{isMarathi ? 'नागरिक / अभ्यागत' : 'Community Visitor'}</span>
          </span>
        );
    }
  };

  const getPercentage = (count: number) => {
    if (!metrics.totalCount) return 0;
    return Math.round((count / metrics.totalCount) * 100);
  };

  return (
    <div className="min-h-screen py-10 sm:py-16 space-y-12 bg-grid-subtle">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-stone-900 text-stone-200 text-xs font-bold tracking-wide border border-stone-700">
            <i className="fa-solid fa-star text-amber-400 text-xs" />
            <span>
              {isMarathi
                ? 'नागरिकांचे अभिप्राय आणि पारदर्शकता'
                : 'COMMUNITY VOICES & TRANSPARENCY'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight font-serif">
            {isMarathi ? (
              <>
                अन्नसेतूसाठी{' '}
                <span className="text-emerald-800 underline decoration-emerald-700/40 decoration-4 underline-offset-4">
                  अभिप्राय आणि रेटिंग्ज
                </span>
              </>
            ) : (
              <>
                Verified Ratings & Feedback for{' '}
                <span className="text-emerald-800 underline decoration-emerald-700/40 decoration-4 underline-offset-4">
                  AnnaSetu
                </span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed">
            {isMarathi
              ? 'प्रत्येक वापरकर्ता महत्त्वाचा आहे! अन्नदाता, स्वयंसेवी संस्था, स्वयंसेवक आणि नागरिक सर्वजण अभिप्राय व सूचना देऊन अन्न पुनर्वितरण अधिक सक्षम करण्यास मदत करू शकतात.'
              : 'Real feedback from chefs, volunteers, NGO coordinators, and citizens helping eliminate surplus food waste with transparency.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-crafted transition flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <i className="fa-solid fa-star text-amber-400" />
              <span>
                {isMarathi ? 'अभिप्राय नोंदवा / रेटिंग द्या' : 'Write a Review / Give Rating'}
              </span>
            </button>
            <Link
              href="/"
              className="px-5 py-3.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm transition shadow-xs flex items-center space-x-2"
            >
              <span>{isMarathi ? 'अतिरिक्त अन्न पहा' : 'Browse Surplus Food'}</span>
              <i className="fa-solid fa-arrow-right text-xs" />
            </Link>
          </div>
        </div>
      </div>

      {/* Rating Scorecard Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-crafted p-6 sm:p-9">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Big Rating Number */}
            <div className="text-center lg:text-left lg:border-r border-stone-200 lg:pr-8 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                {isMarathi ? 'नागरिक समाधान गुण (Score)' : 'Community Satisfaction Index'}
              </div>
              <div className="flex items-baseline justify-center lg:justify-start space-x-3">
                <span className="text-5xl sm:text-6xl font-black text-stone-900 font-serif">
                  {metrics.averageRating.toFixed(1)}
                </span>
                <span className="text-stone-400 font-medium text-xl">/ 5.0</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-1.5 text-amber-400 text-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className="fa-solid fa-star text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-stone-500 font-normal leading-relaxed">
                {isMarathi ? (
                  <>
                    अन्नदाता, संस्था, स्वयंसेवक आणि नागरिकांच्या{' '}
                    <strong className="text-stone-800">{metrics.totalCount}</strong> अधिकृत अभिप्रायांवर आधारित
                  </>
                ) : (
                  <>
                    Synthesized from <strong className="text-stone-800">{metrics.totalCount}</strong> verified community reviews across all stakeholder roles
                  </>
                )}
              </p>
            </div>

            {/* Star Distribution Bars with Font Awesome Stars */}
            <div className="space-y-2 lg:px-4">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = metrics.ratingDistribution[star] || 0;
                const pct = getPercentage(count);
                return (
                  <div key={star} className="flex items-center space-x-3 text-xs">
                    <span className="w-12 text-stone-600 font-bold flex items-center justify-end space-x-1">
                      <span>{star}</span>
                      <i className="fa-solid fa-star text-amber-400 text-xs" />
                    </span>
                    <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className="h-full bg-emerald-800 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-stone-400 font-mono text-[11px]">{pct}%</span>
                  </div>
                );
              })}
            </div>

            {/* Impact Highlights */}
            <div className="grid grid-cols-2 gap-3 text-center bg-stone-50/70 p-4 rounded-2xl border border-stone-200">
              <div className="p-3 bg-white rounded-xl shadow-xs border border-stone-200/70">
                <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-1">
                  <i className="fa-solid fa-users text-emerald-700 text-xs" />
                </div>
                <div className="text-xs font-bold text-stone-800">
                  {isMarathi ? 'सर्व भूमिकांचे स्वागत' : 'All Roles Covered'}
                </div>
                <div className="text-[10px] text-stone-500 font-normal">
                  {isMarathi ? 'अन्नदाता, संस्था, स्वयंसेवक' : 'Donors, NGOs, Volunteers'}
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-xs border border-stone-200/70">
                <div className="w-8 h-8 mx-auto rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-1">
                  <i className="fa-solid fa-bolt text-amber-700 text-xs" />
                </div>
                <div className="text-xs font-bold text-stone-800">
                  {isMarathi ? 'थेट पारदर्शकता' : 'Live Verification'}
                </div>
                <div className="text-[10px] text-stone-500 font-normal">
                  {isMarathi ? 'डिलिव्हरीनंतर अभिप्राय' : 'Verified handovers'}
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-xs border border-stone-200/70">
                <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-50 text-cyan-800 flex items-center justify-center mb-1">
                  <i className="fa-solid fa-hand-holding-heart text-cyan-700 text-xs" />
                </div>
                <div className="text-xs font-bold text-stone-800">
                  {isMarathi ? '१००% मोफत व सामाजिक' : 'Zero Commercial Fee'}
                </div>
                <div className="text-[10px] text-stone-500 font-normal">
                  {isMarathi ? 'शून्य अन्न नासाडी ध्येय' : 'Food to people, not waste'}
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-xs border border-stone-200/70">
                <div className="w-8 h-8 mx-auto rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center mb-1">
                  <i className="fa-solid fa-shield-halved text-emerald-800 text-xs" />
                </div>
                <div className="text-xs font-bold text-stone-800">
                  {isMarathi ? 'FSSAI मानके' : 'FSSAI Compliant'}
                </div>
                <div className="text-[10px] text-stone-500 font-normal">
                  {isMarathi ? 'सुरक्षित अन्न प्रक्रिया' : 'Safe consumption limits'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Reviews List Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-stone-900 font-serif">
              {isMarathi ? 'नागरिकांचे अभिप्राय आणि सूचना' : 'Community Reviews & Operational Notes'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {isMarathi
                ? 'अन्नसेतू प्लॅटफॉर्म वापरणाऱ्या नागरिकांचे प्रत्यक्ष अनुभव वाचा'
                : 'Read authentic operational feedback from on-ground redistribution teams'}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3.5 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 font-medium text-stone-700 shadow-xs cursor-pointer"
            >
              <option value="ALL">
                {isMarathi ? 'सर्व वापरकर्ते प्रकार' : 'All Stakeholders'}
              </option>
              <option value="DONOR">
                {isMarathi ? 'अन्नदाता' : 'Food Donors Only'}
              </option>
              <option value="NGO">
                {isMarathi ? 'संस्था / निवारे' : 'NGOs / Shelters Only'}
              </option>
              <option value="VOLUNTEER">
                {isMarathi ? 'स्वयंसेवक' : 'Volunteers Only'}
              </option>
              <option value="VISITOR">
                {isMarathi ? 'नागरिक / अभ्यागत' : 'Community Visitors Only'}
              </option>
            </select>

            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3.5 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 font-medium text-stone-700 shadow-xs cursor-pointer"
            >
              <option value="ALL">{isMarathi ? 'सर्व रेटिंग्ज' : 'All Ratings'}</option>
              <option value="5">{isMarathi ? '५ स्टार्स ★★★★★' : '5 Stars'}</option>
              <option value="4">{isMarathi ? '४ स्टार्स ★★★★☆' : '4 Stars'}</option>
              <option value="3">{isMarathi ? '३ स्टार्स ★★★☆☆' : '3 Stars'}</option>
              <option value="2">{isMarathi ? '२ स्टार्स ★★☆☆☆' : '2 Stars'}</option>
              <option value="1">{isMarathi ? '१ स्टार ★☆☆☆☆' : '1 Star'}</option>
            </select>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <i className="fa-solid fa-plus text-xs" />
              <span>{isMarathi ? 'अभिप्राय जोडा' : 'Add Feedback'}</span>
            </button>
          </div>
        </div>

        {/* Content State: Loading, Empty, or Reviews Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <i className="fa-solid fa-circle-notch fa-spin text-2xl text-emerald-800 mb-3" />
            <p className="text-xs text-stone-500 font-medium">
              {isMarathi ? 'अभिप्राय लोड होत आहेत...' : 'Loading verified feedback...'}
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/90 p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
              <i className="fa-regular fa-comments text-xl text-stone-400" />
            </div>
            <h3 className="font-bold text-stone-800 text-sm">
              {isMarathi
                ? 'निवडलेल्या फिल्टरनुसार कोणतेही अभिप्राय आढळले नाहीत'
                : 'No reviews match the selected filter'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-normal">
              {isMarathi
                ? 'या श्रेणीसाठी पहिले रेटिंग व अभिप्राय देणारे बना!'
                : 'Be the first to share your rating and review for this category!'}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer inline-flex items-center space-x-1.5"
            >
              <i className="fa-solid fa-pen-to-square text-xs" />
              <span>{isMarathi ? 'आता तुमचा अभिप्राय नोंदवा' : 'Submit Review Now'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl border border-stone-200/90 hover:border-emerald-700/40 hover:shadow-crafted transition p-6 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={
                            star <= rev.rating
                              ? 'fa-solid fa-star text-amber-400 text-xs'
                              : 'fa-regular fa-star text-stone-300 text-xs'
                          }
                        />
                      ))}
                    </div>

                    <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                      {getCategoryLabel(rev.category)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic font-normal">
                    "{rev.feedback}"
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-800 font-bold text-xs flex items-center justify-center shrink-0 border border-stone-200">
                      {rev.name ? rev.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 leading-tight">
                        {rev.name}
                      </div>
                      <div className="mt-0.5">
                        {renderRoleBadge(rev.userType || rev.user?.role || 'VISITOR')}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-stone-400 font-medium">
                    {new Date(rev.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to action banner at bottom */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-stone-900 text-white text-center space-y-4 shadow-crafted border border-stone-800">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-800">
            <i className="fa-solid fa-heart text-emerald-400 text-xs" />
            <span>{isMarathi ? 'एकत्र येऊन अन्न वाचवूया' : 'CIVIC MISSION'}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-serif">
            {isMarathi
              ? 'अन्नाची नासाडी संपवण्यासाठी आम्हाला मदत करा'
              : 'Help Us Make Food Waste History in Every City'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed font-normal">
            {isMarathi
              ? 'तुम्ही शेफ, हॉटेल व्यवस्थापक, निवारा समन्वयक, स्वयंसेवक किंवा जागरूक नागरिक असा, तुमचे विचार आमच्या कार्याला दिशा देतात.'
              : 'Whether you are a commercial banquet chef, shelter director, volunteer courier, or conscious citizen, your input drives our delivery network.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer active:scale-95 inline-flex items-center space-x-2"
            >
              <i className="fa-solid fa-star text-amber-300 text-xs" />
              <span>{isMarathi ? 'तुमचा अभिप्राय व रेटिंग शेअर करा' : 'Share Your Rating & Feedback'}</span>
            </button>
          </div>
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

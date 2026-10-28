'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../app/context/AuthProvider';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, { text: string; emoji: string; color: string }> = {
  1: { text: 'Needs Improvement', emoji: '😞', color: 'text-rose-500' },
  2: { text: 'Fair Experience', emoji: '😐', color: 'text-amber-500' },
  3: { text: 'Good Platform', emoji: '😊', color: 'text-yellow-500' },
  4: { text: 'Very Good & Helpful', emoji: '😃', color: 'text-emerald-500' },
  5: { text: 'Excellent! Loved it', emoji: '🌟', color: 'text-emerald-600' },
};

const CATEGORIES = [
  'Website & Usability',
  'Food Redistribution Flow',
  'Donation & Listing',
  'NGO Food Claiming',
  'Volunteer Delivery',
  'Platform Reliability',
  'General Suggestion',
  'Bug Report',
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('Website & Usability');
  const [feedback, setFeedback] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [userType, setUserType] = useState<string>('VISITOR');
  const [isPublic, setIsPublic] = useState<boolean>(true);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setUserType(user.role || 'VISITOR');
    } else {
      setUserType('VISITOR');
    }
  }, [user, isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubmittedSuccess(false);
      setErrorMsg(null);
      setRating(5);
      setFeedback('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg('Please select a star rating from 1 to 5.');
      return;
    }

    if (!feedback.trim() || feedback.trim().length < 3) {
      setErrorMsg('Please share a few words about your experience (at least 3 characters).');
      return;
    }

    setSubmitting(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        rating,
        category,
        feedback: feedback.trim(),
        name: name.trim() || (user ? user.name : 'Community Member'),
        email: email.trim() || undefined,
        userType: user ? user.role : userType,
        isPublic,
      };

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback.');
      }

      setSubmittedSuccess(true);
      if (onSuccess) {
        onSuccess();
      }

      // Auto close after 2.5 seconds
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;
  const currentRatingInfo = RATING_LABELS[activeRating] || RATING_LABELS[5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="h-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {submittedSuccess ? (
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
                🎉
              </div>
              <h3 className="text-2xl font-black text-slate-900">Thank You for Your Feedback!</h3>
              <p className="text-sm text-slate-600 max-w-xs mx-auto">
                Your rating helps us improve FoodShare and create a more reliable surplus food distribution network for all.
              </p>
              <div className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <span>⭐ Your rating: {rating} / 5 Stars</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold tracking-wide mb-2">
                  <span>💬 FOODSHARE COMMUNITY VOICE</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Rate & Share Your Feedback
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Open to all users — donors, NGOs, volunteers, and visitors. How was your experience with our platform?
                </p>
              </div>

              {/* Star Rating Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Your Overall Rating
                </div>
                <div className="flex items-center justify-center space-x-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="text-3xl sm:text-4xl transition-transform hover:scale-125 focus:outline-none focus:scale-125"
                    >
                      <span className={star <= activeRating ? 'text-amber-400 drop-shadow-sm' : 'text-slate-300'}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <div className={`text-xs font-bold flex items-center justify-center space-x-1.5 ${currentRatingInfo.color}`}>
                  <span>{currentRatingInfo.emoji}</span>
                  <span>{currentRatingInfo.text}</span>
                  <span className="text-slate-400 font-normal">({activeRating} of 5)</span>
                </div>
              </div>

              {/* User Identity / Role Info */}
              {user ? (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {user.role === 'DONOR' ? '👨‍🍳' : user.role === 'NGO' ? '🏢' : user.role === 'VOLUNTEER' ? '🚴' : '🛡️'}
                    </span>
                    <div>
                      <span className="text-slate-500">Submitting as:</span>{' '}
                      <strong className="text-slate-900">{user.name}</strong>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-600 text-white">
                    VERIFIED {user.role}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Name <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Patil or Guest"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your User Role / Affiliation
                      </label>
                      <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="VISITOR">👥 Community Member / Visitor</option>
                        <option value="DONOR">👨‍🍳 Food Donor (Restaurant/Caterer)</option>
                        <option value="NGO">🏢 NGO / Charity Representative</option>
                        <option value="VOLUNTEER">🚴 Volunteer / Courier</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(optional, for replies)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feedback Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Review / Suggestions <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What did you like about FoodShare? Any suggestions for improvements, food pickup, or UI?"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  required
                />
              </div>

              {/* Public Display Checkbox */}
              <label className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Allow my rating and comments to be displayed on the platform reviews showcase</span>
              </label>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20 hover:shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Rating & Feedback</span>
                      <span>✨</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

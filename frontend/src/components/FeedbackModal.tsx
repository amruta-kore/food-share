'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../app/context/AuthProvider';
import { useLanguage } from '../app/context/LanguageProvider';
import {
  StarIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  BrandLogoIcon,
  UtensilsIcon,
  BuildingIcon,
  TruckIcon,
  UserIcon,
} from './Icons';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, { en: string; mr: string; color: string }> = {
  1: { en: 'Needs Improvement', mr: 'सुधारणेची गरज आहे', color: 'text-rose-700' },
  2: { en: 'Fair Experience', mr: 'साधारण अनुभव', color: 'text-amber-700' },
  3: { en: 'Good Platform', mr: 'चांगला प्लॅटफॉर्म', color: 'text-yellow-700' },
  4: { en: 'Very Good & Helpful', mr: 'खूप चांगला व उपयुक्त', color: 'text-emerald-700' },
  5: { en: 'Excellent & Reliable', mr: 'उत्कृष्ट व अत्यंत उपयुक्त', color: 'text-emerald-800' },
};

const CATEGORIES = [
  { id: 'Website & Usability', en: 'Website & Usability', mr: 'वेबसाइट आणि सुलभता' },
  { id: 'Food Redistribution Flow', en: 'Food Redistribution Flow', mr: 'अन्न वितरण प्रक्रिया' },
  { id: 'Donation & Listing', en: 'Donation & Listing', mr: 'अन्नदान आणि नोंदणी' },
  { id: 'NGO Food Claiming', en: 'NGO Food Claiming', mr: 'संस्था अन्न मागणी' },
  { id: 'Volunteer Delivery', en: 'Volunteer Delivery', mr: 'स्वयंसेवक डिलिव्हरी' },
  { id: 'Platform Reliability', en: 'Platform Reliability', mr: 'प्लॅटफॉर्म विश्वसनीयता' },
  { id: 'General Suggestion', en: 'General Suggestion', mr: 'सामान्य सूचना' },
  { id: 'Bug Report', en: 'Bug Report', mr: 'तांत्रिक त्रुटी (Bug)' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isMarathi = language === 'mr';

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
      setErrorMsg(
        isMarathi
          ? 'कृपया १ ते ५ मधील स्टार रेटिंग निवडा.'
          : 'Please select a star rating from 1 to 5.'
      );
      return;
    }

    if (!feedback.trim() || feedback.trim().length < 3) {
      setErrorMsg(
        isMarathi
          ? 'कृपया तुमच्या अनुभवाबद्दल काही शब्द लिहा (किमान ३ अक्षरे).'
          : 'Please share a few words about your experience (at least 3 characters).'
      );
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
      setErrorMsg(
        err?.message ||
          (isMarathi ? 'काहीतरी त्रुटी झाली. कृपया पुन्हा प्रयत्न करा.' : 'Something went wrong. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;
  const currentRatingInfo = RATING_LABELS[activeRating] || RATING_LABELS[5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-stone-800 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent border */}
        <div className="h-1.5 bg-emerald-800" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center text-sm font-bold transition cursor-pointer"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {submittedSuccess ? (
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <CheckCircleIcon className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-2xl font-black text-stone-900 font-serif">
                {isMarathi ? 'तुमच्या अभिप्रायाबद्दल मनापासून धन्यवाद!' : 'Thank You for Your Feedback!'}
              </h3>
              <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                {isMarathi
                  ? 'तुमचे रेटिंग अन्नसेतू सुधारण्यासाठी आणि सर्वांसाठी अधिक सक्षम अन्न वितरण नेटवर्क तयार करण्यास मदत करते.'
                  : 'Your evaluation directly assists our volunteers, donors, and shelter coordinators in refining community food rescue.'}
              </p>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                <StarIcon className="w-3.5 h-3.5 text-amber-500" filled />
                <span>
                  {isMarathi
                    ? `नोंदवलेले रेटिंग: ${rating} / ५ स्टार्स`
                    : `Verified Rating: ${rating} / 5 Stars`}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold tracking-wide border border-stone-200 mb-2">
                  <BrandLogoIcon className="w-3.5 h-3.5 text-emerald-800" />
                  <span>
                    {isMarathi ? 'अन्नसेतू नागरिक संवाद' : 'COMMUNITY VOICE'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-serif">
                  {isMarathi ? 'तुमचे रेटिंग आणि अभिप्राय नोंदवा' : 'Rate & Share Your Experience'}
                </h3>
                <p className="text-xs text-stone-500 mt-1 font-normal">
                  {isMarathi
                    ? 'सर्व वापरकर्त्यांसाठी खुले — अन्नदाता, संस्था, स्वयंसेवक आणि नागरिक. आमचा प्लॅटफॉर्म वापरण्याचा तुमचा अनुभव कसा होता?'
                    : 'Open to all participants — donors, NGOs, volunteer couriers, and conscious citizens.'}
                </p>
              </div>

              {/* Star Rating Selector */}
              <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200 text-center space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  {isMarathi ? 'तुमचे एकंदर रेटिंग निवडा' : 'Select Your Rating'}
                </div>
                <div className="flex items-center justify-center space-x-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <StarIcon
                        className="w-8 h-8 text-amber-400"
                        filled={star <= activeRating}
                      />
                    </button>
                  ))}
                </div>
                <div className={`text-xs font-bold flex items-center justify-center space-x-1.5 ${currentRatingInfo.color}`}>
                  <span>{isMarathi ? currentRatingInfo.mr : currentRatingInfo.en}</span>
                  <span className="text-stone-400 font-normal">
                    {isMarathi ? `(${activeRating} पैकी ५)` : `(${activeRating} of 5)`}
                  </span>
                </div>
              </div>

              {/* User Identity / Role Info */}
              {user ? (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-emerald-800" />
                    <div>
                      <span className="text-stone-500">
                        {isMarathi ? 'नोंदणी करत आहात:' : 'Submitting as:'}
                      </span>{' '}
                      <strong className="text-stone-900">{user.name}</strong>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-800 text-white">
                    {isMarathi ? `पडताळणी झालेले ${user.role}` : `VERIFIED ${user.role}`}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {isMarathi ? (
                          <>तुमचे नाव <span className="text-stone-400 font-normal">(पर्यायी)</span></>
                        ) : (
                          <>Your Name <span className="text-stone-400 font-normal">(Optional)</span></>
                        )}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isMarathi ? 'उदा. राहुल पाटील' : 'e.g. Rahul Patil or Guest'}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {isMarathi ? 'तुमची भूमिका / ओळख' : 'Role / Affiliation'}
                      </label>
                      <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 font-medium cursor-pointer"
                      >
                        <option value="VISITOR">
                          {isMarathi ? 'नागरिक / अभ्यागत' : 'Community Member / Visitor'}
                        </option>
                        <option value="DONOR">
                          {isMarathi ? 'अन्नदाता (हॉटेल/केटरर)' : 'Food Donor (Restaurant/Caterer)'}
                        </option>
                        <option value="NGO">
                          {isMarathi ? 'संस्था / निवारा प्रतिनिधी' : 'NGO / Shelter Coordinator'}
                        </option>
                        <option value="VOLUNTEER">
                          {isMarathi ? 'स्वयंसेवक / डिलिव्हरी' : 'Volunteer Courier'}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {isMarathi ? (
                        <>ईमेल पत्ता <span className="text-stone-400 font-normal">(पर्यायी, उत्तरासाठी)</span></>
                      ) : (
                        <>Email Address <span className="text-stone-400 font-normal">(Optional, for updates)</span></>
                      )}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@example.com"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {isMarathi ? 'विषय / श्रेणी' : 'Topic / Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 font-medium cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {isMarathi ? cat.mr : cat.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feedback Message */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {isMarathi ? (
                    <>तुमचा अभिप्राय / सूचना <span className="text-rose-600">*</span></>
                  ) : (
                    <>Your Review / Feedback <span className="text-rose-600">*</span></>
                  )}
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    isMarathi
                      ? 'अन्नसेतूबाबत तुम्हाला काय आवडले? अन्न संकलन, डिलिव्हरी किंवा वेबसाइटबाबत काही सूचना आहेत का?'
                      : 'Share your experience with food listing, shelter handovers, or volunteer delivery timing...'
                  }
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 resize-none font-normal"
                  required
                />
              </div>

              {/* Public Display Checkbox */}
              <label className="flex items-start space-x-2 text-xs text-stone-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span className="font-normal text-[11px]">
                  {isMarathi
                    ? 'माझे रेटिंग आणि अभिप्राय प्लॅटफॉर्मवर प्रदर्शित करण्यास परवानगी द्या'
                    : 'Allow this review to be showcased on public platform transparency metrics'}
                </span>
              </label>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
                  <AlertTriangleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                  disabled={submitting}
                >
                  {isMarathi ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isMarathi ? 'सादर होत आहे...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isMarathi ? 'रेटिंग आणि अभिप्राय सादर करा' : 'Submit Review'}</span>
                      <CheckCircleIcon className="w-3.5 h-3.5" />
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

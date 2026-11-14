'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, Role } from './context/AuthProvider';
import { useLanguage } from './context/LanguageProvider';
import { useRouter } from 'next/navigation';
import FeedbackModal from '../components/FeedbackModal';
import CountdownTimer from '../components/CountdownTimer';
import {
  BrandLogoIcon,
  VegBadge,
  NonVegBadge,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  BuildingIcon,
  UtensilsIcon,
  ShieldCheckIcon,
  SearchIcon,
  FilterIcon,
  ArrowRightIcon,
  HeartHandshakeIcon,
  SparklesIcon,
} from '../components/Icons';

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
  const { t, language } = useLanguage();
  const isMarathi = language === 'mr';
  const router = useRouter();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Community Ratings & Feedback State
  const [homeReviews, setHomeReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [totalRatingCount, setTotalRatingCount] = useState<number>(0);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);

  const getApiUrl = (endpoint: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (base && typeof window !== 'undefined') {
      return `${base}${endpoint}`;
    }
    return endpoint;
  };

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${base}${cleanPath}`;
  };

  const getHomeCatLabel = (cat: string) => {
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
      'Cooked Meals': 'शिजवलेले अन्न',
      'Bakery & Bread': 'बेकरी व पाव',
      'Fresh Produce / Fruits': 'ताजी फळे व भाजीपाला',
      'Dairy & Sweets': 'दुग्धजन्य व मिठाई',
    };
    return map[cat] || cat;
  };

  const getHomeUserTypeLabel = (role: string) => {
    if (!isMarathi) return role || 'COMMUNITY';
    switch ((role || '').toUpperCase()) {
      case 'DONOR':
        return 'अन्नदाता';
      case 'NGO':
        return 'संस्था / निवारा';
      case 'VOLUNTEER':
        return 'स्वयंसेवक';
      case 'ADMIN':
        return 'प्रशासक';
      default:
        return 'नागरिक';
    }
  };

  const loadFeedback = async () => {
    try {
      const res = await fetch(getApiUrl('/api/feedback?limit=6'));
      if (res.ok) {
        const data = await res.json();
        if (data.reviews) setHomeReviews(data.reviews);
        if (data.averageRating) setAvgRating(data.averageRating);
        if (data.totalCount) setTotalRatingCount(data.totalCount);
      }
    } catch (_) {}
  };

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch(getApiUrl('/api/donations'));
        if (res.ok) {
          const data = await res.json();
          setDonations(data.donations || []);
        }
      } catch (err) {
        console.error('Error fetching donations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
    loadFeedback();

    const handleUpdate = () => {
      fetchDonations();
      loadFeedback();
    };
    window.addEventListener('annasetu:feedback-submitted', handleUpdate);
    window.addEventListener('foodshare:feedback-submitted', handleUpdate);
    return () => {
      window.removeEventListener('annasetu:feedback-submitted', handleUpdate);
      window.removeEventListener('foodshare:feedback-submitted', handleUpdate);
    };
  }, []);

  // Split donations into Active and Completed Distribution History
  const activeDonations = donations.filter(
    (d) => d.status !== 'DELIVERED' && d.status !== 'COMPLETED'
  );
  const historyDonations = donations.filter(
    (d) => d.status === 'DELIVERED' || d.status === 'COMPLETED'
  );

  const currentDataset = activeTab === 'active' ? activeDonations : historyDonations;

  const filtered = currentDataset.filter((d) => {
    const matchSearch =
      d.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.donor?.organization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.request?.ngo?.organization || d.request?.ngo?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchVeg = !vegOnly || d.isVegetarian;
    return matchSearch && matchCat && matchVeg;
  });

  return (
    <div className="space-y-16 py-8 sm:py-12 bg-grid-subtle">
      {/* Handcrafted Editorial Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-white border border-neutral-200/90 shadow-crafted p-8 sm:p-12 lg:p-14 overflow-hidden">
          {/* Subtle architectural background accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-50/80 via-transparent to-transparent pointer-events-none rounded-bl-full" />

          <div className="relative z-10 max-w-4xl space-y-6">
            {/* Live City Badge */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>
                {isMarathi
                  ? 'अन्नसेतू • पुणे व महाराष्ट्र थेट अन्न पुनर्वितरण'
                  : 'AnnaSetu • Live Civic Surplus Food Exchange'}
              </span>
              <span className="text-emerald-300">|</span>
              <span className="text-[11px] font-bold text-emerald-800">
                {isMarathi ? '१००% मोफत व सामाजिक' : '100% Free & Verified'}
              </span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.12]">
              {isMarathi ? (
                <>
                  जेव्हा भूक अजूनही एक कटू सत्य आहे, <br />
                  <span className="text-emerald-900 underline decoration-emerald-300/80 decoration-4 underline-offset-4">
                    तेव्हा कोणत्याही अन्नाची केवळ आठवण उरू नये.
                  </span>
                </>
              ) : (
                <>
                  Let No Harvest Become a Memory <br />
                  <span className="text-emerald-900 underline decoration-emerald-300/80 decoration-4 underline-offset-4">
                    When Hunger Is Still a Reality.
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed font-normal">
              {isMarathi
                ? 'हॉटेल्स, बँक्वेट हॉल्स आणि कॉर्पोरेट किचन शिल्लक राहिलेले ताजे जेवण पोस्ट करतात. नोंदणीकृत स्वयंसेवी संस्था काही मिनिटांत मागणी करतात. स्वयंसेवक ओटीपी पडताळणीसह थेट पोहोचवतात.'
                : 'Restaurants and banquet caterers log excess meals in under 2 minutes. Verified local shelters claim them instantly. Volunteer couriers handle prompt transit with cryptographic OTP security.'}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/donor"
                className="px-6 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition flex items-center space-x-2 cursor-pointer"
              >
                <UtensilsIcon className="w-4 h-4 text-emerald-300" />
                <span>{isMarathi ? 'अन्नदाता: अन्न पोस्ट करा' : 'Food Donors: Post Surplus Food'}</span>
              </Link>

              <Link
                href="/ngo"
                className="px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition flex items-center space-x-2 cursor-pointer"
              >
                <BuildingIcon className="w-4 h-4 text-sky-300" />
                <span>{isMarathi ? 'संस्था: अन्न मिळवा' : 'Shelters & NGOs: Claim Food'}</span>
              </Link>

              <Link
                href="/volunteer"
                className="px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs sm:text-sm transition flex items-center space-x-1.5 cursor-pointer"
              >
                <TruckIcon className="w-4 h-4 text-amber-600" />
                <span>{isMarathi ? 'स्वयंसेवक वितरण' : 'Volunteer Board'}</span>
              </Link>
            </div>

            {/* Trust and Safety Badges */}
            <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-500">
              <div className="flex items-center space-x-1.5 text-neutral-700">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-700" />
                <span>{isMarathi ? 'FSSAI नियमावली अनुरूप' : 'FSSAI Safe Packaging Aligned'}</span>
              </div>
              <span className="text-neutral-300">•</span>
              <div className="flex items-center space-x-1.5 text-neutral-700">
                <ClockIcon className="w-4 h-4 text-emerald-700" />
                <span>{isMarathi ? 'थेट एक्सपायरी काउन्टडाउन' : 'Strict Temperature & Expiry Timers'}</span>
              </div>
              <span className="text-neutral-300">•</span>
              <div className="flex items-center space-x-1.5 text-neutral-700">
                <HeartHandshakeIcon className="w-4 h-4 text-emerald-700" />
                <span>{isMarathi ? 'दुहेरी OTP सुरक्षित हस्तांतरण' : 'Dual-OTP Chain of Custody'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Directory Cards (Artisanal civic design) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
            {isMarathi ? 'प्लॅटफॉर्म भूमिका निवडा' : 'Select Your Operational Role'}
          </h2>
          <span className="text-[11px] text-neutral-400 font-medium">
            {isMarathi ? '४ स्वतंत्र सुरक्षित डॅशबोर्ड्स' : '4 Isolated Verified Workflows'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Donor */}
          <Link
            href="/donor"
            className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-crafted hover:border-emerald-600 shadow-crafted-hover flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold">
                <UtensilsIcon className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 group-hover:text-emerald-800 transition">
                  {isMarathi ? 'अन्नदाता पोर्टल' : 'Food Donor Portal'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  {isMarathi
                    ? 'हॉटेल्स, विवाह सभागृह आणि केटरर्ससाठी अतिरिक्त अन्न नोंदणी.'
                    : 'Restaurants, banquet halls & caterers posting clean surplus meals.'}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>{isMarathi ? 'अन्न पोस्ट करा' : 'Post Surplus'}</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: NGO / Shelter */}
          <Link
            href="/ngo"
            className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-crafted hover:border-sky-600 shadow-crafted-hover flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center font-bold">
                <BuildingIcon className="w-5 h-5 text-sky-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 group-hover:text-sky-800 transition">
                  {isMarathi ? 'संस्था व निवारा हब' : 'NGO & Shelter Hub'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  {isMarathi
                    ? 'पडताळणी झालेले अनाथालये व निवारे उपलब्ध अन्नाची मागणी करतात.'
                    : 'Verified trusts & night shelters claiming warm food nearby.'}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-sky-800">
              <span>{isMarathi ? 'अन्न मागणी करा' : 'Claim Food'}</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Volunteer */}
          <Link
            href="/volunteer"
            className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-crafted hover:border-amber-600 shadow-crafted-hover flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold">
                <TruckIcon className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 group-hover:text-amber-800 transition">
                  {isMarathi ? 'स्वयंसेवक वितरण फलक' : 'Volunteer Courier Board'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  {isMarathi
                    ? 'शहरातील स्वयंसेवक पिकअप स्वीकारून सुरक्षित पोहोचवतात.'
                    : 'Local riders picking up thermal boxes and verifying handovers.'}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-amber-800">
              <span>{isMarathi ? 'वितरण कार्य पहा' : 'View Missions'}</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Admin */}
          <Link
            href="/admin"
            className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-crafted hover:border-purple-600 shadow-crafted-hover flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center font-bold">
                <ShieldCheckIcon className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 group-hover:text-purple-800 transition">
                  {isMarathi ? 'प्रशासक नियंत्रण केंद्र' : 'Admin Governance'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  {isMarathi
                    ? 'कागदपत्र तपासणी, वापरकर्ता मंजुरी आणि प्रणाली देखरेख.'
                    : 'Legal document review, user verification & audit trail.'}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-purple-800">
              <span>{isMarathi ? 'प्रशासक प्रवेश' : 'Restricted Desk'}</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Impact Stats Ribbon (Warm, Dignified & Clean) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 bg-neutral-900 text-white rounded-3xl shadow-crafted">
          <div className="space-y-1 p-2 sm:p-4 text-center sm:text-left sm:border-r border-neutral-800">
            <div className="text-2xl sm:text-4xl font-black text-emerald-400">1,850+</div>
            <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
              {t('stat_meals_rescued', 'Meals Rescued')}
            </div>
            <div className="text-[11px] text-neutral-500 font-medium">
              {isMarathi ? '~८३० किलो ताजे अन्न' : '~830 kg edible surplus'}
            </div>
          </div>

          <div className="space-y-1 p-2 sm:p-4 text-center sm:text-left sm:border-r border-neutral-800">
            <div className="text-2xl sm:text-4xl font-black text-sky-400">42</div>
            <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
              {t('stat_partner_restaurants', 'Partner Kitchens')}
            </div>
            <div className="text-[11px] text-neutral-500 font-medium">
              {isMarathi ? 'हॉटेल्स व बँक्वेट हॉल्स' : 'Banquets & caterers'}
            </div>
          </div>

          <div className="space-y-1 p-2 sm:p-4 text-center sm:text-left sm:border-r border-neutral-800">
            <div className="text-2xl sm:text-4xl font-black text-amber-400">28</div>
            <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
              {t('stat_shelters_ngos', 'Verified Shelters')}
            </div>
            <div className="text-[11px] text-neutral-500 font-medium">
              {isMarathi ? 'अनाथालये व रात्र निवारे' : 'Orphanages & trusts'}
            </div>
          </div>

          <div className="space-y-1 p-2 sm:p-4 text-center sm:text-left">
            <div className="text-2xl sm:text-4xl font-black text-white">0₹</div>
            <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
              {t('stat_free_nonprofit', 'Free & Non-Profit')}
            </div>
            <div className="text-[11px] text-neutral-500 font-medium">
              {isMarathi ? 'नागरिक सेवा उपक्रम' : 'Community civic initiative'}
            </div>
          </div>
        </div>
      </section>

      {/* Live Surplus Food Exchange Feed & Distribution History */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200/80 pb-4">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-semibold">
              <i className="fa-solid fa-wheat-awn text-emerald-700"></i>
              <span>{isMarathi ? 'अन्न रक्षण संकल्प' : 'Food Rescue Pledge'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              {isMarathi ? 'थेट अतिरिक्त अन्न फीड' : 'Surplus Food Redistribution Feed'}
            </h2>
            <p className="text-sm sm:text-base text-neutral-700 font-medium italic border-l-2 border-emerald-700 pl-3 py-0.5 max-w-2xl">
              {isMarathi ? (
                <>
                  <span className="block text-stone-900 font-semibold">
                    &ldquo;जेव्हा भूक अजूनही एक कटू सत्य आहे, तेव्हा कोणत्याही पिकाची किंवा अन्नाची केवळ आठवण उरू नये.&rdquo;
                  </span>
                  <span className="block text-xs text-neutral-500 not-italic font-normal mt-0.5">
                    &ldquo;Let No Harvest Become a Memory When Hunger Is Still a Reality.&rdquo;
                  </span>
                </>
              ) : (
                <span>&ldquo;Let No Harvest Become a Memory When Hunger Is Still a Reality.&rdquo;</span>
              )}
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                  activeTab === 'active'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <span>{isMarathi ? 'उपलब्ध अतिरिक्त अन्न' : 'Active Surplus Food'}</span>
                <span
                  className={`text-[10px] px-2 py-0.2 rounded-full font-extrabold ${
                    activeTab === 'active' ? 'bg-emerald-700 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {activeDonations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <span>{isMarathi ? 'वितरित अन्नाचा इतिहास' : 'Distribution History'}</span>
                <span
                  className={`text-[10px] px-2 py-0.2 rounded-full font-extrabold ${
                    activeTab === 'history' ? 'bg-neutral-700 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {historyDonations.length}
                </span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <SearchIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  activeTab === 'active'
                    ? (isMarathi ? 'अन्न किंवा शहर शोधा...' : 'Search food, city, donor...')
                    : (isMarathi ? 'वितरित अन्न किंवा संस्था शोधा...' : 'Search completed deliveries...')
                }
                className="pl-9 pr-3.5 py-2 text-xs border border-neutral-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white focus:outline-none text-neutral-700 font-medium"
            >
              <option value="ALL">{t('filter_all_categories', 'All Categories')}</option>
              <option value="Cooked Meals">{isMarathi ? 'शिजवलेले अन्न' : 'Cooked Meals'}</option>
              <option value="Bakery & Bread">{isMarathi ? 'बेकरी व पाव' : 'Bakery & Bread'}</option>
              <option value="Fresh Produce / Fruits">{isMarathi ? 'ताजी फळे व भाजीपाला' : 'Fresh Produce'}</option>
              <option value="Dairy & Sweets">{isMarathi ? 'दुग्धजन्य व मिठाई' : 'Dairy & Sweets'}</option>
            </select>

            <label className="flex items-center space-x-1.5 text-xs text-neutral-700 bg-white px-3 py-2 border border-neutral-300 rounded-xl cursor-pointer select-none">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="rounded text-emerald-700 focus:ring-emerald-700"
              />
              <span className="font-semibold">{isMarathi ? 'फक्त शाकाहारी' : 'Veg Only'}</span>
            </label>
          </div>
        </div>

        {/* Content Listing Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-neutral-500 font-medium">
              {isMarathi ? 'अन्न नोंदी लोड होत आहेत...' : 'Loading food listings...'}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-3 shadow-crafted">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <UtensilsIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900 text-base">
              {activeTab === 'active'
                ? (isMarathi ? 'सध्या कोणतीही अन्न नोंद उपलब्ध नाही' : 'No active surplus food currently available')
                : (isMarathi ? 'या फिल्टरनुसार कोणतीही नोंद आढळली नाही' : 'No distribution history matching your criteria')}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {activeTab === 'active'
                ? (isMarathi
                    ? 'सर्व ताजे अन्न यशस्वीरित्या मागणी झाले किंवा वितरित झाले आहे. नवीन अन्न पोस्ट करण्यासाठी खालील बटण वापरा.'
                    : 'All recent surplus meals have either been claimed or delivered. Check Distribution History or post new meals.')
                : (isMarathi
                    ? 'वितरित झालेली सर्व कार्ये आपोआप या विभागात संग्रहित होतात.'
                    : 'Delivered food missions will automatically appear here.')}
            </p>
            {activeTab === 'active' && (
              <Link
                href="/donor"
                className="inline-block px-5 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition cursor-pointer shadow-xs"
              >
                {isMarathi ? 'अन्न नोंदणी करा' : 'Post a Food Listing Now'}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((d) => {
              const isDelivered = d.status === 'DELIVERED' || d.status === 'COMPLETED';
              return (
                <div
                  key={d.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between group shadow-crafted ${
                    isDelivered
                      ? 'border-neutral-200 bg-neutral-50/50'
                      : 'border-neutral-200/90 hover:border-emerald-700 hover:shadow-lg'
                  }`}
                >
                  <div>
                    {/* Visual Card Banner */}
                    {d.imageUrl ? (
                      <div className="relative w-full h-44 bg-neutral-100 overflow-hidden">
                        <img
                          src={resolveImageUrl(d.imageUrl)}
                          alt={d.foodName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling;
                            if (fallback) (fallback as HTMLElement).style.display = 'flex';
                          }}
                        />
                        {/* Fallback image placeholder */}
                        <div
                          style={{ display: 'none' }}
                          className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400"
                        >
                          <UtensilsIcon className="w-8 h-8 opacity-40" />
                        </div>

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                          {d.isVegetarian ? <VegBadge size={20} /> : <NonVegBadge size={20} />}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/90 text-neutral-800 shadow-xs backdrop-blur-xs">
                            {getHomeCatLabel(d.category)}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          {isDelivered ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-neutral-900/90 text-neutral-100 backdrop-blur-xs flex items-center space-x-1">
                              <span>✓</span>
                              <span>{isMarathi ? 'वितरित' : 'Delivered'}</span>
                            </span>
                          ) : d.status === 'AVAILABLE' ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-900/90 text-emerald-100 backdrop-blur-xs flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{isMarathi ? 'उपलब्ध' : 'Available'}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-900/90 text-amber-100 backdrop-blur-xs flex items-center space-x-1">
                              <TruckIcon className="w-3 h-3 text-amber-300" />
                              <span>{isMarathi ? 'वाटेत आहे' : 'In Transit'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-24 bg-neutral-50 flex items-center justify-between px-5 border-b border-neutral-100">
                        <div className="flex items-center space-x-2">
                          {d.isVegetarian ? <VegBadge size={20} /> : <NonVegBadge size={20} />}
                          <span className="text-xs font-bold text-neutral-700">
                            {getHomeCatLabel(d.category)}
                          </span>
                        </div>
                        <div>
                          {isDelivered ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                              {isMarathi ? 'वितरित' : 'Delivered'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {isMarathi ? 'उपलब्ध' : 'Available'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Card Body Details */}
                    <div className="p-5 space-y-3.5">
                      <div>
                        <h3 className="font-bold text-base text-neutral-900 leading-tight">
                          {d.foodName}
                        </h3>
                        <div className="flex items-center space-x-1.5 text-xs text-neutral-500 font-medium mt-1">
                          <UtensilsIcon className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{d.donor?.organization || d.donor?.name || 'Local Kitchen'}</span>
                        </div>
                      </div>

                      {/* Portions & Quantity Grid */}
                      <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-50 rounded-xl text-xs border border-neutral-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                            {isMarathi ? 'प्रमाण (Quantity)' : 'Quantity'}
                          </span>
                          <strong className="text-neutral-800 text-sm">{d.quantity} kg</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                            {isMarathi ? 'लोकांसाठी (Servings)' : 'Servings'}
                          </span>
                          <strong className="text-neutral-800 text-sm">~{d.servings} people</strong>
                        </div>
                      </div>

                      {/* Expiry Countdown Timer */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-neutral-500 flex items-center space-x-1 font-medium">
                          <ClockIcon className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{isMarathi ? 'वापरण्याची अंतिम वेळ:' : 'Consume before:'}</span>
                        </span>
                        <CountdownTimer consumeBefore={d.consumeBefore} targetTime={d.consumeBefore} />
                      </div>

                      {/* Location Row */}
                      <div className="flex items-start space-x-1.5 text-xs text-neutral-600">
                        <MapPinIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span className="truncate">{d.pickupAddress || d.city}</span>
                      </div>

                      {/* Delivered Attribution Notice */}
                      {isDelivered && d.request?.ngo && (
                        <div className="p-2.5 bg-sky-50 rounded-lg border border-sky-100 text-[11px] text-sky-900 flex items-center space-x-1.5">
                          <BuildingIcon className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                          <span className="truncate">
                            {isMarathi ? 'वितरित केले: ' : 'Delivered to: '}
                            <strong>{d.request.ngo.organization || d.request.ngo.name}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-5 pt-0">
                    {isDelivered ? (
                      <div className="w-full py-2 text-center text-xs font-bold text-neutral-500 bg-neutral-100 rounded-xl">
                        {isMarathi ? '✓ अन्न यशस्वीरित्या वितरित' : '✓ Completed & Distributed'}
                      </div>
                    ) : (
                      <Link
                        href="/ngo"
                        className="w-full py-2.5 px-4 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold text-center block transition shadow-xs"
                      >
                        {isMarathi ? 'संस्था हबमधून अन्न मिळवा' : 'Claim from NGO Hub'}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Community Ratings & Feedback Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-neutral-900 rounded-3xl p-8 sm:p-10 text-white shadow-crafted space-y-6 border border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-300 text-xs font-bold border border-emerald-700/50">
                <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isMarathi ? 'नागरिकांचे अभिप्राय आणि अनुभव' : 'COMMUNITY RATINGS & TESTIMONIALS'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {isMarathi
                  ? 'अन्नदाता, संस्था, स्वयंसेवक आणि नागरिकांचा विश्वास'
                  : 'Loved by Donors, NGOs, Couriers & Visitors'}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
                {isMarathi
                  ? 'कोणताही वापरकर्ता अन्नसेतूला रेटिंग व अभिप्राय देऊ शकतो. अन्न वाचवणे आणि समाज सेवेबाबत नागरिकांचे अनुभव पहा.'
                  : 'Any type of user can rate and review AnnaSetu. See what our community has to say about rescuing food and feeding communities.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10">
                <span className="text-2xl font-black text-emerald-400">{avgRating.toFixed(1)}</span>
                <div className="text-left">
                  <div className="text-amber-400 text-xs">★★★★★</div>
                  <div className="text-[10px] text-neutral-300">
                    {isMarathi ? `${totalRatingCount} रेटिंग्ज` : `${totalRatingCount} ratings`}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-star text-amber-300" />
                <span>{isMarathi ? 'अभिप्राय द्या' : 'Give Feedback'}</span>
              </button>

              <Link
                href="/feedback"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition"
              >
                {isMarathi ? 'सर्व अभिप्राय पहा →' : 'View All Reviews →'}
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
                    <span className="text-[10px] font-medium text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      {getHomeCatLabel(item.category)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 italic line-clamp-3 leading-relaxed">
                    "{item.feedback}"
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div className="text-xs font-bold text-white truncate">
                    {item.name}
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-200 border border-white/10">
                    {getHomeUserTypeLabel(item.userType || 'COMMUNITY')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Study Banner (Bespoke Editorial layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-8 sm:p-12 shadow-crafted border border-neutral-800">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800">
                <i className="fa-solid fa-earth-americas text-emerald-400" />
                <span>{isMarathi ? 'भारत व जागतिक अन्न प्रभाव अहवाल' : 'GLOBAL & INDIA IMPACT STUDY'}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {isMarathi ? (
                  <>
                    अतिरिक्त अन्न दान करणे का महत्त्वाचे आहे: <br />
                    <span className="text-emerald-400 underline decoration-emerald-600 decoration-2 underline-offset-4">
                      भूकमुक्ती आणि पर्यावरणाचे संरक्षण
                    </span>
                  </>
                ) : (
                  <>
                    Why Donating Surplus Food Matters: <br />
                    <span className="text-emerald-400 underline decoration-emerald-600 decoration-2 underline-offset-4">
                      Ending Hunger & Protecting the Environment
                    </span>
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                {isMarathi
                  ? 'भारतात दरवर्षी ७८ दशलक्ष टनांपेक्षा जास्त अन्न वाया जाते, तर १९० दशलक्षाहून अधिक लोक उपाशी झोपतात. अन्न पुनर्वितरणामुळे कचरा कसा सन्मानात बदलतो ते जाणून घ्या.'
                  : 'India generates over 78 million tonnes of food waste annually while over 190 million people go hungry every night. Discover the science, environmental facts, operational models, and real-world case study on how food distribution turns waste into dignity.'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">78.2M T</div>
                  <div className="text-[10px] text-neutral-300 font-semibold uppercase">
                    {isMarathi ? 'वार्षिक नासाडी' : 'India Waste/Year'}
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <div className="text-xl sm:text-2xl font-black text-amber-400">190M+</div>
                  <div className="text-[10px] text-neutral-300 font-semibold uppercase">
                    {isMarathi ? 'भुकेले नागरिक' : 'Hungry Citizens'}
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                  <div className="text-xl sm:text-2xl font-black text-cyan-400">8-10%</div>
                  <div className="text-[10px] text-neutral-300 font-semibold uppercase">
                    {isMarathi ? 'वायू बचत' : 'Global GHGs Saved'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                href="/food-impact"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition text-center flex items-center justify-center space-x-2"
              >
                <i className="fa-solid fa-book-open" />
                <span>{isMarathi ? 'संपूर्ण केस स्टडी वाचा' : 'Read Full Impact Case Study'}</span>
                <i className="fa-solid fa-arrow-right text-xs" />
              </Link>
              <Link
                href="/donor"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition text-center"
              >
                {isMarathi ? 'आता अन्न पोस्ट करा' : 'Post Surplus Food Now'}
              </Link>
            </div>
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

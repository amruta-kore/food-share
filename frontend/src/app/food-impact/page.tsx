'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FoodImpactPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'india' | 'global' | 'casestudy' | 'action'>('overview');
  const [calculatorMeals, setCalculatorMeals] = useState<number>(50);

  // Dynamic impact calculation based on meals donated
  const foodSavedKg = (calculatorMeals * 0.45).toFixed(1); // avg ~450g per meal
  const co2PreventedKg = (calculatorMeals * 1.12).toFixed(1); // ~2.5kg CO2e per kg food saved
  const waterSavedLiters = (calculatorMeals * 380).toLocaleString(); // ~840L water footprint per kg grain/meal

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14 space-y-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-emerald-800/40">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold tracking-wide border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>SPECIAL CASE STUDY & GLOBAL REPORT</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              The Power of Surplus Food: <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                Ending Hunger & Healing Our Planet
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Every day, enough nutritious food is prepared across kitchens, banquets, and supply chains to feed every hungry individual on Earth. Yet, up to 40% is wasted. Explore the reality of food waste in India and the world, and discover why your donation matters.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/donor"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition transform active:scale-95 flex items-center space-x-2"
              >
                <span>🍲</span>
                <span>Donate Surplus Food Now</span>
              </Link>
              <Link
                href="/"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 transition flex items-center space-x-1.5"
              >
                <span>← Back to Live Surplus Food</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
          {[
            { id: 'overview', label: '📊 Key Statistics & Reality', icon: '🌍' },
            { id: 'india', label: '🇮🇳 India Context & Paradox', icon: '🇮🇳' },
            { id: 'global', label: '🌱 Environmental Impact', icon: '🌿' },
            { id: 'casestudy', label: '📑 Real-World Case Study', icon: '📖' },
            { id: 'action', label: '💡 Impact Calculator & Action', icon: '⚡' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Section 1: Overview & High-Impact Key Metrics */}
      {(activeTab === 'overview' || activeTab === 'india') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              The Great Paradox: Abundance Amidst Deprivation
            </h2>
            <p className="text-sm text-slate-600">
              Drawing insights from the United Nations Environment Programme (UNEP), FAO, and the India FoodBanking Network (IFBN).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold">
                🗑️
              </div>
              <div className="text-3xl font-black text-slate-900">78.2M</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tonnes / Year (India)</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                India is the 2nd largest generator of food waste globally according to the UNEP Food Waste Index Report.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold">
                🥣
              </div>
              <div className="text-3xl font-black text-slate-900">190M+</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Undernourished People</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                India accounts for a quarter of the world's hungry population, despite achieving self-sufficiency in agricultural production.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                💰
              </div>
              <div className="text-3xl font-black text-slate-900">₹1.5 Lakh Cr</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Annual Economic Loss</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The financial value of lost and discarded food in India could fund nationwide healthcare or education budgets.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold">
                🌿
              </div>
              <div className="text-3xl font-black text-slate-900">8 - 10%</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Global GHG Emissions</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                If food waste were a country, it would be the 3rd largest emitter of greenhouse gases after China and the United States.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Section 2: Detailed India Food Distribution Ecosystem */}
      {(activeTab === 'overview' || activeTab === 'india') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Institutional Strategy</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  How Organized Surplus Food Banking Works
                </h3>
              </div>
              <div className="text-xs text-slate-500 max-w-sm">
                Inspired by the multi-stakeholder operational model of the <strong>India FoodBanking Network (IFBN)</strong> and modern civic tech platforms.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h4 className="font-bold text-base text-slate-900">Interception at Source</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hotels, wedding banquets, corporate cafeterias, and food manufacturers generate daily surplus. Instead of dumping clean, untouched food into bins, donors log item categories, quantities, and strict expiry timestamps.
                </p>
                <div className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-block">
                  Prevents Landfill Dumping
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h4 className="font-bold text-base text-slate-900">Vetted Cold & Direct Transit</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Verified couriers and volunteer drivers are notified instantly within local geofences. Food is picked up with proper hygienic containers before thermal degradation, adhering to food safety guidelines (FSSAI).
                </p>
                <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                  Real-Time Countdown Tracking
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h4 className="font-bold text-base text-slate-900">Dignified Last-Mile Distribution</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Food reaches vetted beneficiary institutions: night shelters, slum schools, orphanages, day-laborer communities, and charitable hospitals, delivering immediate hot meals with complete dignity.
                </p>
                <div className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 inline-block">
                  Direct Nutritional Security
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Environmental Consequences (Global) */}
      {(activeTab === 'overview' || activeTab === 'global') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-8 sm:p-12 text-white border border-emerald-800/40 shadow-xl space-y-8">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Planetary Impact & Sustainability
              </span>
              <h3 className="text-2xl sm:text-3xl font-black">
                Food Waste is a Climate Catastrophe in Disguise
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                When we throw away food, we do not simply discard a meal—we waste all the hidden ecological inputs that went into creating it.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:bg-white/10 transition">
                <div className="text-3xl">🚰</div>
                <h4 className="font-bold text-base text-white">Massive Water Depletion</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Agriculture accounts for 70% of global freshwater use. Producing 1 kg of rice requires roughly 2,500 liters of water. Throwing food into the garbage is equivalent to leaving taps gushing water endlessly.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:bg-white/10 transition">
                <div className="text-3xl">🔥</div>
                <h4 className="font-bold text-base text-white">Methane in Landfills</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Food buried in landfills decomposes anaerobically, releasing <strong>methane (CH₄)</strong>—a greenhouse gas with 28 times the global warming potential of carbon dioxide over a 100-year cycle.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:bg-white/10 transition">
                <div className="text-3xl">🎯</div>
                <h4 className="font-bold text-base text-white">UN SDG Alignment</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Surplus food redistribution directly satisfies <strong>UN SDG 2 (Zero Hunger)</strong> and <strong>UN SDG 12.3</strong> (halving per capita global food waste by 2030), turning a waste management liability into human nutrition.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 4: Detailed Real-World Case Study */}
      {(activeTab === 'overview' || activeTab === 'casestudy') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-8">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold uppercase rounded-full">
                Featured Case Study
              </span>
              <span className="text-xs text-slate-400">Urban Banquet & Large Event Food Recovery</span>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Case Study: Rescuing 350+ Servings from an Urban Wedding Reception in Pune
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                In metropolitan cities across India, wedding banquets prepare on average 15% to 25% extra food to prevent catering shortages. Without a digital food-sharing channel, caterers are forced to discard 50–100 kg of wholesome biryani, paneer gravies, and rotis at 11:30 PM.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">The Problem</span>
                <div className="font-extrabold text-base text-slate-900">85 kg Cooked Food</div>
                <p className="text-xs text-slate-500">
                  Leftover hot food with a 4-hour room temperature shelf-life before bacterial proliferation.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">The Action</span>
                <div className="font-extrabold text-base text-emerald-700">Digital Logged in 2 Mins</div>
                <p className="text-xs text-slate-500">
                  Catering manager logged item with photo and expiry timer (+4h). 2 shelters in a 6 km radius claimed.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">The Transit</span>
                <div className="font-extrabold text-base text-blue-700">32-Minute Dispatch</div>
                <p className="text-xs text-slate-500">
                  Volunteer courier accepted dispatch, picked up sanitized thermal containers, and delivered directly.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">The Outcome</span>
                <div className="font-extrabold text-base text-purple-700">190 Children Fed</div>
                <p className="text-xs text-slate-500">
                  Delivered safely before expiry. Prevented 95 kg of CO2 equivalent landfill emissions.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-bold text-emerald-900">Key Takeaway for Donors</div>
                <p className="text-xs text-emerald-800">
                  Speed, transparency, and expiry countdowns make surplus food rescue feasible even late at night. Every single meal saved changes lives.
                </p>
              </div>
              <Link
                href="/donor"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
              >
                Start Donating →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Section 5: Interactive Impact Calculator & Action Call */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-md space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Interactive Impact Calculator
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              See the Impact of Your Food Donation
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Select or slide how many meals your home, restaurant, or business can donate, and witness the direct positive ecological and humanitarian ripple effect:
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-bold text-slate-800">
              <span>Estimated Meals to Rescue:</span>
              <span className="text-2xl font-black text-emerald-600">{calculatorMeals} Meals</span>
            </div>

            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={calculatorMeals}
              onChange={(e) => setCalculatorMeals(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
              <span>5 Meals (Family Dinner)</span>
              <span>100 Meals (Restaurant Service)</span>
              <span>500 Meals (Large Banquet / Convention)</span>
            </div>
          </div>

          {/* Calculator Output Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-center">
              <span className="text-3xl">🍲</span>
              <div className="text-3xl font-black text-emerald-800">{foodSavedKg} kg</div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">Surplus Food Rescued</div>
              <p className="text-[11px] text-emerald-700">
                Wholesome meals redirected to local night shelters & orphanages instead of trash compactors.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2 text-center">
              <span className="text-3xl">🌱</span>
              <div className="text-3xl font-black text-teal-800">{co2PreventedKg} kg</div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-900">CO₂e Emissions Prevented</div>
              <p className="text-[11px] text-teal-700">
                Prevents hazardous methane gas emission produced by rotting organic matter in open municipal dumps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 text-center">
              <span className="text-3xl">💧</span>
              <div className="text-3xl font-black text-blue-800">{waterSavedLiters} L</div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-900">Agricultural Water Saved</div>
              <p className="text-[11px] text-blue-700">
                Preserves vital embedded irrigation and cultivation water used throughout the farm-to-table chain.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Ready to take action? Anyone can register as a <strong>Food Donor</strong>, <strong>NGO / Shelter Partner</strong>, or <strong>Volunteer Courier</strong>.
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <Link
                href="/register"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Join the Network →
              </Link>
              <Link
                href="/donor"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
              >
                Post Surplus Food
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

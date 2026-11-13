'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageProvider';
import {
  BrandLogoIcon,
  GlobeIcon,
  UtensilsIcon,
  BuildingIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '../../components/Icons';

export default function FoodImpactPage() {
  const { language } = useLanguage();
  const isMarathi = language === 'mr';

  const [activeTab, setActiveTab] = useState<'overview' | 'india' | 'global' | 'casestudy' | 'action'>('overview');
  const [calculatorMeals, setCalculatorMeals] = useState<number>(50);

  // Dynamic impact calculation based on meals donated
  const foodSavedKg = (calculatorMeals * 0.45).toFixed(1); // avg ~450g per meal
  const co2PreventedKg = (calculatorMeals * 1.12).toFixed(1); // ~2.5kg CO2e per kg food saved
  const waterSavedLiters = (calculatorMeals * 380).toLocaleString(); // ~840L water footprint per kg grain/meal

  return (
    <div className="min-h-screen py-10 sm:py-16 space-y-16 bg-grid-subtle">
      {/* Hero Section (Bespoke Editorial Publication Format) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-stone-900 text-white p-8 sm:p-14 shadow-crafted border border-stone-800">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold tracking-wide border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                {isMarathi
                  ? 'विशेष केस स्टडी आणि जागतिक अन्न अहवाल'
                  : 'SPECIAL IMPACT CASE STUDY & RESEARCH REPORT'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight font-serif">
              {isMarathi ? (
                <>
                  अतिरिक्त अन्नाची ताकद: <br />
                  <span className="text-emerald-400 underline decoration-emerald-600 decoration-2 underline-offset-4">
                    भूकमुक्ती आणि पृथ्वीचे रक्षण
                  </span>
                </>
              ) : (
                <>
                  The Power of Surplus Food: <br />
                  <span className="text-emerald-400 underline decoration-emerald-600 decoration-2 underline-offset-4">
                    Ending Urban Hunger & Healing Our Climate
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-normal">
              {isMarathi
                ? 'दररोज हॉटेल्स, स्वयंपाकघरे आणि बँक्वेट्समध्ये जगातील प्रत्येक भुकेल्या व्यक्तीचे पोट भरण्यासाठी पुरेसे पौष्टिक अन्न तयार होते. तरीही ४०% पर्यंत अन्न वाया जाते. भारत आणि जगातील अन्न नासाडीचे वास्तव जाणून घ्या आणि तुमचे योगदान का महत्त्वाचे आहे ते पहा.'
                : 'Every day, enough nutritious food is prepared across urban catering kitchens and supply chains to feed every hungry citizen. Yet up to 40% is wasted. Explore the reality of food waste in India and discover how rapid redistribution turns excess into dignity.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/donor"
                className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center space-x-2 cursor-pointer"
              >
                <UtensilsIcon className="w-4 h-4 text-emerald-200" />
                <span>{isMarathi ? 'आता अतिरिक्त अन्न दान करा' : 'Donate Surplus Food Now'}</span>
              </Link>
              <Link
                href="/"
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-stone-200 font-semibold text-xs sm:text-sm rounded-xl border border-white/15 transition flex items-center space-x-1.5 cursor-pointer"
              >
                <span>←</span>
                <span>{isMarathi ? 'थेट अतिरिक्त अन्नाकडे परत जा' : 'Back to Live Food Feed'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs (Handcrafted Segmented Bar) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-2 bg-stone-100/90 rounded-2xl border border-stone-200 shadow-xs">
          {[
            {
              id: 'overview',
              label: isMarathi ? 'महत्त्वाची आकडेवारी आणि वास्तव' : 'Key Statistics & Facts',
            },
            {
              id: 'india',
              label: isMarathi ? 'भारतातील स्थिती आणि विरोधाभास' : 'India Context & Paradox',
            },
            {
              id: 'global',
              label: isMarathi ? 'पर्यावरणीय परिणाम' : 'Environmental Footprint',
            },
            {
              id: 'casestudy',
              label: isMarathi ? 'पुणे प्रत्यक्ष केस स्टडी' : 'Pune Banquet Case Study',
            },
            {
              id: 'action',
              label: isMarathi ? 'प्रभाव कॅल्क्युलेटर आणि कृती' : 'Impact Calculator & Action',
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/60'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Section 1: Overview & High-Impact Key Metrics */}
      {(activeTab === 'overview' || activeTab === 'india') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
              {isMarathi
                ? 'मोठा विरोधाभास: मुबलकता असूनही भुकेची समस्या'
                : 'The Great Paradox: Abundance Amidst Deprivation'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-normal">
              {isMarathi
                ? 'संयुक्त राष्ट्र पर्यावरण कार्यक्रम (UNEP), FAO आणि इंडिया फूडबँकिंग नेटवर्क (IFBN) च्या अहवालानुसार.'
                : 'Drawing insights from the United Nations Environment Programme (UNEP), FAO, and India FoodBanking Network (IFBN).'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-crafted space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center text-sm font-bold border border-rose-200">
                UNEP
              </div>
              <div className="text-3xl font-black text-stone-900 font-serif">78.2M</div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                {isMarathi ? 'टन / दरवर्षी (भारत)' : 'Tonnes / Year (India)'}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-normal">
                {isMarathi
                  ? 'UNEP अन्न नासाडी निर्देशांक अहवालानुसार भारत जागतिक पातळीवर अन्न वाया घालवणारा दुसरा सर्वात मोठा देश आहे.'
                  : 'India is the 2nd largest generator of food waste globally according to the UNEP Food Waste Index Report.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-crafted space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center text-sm font-bold border border-amber-200">
                GHI
              </div>
              <div className="text-3xl font-black text-stone-900 font-serif">190M+</div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                {isMarathi ? 'अल्पपोषित लोकसंख्या' : 'Undernourished Citizens'}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-normal">
                {isMarathi
                  ? 'कृषी उत्पादनात स्वयंपूर्णता मिळवूनही, जगातील एकूण भुकेल्या लोकांपैकी एक चतुर्थांश लोक भारतात राहतात.'
                  : "India accounts for a quarter of the world's undernourished citizens, despite high domestic agriculture output."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-crafted space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-sm font-bold border border-emerald-200">
                INR
              </div>
              <div className="text-3xl font-black text-stone-900 font-serif">
                {isMarathi ? '₹११.५ लाख कोटी' : '₹11.5L Cr'}
              </div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                {isMarathi ? 'वार्षिक आर्थिक नुकसान' : 'Annual Economic Loss'}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-normal">
                {isMarathi
                  ? 'भारतात वाया जाणाऱ्या अन्नाचे आर्थिक मूल्य देशाच्या संपूर्ण आरोग्य किंवा शिक्षण बजेटपेक्षाही जास्त आहे.'
                  : 'The financial value of lost and discarded food in India exceeds the annual national education or health budgets.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-crafted space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center text-sm font-bold border border-cyan-200">
                CO2
              </div>
              <div className="text-3xl font-black text-stone-900 font-serif">8 - 10%</div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                {isMarathi ? 'जागतिक हरितगृह वायू' : 'Global GHG Footprint'}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-normal">
                {isMarathi
                  ? 'अन्न नासाडी हा एक देश असता, तर चीन आणि अमेरिकेनंतर हरितगृह वायू उत्सर्जनात त्याचा जगात तिसरा क्रमांक असता.'
                  : 'If food waste were a nation, it would rank as the 3rd largest emitter of greenhouse gases after China and the US.'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Section 2: Detailed India Food Distribution Ecosystem */}
      {(activeTab === 'overview' || activeTab === 'india') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-crafted space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {isMarathi ? 'संस्थात्मक कार्यपद्धती' : 'Civic Operating Model'}
                </span>
                <h3 className="text-2xl font-black text-stone-900 font-serif mt-1">
                  {isMarathi
                    ? 'सुरक्षित अतिरिक्त अन्न पुनर्वितरण कसे कार्य करते?'
                    : 'How Organized Surplus Food Redistribution Works'}
                </h3>
              </div>
              <div className="text-xs text-stone-500 max-w-sm font-normal">
                {isMarathi ? (
                  <>
                    <strong>इंडिया फूडबँकिंग नेटवर्क (IFBN)</strong> आणि आधुनिक डिजिटल तंत्रज्ञान प्रणालीवर आधारित बहुपक्षीय कार्यपद्धती.
                  </>
                ) : (
                  <>
                    Inspired by the multi-stakeholder operational model of the{' '}
                    <strong>India FoodBanking Network (IFBN)</strong> and modern civic tech platforms.
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-900 flex items-center justify-center font-bold text-sm">
                  01
                </div>
                <h4 className="font-bold text-base text-stone-900">
                  {isMarathi ? '१. मूळ स्त्रोतावरच अन्न संकलन' : '1. Interception at Source'}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  {isMarathi
                    ? 'हॉटेल्स, लग्न समारंभ, कॉर्पोरेट कॅन्टीन आणि कॅटरर्सकडे रोज अतिरिक्त अन्न तयार होते. ते कचऱ्यात टाकण्याऐवजी अन्नदाता अन्नाचा प्रकार, प्रमाण आणि एक्सपायरी वेळ ॲपवर नोंदवतात.'
                    : 'Hotels, wedding banquets, corporate cafeterias, and caterers generate daily surplus. Donors log food categories, quantities, and strict expiry timestamps instead of disposing of it.'}
                </p>
                <div className="text-[11px] font-semibold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200 inline-block">
                  {isMarathi ? 'कचरा डेपोत जाण्यापासून संरक्षण' : 'Prevents Municipal Dump Disposal'}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm">
                  02
                </div>
                <h4 className="font-bold text-base text-stone-900">
                  {isMarathi ? '२. सुरक्षित व जलद वाहतूक' : '2. Rapid Hygiene Transit'}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  {isMarathi
                    ? 'स्थानिक परिसरातील पडताळणी झालेल्या स्वयंसेवकांना त्वरित सूचना मिळते. FSSAI अन्न सुरक्षा नियमांचे पालन करून स्वच्छ डब्यांतून अन्न जलद पिकअप केले जाते.'
                    : 'Verified volunteer riders within the geofence receive automated dispatch alerts. Food is collected in insulated thermal boxes adhering strictly to FSSAI handling guidelines.'}
                </p>
                <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                  {isMarathi ? 'थेट कालबाह्यता ट्रॅकिंग' : 'Active Expiry Countdown'}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                  03
                </div>
                <h4 className="font-bold text-base text-stone-900">
                  {isMarathi ? '३. सन्मानपूर्वक थेट वाटप' : '3. Dignified Distribution'}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  {isMarathi
                    ? 'हे अन्न रात्र निवारे, अनाथालये, झोपडपट्टी शाळा, कष्टकरी कामगार आणि धर्मादाय रुग्णालयांपर्यंत त्वरित पोहोचवून गरम जेवण सन्मानाने दिले जाते.'
                    : 'Dispatches arrive directly at verified community shelters, orphanages, day-laborer centres, and community kitchens, serving fresh, warm meals with total dignity.'}
                </p>
                <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                  {isMarathi ? 'थेट पोषण सुरक्षा' : 'Direct Food Security'}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Environmental Consequences (Global) */}
      {(activeTab === 'overview' || activeTab === 'global') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-stone-900 rounded-3xl p-8 sm:p-12 text-white border border-stone-800 shadow-crafted space-y-8">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                {isMarathi ? 'पर्यावरणीय प्रभाव आणि शाश्वतता' : 'Ecological Sustainability'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-serif">
                {isMarathi
                  ? 'अन्नाची नासाडी हे एक छुपे हवामान संकट आहे'
                  : 'Food Waste is a Climate Catastrophe in Disguise'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 font-normal">
                {isMarathi
                  ? 'जेव्हा आपण अन्न फेकून देतो, तेव्हा आपण केवळ जेवण फेकत नाही—तर ते पिकवण्यासाठी लागलेले पाणी, जमीन आणि नैसर्गिक संसाधनेही वाया घालवतो.'
                  : 'Discarding food squanders all the embedded water, soil nutrients, transport fuel, and human labor that went into cultivating it.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">WATER FOOTPRINT</div>
                <h4 className="font-bold text-base text-white">
                  {isMarathi ? 'पाण्याचा प्रचंड अपव्यय' : 'Massive Water Depletion'}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed font-normal">
                  {isMarathi
                    ? 'शेतीसाठी जगातील ७०% गोडे पाणी वापरले जाते. १ किलो तांदूळ पिकवण्यासाठी सुमारे २,५०० लिटर पाणी लागते. अन्न कचऱ्यात टाकणे म्हणजे पाण्याचा नळ सतत चालू ठेवण्यासारखे आहे.'
                    : 'Agriculture consumes 70% of freshwater. Producing 1 kg of rice requires 2,500 liters of water. Rescuing meals effectively protects vital aquifers.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-rose-400 uppercase tracking-widest">METHANE CRISIS</div>
                <h4 className="font-bold text-base text-white">
                  {isMarathi ? 'कचरा डेपोतील विषारी मिथेन' : 'Anaerobic Methane Formation'}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed font-normal">
                  {isMarathi ? (
                    <>
                      कचरा डेपोत सडणाऱ्या अन्नातून <strong>मिथेन (CH₄)</strong> वायू बाहेर पडतो, जो १०० वर्षांच्या कालावधीत कार्बन डायऑक्साइडपेक्षा २८ पट जास्त तापमान वाढीस कारणीभूत ठरतो.
                    </>
                  ) : (
                    <>
                      Landfilled food rots anaerobically, emitting <strong>methane (CH₄)</strong>, which carries 28x more greenhouse heating power than carbon dioxide.
                    </>
                  )}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">GLOBAL GOALS</div>
                <h4 className="font-bold text-base text-white">
                  {isMarathi ? 'संयुक्त राष्ट्र SDG उद्दिष्टे' : 'UN SDG 2 & 12.3 Alignment'}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed font-normal">
                  {isMarathi ? (
                    <>
                      अतिरिक्त अन्न पुनर्वितरण थेट <strong>UN SDG 2 (शून्य भूक)</strong> आणि <strong>UN SDG 12.3</strong> (अन्न नासाडी निम्म्यावर आणणे) साध्य करण्यास मदत करते.
                    </>
                  ) : (
                    <>
                      Directly satisfies <strong>UN SDG 2 (Zero Hunger)</strong> and <strong>UN SDG 12.3</strong> (halving retail food waste by 2030) through structured civic infrastructure.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 4: Detailed Real-World Case Study */}
      {(activeTab === 'overview' || activeTab === 'casestudy') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-crafted space-y-8">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold uppercase rounded-full">
                {isMarathi ? 'पुणे केस स्टडी' : 'Featured Urban Case Study'}
              </span>
              <span className="text-xs text-stone-400">
                {isMarathi
                  ? 'शहरी बँक्वेट आणि मोठ्या कार्यक्रमांमधील अन्न बचाव'
                  : 'Commercial Event Surplus Food Recovery'}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight font-serif">
                {isMarathi
                  ? 'केस स्टडी: पुण्यातील लग्न समारंभातून ३५०+ जेवणांचे यशस्वी पुनर्वितरण'
                  : 'Case Study: Rescuing 350+ Servings from an Urban Wedding Reception in Pune'}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-normal">
                {isMarathi
                  ? 'भारतातील प्रमुख शहरांमध्ये लग्न समारंभात अन्नाची कमतरता भासू नये म्हणून सरासरी १५% ते २५% अतिरिक्त जेवण बनवले जाते. डिजिटल प्लॅटफॉर्म नसल्यास रात्री ११:३० वाजता ५०-१०० किलो ताजी बिर्याणी, पनीर भाजी आणि पोळ्या फेकून द्याव्या लागतात.'
                  : 'Caterers routinely prepare 15% to 25% surplus to avoid food shortages at major banquets. Without real-time digital matchmaking, freshly cooked biryani, gravies, and rotis are dumped at midnight.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {isMarathi ? 'समस्या' : 'Initial Condition'}
                </span>
                <div className="font-black text-base text-stone-900 font-serif">
                  {isMarathi ? '८५ किलो शिजवलेले अन्न' : '85 kg Cooked Food'}
                </div>
                <p className="text-xs text-stone-500 font-normal">
                  {isMarathi
                    ? 'खराब होण्यापूर्वी खोलीच्या तापमानात केवळ ४ तासांची सुरक्षित खाण्यायोग्य मर्यादा.'
                    : 'Leftover banquet dishes with a 4-hour room temperature consumption limit.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {isMarathi ? 'कृती (Action)' : 'Platform Action'}
                </span>
                <div className="font-black text-base text-emerald-800 font-serif">
                  {isMarathi ? '२ मिनिटांत ॲपवर नोंद' : 'Logged in 2 Minutes'}
                </div>
                <p className="text-xs text-stone-500 font-normal">
                  {isMarathi
                    ? 'कॅटरिंग व्यवस्थापकाने फोटो आणि ४ तासांच्या टाइमरसह नोंद केले. ६ किमी अंतरावरील २ निवाऱ्यांनी लगेच मागणी नोंदवली.'
                    : 'Catering manager posted with photo and countdown timer. 2 nearby shelters claimed in 6 mins.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {isMarathi ? 'वाहतूक (Transit)' : 'Courier Transit'}
                </span>
                <div className="font-black text-base text-cyan-800 font-serif">
                  {isMarathi ? '३२ मिनिटांत पिकअप व डिलिव्हरी' : '32-Min Turnaround'}
                </div>
                <p className="text-xs text-stone-500 font-normal">
                  {isMarathi
                    ? 'स्वयंसेवकाने विनंती स्वीकारून स्वच्छ थर्मल डब्यांतून थेट निवाऱ्यांपर्यंत सुरक्षित अन्न पोहोचवले.'
                    : 'Volunteer courier accepted dispatch with thermal boxes and fulfilled delivery with dual OTPs.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {isMarathi ? 'परिणाम' : 'Verified Outcome'}
                </span>
                <div className="font-black text-base text-stone-900 font-serif">
                  {isMarathi ? '१९० बालकांना पौष्टिक भोजन' : '190 Children Fed'}
                </div>
                <p className="text-xs text-stone-500 font-normal">
                  {isMarathi
                    ? 'अन्न वेळेत सुरक्षित पोहोचवले. ९५ किलो कार्बन उत्सर्जन कचरा डेपोत होण्यापासून रोखले.'
                    : 'Safely consumed before expiry. 95 kg of landfill greenhouse gas emissions eliminated.'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-stone-100/80 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  {isMarathi ? 'अन्नदात्यांसाठी मुख्य संदेश' : 'Key Takeaway for Donors'}
                </div>
                <p className="text-xs text-stone-600 font-normal">
                  {isMarathi
                    ? 'गती, पारदर्शकता आणि थेट एक्सपायरी टाइमरमुळे रात्री उशिराही अन्न वाचवणे शक्य होते. वाचवलेले प्रत्येक ताट जीवन बदलू शकते.'
                    : 'Live expiry countdowns and automated courier routing make late-night surplus recovery practical and safe.'}
                </p>
              </div>
              <Link
                href="/donor"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
              >
                {isMarathi ? 'अन्न दान करण्यास सुरुवात करा →' : 'Start Donating →'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Section 5: Interactive Impact Calculator & Action Call */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-crafted space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {isMarathi ? 'परस्परसंवादी प्रभाव कॅल्क्युलेटर' : 'Interactive Impact Calculator'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
              {isMarathi ? 'तुमच्या अन्न दानाचा प्रत्यक्ष प्रभाव पहा' : 'Compute Your Ecological & Social Impact'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 font-normal">
              {isMarathi
                ? 'तुमचे घर, हॉटेल किंवा संस्था किती जेवण दान करू शकते ते स्लाइडरने निवडा आणि त्याचा निसर्ग व समाजावर होणारा सकारात्मक परिणाम पहा:'
                : 'Slide to simulate surplus meal volumes and observe the immediate reduction in emissions, water waste, and hunger:'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-bold text-stone-800">
              <span className="text-xs font-semibold text-stone-500">
                {isMarathi ? 'अपेक्षित वाचवलेले जेवण:' : 'Estimated Rescued Servings:'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-800 font-serif">
                {calculatorMeals} {isMarathi ? 'जेवण' : 'Servings'}
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={calculatorMeals}
              onChange={(e) => setCalculatorMeals(Number(e.target.value))}
              className="w-full h-2.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-800"
            />

            <div className="flex justify-between text-[11px] text-stone-500 font-medium">
              <span>{isMarathi ? '५ जेवण (कुटुंब)' : '5 Meals (Family Dinner)'}</span>
              <span>{isMarathi ? '१०० जेवण (हॉटेल)' : '100 Meals (Restaurant Shift)'}</span>
              <span>{isMarathi ? '५०० जेवण (लग्न सोहळा)' : '500 Meals (Convention Banquet)'}</span>
            </div>
          </div>

          {/* Calculator Output Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center mx-auto">
                <UtensilsIcon className="w-5 h-5 text-emerald-800" />
              </div>
              <div className="text-3xl font-black text-stone-900 font-serif">{foodSavedKg} kg</div>
              <div className="text-xs font-bold uppercase tracking-wider text-stone-600">
                {isMarathi ? 'वाचवलेले अतिरिक्त अन्न' : 'Food Rescued'}
              </div>
              <p className="text-[11px] text-stone-500 font-normal">
                {isMarathi
                  ? 'कचऱ्यात जाण्याऐवजी पौष्टिक जेवण स्थानिक रात्र निवारे आणि अनाथालयांपर्यंत पोहोचले.'
                  : 'Nutritious meals redirected from waste streams directly to local shelters.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-900 flex items-center justify-center mx-auto">
                <GlobeIcon className="w-5 h-5 text-cyan-800" />
              </div>
              <div className="text-3xl font-black text-stone-900 font-serif">{co2PreventedKg} kg</div>
              <div className="text-xs font-bold uppercase tracking-wider text-stone-600">
                {isMarathi ? 'रोखलेले कार्बन उत्सर्जन (CO₂e)' : 'CO₂e Prevented'}
              </div>
              <p className="text-[11px] text-stone-500 font-normal">
                {isMarathi
                  ? 'उघड्या कचरा डेपोत सडणाऱ्या अन्नातून निर्माण होणारा विषारी मिथेन वायू रोखला.'
                  : 'Eliminates methane gas produced when organic matter decomposes in municipal dumps.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
                <SparklesIcon className="w-5 h-5 text-amber-800" />
              </div>
              <div className="text-3xl font-black text-stone-900 font-serif">{waterSavedLiters} L</div>
              <div className="text-xs font-bold uppercase tracking-wider text-stone-600">
                {isMarathi ? 'वाचवलेले कृषी पाणी' : 'Water Footprint Protected'}
              </div>
              <p className="text-[11px] text-stone-500 font-normal">
                {isMarathi
                  ? 'शेतीपासून ताटापर्यंत अन्न उत्पादनात वापरले गेलेले मौल्यवान सिंचन पाणी सुरक्षित राहिले.'
                  : 'Protects critical groundwater and irrigation supplies invested in food cultivation.'}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-500 font-normal">
              {isMarathi ? (
                <>
                  सुरुवात करण्यास तयार आहात? कोणीही <strong>अन्नदाता (Donor)</strong>, <strong>स्वयंसेवी संस्था / निवारा</strong>, किंवा <strong>स्वयंसेवक (Volunteer Courier)</strong> म्हणून नोंदणी करू शकते.
                </>
              ) : (
                <>
                  Ready to eliminate food waste? Anyone can register as a <strong>Food Donor</strong>,{' '}
                  <strong>NGO / Shelter Partner</strong>, or <strong>Volunteer Courier</strong>.
                </>
              )}
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <Link
                href="/register"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                {isMarathi ? 'नेटवर्कमध्ये सामील व्हा →' : 'Join Network →'}
              </Link>
              <Link
                href="/donor"
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                {isMarathi ? 'अन्न पोस्ट करा' : 'Post Surplus Food'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

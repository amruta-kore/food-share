'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageProvider';

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
              <span>
                {isMarathi
                  ? 'विशेष केस स्टडी आणि जागतिक अहवाल'
                  : 'SPECIAL CASE STUDY & GLOBAL REPORT'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {isMarathi ? (
                <>
                  अतिरिक्त अन्नाची ताकद: <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                    भूकमुक्ती आणि पृथ्वीचे रक्षण
                  </span>
                </>
              ) : (
                <>
                  The Power of Surplus Food: <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                    Ending Hunger & Healing Our Planet
                  </span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              {isMarathi
                ? 'दररोज हॉटेल्स, स्वयंपाकघरे आणि बँक्वेट्समध्ये जगातील प्रत्येक भुकेल्या व्यक्तीचे पोट भरण्यासाठी पुरेसे पौष्टिक अन्न तयार होते. तरीही ४०% पर्यंत अन्न वाया जाते. भारत आणि जगातील अन्न नासाडीचे वास्तव जाणून घ्या आणि तुमचे योगदान का महत्त्वाचे आहे ते पहा.'
                : 'Every day, enough nutritious food is prepared across kitchens, banquets, and supply chains to feed every hungry individual on Earth. Yet, up to 40% is wasted. Explore the reality of food waste in India and the world, and discover why your donation matters.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/donor"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition transform active:scale-95 flex items-center space-x-2"
              >
                <span>🍲</span>
                <span>{isMarathi ? 'आता अतिरिक्त अन्न दान करा' : 'Donate Surplus Food Now'}</span>
              </Link>
              <Link
                href="/"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 transition flex items-center space-x-1.5"
              >
                <span>←</span>
                <span>{isMarathi ? 'थेट अतिरिक्त अन्नाकडे परत जा' : 'Back to Live Surplus Food'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
          {[
            {
              id: 'overview',
              label: isMarathi ? 'महत्त्वाची आकडेवारी आणि वास्तव' : 'Key Statistics & Reality',
              icon: '📊',
            },
            {
              id: 'india',
              label: isMarathi ? 'भारतातील स्थिती आणि विरोधाभास' : 'India Context & Paradox',
              icon: '🇮🇳',
            },
            {
              id: 'global',
              label: isMarathi ? 'पर्यावरणीय परिणाम' : 'Environmental Impact',
              icon: '🌍',
            },
            {
              id: 'casestudy',
              label: isMarathi ? 'पुणे प्रत्यक्ष केस स्टडी' : 'Real-World Case Study',
              icon: '📖',
            },
            {
              id: 'action',
              label: isMarathi ? 'प्रभाव कॅल्क्युलेटर आणि कृती' : 'Impact Calculator & Action',
              icon: '🧮',
            },
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
              {isMarathi
                ? 'मोठा विरोधाभास: मुबलकता असूनही भुकेची समस्या'
                : 'The Great Paradox: Abundance Amidst Deprivation'}
            </h2>
            <p className="text-sm text-slate-600">
              {isMarathi
                ? 'संयुक्त राष्ट्र पर्यावरण कार्यक्रम (UNEP), FAO आणि इंडिया फूडबँकिंग नेटवर्क (IFBN) च्या अहवालानुसार.'
                : 'Drawing insights from the United Nations Environment Programme (UNEP), FAO, and the India FoodBanking Network (IFBN).'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold">
                🗑️
              </div>
              <div className="text-3xl font-black text-slate-900">78.2M</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isMarathi ? 'टन / दरवर्षी (भारत)' : 'Tonnes / Year (India)'}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isMarathi
                  ? 'UNEP अन्न नासाडी निर्देशांक अहवालानुसार भारत जागतिक पातळीवर अन्न वाया घालवणारा दुसरा सर्वात मोठा देश आहे.'
                  : 'India is the 2nd largest generator of food waste globally according to the UNEP Food Waste Index Report.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold">
                👥
              </div>
              <div className="text-3xl font-black text-slate-900">190M+</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isMarathi ? 'अल्पपोषित लोकसंख्या' : 'Undernourished People'}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isMarathi
                  ? 'कृषी उत्पादनात स्वयंपूर्णता मिळवूनही, जगातील एकूण भुकेल्या लोकांपैकी एक चतुर्थांश लोक भारतात राहतात.'
                  : "India accounts for a quarter of the world's hungry population, despite achieving self-sufficiency in agricultural production."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                ₹
              </div>
              <div className="text-3xl font-black text-slate-900">
                {isMarathi ? '₹११.५ लाख कोटी' : '₹11.5 Lakh Cr'}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isMarathi ? 'वार्षिक आर्थिक नुकसान' : 'Annual Economic Loss'}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isMarathi
                  ? 'भारतात वाया जाणाऱ्या अन्नाचे आर्थिक मूल्य देशाच्या संपूर्ण आरोग्य किंवा शिक्षण बजेटपेक्षाही जास्त आहे.'
                  : 'The financial value of lost and discarded food in India could fund nationwide healthcare or education budgets.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold">
                🌍
              </div>
              <div className="text-3xl font-black text-slate-900">8 - 10%</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isMarathi ? 'जागतिक हरितगृह वायू उत्सर्जन' : 'Global GHG Emissions'}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isMarathi
                  ? 'अन्न नासाडी हा एक देश असता, तर चीन आणि अमेरिकेनंतर हरितगृह वायू उत्सर्जनात त्याचा जगात तिसरा क्रमांक असता.'
                  : 'If food waste were a country, it would be the 3rd largest emitter of greenhouse gases after China and the United States.'}
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
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  {isMarathi ? 'संस्थात्मक कार्यपद्धती' : 'Institutional Strategy'}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {isMarathi
                    ? 'सुरक्षित अतिरिक्त अन्न पुनर्वितरण कसे कार्य करते?'
                    : 'How Organized Surplus Food Banking Works'}
                </h3>
              </div>
              <div className="text-xs text-slate-500 max-w-sm">
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
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h4 className="font-bold text-base text-slate-900">
                  {isMarathi ? '१. मूळ स्त्रोतावरच अन्न संकलन' : 'Interception at Source'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isMarathi
                    ? 'हॉटेल्स, लग्न समारंभ, कॉर्पोरेट कॅन्टीन आणि कॅटरर्सकडे रोज अतिरिक्त अन्न तयार होते. ते कचऱ्यात टाकण्याऐवजी अन्नदाता अन्नाचा प्रकार, प्रमाण आणि एक्सपायरी वेळ ॲपवर नोंदवतात.'
                    : 'Hotels, wedding banquets, corporate cafeterias, and food manufacturers generate daily surplus. Instead of dumping clean, untouched food into bins, donors log item categories, quantities, and strict expiry timestamps.'}
                </p>
                <div className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-block">
                  {isMarathi ? 'कचरा डेपोत जाण्यापासून संरक्षण' : 'Prevents Landfill Dumping'}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h4 className="font-bold text-base text-slate-900">
                  {isMarathi ? '२. सुरक्षित व जलद वाहतूक' : 'Vetted Cold & Direct Transit'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isMarathi
                    ? 'स्थानिक परिसरातील पडताळणी झालेल्या स्वयंसेवकांना त्वरित सूचना मिळते. FSSAI अन्न सुरक्षा नियमांचे पालन करून स्वच्छ डब्यांतून अन्न जलद पिकअप केले जाते.'
                    : 'Verified couriers and volunteer drivers are notified instantly within local geofences. Food is picked up with proper hygienic containers before thermal degradation, adhering to food safety guidelines (FSSAI).'}
                </p>
                <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                  {isMarathi ? 'थेट कालबाह्यता ट्रॅकिंग' : 'Real-Time Countdown Tracking'}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h4 className="font-bold text-base text-slate-900">
                  {isMarathi ? '३. सन्मानपूर्वक थेट वाटप' : 'Dignified Last-Mile Distribution'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isMarathi
                    ? 'हे अन्न रात्र निवारे, अनाथालये, झोपडपट्टी शाळा, कष्टकरी कामगार आणि धर्मादाय रुग्णालयांपर्यंत त्वरित पोहोचवून गरम जेवण सन्मानाने दिले जाते.'
                    : 'Food reaches vetted beneficiary institutions: night shelters, slum schools, orphanages, day-laborer communities, and charitable hospitals, delivering immediate hot meals with complete dignity.'}
                </p>
                <div className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 inline-block">
                  {isMarathi ? 'थेट पोषण सुरक्षा' : 'Direct Nutritional Security'}
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
                {isMarathi ? 'पर्यावरणीय प्रभाव आणि शाश्वतता' : 'Planetary Impact & Sustainability'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black">
                {isMarathi
                  ? 'अन्नाची नासाडी हे एक छुपे हवामान संकट आहे'
                  : 'Food Waste is a Climate Catastrophe in Disguise'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {isMarathi
                  ? 'जेव्हा आपण अन्न फेकून देतो, तेव्हा आपण केवळ जेवण फेकत नाही—तर ते पिकवण्यासाठी लागलेले पाणी, जमीन आणि नैसर्गिक संसाधनेही वाया घालवतो.'
                  : 'When we throw away food, we do not simply discard a meal—we waste all the hidden ecological inputs that went into creating it.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:bg-white/10 transition">
                <div className="text-3xl">💧</div>
                <h4 className="font-bold text-base text-white">
                  {isMarathi ? 'पाण्याचा प्रचंड अपव्यय' : 'Massive Water Depletion'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isMarathi
                    ? 'शेतीसाठी जगातील ७०% गोडे पाणी वापरले जाते. १ किलो तांदूळ पिकवण्यासाठी सुमारे २,५०० लिटर पाणी लागते. अन्न कचऱ्यात टाकणे म्हणजे पाण्याचा नळ सतत चालू ठेवण्यासारखे आहे.'
                    : 'Agriculture accounts for 70% of global freshwater use. Producing 1 kg of rice requires roughly 2,500 liters of water. Throwing food into the garbage is equivalent to leaving taps gushing water endlessly.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:bg-white/10 transition">
                <div className="text-3xl">🔥</div>
                <h4 className="font-bold text-base text-white">
                  {isMarathi ? 'कचरा डेपोतील विषारी मिथेन' : 'Methane in Landfills'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isMarathi ? (
                    <>
                      कचरा डेपोत सडणाऱ्या अन्नातून <strong>मिथेन (CH₄)</strong> वायू बाहेर पडतो, जो १०० वर्षांच्या कालावधीत कार्बन डायऑक्साइडपेक्षा २८ पट जास्त जागतिक तापमान वाढीसाठी कारणीभूत ठरतो.
                    </>
                  ) : (
                    <>
                      Food buried in landfills decomposes anaerobically, releasing <strong>methane (CH₄)</strong>—a greenhouse gas with 28 times the global warming potential of carbon dioxide over a 100-year cycle.
                    </>
                  )}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:bg-white/10 transition">
                <div className="text-3xl">🎯</div>
                <h4 className="font-bold text-base text-white">
                  {isMarathi ? 'संयुक्त राष्ट्र SDG उद्दिष्टे' : 'UN SDG Alignment'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isMarathi ? (
                    <>
                      अतिरिक्त अन्न पुनर्वितरण थेट <strong>UN SDG 2 (शून्य भूक)</strong> आणि <strong>UN SDG 12.3</strong> (२०३० पर्यंत दरडोई अन्न नासाडी निम्म्यावर आणणे) साध्य करण्यात मदत करते.
                    </>
                  ) : (
                    <>
                      Surplus food redistribution directly satisfies <strong>UN SDG 2 (Zero Hunger)</strong> and <strong>UN SDG 12.3</strong> (halving per capita global food waste by 2030), turning a waste management liability into human nutrition.
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
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-8">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold uppercase rounded-full">
                {isMarathi ? 'महत्त्वाची केस स्टडी' : 'Featured Case Study'}
              </span>
              <span className="text-xs text-slate-400">
                {isMarathi
                  ? 'शहरी बँक्वेट आणि मोठ्या कार्यक्रमांमधील अन्न बचाव'
                  : 'Urban Banquet & Large Event Food Recovery'}
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {isMarathi
                  ? 'केस स्टडी: पुण्यातील लग्न समारंभातून ३५०+ जेवणांचे यशस्वी पुनर्वितरण'
                  : 'Case Study: Rescuing 350+ Servings from an Urban Wedding Reception in Pune'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isMarathi
                  ? 'भारतातील प्रमुख शहरांमध्ये लग्न समारंभात अन्नाची कमतरता भासू नये म्हणून सरासरी १५% ते २५% अतिरिक्त जेवण बनवले जाते. डिजिटल प्लॅटफॉर्म नसल्यास रात्री ११:३० वाजता ५०-१०० किलो ताजी बिर्याणी, पनीर भाजी आणि पोळ्या फेकून द्याव्या लागतात.'
                  : 'In metropolitan cities across India, wedding banquets prepare on average 15% to 25% extra food to prevent catering shortages. Without a digital food-sharing channel, caterers are forced to discard 50–100 kg of wholesome biryani, paneer gravies, and rotis at 11:30 PM.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {isMarathi ? 'समस्या' : 'The Problem'}
                </span>
                <div className="font-extrabold text-base text-slate-900">
                  {isMarathi ? '८५ किलो शिजवलेले अन्न' : '85 kg Cooked Food'}
                </div>
                <p className="text-xs text-slate-500">
                  {isMarathi
                    ? 'खराब होण्यापूर्वी खोलीच्या तापमानात केवळ ४ तासांची सुरक्षित खाण्यायोग्य मर्यादा.'
                    : 'Leftover hot food with a 4-hour room temperature shelf-life before bacterial proliferation.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {isMarathi ? 'कृती (Action)' : 'The Action'}
                </span>
                <div className="font-extrabold text-base text-emerald-700">
                  {isMarathi ? '२ मिनिटांत ॲपवर नोंद' : 'Digital Logged in 2 Mins'}
                </div>
                <p className="text-xs text-slate-500">
                  {isMarathi
                    ? 'कॅटरिंग व्यवस्थापकाने फोटो आणि ४ तासांच्या टाइमरसह नोंद केले. ६ किमी अंतरावरील २ निवाऱ्यांनी लगेच मागणी नोंदवली.'
                    : 'Catering manager logged item with photo and expiry timer (+4h). 2 shelters in a 6 km radius claimed.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {isMarathi ? 'वाहतूक (Transit)' : 'The Transit'}
                </span>
                <div className="font-extrabold text-base text-blue-700">
                  {isMarathi ? '३२ मिनिटांत पिकअप व डिलिव्हरी' : '32-Minute Dispatch'}
                </div>
                <p className="text-xs text-slate-500">
                  {isMarathi
                    ? 'स्वयंसेवकाने विनंती स्वीकारून स्वच्छ थर्मल डब्यांतून थेट निवाऱ्यांपर्यंत सुरक्षित अन्न पोहोचवले.'
                    : 'Volunteer courier accepted dispatch, picked up sanitized thermal containers, and delivered directly.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {isMarathi ? 'परिणाम' : 'The Outcome'}
                </span>
                <div className="font-extrabold text-base text-purple-700">
                  {isMarathi ? '१९० बालकांना पौष्टिक भोजन' : '190 Children Fed'}
                </div>
                <p className="text-xs text-slate-500">
                  {isMarathi
                    ? 'अन्न वेळेत सुरक्षित पोहोचवले. ९५ किलो कार्बन उत्सर्जन कचरा डेपोत होण्यापासून रोखले.'
                    : 'Delivered safely before expiry. Prevented 95 kg of CO2 equivalent landfill emissions.'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-bold text-emerald-900">
                  {isMarathi ? 'अन्नदात्यांसाठी मुख्य संदेश' : 'Key Takeaway for Donors'}
                </div>
                <p className="text-xs text-emerald-800">
                  {isMarathi
                    ? 'गती, पारदर्शकता आणि थेट एक्सपायरी टाइमरमुळे रात्री उशिराही अन्न वाचवणे शक्य होते. वाचवलेले प्रत्येक ताट जीवन बदलू शकते.'
                    : 'Speed, transparency, and expiry countdowns make surplus food rescue feasible even late at night. Every single meal saved changes lives.'}
                </p>
              </div>
              <Link
                href="/donor"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
              >
                {isMarathi ? 'अन्न दान करण्यास सुरुवात करा →' : 'Start Donating →'}
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
              {isMarathi ? 'परस्परसंवादी प्रभाव कॅल्क्युलेटर' : 'Interactive Impact Calculator'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {isMarathi ? 'तुमच्या अन्न दानाचा प्रत्यक्ष प्रभाव पहा' : 'See the Impact of Your Food Donation'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              {isMarathi
                ? 'तुमचे घर, हॉटेल किंवा संस्था किती जेवण दान करू शकते ते स्लाइडरने निवडा आणि त्याचा निसर्ग व समाजावर होणारा सकारात्मक परिणाम पहा:'
                : 'Select or slide how many meals your home, restaurant, or business can donate, and witness the direct positive ecological and humanitarian ripple effect:'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-bold text-slate-800">
              <span>{isMarathi ? 'अपेक्षित वाचवलेले जेवण:' : 'Estimated Meals to Rescue:'}</span>
              <span className="text-2xl font-black text-emerald-600">
                {calculatorMeals} {isMarathi ? 'जेवण (Meals)' : 'Meals'}
              </span>
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
              <span>{isMarathi ? '५ जेवण (कौटुंबिक भोजन)' : '5 Meals (Family Dinner)'}</span>
              <span>{isMarathi ? '१०० जेवण (हॉटेल सेवा)' : '100 Meals (Restaurant Service)'}</span>
              <span>{isMarathi ? '५०० जेवण (मोठा लग्न समारंभ)' : '500 Meals (Large Banquet / Convention)'}</span>
            </div>
          </div>

          {/* Calculator Output Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-center">
              <span className="text-3xl">🍲</span>
              <div className="text-3xl font-black text-emerald-800">{foodSavedKg} kg</div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                {isMarathi ? 'वाचवलेले अतिरिक्त अन्न' : 'Surplus Food Rescued'}
              </div>
              <p className="text-[11px] text-emerald-700">
                {isMarathi
                  ? 'कचऱ्यात जाण्याऐवजी पौष्टिक जेवण स्थानिक रात्र निवारे आणि अनाथालयांपर्यंत पोहोचले.'
                  : 'Wholesome meals redirected to local night shelters & orphanages instead of trash compactors.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2 text-center">
              <span className="text-3xl">🌍</span>
              <div className="text-3xl font-black text-teal-800">{co2PreventedKg} kg</div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-900">
                {isMarathi ? 'रोखलेले कार्बन उत्सर्जन (CO₂e)' : 'CO₂e Emissions Prevented'}
              </div>
              <p className="text-[11px] text-teal-700">
                {isMarathi
                  ? 'उघड्या कचरा डेपोत सडणाऱ्या अन्नातून निर्माण होणारा विषारी मिथेन वायू रोखला.'
                  : 'Prevents hazardous methane gas emission produced by rotting organic matter in open municipal dumps.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 text-center">
              <span className="text-3xl">💧</span>
              <div className="text-3xl font-black text-blue-800">{waterSavedLiters} L</div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-900">
                {isMarathi ? 'वाचवलेले कृषी पाणी' : 'Agricultural Water Saved'}
              </div>
              <p className="text-[11px] text-blue-700">
                {isMarathi
                  ? 'शेतीपासून ताटापर्यंत अन्न उत्पादनात वापरले गेलेले मौल्यवान सिंचन पाणी सुरक्षित राहिले.'
                  : 'Preserves vital embedded irrigation and cultivation water used throughout the farm-to-table chain.'}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              {isMarathi ? (
                <>
                  सुरुवात करण्यास तयार आहात? कोणीही <strong>अन्नदाता (Donor)</strong>, <strong>स्वयंसेवी संस्था / निवारा</strong>, किंवा <strong>स्वयंसेवक (Volunteer Courier)</strong> म्हणून नोंदणी करू शकते.
                </>
              ) : (
                <>
                  Ready to take action? Anyone can register as a <strong>Food Donor</strong>,{' '}
                  <strong>NGO / Shelter Partner</strong>, or <strong>Volunteer Courier</strong>.
                </>
              )}
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <Link
                href="/register"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                {isMarathi ? 'नेटवर्कमध्ये सामील व्हा →' : 'Join the Network →'}
              </Link>
              <Link
                href="/donor"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
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

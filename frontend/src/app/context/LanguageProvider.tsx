'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'mr';

export interface Translations {
  [key: string]: {
    en: string;
    mr: string;
  };
}

export const translations: Translations = {
  // Brand & Common
  brand_name: {
    en: 'AnnaSetu',
    mr: 'अन्नसेतू',
  },
  brand_tagline: {
    en: 'SURPLUS REDISTRIBUTION',
    mr: 'अतिरिक्त अन्न पुनर्वितरण नेटवर्क',
  },

  // Navbar
  nav_surplus: {
    en: 'Surplus Food',
    mr: 'अतिरिक्त अन्न',
  },
  nav_donor: {
    en: 'Donor Dashboard',
    mr: 'अन्नदाता डॅशबोर्ड',
  },
  nav_ngo: {
    en: 'NGO Claim Hub',
    mr: 'संस्था / शेल्टर हब',
  },
  nav_volunteer: {
    en: 'Delivery Board',
    mr: 'वितरण फलक',
  },
  nav_admin: {
    en: 'Admin Panel',
    mr: 'प्रशासक पॅनेल',
  },
  nav_impact: {
    en: 'Impact & Case Study',
    mr: 'प्रभाव आणि अभ्यास',
  },
  nav_reviews: {
    en: 'Reviews & Rating',
    mr: 'अभिप्राय आणि रेटिंग',
  },
  nav_login: {
    en: 'Log In',
    mr: 'लॉगिन करा',
  },
  nav_join: {
    en: 'Join AnnaSetu',
    mr: 'अन्नसेतूशी जोडा',
  },
  nav_signout: {
    en: 'Sign Out',
    mr: 'बाहेर पडा',
  },
  nav_signout_full: {
    en: 'Sign Out of AnnaSetu',
    mr: 'अन्नसेतूमधून बाहेर पडा',
  },

  // Hero Section
  hero_live_badge: {
    en: 'ANNASETU • LIVE SURPLUS FOOD REDISTRIBUTION NETWORK',
    mr: 'अन्नसेतू • थेट अतिरिक्त अन्न पुनर्वितरण नेटवर्क',
  },
  hero_title_prefix: {
    en: 'Safe Surplus Food From',
    mr: 'स्वयंपाकघरे आणि बँक्वेट्समधील',
  },
  hero_title_highlight: {
    en: 'Kitchens & Banquets',
    mr: 'सुरक्षित अतिरिक्त अन्न',
  },
  hero_title_suffix: {
    en: 'To People In Need.',
    mr: 'गरजवंतांपर्यंत.',
  },
  hero_description: {
    en: 'Restaurants and caterers post excess safe meals. Verified NGOs claim them in minutes. Volunteer couriers handle rapid delivery. Zero food waste.',
    mr: 'हॉटेल्स आणि केटरर्स अतिरिक्त जेवण पोस्ट करतात. पडताळणी झालेल्या स्वयंसेवी संस्था काही मिनिटांत मागणी करतात. स्वयंसेवक जलद पोहोचवतात. शून्य अन्न वाया.',
  },
  portals_heading: {
    en: 'Platform Portals & Dashboards:',
    mr: 'प्लॅटफॉर्म पोर्टल्स आणि डॅशबोर्ड्स:',
  },
  portal_donor_title: {
    en: 'Food Donor',
    mr: 'अन्नदाता (Donor)',
  },
  portal_donor_desc: {
    en: 'Post Surplus',
    mr: 'अन्न पोस्ट करा',
  },
  portal_ngo_title: {
    en: 'NGO / Shelter',
    mr: 'संस्था / शेल्टर (NGO)',
  },
  portal_ngo_desc: {
    en: 'Claim Food',
    mr: 'अन्न मिळवा',
  },
  portal_volunteer_title: {
    en: 'Volunteer',
    mr: 'स्वयंसेवक (Volunteer)',
  },
  portal_volunteer_desc: {
    en: 'Delivery Board',
    mr: 'डिलिव्हरी कार्य',
  },
  portal_admin_title: {
    en: 'Admin Panel',
    mr: 'प्रशासक पॅनेल (Admin)',
  },
  portal_admin_desc: {
    en: 'Restricted (Admin Only)',
    mr: 'केवळ प्रशासक',
  },

  // Impact Stats
  stat_meals_rescued: {
    en: 'Meals Rescued',
    mr: 'वाचवलेले जेवण',
  },
  stat_partner_restaurants: {
    en: 'Partner Restaurants',
    mr: 'सहभागी हॉटेल्स',
  },
  stat_shelters_ngos: {
    en: 'Shelters & NGOs',
    mr: 'संस्था आणि निवारे',
  },
  stat_free_nonprofit: {
    en: 'Free & Non-Profit',
    mr: 'विनामूल्य आणि सामाजिक',
  },

  // Feed & Filters
  feed_heading: {
    en: 'Surplus Food Redistribution Feed',
    mr: 'थेट अन्न वितरण फीड',
  },
  feed_subheading: {
    en: 'Real-time edible surplus food posted by local banquet halls, caterers, and restaurants',
    mr: 'स्थानिक बँक्वेट हॉल्स, केटरर्स आणि हॉटेल्सद्वारे पोस्ट केलेले ताजे अतिरिक्त अन्न',
  },
  tab_active_surplus: {
    en: 'Available Surplus Food',
    mr: 'उपलब्ध अतिरिक्त अन्न',
  },
  tab_delivered_history: {
    en: 'Delivered History',
    mr: 'वितरित अन्नाचा इतिहास',
  },
  search_placeholder: {
    en: 'Search food, city, donor, or recipient shelter...',
    mr: 'अन्न, शहर, अन्नदाता किंवा शेल्टर शोधा...',
  },
  filter_all_categories: {
    en: 'All Categories',
    mr: 'सर्व प्रकार',
  },
  filter_veg_only: {
    en: 'Vegetarian Only',
    mr: 'फक्त शाकाहारी',
  },
  empty_listings: {
    en: 'No food donations found matching your criteria.',
    mr: 'या निकषाशी जुळणारे अन्न आढळले नाही.',
  },

  // Common Action Buttons & Statuses
  btn_edit_profile: {
    en: 'Edit Profile',
    mr: 'प्रोफाइल बदला',
  },
  btn_post_surplus: {
    en: 'Post Surplus Food',
    mr: 'अन्न पोस्ट करा',
  },
  btn_set_location: {
    en: 'Set Shelter Location',
    mr: 'शेल्टरचे स्थान निश्चित करा',
  },
  btn_refresh_tasks: {
    en: 'Refresh Tasks',
    mr: 'कार्ये रिफ्रेश करा',
  },
  btn_refresh_data: {
    en: 'Refresh Data',
    mr: 'माहिती रिफ्रेश करा',
  },
  btn_claim_food: {
    en: 'Claim Food',
    mr: 'अन्न मागणी करा',
  },
  status_available: {
    en: 'AVAILABLE',
    mr: 'उपलब्ध',
  },
  status_requested: {
    en: 'REQUESTED',
    mr: 'मागणी केली',
  },
  status_accepted: {
    en: 'ACCEPTED',
    mr: 'स्वीकारले',
  },
  status_in_transit: {
    en: 'IN TRANSIT',
    mr: 'डिलिव्हरी सुरू',
  },
  status_delivered: {
    en: 'DELIVERED',
    mr: 'यशस्वीरित्या वितरित',
  },

  // Footer
  footer_home: {
    en: 'Home',
    mr: 'मुख्यपृष्ठ',
  },
  footer_impact: {
    en: 'Food Impact & Case Study',
    mr: 'अन्न प्रभाव व केस स्टडी',
  },
  footer_feedback: {
    en: 'Reviews & Feedback',
    mr: 'अभिप्राय व पुनरावलोकन',
  },
  footer_login: {
    en: 'Login',
    mr: 'लॉगिन',
  },
  footer_register: {
    en: 'Register',
    mr: 'नोंदणी करा',
  },
  footer_text: {
    en: 'AnnaSetu Platform. Reducing Food Waste • Empowering Communities.',
    mr: 'अन्नसेतू प्लॅटफॉर्म. अन्नाची नासाडी थांबवा • गरजवंतांना आधार द्या.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Read from localStorage on mount
    try {
      const savedLang = localStorage.getItem('annasetu_language') as Language;
      if (savedLang === 'en' || savedLang === 'mr') {
        setLanguageState(savedLang);
        document.documentElement.lang = savedLang;
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('annasetu_language', lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'mr' : 'en');
  };

  const t = (key: string, fallback?: string): string => {
    const item = translations[key];
    if (item && item[language]) {
      return item[language];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};


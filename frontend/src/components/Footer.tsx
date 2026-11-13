'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../app/context/LanguageProvider';
import { BrandLogoIcon, GlobeIcon, StarIcon, ShieldCheckIcon } from './Icons';

export default function Footer() {
  const { t, language } = useLanguage();
  const isMarathi = language === 'mr';

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 py-10 px-4 sm:px-6 lg:px-8 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-800">
        {/* Brand signature */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
            <BrandLogoIcon className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-base tracking-tight font-serif">AnnaSetu</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                {isMarathi ? 'अन्नसेतू' : 'Civic Platform'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {isMarathi
                ? 'अतिरिक्त अन्न वाचवा, गरजूंचे पोषण करा • पारदर्शक, सुरक्षित आणि प्रमाणित'
                : 'Connecting surplus edible food to hungry communities with verified dual-OTP tracking.'}
            </p>
          </div>
        </div>

        {/* Quick Links with handcrafted badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-stone-300">
          <Link href="/" className="hover:text-emerald-400 transition-colors">
            {t('footer_home', 'Home')}
          </Link>
          <span className="text-stone-700 hidden sm:inline">•</span>
          <Link
            href="/food-impact"
            className="hover:text-emerald-400 text-emerald-400 font-semibold transition-colors inline-flex items-center space-x-1.5"
          >
            <GlobeIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('footer_impact', 'Food Impact & Case Study')}</span>
          </Link>
          <span className="text-stone-700 hidden sm:inline">•</span>
          <Link
            href="/feedback"
            className="hover:text-amber-400 text-amber-300 font-semibold transition-colors inline-flex items-center space-x-1.5"
          >
            <StarIcon className="w-3.5 h-3.5 text-amber-400" filled />
            <span>{t('footer_feedback', 'Reviews & Feedback')}</span>
          </Link>
          <span className="text-stone-700 hidden sm:inline">•</span>
          <Link href="/login" className="hover:text-emerald-400 transition-colors">
            {t('footer_login', 'Login')}
          </Link>
          <span className="text-stone-700 hidden sm:inline">•</span>
          <Link href="/register" className="hover:text-emerald-400 transition-colors">
            {t('footer_register', 'Register')}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-3">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            {isMarathi
              ? 'FSSAI अन्न सुरक्षा मानकांचे पालन व डिजिटल हँडओव्हर ऑडिट ट्रेल'
              : 'FSSAI Food Safety Standards Compliant • Encrypted OTP Handover Audit Trail'}
          </span>
        </div>
        <p>
          © {new Date().getFullYear()} AnnaSetu Platform • {isMarathi ? 'सर्व हक्क राखीव' : 'All rights reserved.'}
        </p>
      </div>
    </footer>
  );
}

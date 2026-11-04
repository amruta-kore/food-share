'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../app/context/LanguageProvider';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 space-y-2">
      <div className="flex items-center justify-center space-x-4 text-xs font-medium text-slate-600">
        <Link href="/" className="hover:text-emerald-700 transition">
          {t('footer_home', 'Home')}
        </Link>
        <span>•</span>
        <Link
          href="/food-impact"
          className="hover:text-emerald-700 text-teal-700 font-semibold transition flex items-center space-x-1"
        >
          <span>🌍</span>
          <span>{t('footer_impact', 'Food Impact & Case Study')}</span>
        </Link>
        <span>•</span>
        <Link
          href="/feedback"
          className="hover:text-emerald-700 text-emerald-600 font-semibold transition flex items-center space-x-1"
        >
          <span>⭐</span>
          <span>{t('footer_feedback', 'Reviews & Feedback')}</span>
        </Link>
        <span>•</span>
        <Link href="/login" className="hover:text-emerald-700 transition">
          {t('footer_login', 'Login')}
        </Link>
        <span>•</span>
        <Link href="/register" className="hover:text-emerald-700 transition">
          {t('footer_register', 'Register')}
        </Link>
      </div>
      <p>
        © {new Date().getFullYear()} {t('footer_text', 'AnnaSetu Platform. Reducing Food Waste • Empowering Communities.')}
      </p>
    </footer>
  );
}

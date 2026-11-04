'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, Role } from '../app/context/AuthProvider';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../app/context/LanguageProvider';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const getRoleBadgeColor = (role?: Role) => {
    switch (role) {
      case 'DONOR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'NGO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'VOLUNTEER':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0">
              🥗
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                AnnaSetu
              </span>
              <span className="block text-[10px] text-gray-500 -mt-1 font-medium tracking-wide">
                {t('brand_tagline', 'SURPLUS REDISTRIBUTION')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/') ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              {t('nav_surplus', 'Surplus Food')}
            </Link>

            {user?.role === 'DONOR' && (
              <Link
                href="/donor"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/donor') ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {t('nav_donor', 'Donor Dashboard')}
              </Link>
            )}

            {user?.role === 'NGO' && (
              <Link
                href="/ngo"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/ngo') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {t('nav_ngo', 'NGO Claim Hub')}
              </Link>
            )}

            {user?.role === 'VOLUNTEER' && (
              <Link
                href="/volunteer"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/volunteer') ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {t('nav_volunteer', 'Delivery Board')}
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/admin') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {t('nav_admin', 'Admin Panel')}
              </Link>
            )}

            <Link
              href="/food-impact"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1 ${isActive('/food-impact') ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <span>🌍</span>
              <span>{t('nav_impact', 'Impact & Case Study')}</span>
            </Link>

            <Link
              href="/feedback"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1 ${isActive('/feedback') ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <span>⭐</span>
              <span>{t('nav_reviews', 'Reviews & Rating')}</span>
            </Link>
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[140px]">
                    {user.name}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border inline-block mt-0.5 ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition"
                >
                  {t('nav_signout', 'Sign Out')}
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  {t('nav_login', 'Log In')}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                >
                  {t('nav_join', 'Join AnnaSetu')}
                </Link>
              </div>
            )}

            
            {/* Language Switcher (EN | मराठी) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-white text-emerald-700 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('mr')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'mr'
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="मराठी (Marathi)"
              >
                मराठी
              </button>
            </div>

            {/* Mobile Role indicator if logged in */}
            {user && (
              <span className={`sm:hidden text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
            )}

            {/* Mobile Hamburger / Close Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/98 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {/* User profile section if logged in */}
          {user && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
              <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
            </div>
          )}

          {/* Navigation links list */}
          <nav className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive('/') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              <span>🥗</span>
              <span>{t('nav_surplus', 'Surplus Feed')}</span>
            </Link>

            {user?.role === 'DONOR' && (
              <Link
                href="/donor"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive('/donor') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <span>🍲</span>
                <span>{t('nav_donor', 'Donor Dashboard')}</span>
              </Link>
            )}

            {user?.role === 'NGO' && (
              <Link
                href="/ngo"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive('/ngo') ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <span>🏢</span>
                <span>{t('nav_ngo', 'NGO Claim Hub')}</span>
              </Link>
            )}

            {user?.role === 'VOLUNTEER' && (
              <Link
                href="/volunteer"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive('/volunteer') ? 'bg-amber-50 text-amber-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <span>🚴</span>
                <span>{t('nav_volunteer', 'Delivery Board')}</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive('/admin') ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <span>🛡️</span>
                <span>{t('nav_admin', 'Admin Panel')}</span>
              </Link>
            )}

            <Link
              href="/food-impact"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive('/food-impact') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              <span>🌍</span>
              <span>Impact & Case Study</span>
            </Link>

            <Link
              href="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive('/feedback') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              <span>⭐</span>
              <span>Reviews & Rating</span>
            </Link>
          </nav>

          {/* Action buttons on mobile */}
          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2.5 px-4 text-center text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition"
              >
                {t('nav_signout_full', 'Sign Out of AnnaSetu')}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 text-center text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 text-center text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
                >
                  Join AnnaSetu (Register)
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

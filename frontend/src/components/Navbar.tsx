'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, Role } from '../app/context/AuthProvider';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../app/context/LanguageProvider';
import {
  BrandLogoIcon,
  GlobeIcon,
  SparklesIcon,
  UtensilsIcon,
  BuildingIcon,
  TruckIcon,
  ShieldCheckIcon,
} from './Icons';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const isMarathi = language === 'mr';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const getRoleBadgeColor = (role?: Role) => {
    switch (role) {
      case 'DONOR':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'NGO':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'VOLUNTEER':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'ADMIN':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Platform Name */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-900 to-teal-900 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-200 border border-emerald-800/40">
              <BrandLogoIcon className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black tracking-tight text-neutral-900">
                  {isMarathi ? 'अन्नसेतू' : 'AnnaSetu'}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 tracking-wider">
                  Civic
                </span>
              </div>
              <span className="block text-[10px] text-neutral-500 font-medium tracking-wider uppercase -mt-0.5">
                {isMarathi ? 'अतिरिक्त अन्न पुनर्वितरण' : 'Surplus Food Exchange'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isActive('/')
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {t('nav_surplus', 'Surplus Food')}
            </Link>

            {user?.role === 'DONOR' && (
              <Link
                href="/donor"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                  isActive('/donor')
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <UtensilsIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('nav_donor', 'Donor Dashboard')}</span>
              </Link>
            )}

            {user?.role === 'NGO' && (
              <Link
                href="/ngo"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                  isActive('/ngo')
                    ? 'bg-sky-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <BuildingIcon className="w-3.5 h-3.5 text-sky-600" />
                <span>{t('nav_ngo', 'NGO Claim Hub')}</span>
              </Link>
            )}

            {user?.role === 'VOLUNTEER' && (
              <Link
                href="/volunteer"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                  isActive('/volunteer')
                    ? 'bg-amber-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <TruckIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('nav_volunteer', 'Delivery Board')}</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                  isActive('/admin')
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <ShieldCheckIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('nav_admin', 'Admin Panel')}</span>
              </Link>
            )}

            <Link
              href="/food-impact"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                isActive('/food-impact')
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <GlobeIcon className="w-3.5 h-3.5 opacity-70" />
              <span>{t('nav_impact', 'Impact & Case Study')}</span>
            </Link>

            <Link
              href="/feedback"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                isActive('/feedback')
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('nav_reviews', 'Reviews & Rating')}</span>
            </Link>
          </nav>

          {/* Right Action / Auth & Language Controls */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Handcrafted Segmented Language Switcher (EN | मराठी) */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/80 text-[11px] font-bold shrink-0">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-neutral-900 shadow-xs font-extrabold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('mr')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  language === 'mr'
                    ? 'bg-emerald-900 text-emerald-100 shadow-xs font-extrabold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="मराठी (Marathi)"
              >
                मराठी
              </button>
            </div>

            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-neutral-900 leading-tight truncate max-w-[130px]">
                    {user.name}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border inline-block mt-0.5 self-end ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-red-700 hover:bg-red-50 border border-neutral-200 hover:border-red-200 rounded-lg transition cursor-pointer"
                >
                  {t('nav_signout', 'Sign Out')}
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-bold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                >
                  {t('nav_login', 'Log In')}
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg shadow-xs transition"
                >
                  {isMarathi ? 'अन्नसेतूशी जोडा' : 'Join AnnaSetu'}
                </Link>
              </div>
            )}

            {/* Mobile Role indicator if logged in */}
            {user && (
              <span
                className={`sm:hidden text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {user.role}
              </span>
            )}

            {/* Mobile Hamburger / Close Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none transition md:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {/* User profile section if logged in */}
          {user && (
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-neutral-900">{user.name}</div>
                <div className="text-xs text-neutral-500">{user.email}</div>
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
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isActive('/') ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span>{t('nav_surplus', 'Surplus Food')}</span>
            </Link>

            {user?.role === 'DONOR' && (
              <Link
                href="/donor"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive('/donor') ? 'bg-emerald-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>{t('nav_donor', 'Donor Dashboard')}</span>
              </Link>
            )}

            {user?.role === 'NGO' && (
              <Link
                href="/ngo"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive('/ngo') ? 'bg-sky-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>{t('nav_ngo', 'NGO Claim Hub')}</span>
              </Link>
            )}

            {user?.role === 'VOLUNTEER' && (
              <Link
                href="/volunteer"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive('/volunteer') ? 'bg-amber-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>{t('nav_volunteer', 'Delivery Board')}</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive('/admin') ? 'bg-purple-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>{t('nav_admin', 'Admin Panel')}</span>
              </Link>
            )}

            <Link
              href="/food-impact"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isActive('/food-impact') ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span>{t('nav_impact', 'Impact & Case Study')}</span>
            </Link>

            <Link
              href="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isActive('/feedback') ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span>{t('nav_reviews', 'Reviews & Rating')}</span>
            </Link>
          </nav>

          {/* Action buttons on mobile */}
          <div className="pt-2 border-t border-neutral-100 flex flex-col space-y-2">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2.5 px-4 text-center text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition cursor-pointer"
              >
                {t('nav_signout_full', 'Sign Out of AnnaSetu')}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 px-4 text-center text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition"
                >
                  {t('nav_login', 'Log In')}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 px-4 text-center text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl shadow-xs transition"
                >
                  {isMarathi ? 'अन्नसेतूशी जोडा (नोंदणी)' : 'Join AnnaSetu (Register)'}
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

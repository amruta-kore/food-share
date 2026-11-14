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
  LogOutIcon,
  LanguageIcon,
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Platform Name */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-150 border border-stone-800">
              <BrandLogoIcon className="text-xl" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black tracking-tight text-stone-900 font-serif">
                  {isMarathi ? 'अन्नसेतू' : 'AnnaSetu'}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 tracking-wider">
                  Civic
                </span>
              </div>
              <span className="block text-[10px] text-stone-500 font-medium tracking-wider uppercase -mt-0.5">
                {isMarathi ? 'अतिरिक्त अन्न पुनर्वितरण' : 'Surplus Food Exchange'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (with Font Awesome Fixed-Width Icons) */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                isActive('/')
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              <i className="fa-solid fa-bowl-food fa-fw text-xs opacity-80" />
              <span>{t('nav_surplus', 'Surplus Food')}</span>
            </Link>

            {user?.role === 'DONOR' && (
              <Link
                href="/donor"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  isActive('/donor')
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                <UtensilsIcon fw className="text-xs text-emerald-700" />
                <span>{t('nav_donor', 'Donor Dashboard')}</span>
              </Link>
            )}

            {user?.role === 'NGO' && (
              <Link
                href="/ngo"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  isActive('/ngo')
                    ? 'bg-sky-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                <BuildingIcon fw className="text-xs text-sky-700" />
                <span>{t('nav_ngo', 'NGO Claim Hub')}</span>
              </Link>
            )}

            {user?.role === 'VOLUNTEER' && (
              <Link
                href="/volunteer"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  isActive('/volunteer')
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                <TruckIcon fw className="text-xs text-amber-700" />
                <span>{t('nav_volunteer', 'Delivery Board')}</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  isActive('/admin')
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                <ShieldCheckIcon fw className="text-xs text-purple-700" />
                <span>{t('nav_admin', 'Admin Panel')}</span>
              </Link>
            )}

            <Link
              href="/food-impact"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                isActive('/food-impact')
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              <GlobeIcon fw className="text-xs opacity-75" />
              <span>{t('nav_impact', 'Impact & Case Study')}</span>
            </Link>

            <Link
              href="/feedback"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                isActive('/feedback')
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              <i className="fa-solid fa-star fa-fw text-xs text-amber-400" />
              <span>{t('nav_reviews', 'Reviews & Rating')}</span>
            </Link>
          </nav>

          {/* Right Action / Auth & Language Controls */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Segmented Language Switcher (EN | मराठी) with Font Awesome Language Icon */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-[11px] font-bold shrink-0">
              <span className="px-1.5 text-stone-400">
                <LanguageIcon className="text-xs" />
              </span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-stone-900 shadow-xs font-extrabold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('mr')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'mr'
                    ? 'bg-emerald-800 text-emerald-100 shadow-xs font-extrabold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="मराठी (Marathi)"
              >
                मराठी
              </button>
            </div>

            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-stone-900 leading-tight truncate max-w-[130px]">
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
                  className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-rose-700 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 rounded-xl transition cursor-pointer"
                >
                  <LogOutIcon className="text-xs" />
                  <span>{t('nav_signout', 'Sign Out')}</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-bold text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition inline-flex items-center space-x-1.5"
                >
                  <i className="fa-solid fa-right-to-bracket text-xs text-stone-500" />
                  <span>{t('nav_login', 'Log In')}</span>
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                >
                  <i className="fa-solid fa-user-plus text-xs" />
                  <span>{isMarathi ? 'अन्नसेतूशी जोडा' : 'Join AnnaSetu'}</span>
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
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none transition md:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <i className={mobileMenuOpen ? 'fa-solid fa-xmark text-base' : 'fa-solid fa-bars text-base'} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          {/* User profile section if logged in */}
          {user && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-stone-900">{user.name}</div>
                <div className="text-xs text-stone-500">{user.email}</div>
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
                isActive('/') ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <i className="fa-solid fa-bowl-food fa-fw" />
              <span>{t('nav_surplus', 'Surplus Food')}</span>
            </Link>

            {user?.role === 'DONOR' && (
              <Link
                href="/donor"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive('/donor') ? 'bg-emerald-800 text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <UtensilsIcon fw />
                <span>{t('nav_donor', 'Donor Dashboard')}</span>
              </Link>
            )}

            {user?.role === 'NGO' && (
              <Link
                href="/ngo"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive('/ngo') ? 'bg-sky-800 text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <BuildingIcon fw />
                <span>{t('nav_ngo', 'NGO Claim Hub')}</span>
              </Link>
            )}

            {user?.role === 'VOLUNTEER' && (
              <Link
                href="/volunteer"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive('/volunteer') ? 'bg-amber-800 text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <TruckIcon fw />
                <span>{t('nav_volunteer', 'Delivery Board')}</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive('/admin') ? 'bg-purple-800 text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <ShieldCheckIcon fw />
                <span>{t('nav_admin', 'Admin Panel')}</span>
              </Link>
            )}

            <Link
              href="/food-impact"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isActive('/food-impact') ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <GlobeIcon fw />
              <span>{t('nav_impact', 'Impact & Case Study')}</span>
            </Link>

            <Link
              href="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isActive('/feedback') ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <i className="fa-solid fa-star fa-fw text-amber-400" />
              <span>{t('nav_reviews', 'Reviews & Rating')}</span>
            </Link>

            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOutIcon fw />
                <span>{t('nav_signout', 'Sign Out')}</span>
              </button>
            ) : (
              <div className="pt-2 border-t border-stone-200 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-center text-xs font-bold text-stone-700 bg-stone-100 rounded-xl"
                >
                  {t('nav_login', 'Log In')}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-center text-xs font-bold text-white bg-emerald-800 rounded-xl"
                >
                  {isMarathi ? 'नोंदणी करा' : 'Register'}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthProvider';
import { useLanguage } from '../context/LanguageProvider';
import { useRouter } from 'next/navigation';
import { BrandLogoIcon } from '../../components/Icons';

export default function LoginPage() {
  const { login } = useAuth();
  const { language } = useLanguage();
  const isMarathi = language === 'mr';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);

  // Clear inputs on mount to ensure user manually enters credentials
  useEffect(() => {
    setEmail('');
    setPassword('');
    // Remove readOnly slightly after mount so manual typing is smooth
    const timer = setTimeout(() => {
      setIsReadOnly(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(
        isMarathi
          ? 'कृपया तुमचा ईमेल पत्ता आणि पासवर्ड दोन्ही प्रविष्ट करा.'
          : 'Please enter both your email address and password.'
      );
      return;
    }
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const res = await login(cleanEmail, cleanPass);
    if (!res.success) {
      setError(
        res.message ||
          (isMarathi
            ? 'चुकीची माहिती. कृपया तुमचा ईमेल आणि पासवर्ड तपासा.'
            : 'Invalid credentials. Please verify your email and password.')
      );
    }
    setLoading(false);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotEmail || !forgotEmail.trim()) {
      setForgotError(
        isMarathi
          ? 'कृपया तुमचा नोंदणीकृत ईमेल पत्ता प्रविष्ट करा.'
          : 'Please enter your registered email address.'
      );
      return;
    }

    setForgotLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/auth/forgot-password`
        : '/api/auth/forgot-password';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        setForgotError(
          res.status === 502 || res.status === 503 || res.status === 504
            ? (isMarathi ? 'सर्व्हर सुरू होत आहे. कृपया ३० सेकंदांनंतर पुन्हा प्रयत्न करा.' : 'Backend server is waking up. Please try again in 30 seconds.')
            : text && text.length < 120
            ? text
            : `Server returned HTTP ${res.status}.`
        );
        return;
      }

      if (res.ok && data.success) {
        setForgotSuccess(
          data.message ||
            (isMarathi
              ? `एक नवीन ६-अंकी पासवर्ड तयार करून ${forgotEmail} वर पाठवला आहे. कृपया तुमचा ईमेल तपासा.`
              : `A new 6-character password has been generated and sent to ${forgotEmail}. Please check your email inbox.`)
        );
        // Automatically sync email with main login input
        setEmail(forgotEmail.trim());
        setPassword('');
      } else {
        setForgotError(
          data.message ||
            (isMarathi ? 'नवीन पासवर्ड पाठवण्यात अडचण आली. ईमेल पत्ता तपासा.' : 'Failed to send new password. Please verify the email address.')
        );
      }
    } catch (err: any) {
      setForgotError(
        err?.message ||
          (isMarathi ? 'सर्व्हरशी संपर्क होऊ शकला नाही. कृपया थोड्या वेळाने प्रयत्न करा.' : 'Server connection error. Please try again later.')
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(email || '');
    setForgotError(null);
    setForgotSuccess(null);
    setShowForgotModal(true);
  };

  const closeForgotModalAndFocus = () => {
    setShowForgotModal(false);
    if (forgotSuccess) {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-grid-subtle">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-crafted border border-stone-200/90 p-7 sm:p-9 space-y-6">
        <div className="text-center space-y-2">
          {/* Font Awesome Stack: Circle Background with Lock */}
          <div className="inline-flex items-center justify-center mb-1">
            <span className="fa-stack fa-2x">
              <i className="fa-solid fa-circle fa-stack-2x text-emerald-50" />
              <i className="fa-solid fa-lock fa-stack-1x text-emerald-800" />
            </span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight font-serif">
            {isMarathi ? 'अन्नसेतूमध्ये लॉगिन करा' : 'Sign in to AnnaSetu'}
          </h1>
          <p className="text-xs text-stone-500 font-normal">
            {isMarathi
              ? 'तुमच्या अधिकृत डॅशबोर्डवर जाण्यासाठी खात्याची माहिती प्रविष्ट करा'
              : 'Enter your credentials to manage surplus food, claims & pickups'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1.5 shadow-xs">
            <div className="flex items-start space-x-2">
              <i className="fa-solid fa-triangle-exclamation fa-beat text-rose-600 text-sm mt-0.5 shrink-0" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
            <div className="text-[11px] pt-1.5 border-t border-rose-200/70 text-rose-900">
              {isMarathi ? 'पासवर्ड विसरलात? ' : 'Forgot your password? '}
              <button
                type="button"
                onClick={openForgotModal}
                className="font-bold underline hover:text-rose-950 cursor-pointer"
              >
                {isMarathi
                  ? 'तुमच्या ईमेलवर नवीन ६-अंकी पासवर्ड मिळवा'
                  : 'Dispatch new temporary password to email'}
              </button>
            </div>
          </div>
        )}

        <form
          action="javascript:void(0);"
          method="POST"
          onSubmit={handleSubmit}
          autoComplete="off"
          className="space-y-4"
        >
          {/* Invisible trap inputs */}
          <input
            type="text"
            name="prevent_autofill_user"
            id="prevent_autofill_user"
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />
          <input
            type="password"
            name="prevent_autofill_pass"
            id="prevent_autofill_pass"
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="new-password"
          />

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              <i className="fa-solid fa-envelope mr-1.5 text-stone-400" />
              <span>{isMarathi ? 'ईमेल पत्ता' : 'Email Address'}</span>
            </label>
            <input
              type="email"
              name="user_manual_login_email"
              id="user_manual_login_email"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
              required
              readOnly={isReadOnly}
              onFocus={() => setIsReadOnly(false)}
              onClick={() => setIsReadOnly(false)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isMarathi ? 'उदा. donor@restaurant.com' : 'you@organization.org'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 text-sm bg-stone-50/40 text-stone-900 transition font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
                <i className="fa-solid fa-key mr-1.5 text-stone-400" />
                <span>{isMarathi ? 'पासवर्ड' : 'Password'}</span>
              </label>
              <button
                type="button"
                onClick={openForgotModal}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 hover:underline transition cursor-pointer"
              >
                {isMarathi ? 'पासवर्ड विसरलात?' : 'Forgot Password?'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                ref={passwordInputRef}
                name="user_manual_login_secret"
                id="user_manual_login_secret"
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                readOnly={isReadOnly}
                onFocus={() => setIsReadOnly(false)}
                onClick={() => setIsReadOnly(false)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 text-sm bg-stone-50/40 text-stone-900 font-mono tracking-wider transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={
                  isMarathi
                    ? showPassword
                      ? 'पासवर्ड लपवा'
                      : 'पासवर्ड दाखवा'
                    : showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer select-none text-sm"
              >
                <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-800 hover:bg-emerald-700 active:scale-[0.99] transition shadow-xs disabled:opacity-50 text-sm flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin text-sm" />
                <span>
                  {isMarathi
                    ? 'पडताळणी आणि डॅशबोर्डवर जात आहे...'
                    : 'Authenticating & Entering Dashboard...'}
                </span>
              </>
            ) : (
              <>
                <span>{isMarathi ? 'लॉगिन करा' : 'Sign In'}</span>
                <i className="fa-solid fa-arrow-right text-xs" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-200/80 flex flex-col items-center space-y-3">
          <div className="text-center text-xs text-stone-500">
            {isMarathi ? 'अजून खाते नाही का? ' : "Don't have an account yet? "}
            <Link href="/register" className="font-bold text-emerald-800 hover:text-emerald-900 underline underline-offset-2">
              {isMarathi ? 'येथे नोंदणी करा' : 'Register as Donor, NGO, or Volunteer'}
            </Link>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-stone-400">
            <i className="fa-solid fa-shield-halved text-emerald-700 text-xs" />
            <span>{isMarathi ? 'सुरक्षित FSSAI सुसंगत प्लॅटफॉर्म' : 'End-to-End Verified Platform'}</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-stone-200 animate-in fade-in duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-key text-emerald-700 text-sm" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">
                    {isMarathi ? 'पासवर्ड विसरलात?' : 'Forgot Your Password?'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {isMarathi
                      ? 'तुमच्या ईमेलवर नवीन ६-अंकी तात्पुरता पासवर्ड मिळवा'
                      : 'Receive a fresh 6-character access password'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-stone-400 hover:text-stone-700 text-base font-bold p-1 cursor-pointer"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                <i className="fa-solid fa-triangle-exclamation text-rose-600 text-sm mt-0.5 shrink-0" />
                <div>{forgotError}</div>
              </div>
            )}

            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                  <div className="font-bold flex items-center space-x-1.5 text-sm text-emerald-800">
                    <i className="fa-solid fa-circle-check text-emerald-700" />
                    <span>{isMarathi ? 'नवीन पासवर्ड पाठवला!' : 'New Password Dispatched!'}</span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed font-normal">
                    {forgotSuccess}
                  </p>
                  <div className="bg-white/80 p-3 rounded-lg border border-emerald-200 text-[11px] text-stone-600">
                    <i className="fa-solid fa-lightbulb text-amber-500 mr-1" />
                    <strong>{isMarathi ? 'टीप:' : 'Tip:'}</strong>{' '}
                    {isMarathi
                      ? 'तुमचा ईमेल उघडा, ६-अंकी पासवर्ड कॉपी करा आणि लॉगिन फॉर्ममध्ये टाकून त्वरित साइन इन करा.'
                      : 'Open your inbox, copy the 6-character code, and paste it into the password box.'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForgotModalAndFocus}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-emerald-800 hover:bg-emerald-700 transition shadow-xs text-xs cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <span>{isMarathi ? 'नवीन पासवर्ड टाकून लॉगिन करा' : 'Enter New Password & Log In'}</span>
                  <i className="fa-solid fa-arrow-right text-xs" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  {isMarathi
                    ? 'तुमचा नोंदणीकृत अन्नसेतू ईमेल पत्ता खाली प्रविष्ट करा. आमची प्रणाली नवीन ६-अंकी पासवर्ड तयार करून लगेच तुम्हाला ईमेल करेल.'
                    : 'Enter your registered email address. We will generate a secure 6-character key and dispatch it to your inbox.'}
                </p>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                    <i className="fa-solid fa-envelope mr-1.5 text-stone-400" />
                    <span>{isMarathi ? 'नोंदणीकृत ईमेल पत्ता' : 'Registered Email Address'}</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={isMarathi ? 'उदा. user@organization.org' : 'you@organization.org'}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 bg-stone-50/50"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                  >
                    {isMarathi ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl transition shadow-xs disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                        <span>{isMarathi ? 'नवीन पासवर्ड पाठवत आहे...' : 'Generating & Dispatching...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isMarathi ? 'ईमेलवर नवीन पासवर्ड पाठवा' : 'Dispatch New Password'}</span>
                        <i className="fa-solid fa-paper-plane text-xs" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

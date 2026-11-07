'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthProvider';
import { useLanguage } from '../context/LanguageProvider';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 items-center justify-center text-2xl mb-3 shadow-inner">
            🔐
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isMarathi ? 'अन्नसेतूमध्ये लॉगिन करा' : 'Sign in to AnnaSetu'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isMarathi
              ? 'तुमच्या डॅशबोर्डवर जाण्यासाठी खात्याची माहिती प्रविष्ट करा'
              : 'Enter your account credentials to access your dashboard'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm space-y-1.5">
            <div className="flex items-start space-x-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <div className="flex-1">{error}</div>
            </div>
            <div className="text-xs pt-1 border-t border-red-100 text-red-800">
              {isMarathi ? 'पासवर्ड विसरलात? ' : 'Forgot your password? '}
              <button
                type="button"
                onClick={openForgotModal}
                className="font-bold underline hover:text-red-900 cursor-pointer"
              >
                {isMarathi
                  ? 'तुमच्या ईमेलवर नवीन ६-अंकी पासवर्ड मिळवा'
                  : 'Send a new 6-character password to your email'}
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
          {/* Invisible trap inputs to prevent browser autofill engines from populating user fields */}
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
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              {isMarathi ? 'ईमेल पत्ता' : 'Email Address'}
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
              placeholder={isMarathi ? 'उदा. user@organization.org' : 'you@organization.org'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-slate-50/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase text-slate-600">
                {isMarathi ? 'पासवर्ड' : 'Password'}
              </label>
              <button
                type="button"
                onClick={openForgotModal}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition cursor-pointer"
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
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-slate-50/50 font-mono tracking-wider"
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer select-none text-base"
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition shadow-md shadow-emerald-600/20 disabled:opacity-50 text-sm flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>
                  {isMarathi
                    ? 'पडताळणी आणि डॅशबोर्डवर जात आहे...'
                    : 'Authenticating & Entering Dashboard...'}
                </span>
              </>
            ) : (
              <span>{isMarathi ? 'लॉगिन करा' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          {isMarathi ? 'अजून खाते नाही का? ' : "Don't have an account yet? "}
          <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 underline">
            {isMarathi ? 'येथे नोंदणी करा' : 'Register here'}
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-100 animate-in fade-in duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0">
                  🔑
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isMarathi ? 'पासवर्ड विसरलात?' : 'Forgot Your Password?'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isMarathi
                      ? 'तुमच्या ईमेलवर नवीन ६-अंकी तात्पुरता पासवर्ड मिळवा'
                      : 'Get a new 6-character password sent to your email'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <div>{forgotError}</div>
              </div>
            )}

            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                  <div className="font-bold flex items-center space-x-1.5 text-sm text-emerald-800">
                    <span>✓</span>
                    <span>{isMarathi ? 'नवीन पासवर्ड पाठवला!' : 'New Password Dispatched!'}</span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    {forgotSuccess}
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 text-[11px] text-slate-600">
                    💡 <strong>{isMarathi ? 'टीप:' : 'Tip:'}</strong>{' '}
                    {isMarathi
                      ? 'तुमचा ईमेल उघडा, ६-अंकी पासवर्ड कॉपी करा आणि लॉगिन फॉर्ममध्ये टाकून त्वरित साइन इन करा.'
                      : 'Open your email, copy the 6-character password, and paste it on the login form to sign in immediately.'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForgotModalAndFocus}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm text-sm cursor-pointer"
                >
                  {isMarathi ? 'नवीन पासवर्ड टाकून लॉगिन करा' : 'Enter New Password & Log In'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isMarathi
                    ? 'तुमचा नोंदणीकृत अन्नसेतू ईमेल पत्ता खाली प्रविष्ट करा. आमची प्रणाली नवीन ६-अंकी पासवर्ड तयार करून लगेच तुम्हाला ईमेल करेल.'
                    : 'Enter your registered AnnaSetu email address below. Our system will generate a fresh, random 6-character password, update your account, and email it to you right away.'}
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isMarathi ? 'नोंदणीकृत ईमेल पत्ता' : 'Registered Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={isMarathi ? 'उदा. user@organization.org' : 'you@organization.org'}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    {isMarathi ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{isMarathi ? 'नवीन पासवर्ड पाठवत आहे...' : 'Generating & Dispatching...'}</span>
                      </>
                    ) : (
                      <span>{isMarathi ? 'ईमेलवर नवीन पासवर्ड पाठवा' : 'Dispatch New Password to Email'}</span>
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

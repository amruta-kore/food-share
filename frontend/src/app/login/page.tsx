'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthProvider';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const passwordInputRef = useRef<HTMLInputElement | null>(null);



  const handleInstantLogin = async (targetEmail: string, targetPass: string) => {
    setError(null);
    setEmail(targetEmail);
    setPassword(targetPass);
    setLoading(true);
    const cleanEmail = targetEmail.trim().toLowerCase();
    const cleanPass = targetPass.trim();
    const res = await login(cleanEmail, cleanPass);
    if (!res.success) {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    await handleInstantLogin(email, password);
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    handleInstantLogin(demoEmail, demoPass);
  };

  // Auto-login if query params exist in URL from native mobile submission
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlEmail = params.get('foodshare_manual_email') || params.get('email');
      const urlPass = params.get('foodshare_manual_secret') || params.get('password');
      if (urlEmail && urlPass) {
        handleInstantLogin(urlEmail, urlPass);
      }
    }
  }, []);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotEmail || !forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setForgotSuccess(
          data.message ||
            `A new 6-character password has been generated and sent to ${forgotEmail}. Please check your email inbox.`
        );
        // Automatically sync email with main login input
        setEmail(forgotEmail.trim());
        setPassword('');
      } else {
        setForgotError(data.message || 'Failed to send new password. Please verify the email address.');
      }
    } catch (err: any) {
      setForgotError(err?.message || 'Server connection error. Please try again later.');
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
          <h1 className="text-2xl font-bold text-slate-900">Sign in to FoodShare</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your account credentials to access your dashboard
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm space-y-1.5">
            <div className="flex items-start space-x-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <div className="flex-1">{error}</div>
            </div>
            <div className="text-xs pt-1 border-t border-red-100 text-red-800">
              Forgot your password?{' '}
              <button
                type="button"
                onClick={openForgotModal}
                className="font-bold underline hover:text-red-900"
              >
                Send a new 6-character password to your email
              </button>
            </div>
          </div>
        )}

        {/* 1-Tap Demo Instant Logins (1-Tap direct entry into Dashboard) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
            <span className="font-bold text-slate-700">⚡ Instant 1-Tap Login:</span>
            <span className="text-emerald-700 font-bold font-mono">tap to enter</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoFill('admin.demo@foodshare.org', 'Admin@123')}
              className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-800 shadow-2xs transition active:scale-95 text-center truncate disabled:opacity-50"
            >
              👑 Admin
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoFill('donor.demo@foodshare.org', 'password123')}
              className="py-2 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs transition active:scale-95 text-center truncate disabled:opacity-50"
            >
              🥦 Donor
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoFill('ngo.demo@foodshare.org', 'password123')}
              className="py-2 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs transition active:scale-95 text-center truncate disabled:opacity-50"
            >
              🤝 NGO
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoFill('volunteer.demo@foodshare.org', 'password123')}
              className="py-2 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs transition active:scale-95 text-center truncate disabled:opacity-50"
            >
              🚴 Volunteer
            </button>
          </div>
        </div>

        <form
          action="javascript:void(0);"
          method="POST"
          onSubmit={handleSubmit}
          autoComplete="on"
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="foodshare_manual_email"
              id="foodshare_manual_email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.org"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-slate-50/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase text-slate-600">
                Password
              </label>
              <button
                type="button"
                onClick={openForgotModal}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              ref={passwordInputRef}
              name="foodshare_manual_secret"
              id="foodshare_manual_secret"
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-slate-50/50 font-mono tracking-wider"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition shadow-md shadow-emerald-600/20 disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating & Entering Dashboard...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account yet?{' '}
          <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 underline">
            Register here
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
                  <h3 className="text-lg font-bold text-slate-900">Forgot Your Password?</h3>
                  <p className="text-xs text-slate-500">
                    Get a new 6-character password sent to your email
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
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
                    <span>New Password Dispatched!</span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    {forgotSuccess}
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 text-[11px] text-slate-600">
                    💡 <strong>Tip:</strong> Open your email, copy the <strong>6-character password</strong>, and paste it on the login form to sign in immediately.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForgotModalAndFocus}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm text-sm"
                >
                  Enter New Password & Log In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered FoodShare email address below. Our system will generate a fresh, random <strong>6-character password</strong>, update your account, and email it to you right away.
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Your Registered Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@organization.org"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs text-xs disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    {forgotLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Sending Email...</span>
                      </>
                    ) : (
                      <>
                        <span>✉️</span>
                        <span>Send New Password</span>
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

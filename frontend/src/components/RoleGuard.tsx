'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, Role } from '../app/context/AuthProvider';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  dashboardName?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  dashboardName = 'Dashboard',
}) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if unauthenticated
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [user, loading, router, pathname]);

  // 1. Loading state while checking token
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-600">Verifying authorized credentials...</p>
      </div>
    );
  }

  // 2. Unauthenticated user barrier
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">
            🔒
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Authentication Required</h2>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              You must sign in with an authorized account to access the <span className="font-semibold text-slate-900">{dashboardName}</span>.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="inline-block w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-emerald-600/20"
            >
              Sign In to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthorized role barrier
  if (!allowedRoles.includes(user.role)) {
    const getOwnDashboard = (role: Role) => {
      switch (role) {
        case 'ADMIN':
          return { name: 'Admin Dashboard', path: '/admin' };
        case 'DONOR':
          return { name: 'Donor Dashboard', path: '/donor' };
        case 'NGO':
          return { name: 'NGO Claim Hub', path: '/ngo' };
        case 'VOLUNTEER':
          return { name: 'Volunteer Courier Board', path: '/volunteer' };
        default:
          return { name: 'Home', path: '/' };
      }
    };

    const ownDashboard = getOwnDashboard(user.role);

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-red-200 shadow-2xl max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-4xl mx-auto ring-8 ring-red-50">
            🛡️
          </div>
          <div>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-full">
              403 • Access Restricted
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">Access Denied</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              This area is restricted to authorized <span className="font-bold text-slate-900">{allowedRoles.join(' / ')}</span> accounts only. You do not have permission to view or modify data in the{' '}
              <span className="font-bold text-slate-800">{dashboardName}</span>.
            </p>

            <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Logged In Account:</span>
                <span className="font-semibold text-slate-900">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Your Current Role:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-red-100 text-red-700 border border-red-200">
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Required Role:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {allowedRoles.join(', ')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={ownDashboard.path}
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition shadow-md"
            >
              Go to Your {ownDashboard.name}
            </Link>
            <button
              onClick={logout}
              className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs rounded-xl transition"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized user: render content
  return <>{children}</>;
};

export default RoleGuard;

'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password) return;

    setLoading(true);
    setError('');
    try {
      await login(emailOrPhone.trim(), password);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Invalid email/phone or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setEmailOrPhone('admin@mobixora.com');
      setPassword('admin12345');
    } else {
      setEmailOrPhone('customer@example.com');
      setPassword('customer123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <Logo size="md" className="justify-center" />
            <h1 className="text-xl font-black text-slate-900 pt-2">
              Welcome Back to Mobixora
            </h1>
            <p className="text-xs text-slate-500">
              Sign in to manage your orders, wishlist, and profile.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="admin@mobixora.com or 03001234567"
                  required
                  className="w-full text-xs p-3.5 pl-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  required
                  className="w-full text-xs p-3.5 pl-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Demo Login Quick Selectors */}
          <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100 text-xs space-y-2">
            <span className="font-bold text-cyan-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> One-Click Demo Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="py-1.5 px-2 bg-white rounded-lg border border-cyan-200 text-slate-800 text-[11px] font-bold hover:bg-cyan-500 hover:text-white transition-colors"
              >
                Fill Admin (admin@)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('customer')}
                className="py-1.5 px-2 bg-white rounded-lg border border-cyan-200 text-slate-800 text-[11px] font-bold hover:bg-cyan-500 hover:text-white transition-colors"
              >
                Fill Customer
              </button>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href={`/register?redirect=${redirectUrl}`} className="text-cyan-600 font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-12 text-center text-xs text-slate-400">Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}

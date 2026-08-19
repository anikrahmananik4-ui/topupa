import React, { useState } from 'react';
import {
  Game,
  Product,
  PaymentMethod,
  Order,
  Deposit,
  User,
  Slider,
  RedeemCode,
} from '../types';
import { AdminPanel } from './AdminPanel';
import { Shield, Lock, LogOut, ArrowLeft, Gamepad2, Key, Download } from 'lucide-react';

interface AdminPortalProps {
  games: Game[];
  products: Product[];
  paymentMethods: PaymentMethod[];
  orders: Order[];
  deposits: Deposit[];
  users: User[];
  sliders: Slider[];
  redeemCodes: RedeemCode[];
  settings: Record<string, string>;
  currency: string;
  onRefreshData: () => void;
  onExitAdmin: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  games,
  products,
  paymentMethods,
  orders,
  deposits,
  users,
  sliders,
  redeemCodes,
  settings,
  currency,
  onRefreshData,
  onExitAdmin,
}) => {
  // Local state for Admin Auth
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('prime_admin_logged_in') === 'true';
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminUsername,
          password: adminPassword,
          isAdmin: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status) {
        setIsAdminLoggedIn(true);
        localStorage.setItem('prime_admin_logged_in', 'true');
      } else {
        setErrorMsg(data.message || 'Invalid admin username or password');
      }
    } catch {
      setErrorMsg('Failed to connect to authentication server');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('prime_admin_logged_in');
  };

  // If Admin is NOT logged in, render the Dedicated Admin Login Portal
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4">
        
        {/* Header Bar */}
        <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-xl shadow-lg font-black">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg text-white tracking-wide uppercase">
                {settings.site_name || 'Prime Top Up'} — Admin Portal
              </h1>
              <p className="text-[11px] text-slate-400">Isolated Management Environment</p>
            </div>
          </div>

          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Storefront</span>
          </button>
        </header>

        {/* Login Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-12">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 mb-1">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Admin Authentication</h2>
              <p className="text-xs text-slate-400">Enter your secure credentials to manage shop operations</p>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Admin Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Tha_perfect_provider"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <Shield className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In To Admin Console'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-800">
              <p className="text-[11px] text-slate-500 font-mono">
                🔒 Protected System — Authorized Admin Personnel Only
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-600 py-4">
          &copy; {new Date().getFullYear()} {settings.site_name || 'Prime Top Up'} Admin Portal — All Rights Reserved
        </footer>

      </div>
    );
  }

  // If Admin IS logged in, render the Dedicated Admin Console Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Admin Standalone Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-xl shadow font-black">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white uppercase tracking-wider">
                  {settings.site_name || 'Prime Top Up'}
                </span>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 uppercase">
                  Admin Console
                </span>
              </div>
              <p className="text-[10px] text-slate-400">System Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/download/infinityfree-admin-dist"
              download="htdocs-ready-infinityfree.zip"
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black transition shadow-lg"
              title="Download Pre-Built HTML/JS for InfinityFree htdocs"
            >
              <Download className="w-4 h-4" />
              <span>InfinityFree Ready ZIP</span>
            </a>

            <a
              href="/api/download/admin-zip"
              download="admin-panel-standalone.zip"
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black transition shadow-lg"
              title="Download Complete Standalone Admin Source Project ZIP"
            >
              <Download className="w-4 h-4" />
              <span>Source ZIP</span>
            </a>

            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition border border-slate-700"
            >
              <Gamepad2 className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">View Storefront</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Admin</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <AdminPanel
          games={games}
          products={products}
          paymentMethods={paymentMethods}
          orders={orders}
          deposits={deposits}
          users={users}
          sliders={sliders}
          redeemCodes={redeemCodes}
          settings={settings}
          currency={currency}
          onRefreshData={onRefreshData}
        />
      </main>

    </div>
  );
};

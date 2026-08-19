import React from 'react';
import { Gamepad2, Wallet, User as UserIcon, Shield, LogOut, PlusCircle, LogIn } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  siteName: string;
  currency: string;
  currentUser: User | null;
  isAdmin: boolean;
  onOpenAddMoney: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onToggleAdminView: () => void;
  viewMode: 'store' | 'admin';
}

export const Navbar: React.FC<NavbarProps> = ({
  siteName,
  currency,
  currentUser,
  isAdmin,
  onOpenAddMoney,
  onOpenLogin,
  onLogout,
  onToggleAdminView,
  viewMode,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div 
          onClick={() => viewMode === 'admin' && onToggleAdminView()}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition"
        >
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl text-white shadow-md">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg md:text-xl tracking-tight leading-none bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              {siteName || 'Prime Top Up'}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Gaming Top-Up & Voucher Shop</p>
          </div>
        </div>

        {/* Right Section / Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* User Wallet Balance Badge */}
          {currentUser && (
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-1.5 px-3 text-xs">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium uppercase leading-none">Wallet</span>
                <span className="font-bold text-emerald-400">
                  {currency} {currentUser.balance.toFixed(2)}
                </span>
              </div>
              <button
                onClick={onOpenAddMoney}
                className="ml-1 bg-emerald-600 hover:bg-emerald-500 text-white p-1 rounded-md transition shadow"
                title="Add Money"
              >
                <PlusCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Account Login / User Profile */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400">{currentUser.email || currentUser.phone}</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-slate-800 hover:bg-red-600/20 text-slate-300 hover:text-red-400 p-2 rounded-lg transition border border-slate-700"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

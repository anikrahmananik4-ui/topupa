import React, { useState } from 'react';
import { Game, Slider, Order, User, PaymentMethod } from '../types';
import { Search, Sparkles, Gift, Clock, ShieldCheck, Shield, Gamepad2, ArrowRight, MessageCircle } from 'lucide-react';

interface UserStorefrontProps {
  games: Game[];
  sliders: Slider[];
  settings?: Record<string, string>;
  currency: string;
  currentUser: User | null;
  userOrders: Order[];
  telegramLink: string;
  onSelectGame: (game: Game) => void;
  onOpenAddMoney: () => void;
  onRedeemCode: (code: string) => Promise<boolean>;
}

export const UserStorefront: React.FC<UserStorefrontProps> = ({
  games,
  sliders,
  settings = {},
  currency,
  currentUser,
  userOrders,
  telegramLink,
  onSelectGame,
  onOpenAddMoney,
  onRedeemCode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'uid' | 'voucher'>('all');
  const [voucherInput, setVoucherInput] = useState('');
  const [redeemMsg, setRedeemMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const filteredGames = games.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeTypeFilter === 'all' || g.type === activeTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    setRedeeming(true);
    setRedeemMsg(null);
    const success = await onRedeemCode(voucherInput);
    setRedeeming(false);
    if (success) {
      setRedeemMsg({ type: 'success', text: 'Voucher redeemed successfully!' });
      setVoucherInput('');
    } else {
      setRedeemMsg({ type: 'error', text: 'Invalid or already used voucher code.' });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Banner Sliders */}
      {sliders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sliders.map((s, idx) => (
            <div key={s.id || idx} className="rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 aspect-[21/9] md:aspect-[16/9] bg-slate-900 relative group">
              <img src={s.image} alt="Promotion" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
          ))}
        </div>
      )}

      {/* Quick Action & Redeem Box Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Redeem Voucher Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-indigo-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-300 mb-1">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>{settings.card1_title || 'Redeem Gift Voucher / Code'}</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">{settings.card1_desc || 'Got a promo or voucher code? Redeem it here for instant wallet credit.'}</p>
          </div>
          <form onSubmit={handleRedeem} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value)}
                placeholder="UNIPIN-XXXX-XXXX"
                className="flex-1 px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs font-mono uppercase text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={redeeming}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition shadow"
              >
                {redeeming ? '...' : 'Redeem'}
              </button>
            </div>
            {redeemMsg && (
              <p className={`text-[11px] font-semibold ${redeemMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {redeemMsg.text}
              </p>
            )}
          </form>
        </div>

        {/* Deposit Banner Card */}
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-emerald-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-300 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{settings.card2_title || 'Wallet Instant Auto-Deposit'}</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              {settings.card2_desc || 'Add funds via bKash, Nagad, or Rocket to enjoy instant 1-click purchases anytime!'}
            </p>
          </div>
          <button
            onClick={onOpenAddMoney}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 rounded-xl text-xs font-extrabold transition shadow flex items-center justify-center gap-2"
          >
            <span>Add Money to Wallet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Telegram Support Card */}
        <div className="bg-gradient-to-br from-sky-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-sky-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-sm text-sky-300 mb-1">
              <MessageCircle className="w-4 h-4 text-sky-400" />
              <span>{settings.card3_title || 'Customer Support 24/7'}</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              {settings.card3_desc || 'Need assistance with an order or deposit? Connect directly with our admin support on Telegram.'}
            </p>
          </div>
          <a
            href={telegramLink || 'https://t.me/Tha_perfect_provider'}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 py-2.5 rounded-xl text-xs font-extrabold transition shadow flex items-center justify-center gap-2"
          >
            <span>{settings.card3_btn || 'Contact Support on Telegram'}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Available Games & Vouchers</h2>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Type Filter */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTypeFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${activeTypeFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTypeFilter('uid')}
              className={`px-3 py-1 rounded-lg transition ${activeTypeFilter === 'uid' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              UID Topup
            </button>
            <button
              onClick={() => setActiveTypeFilter('voucher')}
              className={`px-3 py-1 rounded-lg transition ${activeTypeFilter === 'voucher' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Vouchers
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search game..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Games Catalog Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            onClick={() => onSelectGame(game)}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col"
          >
            <div className="relative aspect-square bg-slate-900 overflow-hidden">
              <img
                src={game.image}
                alt={game.name}
                className="w-full h-full object-cover group-hover:scale-108 transition duration-500"
              />
              <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-white/20">
                {game.type === 'uid' ? 'UID Direct' : 'Voucher'}
              </span>
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition truncate">
                  {game.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                  {game.description || 'Instant delivery topup'}
                </p>
              </div>
              <button className="mt-3 w-full bg-slate-100 group-hover:bg-blue-600 text-slate-800 group-hover:text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">
                <span>Top Up Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders List (if logged in) */}
      {currentUser && userOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Your Recent Orders</span>
            </h3>
            <span className="text-xs text-slate-500">{userOrders.length} orders total</span>
          </div>

          <div className="divide-y max-h-60 overflow-y-auto">
            {userOrders.map((ord) => (
              <div key={ord.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-extrabold text-slate-900">
                    Order #{ord.id} — {ord.game_name} ({ord.product_name})
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Player ID: {ord.player_id} | TrxID: {ord.transaction_id}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-slate-900">
                    {currency} {ord.amount.toFixed(2)}
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      ord.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200 flex flex-col items-center gap-2">
        <p>© {new Date().getFullYear()} Prime Top Up. All rights reserved.</p>
        <div>
          <p>
            Developed by{' '}
            <a
              href="https://sradigitallabs.rf.gd/?i=1"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline font-semibold"
            >
              SRA Digital Labs
            </a>
          </p>
        </div>
      </footer>

    </div>
  );
};

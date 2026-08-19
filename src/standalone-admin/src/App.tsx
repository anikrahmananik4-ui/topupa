import React, { useState, useEffect, useCallback } from 'react';
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
import {
  Shield,
  Lock,
  LogOut,
  ArrowLeft,
  Gamepad2,
  Key,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wallet,
  CreditCard,
  Users,
  Image,
  Settings,
  Plus,
  Trash2,
  Check,
  X,
  Download,
} from 'lucide-react';

interface AdminStandaloneProps {
  onExitAdmin?: () => void;
}

export const AdminStandaloneApp: React.FC<AdminStandaloneProps> = ({ onExitAdmin }) => {
  // Auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('prime_admin_logged_in') === 'true';
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // App Data State
  const [games, setGames] = useState<Game[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [redeemCodes, setRedeemCodes] = useState<RedeemCode[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: 'Prime Top Up',
    currency: '৳',
  });

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'games' | 'products' | 'orders' | 'deposits' | 'payments' | 'users' | 'sliders' | 'redeem' | 'settings'
  >('dashboard');

  const loadData = useCallback(async () => {
    try {
      const [gRes, pRes, pmRes, oRes, dRes, uRes, sRes, rcRes, stRes] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/products'),
        fetch('/api/payment-methods'),
        fetch('/api/orders'),
        fetch('/api/deposits'),
        fetch('/api/users'),
        fetch('/api/sliders'),
        fetch('/api/redeem-codes'),
        fetch('/api/settings'),
      ]);

      if (gRes.ok) setGames(await gRes.json());
      if (pRes.ok) setProducts(await pRes.json());
      if (pmRes.ok) setPaymentMethods(await pmRes.json());
      if (oRes.ok) setOrders(await oRes.json());
      if (dRes.ok) setDeposits(await dRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (sRes.ok) setSliders(await sRes.json());
      if (rcRes.ok) setRedeemCodes(await rcRes.json());
      if (stRes.ok) setSettings(await stRes.json());
    } catch (err) {
      console.warn('Admin data load warning:', err);
    }
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadData();
    }
  }, [isAdminLoggedIn, loadData]);

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
        loadData();
      } else {
        setErrorMsg(data.message || 'Invalid admin credentials');
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

  const currency = settings.currency || '৳';

  // LOGIN SCREEN
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 font-sans">
        <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-xl shadow-lg font-black">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg text-white tracking-wide uppercase">
                {settings.site_name || 'Prime Top Up'} — Admin Portal
              </h1>
              <p className="text-[11px] text-slate-400">Standalone Management File: /src/admin/AdminStandaloneApp.tsx</p>
            </div>
          </div>

          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Storefront</span>
            </button>
          )}
        </header>

        <div className="max-w-md w-full mx-auto my-auto py-12">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 mb-1">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Admin Authentication</h2>
              <p className="text-xs text-slate-400">Enter credentials to manage topups, packages & wallet requests</p>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Tha_perfect_provider"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
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

        <footer className="text-center text-xs text-slate-600 py-4">
          © {new Date().getFullYear()} {settings.site_name || 'Prime Top Up'} Admin Standalone File
        </footer>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
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
              <p className="text-[10px] text-slate-400">Separate Admin File (/src/admin/AdminStandaloneApp.tsx)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/download/admin"
              download="AdminStandaloneApp.tsx"
              className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition"
              title="Download Admin File"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </a>

            {onExitAdmin && (
              <button
                onClick={onExitAdmin}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition border border-slate-700"
              >
                <Gamepad2 className="w-4 h-4 text-indigo-400" />
                <span>Storefront</span>
              </button>
            )}

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 bg-slate-900 text-white rounded-2xl p-4 shrink-0 shadow-lg border border-slate-800">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'orders' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders ({orders.filter(o => o.status === 'pending').length})</span>
              </button>
              <button
                onClick={() => setActiveTab('deposits')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'deposits' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Add Money ({deposits.filter(d => d.status === 'pending').length})</span>
              </button>
              <button
                onClick={() => setActiveTab('games')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'games' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Games ({games.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'products' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Products ({products.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Users ({users.length})</span>
              </button>
            </nav>
          </aside>

          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200">
            {activeTab === 'dashboard' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Admin Dashboard</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Total Users</div>
                    <div className="text-xl font-black text-amber-400">{users.length}</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Total Orders</div>
                    <div className="text-xl font-black text-emerald-400">{orders.length}</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Pending Orders</div>
                    <div className="text-xl font-black text-red-400">
                      {orders.filter(o => o.status === 'pending').length}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Pending Deposits</div>
                    <div className="text-xl font-black text-indigo-400">
                      {deposits.filter(d => d.status === 'pending').length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">All Customer Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
                      <tr>
                        <th className="p-2">Order ID</th>
                        <th className="p-2">Customer Name</th>
                        <th className="p-2">Game & Package</th>
                        <th className="p-2">Player ID</th>
                        <th className="p-2">Amount</th>
                        <th className="p-2">Method & TrxID</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-800/50">
                          <td className="p-2 font-mono font-bold text-amber-400">#{o.id}</td>
                          <td className="p-2">
                            <div className="font-bold text-white">{o.user_name || 'Guest User'}</div>
                            <div className="text-[10px] text-slate-500 font-mono">User ID: #{o.user_id}</div>
                          </td>
                          <td className="p-2">
                            <div className="font-bold text-indigo-400">{o.game_name}</div>
                            <div className="text-slate-300 text-[11px]">{o.product_name}</div>
                          </td>
                          <td className="p-2 font-mono font-bold bg-slate-950 px-2 py-1 rounded text-amber-300 border border-slate-800 inline-block my-1">
                            {o.player_id}
                          </td>
                          <td className="p-2 font-black text-emerald-400">{currency} {o.amount}</td>
                          <td className="p-2">
                            <div className="font-mono text-slate-200">{o.transaction_id}</div>
                            <div className="text-[10px] text-slate-400">{o.payment_method}</div>
                          </td>
                          <td className="p-2 uppercase font-extrabold">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              o.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              o.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'deposits' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Deposit Requests</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
                      <tr>
                        <th className="p-2">ID</th>
                        <th className="p-2">Method</th>
                        <th className="p-2">Amount</th>
                        <th className="p-2">TrxID</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {deposits.map(d => (
                        <tr key={d.id}>
                          <td className="p-2 font-mono">#{d.id}</td>
                          <td className="p-2">{d.method}</td>
                          <td className="p-2 font-bold">{currency} {d.amount}</td>
                          <td className="p-2 font-mono">{d.trx_id}</td>
                          <td className="p-2 uppercase font-extrabold">{d.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'games' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Game Catalogue</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {games.map(g => (
                    <div key={g.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                      <img src={g.image} alt={g.name} className="w-10 h-10 object-cover rounded" />
                      <div>
                        <div className="font-bold text-sm text-white">{g.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{g.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Packages</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map(p => (
                    <div key={p.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="font-bold text-sm text-white">{p.name}</div>
                      <div className="font-bold text-emerald-400">{currency} {p.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Users & Wallet Balances</h3>
                <div className="divide-y divide-slate-800">
                  {users.map(u => (
                    <div key={u.id} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.email || u.phone}</div>
                      </div>
                      <div className="font-extrabold text-emerald-400">{currency} {u.balance.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminStandaloneApp;

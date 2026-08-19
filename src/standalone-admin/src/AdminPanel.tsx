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
import {
  LayoutDashboard,
  Gamepad2,
  Package,
  ShoppingBag,
  Wallet,
  CreditCard,
  Users,
  Image,
  Key,
  Settings,
  Plus,
  Trash2,
  Check,
  X,
  Edit,
  DollarSign,
  TrendingUp,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface AdminPanelProps {
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
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
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
}) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'games' | 'products' | 'orders' | 'deposits' | 'payments' | 'users' | 'sliders' | 'redeem' | 'settings'
  >('dashboard');

  // Stats Calculations
  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const pendingDeposits = deposits.filter((d) => d.status === 'pending');

  // Form States
  // Add Game
  const [newGameName, setNewGameName] = useState('');
  const [newGameType, setNewGameType] = useState<string>('uid');
  const [newGameDesc, setNewGameDesc] = useState('');
  const [newGameImgUrl, setNewGameImgUrl] = useState('');
  const [uploadingNewGameImg, setUploadingNewGameImg] = useState(false);
  const [newGamePackages, setNewGamePackages] = useState<{ name: string; price: string }[]>([
    { name: '', price: '' }
  ]);

  // Edit Game Modal State
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editGameName, setEditGameName] = useState('');
  const [editGameType, setEditGameType] = useState<string>('uid');
  const [editGameDesc, setEditGameDesc] = useState('');
  const [editGameImgUrl, setEditGameImgUrl] = useState('');
  const [uploadingEditGameImg, setUploadingEditGameImg] = useState(false);

  // Add Product
  const [newProdGameId, setNewProdGameId] = useState<number>(games[0]?.id || 1);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProdGameId, setEditProdGameId] = useState<number>(1);
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');

  // Add Payment Method
  const [newPmName, setNewPmName] = useState('');
  const [newPmNumber, setNewPmNumber] = useState('');
  const [newPmDesc, setNewPmDesc] = useState('');
  const [newPmLogo, setNewPmLogo] = useState('');

  // Add Slider
  const [newSliderImg, setNewSliderImg] = useState('');

  // Add Redeem Code
  const [newRedeemGameId, setNewRedeemGameId] = useState<number>(games[0]?.id || 1);
  const [newRedeemCodeVal, setNewRedeemCodeVal] = useState('');

  // User Balance Edit
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editBalanceVal, setEditBalanceVal] = useState('');

  // Settings State
  const [siteName, setSiteName] = useState(settings.site_name || 'Prime Top Up');
  const [siteDesc, setSiteDesc] = useState(settings.site_desc || '');
  const [currSymbol, setCurrSymbol] = useState(settings.currency || '৳');
  const [marqueeText, setMarqueeText] = useState(settings.marquee_text || '');
  const [marqueeActive, setMarqueeActive] = useState(settings.marquee_active === '1');
  const [fabLink, setFabLink] = useState(settings.fab_link || '');
  const [videoLink, setVideoLink] = useState(settings.add_money_video || '');

  // Service Banner Cards Settings
  const [card1Title, setCard1Title] = useState(settings.card1_title || 'Redeem Gift Voucher / Code');
  const [card1Desc, setCard1Desc] = useState(settings.card1_desc || 'Got a promo or voucher code? Redeem it here for instant wallet credit.');
  const [card2Title, setCard2Title] = useState(settings.card2_title || 'Wallet Instant Auto-Deposit');
  const [card2Desc, setCard2Desc] = useState(settings.card2_desc || 'Add funds via bKash, Nagad, or Rocket to enjoy instant 1-click purchases anytime!');
  const [card3Title, setCard3Title] = useState(settings.card3_title || 'Customer Support 24/7');
  const [card3Desc, setCard3Desc] = useState(settings.card3_desc || 'Need assistance with an order or deposit? Connect directly with our admin support on Telegram.');
  const [card3Btn, setCard3Btn] = useState(settings.card3_btn || 'Contact Support on Telegram');

  // Image Upload Helper
  const handleFileUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.status) return data.url;
    } catch (err) {
      console.error('File upload failed:', err);
    }
    return null;
  };

  // Handlers
  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newGameName,
        type: newGameType,
        description: newGameDesc,
        imageUrl: newGameImgUrl,
      }),
    });
    const data = await res.json();
    if (data.status && data.game) {
      const createdGameId = data.game.id;
      for (const pkg of newGamePackages) {
        if (pkg.name.trim() && pkg.price.trim()) {
          await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              game_id: createdGameId,
              name: pkg.name.trim(),
              price: parseFloat(pkg.price.trim()),
            }),
          });
        }
      }
    }
    setNewGameName('');
    setNewGameDesc('');
    setNewGameImgUrl('');
    setNewGamePackages([{ name: '', price: '' }]);
    onRefreshData();
  };

  const handleStartEditGame = (g: Game) => {
    setEditingGame(g);
    setEditGameName(g.name);
    setEditGameType(g.type);
    setEditGameDesc(g.description || '');
    setEditGameImgUrl(g.image || '');
  };

  const handleSaveEditGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame) return;
    await fetch(`/api/games/${editingGame.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editGameName,
        type: editGameType,
        description: editGameDesc,
        imageUrl: editGameImgUrl,
      }),
    });
    setEditingGame(null);
    onRefreshData();
  };

  const handleDeleteGame = async (id: number) => {
    if (confirm('Delete this game/service and its products?')) {
      await fetch(`/api/games/${id}`, { method: 'DELETE' });
      onRefreshData();
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game_id: newProdGameId,
        name: newProdName,
        price: newProdPrice,
      }),
    });
    setNewProdName('');
    setNewProdPrice('');
    onRefreshData();
  };

  const handleStartEditProduct = (p: Product) => {
    setEditingProduct(p);
    setEditProdGameId(p.game_id);
    setEditProdName(p.name);
    setEditProdPrice(p.price.toString());
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await fetch(`/api/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game_id: editProdGameId,
        name: editProdName,
        price: editProdPrice,
      }),
    });
    setEditingProduct(null);
    onRefreshData();
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Delete this product package?')) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      onRefreshData();
    }
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    onRefreshData();
  };

  const handleUpdateDepositStatus = async (id: number, status: string) => {
    await fetch(`/api/deposits/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    onRefreshData();
  };

  const handleUpdateUserBalance = async (id: number) => {
    await fetch(`/api/users/${id}/balance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: editBalanceVal }),
    });
    setEditingUserId(null);
    onRefreshData();
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newPmName,
        number: newPmNumber,
        description: newPmDesc,
        logoUrl: newPmLogo,
      }),
    });
    setNewPmName('');
    setNewPmNumber('');
    setNewPmDesc('');
    setNewPmLogo('');
    onRefreshData();
  };

  const handleDeletePaymentMethod = async (id: number) => {
    if (confirm('Delete payment method?')) {
      await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
      onRefreshData();
    }
  };

  const handleAddSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/sliders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: newSliderImg }),
    });
    setNewSliderImg('');
    onRefreshData();
  };

  const handleDeleteSlider = async (id: number) => {
    await fetch(`/api/sliders/${id}`, { method: 'DELETE' });
    onRefreshData();
  };

  const handleAddRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/redeem-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game_id: newRedeemGameId,
        product_id: products.find((p) => p.game_id === newRedeemGameId)?.id || 1,
        code: newRedeemCodeVal,
      }),
    });
    setNewRedeemCodeVal('');
    onRefreshData();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_name: siteName,
        site_desc: siteDesc,
        currency: currSymbol,
        marquee_text: marqueeText,
        marquee_active: marqueeActive ? '1' : '0',
        fab_link: fabLink,
        add_money_video: videoLink,
        card1_title: card1Title,
        card1_desc: card1Desc,
        card2_title: card2Title,
        card2_desc: card2Desc,
        card3_title: card3Title,
        card3_desc: card3Desc,
        card3_btn: card3Btn,
      }),
    });
    alert('Settings saved successfully!');
    onRefreshData();
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 pb-20">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white rounded-2xl p-4 shrink-0 shadow-lg border border-slate-800">
        <div className="px-3 py-2 border-b border-slate-800 mb-3">
          <div className="font-extrabold text-sm uppercase tracking-wider text-amber-400">Admin Control</div>
          <div className="text-[11px] text-slate-400">Prime Top Up Management</div>
        </div>

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
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'orders' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </div>
            {pendingOrders.length > 0 && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('deposits')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'deposits' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Wallet className="w-4 h-4" />
              <span>Add Money Requests</span>
            </div>
            {pendingDeposits.length > 0 && (
              <span className="bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                {pendingDeposits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'games' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Games</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'products' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Packages</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'payments' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Methods</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Wallet</span>
          </button>

          <button
            onClick={() => setActiveTab('sliders')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'sliders' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Banners / Sliders</span>
          </button>

          <button
            onClick={() => setActiveTab('redeem')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'redeem' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Redeem Codes</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Site Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Admin View Content */}
      <main className="flex-1 bg-white rounded-2xl p-4 md:p-6 shadow-md border border-slate-200">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b pb-3">Dashboard Overview</h2>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm">
                <div className="text-xs text-slate-500 uppercase font-bold">Total Users</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm">
                <div className="text-xs text-slate-500 uppercase font-bold">Total Orders</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{orders.length}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 border-l-4 border-l-indigo-500 shadow-sm">
                <div className="text-xs text-slate-500 uppercase font-bold">Completed Revenue</div>
                <div className="text-2xl font-black text-indigo-600 mt-1">
                  {currency} {totalRevenue.toFixed(2)}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 shadow-sm">
                <div className="text-xs text-slate-500 uppercase font-bold">Pending Actions</div>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {pendingOrders.length + pendingDeposits.length}
                </div>
              </div>
            </div>

            {/* Quick Actions Navigation */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Management Links</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('games')}
                  className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 p-4 rounded-2xl font-bold text-xs text-center transition"
                >
                  + Add Game
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 p-4 rounded-2xl font-bold text-xs text-center transition"
                >
                  + Add Package
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className="bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 p-4 rounded-2xl font-bold text-xs text-center transition"
                >
                  Payment Methods
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 p-4 rounded-2xl font-bold text-xs text-center transition"
                >
                  System Settings
                </button>
              </div>
            </div>

            {/* Pending Orders Table */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">Pending Orders ({pendingOrders.length})</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Game & Package</th>
                      <th className="p-3">Player ID</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Method / TrxID</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pendingOrders.length > 0 ? (
                      pendingOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold">#{ord.id}</td>
                          <td className="p-3">
                            <div className="font-extrabold text-slate-900">{ord.user_name || 'Guest User'}</div>
                            <div className="text-[10px] text-slate-500 font-mono">User ID: #{ord.user_id}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-blue-600">{ord.game_name}</div>
                            <div className="text-slate-600 text-[11px] font-semibold">{ord.product_name}</div>
                          </td>
                          <td className="p-3 font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-900 inline-block my-2">
                            {ord.player_id}
                          </td>
                          <td className="p-3 font-black text-slate-900 text-sm">{currency} {ord.amount}</td>
                          <td className="p-3">
                            <div className="font-mono text-slate-800 font-bold">{ord.transaction_id}</div>
                            <div className="text-[10px] text-slate-500">{ord.payment_method}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'completed')}
                                className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold hover:bg-emerald-500 shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'cancelled')}
                                className="bg-red-600 text-white px-2.5 py-1 rounded-lg font-bold hover:bg-red-500 shadow-sm"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-400">No pending orders.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* GAMES TAB */}
        {activeTab === 'games' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b pb-3">Games & Services Grid Management</h2>

            {/* Add Game Form */}
            <form onSubmit={handleAddGame} className="bg-slate-50 p-4 rounded-2xl border space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800">Add New Game / Service Card</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Game / Service Name</label>
                  <input
                    type="text"
                    required
                    value={newGameName}
                    onChange={(e) => setNewGameName(e.target.value)}
                    placeholder="e.g. Free Fire, PUBG, Weekly Pass"
                    className="w-full p-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topup / Service Type</label>
                  <select
                    value={newGameType}
                    onChange={(e) => setNewGameType(e.target.value)}
                    className="w-full p-2 border rounded-xl text-xs font-semibold"
                  >
                    <option value="uid">🎮 Games (UID Direct Top Up)</option>
                    <option value="email">📧 Subscriptions (YouTube, ChatGPT, Netflix - Gmail/Email Delivery)</option>
                    <option value="phone">📱 Mobile Service (Flexiload / WhatsApp Number Delivery)</option>
                    <option value="voucher">🎟️ Voucher Code (Unipin / Gift Cards)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image (URL or Upload)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGameImgUrl}
                      onChange={(e) => setNewGameImgUrl(e.target.value)}
                      placeholder="/game_1764253427.jpg or https://..."
                      className="flex-1 p-2 border rounded-xl text-xs"
                    />
                    <label className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1">
                      <Image className="w-3.5 h-3.5" />
                      <span>{uploadingNewGameImg ? '...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadingNewGameImg(true);
                            const url = await handleFileUpload(file);
                            if (url) setNewGameImgUrl(url);
                            setUploadingNewGameImg(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description / Rules</label>
                  <input
                    type="text"
                    value={newGameDesc}
                    onChange={(e) => setNewGameDesc(e.target.value)}
                    placeholder="e.g. Instant Diamond Topup via Player ID"
                    className="w-full p-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Packages & Prices Section */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                      💰 Packages & Prices (Taka)
                    </label>
                    <p className="text-[11px] text-slate-500">Add the prices/packages for this service right now (e.g. 1 Month = ৳150, 1 Year = ৳1200)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewGamePackages([...newGamePackages, { name: '', price: '' }])}
                    className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1.5 rounded-xl hover:bg-emerald-200 transition"
                  >
                    + Add Price / Package
                  </button>
                </div>

                <div className="space-y-2">
                  {newGamePackages.map((pkg, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-xl border">
                      <input
                        type="text"
                        placeholder="e.g. 1 Month Individual / 100 Diamonds"
                        value={pkg.name}
                        onChange={(e) => {
                          const updated = [...newGamePackages];
                          updated[idx].name = e.target.value;
                          setNewGamePackages(updated);
                        }}
                        className="flex-1 p-2 border border-slate-200 rounded-lg text-xs font-semibold"
                      />
                      <div className="relative w-32">
                        <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">৳</span>
                        <input
                          type="number"
                          placeholder="Price"
                          value={pkg.price}
                          onChange={(e) => {
                            const updated = [...newGamePackages];
                            updated[idx].price = e.target.value;
                            setNewGamePackages(updated);
                          }}
                          className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs font-black text-emerald-600"
                        />
                      </div>
                      {newGamePackages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setNewGamePackages(newGamePackages.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold hover:bg-blue-500 transition shadow flex items-center gap-2"
              >
                <span>+ Add Game / Service Card</span>
              </button>
            </form>

            {/* Edit Game Modal */}
            {editingGame && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <Edit className="w-4 h-4 text-blue-600" />
                      <span>Edit Game Card #{editingGame.id}</span>
                    </h3>
                    <button
                      onClick={() => setEditingGame(null)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSaveEditGame} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Game Name</label>
                      <input
                        type="text"
                        required
                        value={editGameName}
                        onChange={(e) => setEditGameName(e.target.value)}
                        className="w-full p-2 border rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Topup / Service Type</label>
                      <select
                        value={editGameType}
                        onChange={(e) => setEditGameType(e.target.value)}
                        className="w-full p-2 border rounded-xl text-xs font-semibold"
                      >
                        <option value="uid">🎮 Games (UID Direct Top Up)</option>
                        <option value="email">📧 Subscriptions (YouTube, ChatGPT, Netflix - Gmail/Email Delivery)</option>
                        <option value="phone">📱 Mobile Service (Flexiload / WhatsApp Number Delivery)</option>
                        <option value="voucher">🎟️ Voucher Code (Unipin / Gift Cards)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image</label>
                      <div className="flex gap-2 items-center">
                        <img src={editGameImgUrl || '/placeholder.png'} alt="Preview" className="w-10 h-10 object-cover rounded-lg border" />
                        <input
                          type="text"
                          value={editGameImgUrl}
                          onChange={(e) => setEditGameImgUrl(e.target.value)}
                          className="flex-1 p-2 border rounded-xl text-xs"
                        />
                        <label className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1">
                          <Image className="w-3.5 h-3.5" />
                          <span>{uploadingEditGameImg ? '...' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingEditGameImg(true);
                                const url = await handleFileUpload(file);
                                if (url) setEditGameImgUrl(url);
                                setUploadingEditGameImg(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={editGameDesc}
                        onChange={(e) => setEditGameDesc(e.target.value)}
                        className="w-full p-2 border rounded-xl text-xs"
                      />
                    </div>

                    {/* Packages & Prices Manager for this Service */}
                    <div className="border-t border-slate-200 pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                          💰 Packages & Prices for this Service
                        </label>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          {products.filter(p => p.game_id === editingGame.id).length} Packages
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {products.filter(p => p.game_id === editingGame.id).map(p => (
                          <div key={p.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border text-xs">
                            <span className="font-bold text-slate-800">{p.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-emerald-600">{currSymbol} {p.price.toFixed(2)}</span>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Delete package "${p.name}"?`)) {
                                    await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
                                    onRefreshData();
                                  }
                                }}
                                className="text-slate-400 hover:text-red-500 p-1"
                                title="Delete Package"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {products.filter(p => p.game_id === editingGame.id).length === 0 && (
                          <p className="text-xs text-amber-600 font-bold bg-amber-50 p-2 rounded-xl border border-amber-200">
                            ⚠️ No packages/prices added yet! Add your packages below:
                          </p>
                        )}
                      </div>

                      {/* Add New Package Directly */}
                      <div className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          placeholder="Package Name (e.g. 1 Month Subscription)"
                          id={`quickPkgName_${editingGame.id}`}
                          className="flex-1 p-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                        <input
                          type="number"
                          placeholder="Price ৳"
                          id={`quickPkgPrice_${editingGame.id}`}
                          className="w-24 p-1.5 border border-slate-200 rounded-lg text-xs font-extrabold text-emerald-600"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const nameEl = document.getElementById(`quickPkgName_${editingGame.id}`) as HTMLInputElement;
                            const priceEl = document.getElementById(`quickPkgPrice_${editingGame.id}`) as HTMLInputElement;
                            if (nameEl && priceEl && nameEl.value.trim() && priceEl.value) {
                              await fetch('/api/products', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  game_id: editingGame.id,
                                  name: nameEl.value.trim(),
                                  price: parseFloat(priceEl.value),
                                }),
                              });
                              nameEl.value = '';
                              priceEl.value = '';
                              onRefreshData();
                            } else {
                              alert('Please enter package name and price');
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg shadow"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingGame(null)}
                        className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Games List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {games.map((g) => {
                const gamePkgs = products.filter((p) => p.game_id === g.id);
                return (
                  <div key={g.id} className="p-3.5 border rounded-2xl bg-white shadow-sm hover:shadow-md transition space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={g.image} alt={g.name} className="w-14 h-14 object-cover rounded-xl border flex-shrink-0" />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">{g.name}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{g.description || 'No description'}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-extrabold px-2 py-0.5 rounded uppercase">
                              {g.type === 'email' ? '📧 EMAIL/GMAIL' : g.type === 'phone' ? '📱 PHONE' : g.type === 'voucher' ? '🎟️ VOUCHER' : '🎮 UID'}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${gamePkgs.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {gamePkgs.length > 0 ? `${gamePkgs.length} Packages` : '⚠️ No Packages'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditGame(g)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                          title="Edit Game & Packages"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGame(g.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                          title="Delete Game"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Package Action Row */}
                    <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-between border text-xs">
                      <div className="truncate text-slate-600 font-medium">
                        {gamePkgs.length > 0
                          ? `Prices: ${currSymbol}${Math.min(...gamePkgs.map(p => p.price))} - ${currSymbol}${Math.max(...gamePkgs.map(p => p.price))}`
                          : 'No packages/prices added yet!'}
                      </div>
                      <button
                        onClick={() => handleStartEditGame(g)}
                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg font-bold shadow shrink-0"
                      >
                        + Manage Prices
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b pb-3">Products & Packages</h2>

            {/* Add Product Form */}
            <form onSubmit={handleAddProduct} className="bg-slate-50 p-4 rounded-2xl border space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800">Add New Package</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Game</label>
                  <select
                    value={newProdGameId}
                    onChange={(e) => setNewProdGameId(Number(e.target.value))}
                    className="w-full p-2 border rounded-xl text-xs"
                  >
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. 115 Diamonds"
                    className="w-full p-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price ({currency})</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="80"
                    className="w-full p-2 border rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-500 transition shadow"
              >
                + Save Package
              </button>
            </form>

            {/* Edit Product Modal */}
            {editingProduct && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <Edit className="w-4 h-4 text-blue-600" />
                      <span>Edit Package #{editingProduct.id}</span>
                    </h3>
                    <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-700 p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSaveEditProduct} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Game</label>
                      <select
                        value={editProdGameId}
                        onChange={(e) => setEditProdGameId(Number(e.target.value))}
                        className="w-full p-2 border rounded-xl text-xs"
                      >
                        {games.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Package Name</label>
                      <input
                        type="text"
                        required
                        value={editProdName}
                        onChange={(e) => setEditProdName(e.target.value)}
                        className="w-full p-2 border rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Price ({currency})</label>
                      <input
                        type="number"
                        required
                        value={editProdPrice}
                        onChange={(e) => setEditProdPrice(e.target.value)}
                        className="w-full p-2 border rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-3">Game</th>
                    <th className="p-3">Package</th>
                    <th className="p-3">Price</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p) => {
                    const g = games.find((gm) => gm.id === p.game_id);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold">{g?.name || 'Unknown'}</td>
                        <td className="p-3 font-bold text-slate-900">{p.name}</td>
                        <td className="p-3 font-bold text-blue-600">
                          {currency} {p.price.toFixed(2)}
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handleStartEditProduct(p)}
                            className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition inline-block"
                            title="Edit Package"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded transition inline-block"
                            title="Delete Package"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b pb-3">All Customer Orders</h2>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer / Player ID</th>
                    <th className="p-3">Item</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method & TrxID</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold">#{o.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{o.user_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {o.player_id}</div>
                      </td>
                      <td className="p-3">
                        {o.game_name} - {o.product_name}
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {currency} {o.amount}
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-slate-700">{o.transaction_id}</div>
                        <div className="text-[10px] text-slate-400">{o.payment_method}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-extrabold uppercase text-[10px] ${
                            o.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="border rounded p-1 text-xs font-bold"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DEPOSITS TAB */}
        {activeTab === 'deposits' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b pb-3">Wallet Deposit Requests</h2>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method & Wallet No</th>
                    <th className="p-3">TrxID</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold">#{d.id}</td>
                      <td className="p-3 font-bold text-slate-900">{d.user_name}</td>
                      <td className="p-3 font-bold text-emerald-600">
                        {currency} {d.amount}
                      </td>
                      <td className="p-3">
                        <div>{d.method}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{d.wallet_number}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-700">{d.trx_id}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-extrabold uppercase text-[10px] ${
                            d.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : d.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3 flex gap-1">
                        {d.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateDepositStatus(d.id, 'approved')}
                              className="bg-emerald-600 text-white px-2.5 py-1 rounded font-bold hover:bg-emerald-500"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateDepositStatus(d.id, 'rejected')}
                              className="bg-red-600 text-white px-2.5 py-1 rounded font-bold hover:bg-red-500"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAYMENT METHODS TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b pb-3">Payment Methods</h2>

            {/* Add Payment Method Form */}
            <form onSubmit={handleAddPaymentMethod} className="bg-slate-50 p-4 rounded-2xl border space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800">Add Payment Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Method Name</label>
                  <input
                    type="text"
                    required
                    value={newPmName}
                    onChange={(e) => setNewPmName(e.target.value)}
                    placeholder="e.g. bKash Personal"
                    className="w-full p-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newPmNumber}
                    onChange={(e) => setNewPmNumber(e.target.value)}
                    placeholder="01700000000"
                    className="w-full p-2 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Logo URL</label>
                  <input
                    type="text"
                    value={newPmLogo}
                    onChange={(e) => setNewPmLogo(e.target.value)}
                    placeholder="/pay_logo_1764254426.png"
                    className="w-full p-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instructions</label>
                  <input
                    type="text"
                    value={newPmDesc}
                    onChange={(e) => setNewPmDesc(e.target.value)}
                    placeholder="Send Money instructions..."
                    className="w-full p-2 border rounded-xl text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-500 transition shadow"
              >
                + Save Method
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="p-3 border rounded-xl flex items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-3">
                    <img src={pm.logo} alt={pm.name} className="w-10 h-10 object-contain rounded" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{pm.name}</h4>
                      <p className="text-xs font-mono text-emerald-600 font-bold">{pm.number}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePaymentMethod(pm.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b pb-3">User & Wallet Management</h2>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone / Email</th>
                    <th className="p-3">Wallet Balance</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold">#{u.id}</td>
                      <td className="p-3 font-bold text-slate-900">{u.name}</td>
                      <td className="p-3">
                        <div>{u.phone}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="p-3 font-bold text-emerald-600 text-sm">
                        {editingUserId === u.id ? (
                          <input
                            type="number"
                            value={editBalanceVal}
                            onChange={(e) => setEditBalanceVal(e.target.value)}
                            className="w-24 p-1 border rounded text-xs font-bold"
                          />
                        ) : (
                          `${currency} ${u.balance.toFixed(2)}`
                        )}
                      </td>
                      <td className="p-3">
                        {editingUserId === u.id ? (
                          <button
                            onClick={() => handleUpdateUserBalance(u.id)}
                            className="bg-emerald-600 text-white px-2 py-1 rounded font-bold"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingUserId(u.id);
                              setEditBalanceVal(u.balance.toString());
                            }}
                            className="text-blue-600 hover:bg-blue-50 p-1 rounded font-bold"
                          >
                            Edit Balance
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SLIDERS TAB */}
        {activeTab === 'sliders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b pb-3">Homepage Sliders & Banners</h2>

            <form onSubmit={handleAddSlider} className="bg-slate-50 p-4 rounded-2xl border space-y-3">
              <h3 className="font-extrabold text-sm text-slate-800">Add Banner Image</h3>
              <input
                type="text"
                required
                value={newSliderImg}
                onChange={(e) => setNewSliderImg(e.target.value)}
                placeholder="/slider_1764253181.jpg or https://..."
                className="w-full p-2 border rounded-xl text-xs"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-500 shadow transition"
              >
                + Add Banner
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sliders.map((s) => (
                <div key={s.id} className="relative rounded-xl overflow-hidden border bg-slate-900 group">
                  <img src={s.image} alt="Slider" className="w-full h-28 object-cover" />
                  <button
                    onClick={() => handleDeleteSlider(s.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg shadow"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REDEEM CODES TAB */}
        {activeTab === 'redeem' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b pb-3">Redeem Codes Generator</h2>

            <form onSubmit={handleAddRedeemCode} className="bg-slate-50 p-4 rounded-2xl border space-y-3">
              <h3 className="font-extrabold text-sm text-slate-800">Generate Voucher Code</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={newRedeemGameId}
                  onChange={(e) => setNewRedeemGameId(Number(e.target.value))}
                  className="p-2 border rounded-xl text-xs"
                >
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newRedeemCodeVal}
                  onChange={(e) => setNewRedeemCodeVal(e.target.value)}
                  placeholder="Leave empty to auto-generate"
                  className="p-2 border rounded-xl text-xs font-mono"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-500 shadow transition"
              >
                + Generate Code
              </button>
            </form>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {redeemCodes.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold">#{r.id}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{r.code}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            r.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b pb-3">Site Configuration</h2>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full p-2.5 border rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={currSymbol}
                    onChange={(e) => setCurrSymbol(e.target.value)}
                    className="w-full p-2.5 border rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Top Notice Bar Text</label>
                  <input
                    type="text"
                    value={marqueeText}
                    onChange={(e) => setMarqueeText(e.target.value)}
                    className="w-full p-2.5 border rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="marqActive"
                    checked={marqueeActive}
                    onChange={(e) => setMarqueeActive(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="marqActive" className="text-xs font-bold text-slate-700">
                    Enable Top Notice Marquee
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Support Link</label>
                  <input
                    type="text"
                    value={fabLink}
                    onChange={(e) => setFabLink(e.target.value)}
                    className="w-full p-2.5 border rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">How to Add Money YouTube URL</label>
                  <input
                    type="text"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    className="w-full p-2.5 border rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Service Banner Cards Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border space-y-4 pt-4">
                <h3 className="font-extrabold text-sm text-slate-900 border-b pb-2">
                  Service Banner Cards Customization (3 Top Cards)
                </h3>

                {/* Card 1 */}
                <div className="bg-white p-3 rounded-xl border space-y-2">
                  <h4 className="font-bold text-xs text-indigo-700">Card 1: Redeem Voucher Box</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Title</label>
                      <input
                        type="text"
                        value={card1Title}
                        onChange={(e) => setCard1Title(e.target.value)}
                        className="w-full p-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                      <input
                        type="text"
                        value={card1Desc}
                        onChange={(e) => setCard1Desc(e.target.value)}
                        className="w-full p-2 border rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-3 rounded-xl border space-y-2">
                  <h4 className="font-bold text-xs text-emerald-700">Card 2: Wallet Auto-Deposit Box</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Title</label>
                      <input
                        type="text"
                        value={card2Title}
                        onChange={(e) => setCard2Title(e.target.value)}
                        className="w-full p-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                      <input
                        type="text"
                        value={card2Desc}
                        onChange={(e) => setCard2Desc(e.target.value)}
                        className="w-full p-2 border rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-3 rounded-xl border space-y-2">
                  <h4 className="font-bold text-xs text-sky-700">Card 3: Telegram Customer Support Box</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Title</label>
                      <input
                        type="text"
                        value={card3Title}
                        onChange={(e) => setCard3Title(e.target.value)}
                        className="w-full p-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                      <input
                        type="text"
                        value={card3Desc}
                        onChange={(e) => setCard3Desc(e.target.value)}
                        className="w-full p-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Button Label</label>
                      <input
                        type="text"
                        value={card3Btn}
                        onChange={(e) => setCard3Btn(e.target.value)}
                        className="w-full p-2 border rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition"
              >
                Save Site Settings
              </button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
};

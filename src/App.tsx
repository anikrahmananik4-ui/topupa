import React, { useState, useEffect, useCallback } from 'react';
import { Game, Product, PaymentMethod, Order, Deposit, User, Slider, RedeemCode } from './types';
import { Navbar } from './components/Navbar';
import { MarqueeNotice } from './components/MarqueeNotice';
import { UserStorefront } from './components/UserStorefront';
import { GameDetailModal } from './components/GameDetailModal';
import { AddMoneyModal } from './components/AddMoneyModal';
import { LoginModal } from './components/LoginModal';

// Lazy load AdminPortal so admin code is isolated and completely separate from main user bundle
const AdminPortal = React.lazy(() => import('./components/AdminPortal').then(m => ({ default: m.AdminPortal })));

export const App: React.FC = () => {
  // State from Backend
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
    marquee_text: 'Welcome to Prime Top Up!',
    marquee_active: '1',
    fab_link: 'https://t.me/Tha_perfect_provider',
    add_money_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  });

  // Routing State
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Secret Admin Route Only (Plain /admin is disabled so users cannot access admin panel)
  const isAdminRoute =
    currentPath.startsWith('/Tha_perfect_provider') ||
    window.location.search.includes('secret=khfmhf2007') ||
    window.location.search.includes('admin_key=khfmhf2007');

  // Auth States (Defaults to null so new users start with clean logged-out session)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('prime_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Fetch Data Function
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
      console.warn('Backend loading warning:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keep current user balance updated from backend users list
  useEffect(() => {
    if (currentUser) {
      const matched = users.find(u => u.id === currentUser.id);
      if (matched && matched.balance !== currentUser.balance) {
        const updated = { ...currentUser, balance: matched.balance };
        setCurrentUser(updated);
        try {
          localStorage.setItem('prime_user', JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage sync error:', e);
        }
      }
    }
  }, [users, currentUser]);

  const handleLoginSuccess = (user: User, adminFlag: boolean) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('prime_user', JSON.stringify(user));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    if (adminFlag) {
      window.history.pushState({}, '', '/admin');
      setCurrentPath('/admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('prime_user');
    } catch (e) {
      console.warn('LocalStorage remove error:', e);
    }
  };

  const handleExitAdmin = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  };

  const handleRedeemCode = async (code: string) => {
    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, user_id: currentUser?.id || 1 }),
      });
      const data = await res.json();
      if (data.status) {
        loadData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const userOrders = currentUser ? orders.filter(o => o.user_id === currentUser.id) : [];

  // Standalone Admin Route Page (Isolated & Lazy-Loaded)
  if (isAdminRoute) {
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center font-mono text-sm">Loading Admin Console...</div>}>
        <AdminPortal
          games={games}
          products={products}
          paymentMethods={paymentMethods}
          orders={orders}
          deposits={deposits}
          users={users}
          sliders={sliders}
          redeemCodes={redeemCodes}
          settings={settings}
          currency={settings.currency || '৳'}
          onRefreshData={loadData}
          onExitAdmin={handleExitAdmin}
        />
      </React.Suspense>
    );
  }

  // Standalone User Storefront Application
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        siteName={settings.site_name || 'Prime Top Up'}
        currency={settings.currency || '৳'}
        currentUser={currentUser}
        isAdmin={false}
        onOpenAddMoney={() => setIsAddMoneyOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onToggleAdminView={() => {
          window.history.pushState({}, '', '/admin');
          setCurrentPath('/admin');
        }}
        viewMode="store"
      />

      {/* Marquee Notice Bar */}
      <MarqueeNotice
        text={settings.marquee_text}
        active={settings.marquee_active === '1'}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <UserStorefront
          games={games}
          sliders={sliders}
          settings={settings}
          currency={settings.currency || '৳'}
          currentUser={currentUser}
          userOrders={userOrders}
          telegramLink={settings.fab_link}
          onSelectGame={(g) => setSelectedGame(g)}
          onOpenAddMoney={() => setIsAddMoneyOpen(true)}
          onRedeemCode={handleRedeemCode}
        />
      </main>

      {/* Game Detail Modal */}
      <GameDetailModal
        game={selectedGame}
        products={products}
        paymentMethods={paymentMethods}
        currency={settings.currency || '৳'}
        currentUser={currentUser}
        onClose={() => setSelectedGame(null)}
        onOrderCompleted={() => loadData()}
        onOpenLogin={() => { setSelectedGame(null); setIsLoginOpen(true); }}
        onOpenAddMoney={() => { setSelectedGame(null); setIsAddMoneyOpen(true); }}
      />

      {/* Add Money Modal */}
      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        currency={settings.currency || '৳'}
        currentUser={currentUser}
        paymentMethods={paymentMethods}
        videoUrl={settings.add_money_video}
        deposits={deposits}
        onDepositSubmitted={() => loadData()}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
};

export default App;

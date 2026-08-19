import React, { useState } from 'react';
import { X, ShoppingBag, ShieldCheck, CheckCircle2, AlertCircle, Copy, Check, Wallet, Smartphone } from 'lucide-react';
import { Game, Product, PaymentMethod, User } from '../types';

interface GameDetailModalProps {
  game: Game | null;
  products: Product[];
  paymentMethods: PaymentMethod[];
  currency: string;
  currentUser: User | null;
  onClose: () => void;
  onOrderCompleted: () => void;
  onOpenLogin: () => void;
  onOpenAddMoney: () => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  products,
  paymentMethods,
  currency,
  currentUser,
  onClose,
  onOrderCompleted,
  onOpenLogin,
  onOpenAddMoney,
}) => {
  const gameProducts = game ? products.filter((p) => p.game_id === game.id) : [];

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(gameProducts[0] || null);
  const [playerId, setPlayerId] = useState('');
  const [payType, setPayType] = useState<'wallet' | 'direct'>('wallet');
  const [selectedPm, setSelectedPm] = useState<PaymentMethod | null>(paymentMethods[0] || null);
  const [trxId, setTrxId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!game) return null;

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (!selectedProduct) {
      setMessage({ type: 'error', text: 'Please select a package.' });
      return;
    }
    if (game.type === 'uid' && !playerId.trim()) {
      setMessage({ type: 'error', text: 'Please enter your Player ID.' });
      return;
    }
    if (game.type === 'email' && !playerId.trim()) {
      setMessage({ type: 'error', text: 'Please enter your Account Email / Gmail.' });
      return;
    }
    if (game.type === 'phone' && !playerId.trim()) {
      setMessage({ type: 'error', text: 'Please enter your Phone Number.' });
      return;
    }

    if (payType === 'wallet' && currentUser.balance < selectedProduct.price) {
      setMessage({
        type: 'error',
        text: `Insufficient wallet balance. You need ${currency}${selectedProduct.price.toFixed(2)}.`,
      });
      return;
    }

    if (payType === 'direct' && (!selectedPm || !trxId.trim())) {
      setMessage({ type: 'error', text: 'Please select payment method and enter Transaction ID.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          user_email: currentUser.email,
          user: currentUser,
          game_id: game.id,
          product_id: selectedProduct.id,
          amount: selectedProduct.price,
          player_id: playerId || 'Voucher Redeem',
          transaction_id: payType === 'wallet' ? `WALLET-${Date.now()}` : trxId,
          payment_method: payType === 'wallet' ? 'Wallet Balance' : (selectedPm?.name || 'Direct Deposit Payment'),
        }),
      });

      const data = await res.json();
      if (data.status) {
        setMessage({ type: 'success', text: payType === 'wallet' ? 'Order placed! Wallet balance deducted successfully.' : 'Order placed successfully! Processing in progress.' });
        setTrxId('');
        onOrderCompleted();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to place order.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error connecting to server.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto border border-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Banner Header */}
        <div className="relative bg-slate-900 text-white p-5 flex items-center gap-4 shrink-0 overflow-hidden">
          <img
            src={game.image}
            alt={game.name}
            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl border-2 border-white/20 shadow-md shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="bg-blue-600/80 text-blue-100 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide inline-block mb-1">
              {game.type === 'email'
                ? 'Account / Subscription'
                : game.type === 'phone'
                ? 'Mobile Service'
                : game.type === 'voucher'
                ? 'Voucher Code'
                : 'UID Direct Top-Up'}
            </span>
            <h3 className="text-lg md:text-xl font-extrabold truncate">{game.name}</h3>
            <p className="text-xs text-slate-300 line-clamp-1">{game.description || 'Instant automated service'}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-5">
          
          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* 1. Select Package */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              1. Select Package
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {gameProducts.map((prod) => {
                const isSelected = selectedProduct?.id === prod.id;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => setSelectedProduct(prod)}
                    className={`p-3 rounded-xl border text-left transition relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-extrabold text-xs text-slate-900">{prod.name}</div>
                    <div className="text-sm font-black text-blue-600 mt-1">
                      {currency} {prod.price.toFixed(2)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Enter Account / Player Information */}
          {game.type !== 'voucher' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                {game.type === 'email'
                  ? '2. Enter Gmail / Account Email'
                  : game.type === 'phone'
                  ? '2. Enter Phone / WhatsApp Number'
                  : '2. Enter Player ID / User ID'}
              </label>
              <input
                type={game.type === 'email' ? 'email' : 'text'}
                required
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder={
                  game.type === 'email'
                    ? 'e.g. user@gmail.com'
                    : game.type === 'phone'
                    ? 'e.g. 01700000000'
                    : 'e.g. 123456789'
                }
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {game.type === 'email'
                  ? 'Provide the email account where subscription/access will be delivered.'
                  : game.type === 'phone'
                  ? 'Provide valid mobile number for delivery.'
                  : 'Make sure Player ID is correct before proceeding.'}
              </p>
            </div>
          )}

          {/* 3. Choose Payment Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              3. Payment Option
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setPayType('wallet')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                  payType === 'wallet'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Pay via Wallet Balance</span>
              </button>

              <button
                type="button"
                onClick={() => setPayType('direct')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                  payType === 'direct'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>bKash / Nagad / Rocket</span>
              </button>
            </div>

            {/* Wallet Info Box */}
            {payType === 'wallet' && (
              <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="text-emerald-900 font-bold block">Wallet Balance</span>
                  <span className="text-emerald-700 font-medium">
                    {currentUser
                      ? `Available: ${currency}${currentUser.balance.toFixed(2)}`
                      : 'Please log in to check balance'}
                  </span>
                </div>
                {currentUser && currentUser.balance < (selectedProduct?.price || 0) && (
                  <button
                    type="button"
                    onClick={onOpenAddMoney}
                    className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-500 transition shadow-sm"
                  >
                    + Add Money
                  </button>
                )}
              </div>
            )}

            {/* Direct Mobile Banking Box */}
            {payType === 'direct' && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedPm(pm)}
                      className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition ${
                        selectedPm?.id === pm.id
                          ? 'border-blue-600 bg-white ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white/50 hover:bg-white'
                      }`}
                    >
                      <img src={pm.logo} alt={pm.name} className="w-6 h-6 object-contain" />
                      <span className="text-[10px] font-bold text-slate-800 truncate">{pm.name}</span>
                    </button>
                  ))}
                </div>

                {selectedPm && (
                  <div className="bg-slate-900 text-white p-3 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Send Money Number:</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-400">
                        <span>{selectedPm.number}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedPm.number)}
                          className="bg-slate-800 p-1 rounded hover:bg-slate-700"
                        >
                          {copiedNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enter Transaction ID (TrxID)</label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="e.g. 8N765TRX22"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Place Order Action */}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {submitting
                ? 'Processing Order...'
                : !currentUser
                ? 'Login to Buy Now'
                : `Buy Now - ${currency}${(selectedProduct?.price || 0).toFixed(2)}`}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Wallet, CheckCircle2, AlertCircle, Copy, Check, Play, History } from 'lucide-react';
import { PaymentMethod, Deposit, User } from '../types';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  currentUser: User | null;
  paymentMethods: PaymentMethod[];
  videoUrl: string;
  deposits: Deposit[];
  onDepositSubmitted: () => void;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  isOpen,
  onClose,
  currency,
  currentUser,
  paymentMethods,
  videoUrl,
  deposits,
  onDepositSubmitted,
}) => {
  const [selectedPm, setSelectedPm] = useState<PaymentMethod | null>(paymentMethods[0] || null);
  const [amount, setAmount] = useState<string>('500');
  const [walletNumber, setWalletNumber] = useState<string>('');
  const [trxId, setTrxId] = useState<string>('');

  const [copiedNumber, setCopiedNumber] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const getEmbedLink = (url: string) => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setMessage({ type: 'error', text: 'Please log in to add money.' });
      return;
    }
    if (!selectedPm) {
      setMessage({ type: 'error', text: 'Please select a payment method.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          amount: parseFloat(amount),
          method: selectedPm.name,
          wallet_number: walletNumber,
          trx_id: trxId,
        }),
      });
      const data = await res.json();
      if (data.status) {
        setMessage({ type: 'success', text: 'Deposit request submitted successfully! Pending admin approval.' });
        setTrxId('');
        setWalletNumber('');
        onDepositSubmitted();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to submit request.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error while submitting deposit.' });
    } finally {
      setSubmitting(false);
    }
  };

  const userDeposits = currentUser ? deposits.filter(d => d.user_id === currentUser.id) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto border border-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 md:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl border border-emerald-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-lg">Add Money / Deposit Wallet</h3>
              <p className="text-xs text-slate-400">Instantly add funds to your Prime Top Up account</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6">
          
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

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {paymentMethods.map((pm) => {
                const isSelected = selectedPm?.id === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSelectedPm(pm)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition relative ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <img src={pm.logo} alt={pm.name} className="w-8 h-8 object-contain rounded-lg shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-800 truncate">{pm.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{pm.short_desc || 'Send Money'}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Details Box */}
          {selectedPm && (
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Personal Number:</span>
                <div className="flex items-center gap-2 font-mono font-bold text-emerald-400 text-sm">
                  <span>{selectedPm.number}</span>
                  <button
                    onClick={() => handleCopyNumber(selectedPm.number)}
                    className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded text-xs text-slate-300 transition"
                  >
                    {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedPm.description}</p>
            </div>
          )}

          {/* Deposit Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Enter Transaction Information
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  required
                  min="10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Your Wallet Number</label>
                <input
                  type="text"
                  required
                  value={walletNumber}
                  onChange={(e) => setWalletNumber(e.target.value)}
                  placeholder="01712345678"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction ID (TrxID)</label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="e.g. 8N765TRX22"
                  className="w-full px-3 py-2 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
            >
              <Wallet className="w-4 h-4" />
              <span>{submitting ? 'Submitting Request...' : 'Submit Deposit Request'}</span>
            </button>
          </form>

          {/* Tutorial Video Section */}
          {videoUrl && (
            <div className="pt-2 border-t">
              <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5 mb-2">
                <Play className="w-4 h-4 text-red-500 fill-current" />
                <span>How to Add Money Video Tutorial</span>
              </h4>
              <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden shadow">
                <iframe
                  className="w-full h-full"
                  src={getEmbedLink(videoUrl)}
                  title="Tutorial Video"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* User's Deposit History */}
          {userDeposits.length > 0 && (
            <div className="pt-2 border-t">
              <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5 mb-2">
                <History className="w-4 h-4 text-slate-500" />
                <span>Your Deposit History</span>
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userDeposits.map((dep) => (
                  <div key={dep.id} className="bg-slate-50 p-2.5 rounded-xl border flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">
                        {currency} {dep.amount} <span className="text-slate-400 font-normal">via {dep.method}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">TrxID: {dep.trx_id}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase ${
                        dep.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : dep.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {dep.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

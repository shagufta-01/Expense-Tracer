import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, ArrowRight, DollarSign, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User } from '../types';

interface SettleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettled: () => void;
  initialFromUser?: string;
  initialToUser?: string;
  initialAmount?: number;
}

export const SettleModal: React.FC<SettleModalProps> = ({
  isOpen,
  onClose,
  onSettled,
  initialFromUser,
  initialToUser,
  initialAmount,
}) => {
  const { user, allUsers, token } = useAuth();
  const { t } = useLanguage();

  const [fromUser, setFromUser] = useState<string>('');
  const [toUser, setToUser] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'cash' | 'bank_transfer' | 'stc_pay' | 'urpay' | 'other'>('stc_pay');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setFromUser(initialFromUser || (user?.role === 'owner' ? user.id : ''));
      setToUser(initialToUser || '');
      setAmount(initialAmount ? initialAmount.toFixed(2) : '');
      setNote('');
    }
  }, [isOpen, initialFromUser, initialToUser, initialAmount, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fromUser || !toUser) {
      setErrorMsg('Please select both payer and receiver.');
      return;
    }
    if (fromUser === toUser) {
      setErrorMsg('Sender and receiver cannot be the same person.');
      return;
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/settlements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromUser,
          toUser,
          amount: numAmount,
          method,
          note: note.trim(),
          date,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to record settlement');
      }

      // Fire confetti burst!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#1E3A8A', '#38BDF8'],
      });

      setIsSubmitting(false);
      onSettled();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording settlement');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0F2942] text-white border-b-2 border-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base leading-tight">{t.recordSettlement}</h2>
              <p className="text-[11px] text-amber-300">MADAR AL-TASIS • Balances Settlement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* From and To Selector */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">{t.fromUser} (Paid Money)</label>
              <select
                value={fromUser}
                onChange={(e) => setFromUser(e.target.value)}
                required
                className="block w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 bg-white"
              >
                <option value="">-- Select Payer --</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'owner' ? 'Owner' : 'Staff'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">{t.toUser} (Received Money)</label>
              <select
                value={toUser}
                onChange={(e) => setToUser(e.target.value)}
                required
                className="block w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 bg-white"
              >
                <option value="">-- Select Receiver --</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'owner' ? 'Owner' : 'Staff'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t.amountSAR} *
            </label>
            <div className="relative rounded-xl shadow-xs">
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="block w-full rounded-xl border border-slate-300 py-2.5 pl-4 pr-16 text-xl font-black text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <span className="text-xs font-bold text-slate-500">SAR</span>
              </div>
            </div>
          </div>

          {/* Method and Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">{t.paymentMethod}</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="block w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 bg-white"
              >
                <option value="stc_pay">{t.stcPay}</option>
                <option value="cash">{t.cash}</option>
                <option value="bank_transfer">{t.bankTransfer}</option>
                <option value="urpay">{t.urpay}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">{t.date}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900"
              >
              </input>
            </div>
          </div>

          {/* Reference Note */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">{t.referenceNote}</label>
            <input
              type="text"
              placeholder="e.g. STC Pay Ref #789012, or Cash handed at Jabal Al-Nour shop"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition transform active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? t.recording : t.recordSettlement}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

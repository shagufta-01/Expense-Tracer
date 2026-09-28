import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  Trash2,
  Calendar,
  Building,
  User,
  Briefcase,
  Layers,
  DollarSign,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Expense } from '../types';

interface ExpenseDetailModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [reviewComment, setReviewComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showImageZoom, setShowImageZoom] = useState(false);

  if (!isOpen || !expense) return null;

  const isOwner = user?.role === 'owner';
  const canDelete = isOwner || (expense.createdBy === user?.id && expense.status === 'pending');

  const handleApprove = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/expenses/${expense.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewComment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to approve');
      }
      setIsProcessing(false);
      onUpdated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reviewComment.trim()) {
      setErrorMsg('Please specify a rejection reason for the technician.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/expenses/${expense.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewComment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reject');
      }
      setIsProcessing(false);
      onUpdated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t.confirmDelete)) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      setIsProcessing(false);
      onUpdated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0F2942] text-white border-b-2 border-amber-400">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                expense.status === 'approved'
                  ? 'bg-emerald-500 text-slate-950'
                  : expense.status === 'pending'
                  ? 'bg-amber-400 text-slate-950 animate-pulse'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {expense.status}
            </span>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base leading-tight">Expense Details</h2>
              <p className="text-[11px] text-amber-300">MADAR AL-TASIS • #{expense.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Amount and Title Card */}
          <div className="p-4 rounded-2xl bg-linear-to-r from-blue-900 to-[#0F2942] text-white shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold block">
                {expense.categoryName} • {expense.splitType.toUpperCase()} SPLIT
              </span>
              <h3 className="text-base sm:text-lg font-bold leading-snug">{expense.description}</h3>
              <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{expense.date}</span>
                <span>•</span>
                <span>Paid by {expense.paidByName}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                {expense.amount.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-300">SAR (ر.س)</span>
            </div>
          </div>

          {/* Receipt Image Thumbnail / Zoom */}
          {expense.receiptUrl ? (
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Receipt / Bill Image:
              </span>
              <div
                onClick={() => setShowImageZoom(true)}
                className="relative cursor-pointer group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48 flex items-center justify-center"
              >
                <img
                  src={expense.receiptUrl}
                  alt="Receipt"
                  className="w-full object-cover max-h-48 group-hover:opacity-90 transition"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1 transition">
                  <ExternalLink className="w-4 h-4" />
                  <span>Click to expand</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-100 text-slate-500 text-xs italic text-center">
              No receipt image uploaded
            </div>
          )}

          {/* Details metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Customer Job
              </span>
              <span className="font-bold text-slate-900 block truncate">
                {expense.jobName || 'General Operation'}
              </span>
              {expense.jobLocation && (
                <span className="text-[10px] text-blue-600 block">{expense.jobLocation}</span>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Team / Group
              </span>
              <span className="font-bold text-slate-900 block truncate">
                {expense.groupName || 'General'}
              </span>
            </div>
          </div>

          {/* Splits Breakdown */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Split Breakdown:
            </span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              {expense.splits.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-medium text-slate-800">{s.userName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">
                      {s.shareAmount?.toFixed(2)} SAR
                    </span>
                    {s.percentage && (
                      <span className="text-[10px] text-slate-400 ml-1.5">
                        ({s.percentage}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review / Approval Status Note */}
          {expense.reviewComment && (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-0.5">
                Review by {expense.approvedByName || 'Director'}:
              </span>
              <p className="text-slate-600 italic">"{expense.reviewComment}"</p>
            </div>
          )}

          {/* Owner Approval/Rejection Actions */}
          {isOwner && expense.status === 'pending' && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5">
              <span className="text-xs font-bold text-blue-900 block">
                Director Decision (Imtiyaz Alam):
              </span>
              <input
                type="text"
                placeholder="Review note (optional for approval, required for rejection)..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleApprove}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{t.approve}</span>
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleReject}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{t.reject}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Delete Option */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {canDelete ? (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDelete}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-800 text-xs font-bold p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.delete}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Fullscreen Image Zoom Modal */}
      {showImageZoom && expense.receiptUrl && (
        <div
          onClick={() => setShowImageZoom(false)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={expense.receiptUrl}
            alt="Receipt Fullscreen"
            className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

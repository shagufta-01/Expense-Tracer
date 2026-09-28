import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  Calendar,
  CreditCard,
  User,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Settlement, SimplifiedSettlement, UserBalance } from '../types';

interface SettlementsViewProps {
  onOpenSettleModal: (from?: string, to?: string, amount?: number) => void;
}

export const SettlementsView: React.FC<SettlementsViewProps> = ({ onOpenSettleModal }) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [simplifiedSettlements, setSimplifiedSettlements] = useState<SimplifiedSettlement[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettlementData = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [balRes, stlRes] = await Promise.all([
        fetch('/api/balances', { headers }),
        fetch('/api/settlements', { headers }),
      ]);

      if (balRes.ok) {
        const balData = await balRes.json();
        setBalances(balData.userSummaries || []);
        setSimplifiedSettlements(balData.simplifiedSettlements || []);
      }
      if (stlRes.ok) {
        setSettlements(await stlRes.json());
      }
    } catch (e) {
      console.warn('Failed to load settlement view:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlementData();
  }, [token]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t.navSettleUp}
          </h1>
          <p className="text-xs text-slate-500">
            Integer-accurate halalas ledger &amp; debt minimization settlement plan
          </p>
        </div>

        <button
          onClick={() => onOpenSettleModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.recordSettlement}</span>
        </button>
      </div>

      {/* Simplified Settlement Plan ("Who Pays Whom") */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{t.whoPaysWhom}</span>
          </h2>
          <p className="text-xs text-slate-500">{t.simplifiedSettlements}</p>
        </div>

        {simplifiedSettlements.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 text-xs font-semibold">
            ✨ {t.allSettled}! All technician expenditures and reimbursements are completely settled.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {simplifiedSettlements.map((s, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-emerald-400 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      From (Payer)
                    </span>
                    <span className="font-bold text-xs text-slate-900 block truncate">
                      {s.fromUserName}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-bold px-2 py-0.5 rounded-full bg-slate-200/80">
                    pays
                  </span>

                  <div className="space-y-0.5 text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      To (Receiver)
                    </span>
                    <span className="font-bold text-xs text-slate-900 block truncate">
                      {s.toUserName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                  <div className="text-base font-black text-slate-900">
                    {s.amountSAR.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-500">SAR</span>
                  </div>

                  <button
                    onClick={() => onOpenSettleModal(s.fromUserId, s.toUserId, s.amountSAR)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition transform active:scale-95"
                  >
                    {t.settleNow}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Balances Ledger Table (All Staff) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">{t.balanceLedger}</h2>
          <p className="text-xs text-slate-500">
            Calculated in integer Halalas (1 SAR = 100 Halalas)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">Personnel</th>
                <th className="pb-3 font-bold">Role</th>
                <th className="pb-3 font-bold text-right">{t.totalPaid}</th>
                <th className="pb-3 font-bold text-right">{t.totalShare}</th>
                <th className="pb-3 font-bold text-right">{t.netBalance}</th>
                <th className="pb-3 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {balances.map((b) => (
                <tr key={b.userId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <img
                      src={b.avatar}
                      alt={b.userName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span>{b.userName}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        b.userRole === 'owner'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {b.userRole}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium text-slate-700">
                    {b.totalPaidSAR.toFixed(2)} SAR
                  </td>
                  <td className="py-3 text-right font-medium text-slate-700">
                    {b.totalShareSAR.toFixed(2)} SAR
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`font-black text-xs ${
                        b.netSAR > 0
                          ? 'text-emerald-600'
                          : b.netSAR < 0
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {b.netSAR > 0 ? `+${b.netSAR.toFixed(2)}` : b.netSAR.toFixed(2)} SAR
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'owed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'owes'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.status === 'owed'
                        ? 'Owed Money'
                        : b.status === 'owes'
                        ? 'Owes Money'
                        : 'Settled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlements History */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">{t.settlementHistory}</h2>
          <p className="text-xs text-slate-500">Record of all past cash &amp; digital payments</p>
        </div>

        <div className="divide-y divide-slate-100">
          {settlements.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No settlements recorded yet.
            </div>
          ) : (
            settlements.map((stl) => (
              <div key={stl.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      <strong>{stl.fromUserName}</strong> paid <strong>{stl.toUserName}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="uppercase font-semibold text-slate-600">
                        {stl.method.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>{stl.date}</span>
                      {stl.note && (
                        <>
                          <span>•</span>
                          <span className="italic">"{stl.note}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-emerald-600 block">
                    {stl.amount.toFixed(2)} SAR
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Settled
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

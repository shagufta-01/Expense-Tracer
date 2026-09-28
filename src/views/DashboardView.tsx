import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Receipt,
  ArrowLeftRight,
  Clock,
  Briefcase,
  AlertCircle,
  Plus,
  CheckCircle2,
  Calendar,
  Building,
  User,
  ChevronRight,
  Flame,
  Wrench,
  Fuel,
  Hammer,
  Truck,
  Utensils,
  Package,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Expense, SimplifiedSettlement, UserBalance } from '../types';

interface DashboardViewProps {
  onOpenAddExpense: () => void;
  onOpenSettleModal: (from?: string, to?: string, amount?: number) => void;
  onSelectExpense: (expense: Expense) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddExpense,
  onOpenSettleModal,
  onSelectExpense,
  onNavigateTab,
}) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [myBalance, setMyBalance] = useState<UserBalance | null>(null);
  const [simplifiedSettlements, setSimplifiedSettlements] = useState<SimplifiedSettlement[]>([]);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [totalMonthSpend, setTotalMonthSpend] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [expRes, balRes, repRes, jobRes] = await Promise.all([
        fetch('/api/expenses', { headers }),
        fetch('/api/balances', { headers }),
        fetch('/api/reports/analytics', { headers }),
        fetch('/api/jobs', { headers }),
      ]);

      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData);
        setPendingCount(expData.filter((e: Expense) => e.status === 'pending').length);
      }
      if (balRes.ok) {
        const balData = await balRes.json();
        setBalances(balData.userSummaries || []);
        setMyBalance(balData.myBalance || null);
        setSimplifiedSettlements(balData.simplifiedSettlements || []);
      }
      if (repRes.ok) {
        const repData = await repRes.json();
        setTotalMonthSpend(repData.totalSpendSAR || 0);
        setCategoryBreakdown(repData.categoryBreakdown || []);
      }
      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setActiveJobsCount(jobData.filter((j: any) => j.status === 'active').length);
      }
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, user]);

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#0A1929] via-[#0F2942] to-[#1E3A8A] text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Building className="w-3.5 h-3.5" />
            <span>MADAR AL-TASIS • Makkah Branch (Jabal Al-Nour)</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
            Shared Expense &amp; Settlement System
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Transparent split tracking for AC &amp; Washing Machine technicians in Makkah.
            Managing Director: <strong className="text-amber-400">Imtiyaz Alam</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t.addExpense}</span>
            </button>

            <button
              onClick={() => onOpenSettleModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
            >
              <ArrowLeftRight className="w-4 h-4 text-amber-400" />
              <span>{t.settleNow}</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 -mb-12 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses This Month */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t.totalExpensesThisMonth}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalMonthSpend.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-500">SAR</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Approved shared operational spend</span>
        </div>

        {/* My Personal Balance Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.myBalance}</span>
            <div
              className={`p-2 rounded-xl ${
                myBalance?.netSAR && myBalance.netSAR > 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : myBalance?.netSAR && myBalance.netSAR < 0
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-50 text-slate-600'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl sm:text-3xl font-black ${
                myBalance?.netSAR && myBalance.netSAR > 0
                  ? 'text-emerald-600'
                  : myBalance?.netSAR && myBalance.netSAR < 0
                  ? 'text-amber-600'
                  : 'text-slate-800'
              }`}
            >
              {myBalance?.netSAR ? Math.abs(myBalance.netSAR).toFixed(2) : '0.00'}
            </span>
            <span className="text-xs font-bold text-slate-500">SAR</span>
          </div>
          <span className="text-[11px] font-semibold mt-1 block">
            {myBalance?.netSAR && myBalance.netSAR > 0 ? (
              <span className="text-emerald-700">{t.youAreOwed}</span>
            ) : myBalance?.netSAR && myBalance.netSAR < 0 ? (
              <span className="text-amber-700">{t.youOwe}</span>
            ) : (
              <span className="text-slate-500">{t.allSettled}</span>
            )}
          </span>
        </div>

        {/* Pending Approvals (Crucial for Owner) */}
        <div
          onClick={() => onNavigateTab('expenses')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.pendingApprovals}</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{pendingCount}</span>
            <span className="text-xs text-slate-500">awaiting review</span>
          </div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
            {user?.role === 'owner' ? 'Tap to review as Owner →' : 'Under Director review'}
          </span>
        </div>

        {/* Active Customer Jobs in Makkah */}
        <div
          onClick={() => onNavigateTab('jobs')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t.activeCustomerJobs}
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{activeJobsCount}</span>
            <span className="text-xs text-slate-500">in progress</span>
          </div>
          <span className="text-[11px] text-sky-600 font-semibold mt-1 block">
            AC &amp; Washing Machines →
          </span>
        </div>
      </div>

      {/* Simplified Settlement Plan: "Who Pays Whom" */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{t.whoPaysWhom}</span>
            </h2>
            <p className="text-xs text-slate-500">{t.simplifiedSettlements}</p>
          </div>
          <button
            onClick={() => onNavigateTab('settle')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {simplifiedSettlements.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-emerald-50/50 border border-emerald-100 text-emerald-800 text-xs font-medium">
            ✨ {t.allSettled}! No pending debts between technicians or company.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {simplifiedSettlements.map((s, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-amber-400 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Debtor
                    </span>
                    <span className="font-bold text-xs text-slate-900 block truncate">
                      {s.fromUserName}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-bold px-2 py-0.5 rounded-full bg-slate-200/80">
                    owes
                  </span>

                  <div className="space-y-0.5 text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Creditor
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
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition transform active:scale-95"
                  >
                    {t.settleNow}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Category Spend Breakdown + Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Category Spend Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">{t.categoryBreakdown}</h2>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900"
            >
              Reports →
            </button>
          </div>

          <div className="space-y-3">
            {categoryBreakdown.slice(0, 5).map((cat) => (
              <div key={cat.categoryId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{cat.name}</span>
                  <span className="font-bold text-slate-900">
                    {cat.amountSAR.toFixed(2)} SAR ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-amber-400 to-blue-600 transition-all duration-500"
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Expenses Activity Feed */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">{t.recentExpenses}</h2>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <span>{t.viewAll}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {expenses.slice(0, 5).map((exp) => (
              <div
                key={exp.id}
                onClick={() => onSelectExpense(exp)}
                className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-blue-950 font-bold flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 block truncate">
                      {exp.description}
                    </span>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                      <span>{exp.categoryName}</span>
                      <span>•</span>
                      <span>By {exp.paidByName}</span>
                      <span>•</span>
                      <span>{exp.date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-black text-xs sm:text-sm text-slate-900">
                    {exp.amount.toFixed(2)} SAR
                  </div>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      exp.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : exp.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {exp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Receipt,
  CheckCircle,
  XCircle,
  Plus,
  Image,
  Calendar,
  Briefcase,
  Users,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Category, Expense, Job, User } from '../types';

interface ExpensesViewProps {
  onOpenAddExpense: () => void;
  onSelectExpense: (expense: Expense) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  onOpenAddExpense,
  onSelectExpense,
}) => {
  const { user, allUsers, token } = useAuth();
  const { t } = useLanguage();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [payerFilter, setPayerFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  const fetchExpenses = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('categoryId', categoryFilter);
      if (payerFilter !== 'all') params.append('paidBy', payerFilter);
      if (jobFilter !== 'all') params.append('jobId', jobFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const headers = { Authorization: `Bearer ${token}` };
      const [expRes, catRes, jobRes] = await Promise.all([
        fetch(`/api/expenses?${params.toString()}`, { headers }),
        fetch('/api/categories', { headers }),
        fetch('/api/jobs', { headers }),
      ]);

      if (expRes.ok) setExpenses(await expRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (jobRes.ok) setJobs(await jobRes.json());
    } catch (e) {
      console.warn('Failed to fetch expenses:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [token, statusFilter, categoryFilter, payerFilter, jobFilter, searchQuery, startDate, endDate]);

  const isOwner = user?.role === 'owner';

  // Quick Owner Approve
  const handleQuickApprove = async (e: React.MouseEvent, expId: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/expenses/${expId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewComment: 'Quick Approved by Owner' }),
      });
      if (res.ok) fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Owner Reject
  const handleQuickReject = async (e: React.MouseEvent, expId: string) => {
    e.stopPropagation();
    const reason = window.prompt('Enter reason for rejection:');
    if (!reason) return;

    try {
      const res = await fetch(`/api/expenses/${expId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewComment: reason }),
      });
      if (res.ok) fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t.navExpenses}
          </h1>
          <p className="text-xs text-slate-500">
            Track, filter, and review all shared team expenditures in Makkah
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.addExpense}</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 overflow-x-auto shadow-xs">
        {[
          { id: 'all', label: t.all },
          { id: 'pending', label: t.pending },
          { id: 'approved', label: t.approved },
          { id: 'rejected', label: t.rejected },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === tab.id
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition w-full sm:w-auto justify-center"
          >
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>Filters</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Extended Filters Drawer */}
        {showFiltersDrawer && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">{t.category}</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">{t.paidBy}</label>
              <select
                value={payerFilter}
                onChange={(e) => setPayerFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
              >
                <option value="all">All Personnel</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Customer Job</label>
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
              >
                <option value="all">All Jobs</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.customerName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Date Range</label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg border border-slate-300 p-1 text-[11px]"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg border border-slate-300 p-1 text-[11px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-400 space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">No expenses found matching the criteria.</p>
          </div>
        ) : (
          expenses.map((exp) => (
            <div
              key={exp.id}
              onClick={() => onSelectExpense(exp)}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-400 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Left Info */}
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Category Icon Badge */}
                <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                  <Receipt className="w-5 h-5 text-blue-900" />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 truncate">
                      {exp.description}
                    </span>

                    {/* Receipt Indicator */}
                    {exp.receiptUrl && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                        <Image className="w-3 h-3" />
                        Receipt
                      </span>
                    )}

                    {/* Split Type Badge */}
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                      {exp.splitType}
                    </span>
                  </div>

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{exp.categoryName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {exp.date}
                    </span>
                    <span>•</span>
                    <span>Paid by <strong>{exp.paidByName}</strong></span>
                    {exp.jobName && (
                      <>
                        <span>•</span>
                        <span className="text-blue-700 font-medium">Job: {exp.jobName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Amount & Status & Quick Owner Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="sm:text-right">
                  <div className="text-lg font-black text-slate-900">
                    {exp.amount.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-500">SAR</span>
                  </div>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      exp.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : exp.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {exp.status}
                  </span>
                </div>

                {/* Quick Owner Approval / Rejection buttons */}
                {isOwner && exp.status === 'pending' && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={(e) => handleQuickApprove(e, exp.id)}
                      className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleQuickReject(e, exp.id)}
                      className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  FileSpreadsheet,
  Building,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Expense } from '../types';

export const ReportsView: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [analytics, setAnalytics] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [anRes, expRes] = await Promise.all([
        fetch('/api/reports/analytics', { headers }),
        fetch('/api/expenses', { headers }),
      ]);

      if (anRes.ok) setAnalytics(await anRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
    } catch (e) {
      console.warn('Failed to load reports:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  // Export to CSV
  const handleExportCSV = () => {
    if (expenses.length === 0) return;

    const headers = [
      'ID',
      'Date',
      'Description',
      'Category',
      'Paid By',
      'Split Type',
      'Amount (SAR)',
      'Status',
      'Customer Job',
      'Approved By',
    ];

    const rows = expenses.map((e) => [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${e.categoryName || ''}"`,
      `"${e.paidByName || ''}"`,
      `"${e.splitType}"`,
      e.amount.toFixed(2),
      `"${e.status}"`,
      `"${(e.jobName || '').replace(/"/g, '""')}"`,
      `"${e.approvedByName || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MADAR_AL_TASIS_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export / Print PDF report
  const handlePrintPDF = () => {
    window.print();
  };

  const isOwner = user?.role === 'owner';

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t.navReports}
          </h1>
          <p className="text-xs text-slate-500">
            Financial analytics, category breakdown, technician spending &amp; exports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{t.exportCSV}</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>{t.exportPDF}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Operational Spend
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {analytics?.totalSpendSAR?.toFixed(2) || '0.00'}{' '}
            <span className="text-xs font-bold text-slate-500">SAR</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            {analytics?.approvedExpenseCount || 0} approved expenses
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Pending Approval Volume
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {analytics?.pendingApprovalsCount || 0}
          </div>
          <span className="text-[11px] text-slate-500 font-semibold block mt-1">
            Awaiting owner review
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Company Branch
          </span>
          <div className="text-sm font-black text-slate-900 leading-snug">
            Jabal Al-Nour, Makkah
          </div>
          <span className="text-[11px] text-blue-700 font-semibold block mt-1">
            Managing Director: Imtiyaz Alam
          </span>
        </div>
      </div>

      {/* Grid: Category Distribution & Technician Spend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-700" />
            <span>Category Spending Distribution</span>
          </h2>

          <div className="space-y-3">
            {(analytics?.categoryBreakdown || []).map((cat: any) => (
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

        {/* Technician Spending Comparison */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span>Technician Out-of-Pocket Outlay</span>
          </h2>

          <div className="space-y-3">
            {(analytics?.personBreakdown || []).map((p: any) => (
              <div key={p.userId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-semibold text-slate-800">{p.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {p.amountSAR.toFixed(2)} SAR ({p.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-400 to-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(p.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Job Cost Analysis Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900">Makkah Customer Job Cost Analysis</h2>
          <p className="text-xs text-slate-500">Expenses attached directly to customer repair orders</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">Customer &amp; Appliance</th>
                <th className="pb-3 font-bold">Location</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Linked Expenses</th>
                <th className="pb-3 font-bold text-right">Total Cost (SAR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(analytics?.jobCosts || []).map((j: any) => (
                <tr key={j.jobId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3">
                    <span className="font-bold text-slate-900 block">{j.customerName}</span>
                    <span className="text-[11px] text-slate-500">
                      {j.applianceType} {j.brand && `(${j.brand})`}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">{j.location}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        j.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-600">{j.expenseCount}</td>
                  <td className="py-3 text-right font-black text-slate-900">
                    {j.costSAR.toFixed(2)} SAR
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

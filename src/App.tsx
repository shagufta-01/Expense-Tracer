import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { OfflineProvider } from './context/OfflineContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AddExpenseModal } from './components/AddExpenseModal';
import { SettleModal } from './components/SettleModal';
import { ExpenseDetailModal } from './components/ExpenseDetailModal';
import { DashboardView } from './views/DashboardView';
import { ExpensesView } from './views/ExpensesView';
import { SettlementsView } from './views/SettlementsView';
import { JobsView } from './views/JobsView';
import { TeamsView } from './views/TeamsView';
import { ReportsView } from './views/ReportsView';
import { AuditLogsView } from './views/AuditLogsView';
import { CategoriesView } from './views/CategoriesView';
import { SettingsView } from './views/SettingsView';
import { Expense } from './types';
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  Briefcase,
  Plus,
} from 'lucide-react';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Settle Modal state with optional prefill
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settlePrefill, setSettlePrefill] = useState<{
    from?: string;
    to?: string;
    amount?: number;
  }>({});

  const handleOpenSettle = (from?: string, to?: string, amount?: number) => {
    setSettlePrefill({ from, to, amount });
    setIsSettleModalOpen(true);
  };

  const handleExpenseAddedOrUpdated = () => {
    // Refresh triggered via state/callbacks in child components
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 pb-[90px] sm:p-6 sm:pb-6 lg:p-8 lg:pb-8 min-w-0 max-w-full overflow-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onOpenSettleModal={handleOpenSettle}
              onSelectExpense={(exp) => setSelectedExpense(exp)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onSelectExpense={(exp) => setSelectedExpense(exp)}
            />
          )}

          {currentTab === 'settle' && (
            <SettlementsView onOpenSettleModal={handleOpenSettle} />
          )}

          {currentTab === 'jobs' && <JobsView />}

          {currentTab === 'teams' && <TeamsView />}

          {currentTab === 'reports' && <ReportsView />}

          {currentTab === 'audit-logs' && <AuditLogsView />}

          {currentTab === 'categories' && <CategoriesView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0F2942] border-t border-slate-800 flex items-center justify-around py-2 px-3 shadow-2xl">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            currentTab === 'dashboard' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentTab('expenses')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            currentTab === 'expenses' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Expenses</span>
        </button>

        {/* Center elevated + button */}
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="-mt-5 flex items-center justify-center w-12 h-12 rounded-full bg-amber-400 text-slate-950 font-black shadow-lg border-2 border-[#0F2942] active:scale-90 transition"
          aria-label="Add Expense"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={() => setCurrentTab('settle')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            currentTab === 'settle' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Settle</span>
        </button>

        <button
          onClick={() => setCurrentTab('jobs')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            currentTab === 'jobs' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Jobs</span>
        </button>
      </nav>

      {/* Global Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onExpenseAdded={handleExpenseAddedOrUpdated}
      />

      <SettleModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        onSettled={handleExpenseAddedOrUpdated}
        initialFromUser={settlePrefill.from}
        initialToUser={settlePrefill.to}
        initialAmount={settlePrefill.amount}
      />

      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onUpdated={handleExpenseAddedOrUpdated}
      />

      {/* Offline Status & Sync Queue Toast */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <OfflineProvider>
          <AppContent />
        </OfflineProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

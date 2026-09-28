import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  Briefcase,
  Users,
  BarChart3,
  ShieldCheck,
  Tags,
  Settings,
  X,
  PlusCircle,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenAddExpense: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  onOpenAddExpense,
}) => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  const isOwner = user?.role === 'owner';

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'expenses', label: t.navExpenses, icon: Receipt },
    { id: 'settle', label: t.navSettleUp, icon: ArrowLeftRight },
    { id: 'jobs', label: t.navJobs, icon: Briefcase },
    { id: 'teams', label: t.navTeams, icon: Users },
    { id: 'reports', label: t.navReports, icon: BarChart3 },
    ...(isOwner
      ? [
          { id: 'audit-logs', label: t.navAuditLogs, icon: ShieldCheck, ownerOnly: true },
          { id: 'categories', label: t.navCategories, icon: Tags, ownerOnly: true },
        ]
      : []),
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-50 lg:z-10 h-screen lg:h-[calc(100vh-4rem)] w-68 bg-[#0A1929] text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isRTL
            ? isOpen
              ? 'translate-x-0 right-0'
              : 'translate-x-full right-0 lg:translate-x-0 hidden lg:flex'
            : isOpen
            ? 'translate-x-0 left-0'
              : '-translate-x-full left-0 lg:translate-x-0 hidden lg:flex'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Top Header on Mobile */}
        <div className="p-4 lg:hidden flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm">
              MT
            </div>
            <span className="font-extrabold text-white text-sm">{t.appName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button & Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Quick Add Expense button in sidebar */}
          <button
            onClick={() => {
              onOpenAddExpense();
              onClose();
            }}
            className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition transform active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.addExpense}</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                    }`}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.ownerOnly && (
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                        isActive
                          ? 'bg-slate-900 text-amber-300'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      Owner
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info & PWA install */}
        <div className="p-3 border-t border-slate-800 space-y-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-white font-bold text-xs mb-0.5">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span>MADAR AL-TASIS</span>
            </div>
            <div className="text-[10px] text-amber-300/80">Jabal Al-Nour, Makkah</div>
            <div className="text-[10px] text-slate-400">Managing Dir: Imtiyaz Alam</div>
          </div>

          <PWAInstallButton variant="sidebar" />
        </div>
      </aside>
    </>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Globe,
  Bell,
  CheckCircle,
  WifiOff,
  UserCheck,
  ChevronDown,
  Building2,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOffline } from '../context/OfflineContext';
import { PWAInstallButton } from './PWAInstallButton';
import { LanguageCode, NotificationItem } from '../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenAddExpense: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenAddExpense }) => {
  const { user, allUsers, switchDemoUser, token } = useAuth();
  const { lang, setLang, t, isRTL } = useLanguage();
  const { isOnline, offlineQueueCount } = useOffline();

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: NotificationItem) => !n.isRead).length);
      }
    } catch {
      // Offline or network error
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [token, user]);

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.warn('Could not mark notification read:', e);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.warn('Could not mark all notifications read:', e);
    }
  };

  const languageOptions: { code: LanguageCode; label: string; native: string; flag: string }[] = [
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { code: 'ur', label: 'Urdu', native: 'اردو', flag: '🇵🇰' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0F2942] text-white border-b-2 border-amber-400 shadow-md pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile menu toggle + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              {/* Brand Icon */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-amber-500 text-slate-950 font-black shadow-inner shadow-amber-200">
                <span className="text-lg">MT</span>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-[#0F2942] flex items-center justify-center">
                  <Wrench className="w-2.5 h-2.5 text-white" />
                </span>
              </div>

              {/* Title & Location details */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                    {t.appName}
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-semibold border border-amber-400/30">
                    <Building2 className="w-2.5 h-2.5" />
                    Jabal Al-Nour, Makkah
                  </span>
                </div>
                <span className="text-[11px] text-amber-300/90 font-medium hidden sm:block">
                  {t.tagline} • <span className="text-slate-300 font-normal">{t.managingDirector}: {t.directorName}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Offline alert pill */}
            {!isOnline && (
              <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/40">
                <WifiOff className="w-3.5 h-3.5" />
                Offline ({offlineQueueCount})
              </span>
            )}

            {/* Install PWA Button */}
            <div className="hidden sm:block">
              <PWAInstallButton variant="navbar" />
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowUserMenu(false);
                  setShowNotifs(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span className="uppercase text-xs">{lang}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div
                  className={`absolute mt-2 w-44 rounded-xl bg-white text-slate-900 shadow-2xl py-1.5 border border-slate-200 z-50 ${
                    isRTL ? 'left-0' : 'right-0'
                  }`}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Select Language / زبان
                  </div>
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        setLang(opt.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-amber-50 transition ${
                        lang === opt.code ? 'bg-amber-100/70 text-blue-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{opt.flag}</span>
                        <span>{opt.native}</span>
                      </span>
                      {lang === opt.code && <CheckCircle className="w-3.5 h-3.5 text-blue-700" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  setShowLangMenu(false);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div
                  className={`absolute mt-2 w-80 sm:w-96 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 z-50 overflow-hidden ${
                    isRTL ? 'left-0' : 'right-0'
                  }`}
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      {t.notifications} ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {t.markAllRead}
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        {t.noNotifications}
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50 ${
                            !n.isRead ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-slate-800 leading-snug">{n.message}</p>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Demo Switcher */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowLangMenu(false);
                  setShowNotifs(false);
                }}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition"
              >
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
                  }
                  alt={user?.name || 'User'}
                  className="w-7 h-7 rounded-full object-cover border border-amber-400"
                />
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-bold text-white leading-tight">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
                    {user?.role === 'owner' ? 'Owner' : 'Staff'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div
                  className={`absolute mt-2 w-72 rounded-2xl bg-white text-slate-900 shadow-2xl p-2 border border-slate-200 z-50 ${
                    isRTL ? 'left-0' : 'right-0'
                  }`}
                >
                  {/* Current User Info */}
                  <div className="p-3 bg-linear-to-r from-blue-900 to-slate-900 text-white rounded-xl mb-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                      />
                      <div>
                        <div className="font-bold text-sm leading-snug">{user?.name}</div>
                        <div className="text-[11px] text-slate-300">{user?.email}</div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user?.role === 'owner'
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {user?.role === 'owner' ? t.ownerRole : t.staffRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Demo User Switcher Header */}
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {t.demoSwitcher}
                  </div>

                  {/* Demo Switcher user buttons */}
                  <div className="space-y-1 mt-1">
                    {allUsers.map((u) => {
                      const isCurrent = user?.id === u.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchDemoUser(u.id);
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                            isCurrent
                              ? 'bg-amber-100/80 border border-amber-300 font-bold text-slate-900'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div>
                              <span className="block font-semibold">{u.name}</span>
                              <span className="text-[10px] text-slate-400">
                                {u.role === 'owner' ? 'Owner / Director' : 'Field Technician'}
                              </span>
                            </div>
                          </div>
                          {isCurrent && (
                            <UserCheck className="w-4 h-4 text-blue-700 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick + Add Expense button in header for desktop */}
            <button
              onClick={onOpenAddExpense}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition transform active:scale-95"
            >
              <span>{t.addExpense}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

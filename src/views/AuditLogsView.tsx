import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, User, FileText, CheckCircle, Trash2, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AuditLogItem } from '../types';

export const AuditLogsView: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setLogs(await res.json());
    } catch (e) {
      console.warn('Failed to fetch audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  if (user?.role !== 'owner') {
    return (
      <div className="p-8 text-center rounded-3xl bg-rose-50 text-rose-800 text-sm font-semibold">
        Access Denied. Only the Managing Director (Imtiyaz Alam) can view system audit logs.
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">Created</span>;
      case 'approve':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">Approved</span>;
      case 'reject':
        return <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">Rejected</span>;
      case 'settle':
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">Settled</span>;
      case 'delete':
        return <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold uppercase">Deleted</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-500" />
          <span>{t.auditTimeline}</span>
        </h1>
        <p className="text-xs text-slate-500">
          Immutable event log of every expense creation, edit, approval, rejection, and settlement
        </p>
      </div>

      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="divide-y divide-slate-100">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No logs found.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="py-3.5 space-y-1.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="text-slate-500">
                      performed {log.action} on <strong className="text-blue-900 uppercase">{log.entity}</strong>
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                {log.after && (
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 font-mono overflow-x-auto">
                    {JSON.stringify(log.after)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

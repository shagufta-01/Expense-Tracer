import React, { useState, useEffect } from 'react';
import { Users, User, DollarSign, Receipt, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Group } from '../types';

export const TeamsView: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGroups = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/groups', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setGroups(await res.json());
    } catch (e) {
      console.warn('Failed to load groups:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [token]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t.navTeams}
          </h1>
          <p className="text-xs text-slate-500">
            Field technician groups &amp; specialized maintenance divisions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {groups.map((group) => (
          <div
            key={group.id}
            className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-blue-950 font-bold flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-amber-600" />
              </div>

              <h3 className="font-extrabold text-base text-slate-900">{group.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{group.description}</p>
            </div>

            {/* Member list */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Team Members ({group.membersCount}):
              </span>
              <div className="space-y-1.5">
                {(group.memberList || []).map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-medium text-slate-800">{m.name}</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                        m.role === 'owner'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Group spending card */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Total Shared Spend
                </span>
                <span className="text-sm font-black text-slate-900">
                  {group.totalSpendSAR?.toFixed(2) || '0.00'} SAR
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {group.expenseCount || 0} expenses
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

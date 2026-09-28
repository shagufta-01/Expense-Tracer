import React, { useState, useEffect } from 'react';
import { Briefcase, Phone, MapPin, Plus, Wrench, Layers, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { JobModal } from '../components/JobModal';
import { Job } from '../types';

export const JobsView: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setJobs(await res.json());
    } catch (e) {
      console.warn('Failed to load jobs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [token]);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t.navJobs}
          </h1>
          <p className="text-xs text-slate-500">
            Customer maintenance &amp; repair orders across Makkah neighborhoods
          </p>
        </div>

        <button
          onClick={() => setShowAddJobModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.addNewJob}</span>
        </button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
          >
            {/* Header: Title and Status */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] text-blue-700 uppercase font-black tracking-wider block">
                  {job.applianceType} {job.brand && `• ${job.brand}`}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                  {job.customerName}
                </h3>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  job.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : job.status === 'active'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {job.status}
              </span>
            </div>

            {/* Location & Phone */}
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{job.location}</span>
              </div>
              {job.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.phone}</span>
                </div>
              )}
            </div>

            {/* Assigned Technicians */}
            {job.assignedStaff && job.assignedStaff.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Assigned Technicians:</span>
                <div className="flex items-center -space-x-1.5">
                  {job.assignedStaff.map((staff) => (
                    <img
                      key={staff.id}
                      src={staff.avatar}
                      alt={staff.name}
                      title={staff.name}
                      className="w-6 h-6 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Attached Expenses Cost Card */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Total Job Cost (Parts/Gas)
                </span>
                <span className="text-sm font-black text-slate-900">
                  {job.totalCostSAR?.toFixed(2) || '0.00'} SAR
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {job.expenseCount || 0} expenses linked
              </span>
            </div>
          </div>
        ))}
      </div>

      <JobModal
        isOpen={showAddJobModal}
        onClose={() => setShowAddJobModal(false)}
        onJobCreated={fetchJobs}
      />
    </div>
  );
};

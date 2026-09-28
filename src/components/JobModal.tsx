import React, { useState } from 'react';
import { X, Briefcase, Phone, MapPin, Wrench, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: () => void;
}

export const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, onJobCreated }) => {
  const { allUsers, token } = useAuth();
  const { t } = useLanguage();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [applianceType, setApplianceType] = useState('Air Conditioner');
  const [brand, setBrand] = useState('Gree');
  const [location, setLocation] = useState('Al-Aziziyah, Makkah');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('Customer name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          applianceType,
          brand: brand.trim(),
          location: location.trim(),
          assignedTo,
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create job');
      }

      setIsSubmitting(false);
      onJobCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

  const toggleAssignee = (uid: string) => {
    if (assignedTo.includes(uid)) {
      setAssignedTo(assignedTo.filter((id) => id !== uid));
    } else {
      setAssignedTo([...assignedTo, uid]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0F2942] text-white border-b-2 border-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base leading-tight">{t.addNewJob}</h2>
              <p className="text-[11px] text-amber-300">MADAR AL-TASIS • Makkah Service Jobs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">{t.customerName} *</label>
            <input
              type="text"
              placeholder="e.g. Sheikh Abdullah / Hotel Al-Safwah"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">{t.phone}</label>
            <input
              type="tel"
              placeholder="+966 50 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">{t.applianceType}</label>
              <select
                value={applianceType}
                onChange={(e) => setApplianceType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
              >
                <option value="Air Conditioner">Air Conditioner (AC)</option>
                <option value="Washing Machine">Washing Machine</option>
                <option value="Refrigerator">Refrigerator</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">{t.brand}</label>
              <input
                type="text"
                placeholder="e.g. Gree, LG, Daikin, Samsung"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Location in Makkah</label>
            <input
              type="text"
              placeholder="e.g. Jabal Al-Nour, Al-Aziziyah, Al-Kakiyyah"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs"
            />
          </div>

          {/* Assigned Technicians */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Assign Technicians</label>
            <div className="grid grid-cols-2 gap-1.5">
              {allUsers.map((u) => {
                const isSelected = assignedTo.includes(u.id);
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => toggleAssignee(u.id)}
                    className={`p-2 rounded-lg text-xs font-medium text-left border transition ${
                      isSelected
                        ? 'bg-amber-100/70 border-amber-300 font-bold text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {u.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Fault Description / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Not cooling, R410A gas leak, motor drum noise..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-extrabold shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : t.createJob}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

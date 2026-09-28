import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Check,
  AlertCircle,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  Building,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOffline } from '../context/OfflineContext';
import { Category, Group, Job, User } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onExpenseAdded,
}) => {
  const { user, allUsers, token } = useAuth();
  const { t } = useLanguage();
  const { isOnline, queueOfflineExpense } = useOffline();

  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [paidBy, setPaidBy] = useState<string>(user?.id || '');
  const [groupId, setGroupId] = useState<string>('');
  const [jobId, setJobId] = useState<string>('');
  const [splitType, setSplitType] = useState<'company' | 'equal' | 'custom' | 'percentage'>('company');

  // Split configurations
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customShares, setCustomShares] = useState<{ [userId: string]: string }>({});
  const [percentages, setPercentages] = useState<{ [userId: string]: string }>({});

  // Receipt
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [receiptPreview, setReceiptPreview] = useState<string>('');

  // Dropdown data
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (user) {
        setPaidBy(user.id);
      }
      fetchDependencies();
    }
  }, [isOpen, user]);

  const fetchDependencies = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [catRes, grpRes, jobRes] = await Promise.all([
        fetch('/api/categories', { headers }),
        fetch('/api/groups', { headers }),
        fetch('/api/jobs', { headers }),
      ]);

      if (catRes.ok) {
        const cats = await catRes.json();
        setCategories(cats);
        if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
      }
      if (grpRes.ok) {
        const grps = await grpRes.json();
        setGroups(grps);
        if (grps.length > 0 && !groupId) {
          setGroupId(grps[0].id);
          // Set default selected members from group
          setSelectedMembers(grps[0].members || allUsers.map((u) => u.id));
        }
      }
      if (jobRes.ok) {
        const jbs = await jobRes.json();
        setJobs(jbs.filter((j: Job) => j.status === 'active'));
      }
    } catch (e) {
      console.warn('Could not load modal dependencies:', e);
    }
  };

  // Image Upload handler (Base64 dataURL)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setReceiptUrl(b64);
      setReceiptPreview(b64);
    };
    reader.readAsDataURL(file);
  };

  // Preset quick amounts (SAR)
  const handlePresetAmount = (presetVal: number) => {
    const current = Number(amount) || 0;
    setAmount((current + presetVal).toString());
  };

  // Handle member toggle for equal split
  const toggleMember = (uid: string) => {
    if (selectedMembers.includes(uid)) {
      if (selectedMembers.length > 1) {
        setSelectedMembers(selectedMembers.filter((id) => id !== uid));
      }
    } else {
      setSelectedMembers([...selectedMembers, uid]);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount in SAR.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Description is required.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Please select a category.');
      return;
    }

    // Build splits payload
    let formattedSplits: any[] = [];
    if (splitType === 'company') {
      formattedSplits = [];
    } else if (splitType === 'equal') {
      formattedSplits = selectedMembers.map((userId) => ({ userId }));
    } else if (splitType === 'custom') {
      let customSum = 0;
      formattedSplits = allUsers.map((u) => {
        const val = Number(customShares[u.id] || 0);
        customSum += val;
        return { userId: u.id, shareAmount: val };
      });
      if (Math.abs(customSum - numAmount) > 0.05) {
        setErrorMsg(`Custom shares sum (${customSum.toFixed(2)} SAR) must equal total amount (${numAmount.toFixed(2)} SAR).`);
        return;
      }
    } else if (splitType === 'percentage') {
      let pctSum = 0;
      formattedSplits = allUsers.map((u) => {
        const val = Number(percentages[u.id] || 0);
        pctSum += val;
        return { userId: u.id, percentage: val };
      });
      if (Math.abs(pctSum - 100) > 0.5) {
        setErrorMsg(`Percentages sum (${pctSum}%) must equal 100%.`);
        return;
      }
    }

    const payload = {
      amount: numAmount,
      date,
      description: description.trim(),
      categoryId,
      paidBy: paidBy || user?.id,
      groupId: groupId || (groups[0]?.id || 'general'),
      jobId: jobId || null,
      splitType,
      splits: formattedSplits,
      receiptUrl,
    };

    setIsSubmitting(true);

    // If offline, save into local queue
    if (!isOnline) {
      queueOfflineExpense(payload);
      setIsSubmitting(false);
      onExpenseAdded();
      onClose();
      return;
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save expense');
      }

      setIsSubmitting(false);
      onExpenseAdded();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving expense');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0F2942] text-white border-b-2 border-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base leading-tight">{t.addExpense}</h2>
              <p className="text-[11px] text-amber-300">MADAR AL-TASIS • Jabal Al-Nour</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Amount Input with SAR label and Quick Presets */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t.amountSAR} *
            </label>
            <div className="relative rounded-xl shadow-xs">
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="block w-full rounded-xl border border-slate-300 py-3 pl-4 pr-16 text-2xl font-black text-slate-900 placeholder:text-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <span className="text-sm font-bold text-slate-500">SAR (ر.س)</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Add Quick:</span>
              {[50, 100, 200, 500].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handlePresetAmount(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-blue-900 text-slate-700 text-xs font-bold transition border border-slate-200"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t.description} *
            </label>
            <input
              type="text"
              placeholder="e.g. R410A Refrigerant cylinder, LG drain motor, fuel..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="block w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
            />
          </div>

          {/* Date & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">{t.date}</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">{t.category} *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="block w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Paid By & Group Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">{t.paidBy} *</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 bg-white"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'owner' ? 'Owner' : 'Staff'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">{t.teamGroup}</label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 bg-white"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linked Customer Job in Makkah (Optional) */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.customerJob}</span>
            </label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 bg-white"
            >
              <option value="">-- No customer job linked (General operational expense) --</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.customerName} • {j.applianceType} ({j.location})
                </option>
              ))}
            </select>
          </div>

          {/* Split Type Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t.splitType}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'company', label: t.companyExpense, desc: t.companyBears100 },
                { id: 'equal', label: t.equalSplit, desc: 'Divide equally' },
                { id: 'custom', label: t.customSplit, desc: 'Exact SAR amount' },
                { id: 'percentage', label: t.percentageSplit, desc: 'By percentage' },
              ].map((st) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setSplitType(st.id as any)}
                  className={`p-2 rounded-xl text-left border transition ${
                    splitType === st.id
                      ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold text-xs">{st.label}</span>
                  <span
                    className={`block text-[10px] truncate ${
                      splitType === st.id ? 'text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    {st.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Split Details Configurations */}
            {splitType === 'company' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-slate-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">100% Company Reimbursement:</span>
                  <p className="text-[11px] text-slate-600">
                    The company / Managing Director Imtiyaz Alam will reimburse the full{' '}
                    <strong>{amount ? `${Number(amount).toFixed(2)} SAR` : 'amount'}</strong> to the payer.
                  </p>
                </div>
              </div>
            )}

            {splitType === 'equal' && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Select Participants:</span>
                  <span className="text-blue-700 font-bold">
                    {amount && selectedMembers.length > 0
                      ? `~${(Number(amount) / selectedMembers.length).toFixed(2)} SAR / person`
                      : ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {allUsers.map((u) => {
                    const isChecked = selectedMembers.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-amber-100/70 border-amber-300 font-semibold text-slate-900'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMember(u.id)}
                          className="rounded text-amber-500 focus:ring-amber-400"
                        />
                        <span className="truncate">{u.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {splitType === 'custom' && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-semibold text-slate-700">
                  Enter exact SAR share for each person:
                </div>
                <div className="space-y-1.5">
                  {allUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-800 font-medium truncate w-1/2">{u.name}</span>
                      <div className="relative w-1/2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={customShares[u.id] || ''}
                          onChange={(e) =>
                            setCustomShares({ ...customShares, [u.id]: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 py-1 px-2 text-xs text-right pr-10"
                        />
                        <span className="absolute right-2 top-1 text-[10px] text-slate-400">SAR</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {splitType === 'percentage' && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-semibold text-slate-700">
                  Enter percentage share (must sum to 100%):
                </div>
                <div className="space-y-1.5">
                  {allUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-800 font-medium truncate w-1/2">{u.name}</span>
                      <div className="relative w-1/2">
                        <input
                          type="number"
                          step="1"
                          placeholder="0"
                          value={percentages[u.id] || ''}
                          onChange={(e) =>
                            setPercentages({ ...percentages, [u.id]: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 py-1 px-2 text-xs text-right pr-8"
                        />
                        <span className="absolute right-2 top-1 text-[10px] text-slate-400">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Receipt Upload */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t.receiptPhoto}
            </label>

            {receiptPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-100 p-2 flex items-center justify-between">
                <img
                  src={receiptPreview}
                  alt="Receipt Preview"
                  className="h-20 w-24 object-cover rounded-lg border border-slate-200"
                />
                <div className="flex-1 px-3">
                  <span className="text-xs font-bold text-slate-800 block">Receipt Attached</span>
                  <span className="text-[10px] text-slate-500">Ready to upload</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReceiptUrl('');
                    setReceiptPreview('');
                  }}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 font-bold rounded-lg transition"
                >
                  {t.removePhoto}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-400 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-amber-50/50 cursor-pointer transition">
                  <Upload className="w-4 h-4 text-amber-500" />
                  <span>{t.uploadReceipt}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-extrabold shadow-md transition transform active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? t.saving : t.saveExpense}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

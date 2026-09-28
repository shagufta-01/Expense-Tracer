import React, { useState, useEffect } from 'react';
import { Tags, Plus, Wrench, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Category } from '../types';

export const CategoriesView: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.warn('Failed to load categories:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      if (res.ok) {
        setNewCatName('');
        fetchCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (user?.role !== 'owner') {
    return (
      <div className="p-8 text-center rounded-3xl bg-rose-50 text-rose-800 text-sm font-semibold">
        Access Denied. Only the Owner can manage expense categories.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t.navCategories}
        </h1>
        <p className="text-xs text-slate-500">
          Manage operational expenditure categories for AC and washing machine teams
        </p>
      </div>

      {/* Add Category Form */}
      <form
        onSubmit={handleAddCategory}
        className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-3"
      >
        <input
          type="text"
          placeholder="New Category Name (e.g. Workshop Machinery, Van Maintenance)..."
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className="flex-1 rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Category</span>
        </button>
      </form>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-blue-900">
                <Package className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-slate-900">{c.name}</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        ))}
      </div>
    </div>
  );
};

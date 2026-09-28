'use client';

import { useEffect, useState } from 'react';
import { Zap, Plus, Pencil, Trash2, CalendarClock, CheckCircle2, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function getSaleStatus(sale: any) {
  const now   = new Date();
  const start = new Date(sale.startsAt);
  const end   = new Date(sale.endsAt);
  if (!sale.isActive)  return { label: 'Inactive', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: XCircle };
  if (now < start)    return { label: 'Upcoming', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400', icon: Clock };
  if (now > end)      return { label: 'Expired',  cls: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400', icon: XCircle };
  return { label: 'Active', cls: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400', icon: CheckCircle2 };
}

export default function FlashSalesPage() {
  const [sales, setSales]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ title: '', discountPct: '', startsAt: '', endsAt: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/flash-sales');
      const data = await res.json();
      setSales(data);
    } catch { toast.error('Failed to load flash sales'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSales(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', discountPct: '', startsAt: '', endsAt: '', isActive: true });
    setShowForm(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      title: s.title,
      discountPct: String(s.discountPct),
      startsAt: s.startsAt.slice(0, 16),
      endsAt: s.endsAt.slice(0, 16),
      isActive: s.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method  = editing ? 'PUT' : 'POST';
      const url     = editing ? `/api/admin/flash-sales/${editing.id}` : '/api/admin/flash-sales';
      const res     = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Failed');
      toast.success(editing ? 'Flash sale updated!' : 'Flash sale created!');
      setShowForm(false);
      fetchSales();
    } catch { toast.error('Failed to save flash sale'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this flash sale?')) return;
    try {
      await fetch(`/api/admin/flash-sales/${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      fetchSales();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <Zap size={22} className="text-amber-600 dark:text-amber-400" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Flash Sales</h1>
            <p className="text-slate-500 text-sm">Create time-limited discount events.</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Flash Sale
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">
              {editing ? 'Edit Flash Sale' : 'Create Flash Sale'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  className="w-full input-field" placeholder="e.g. Weekend Flash Sale" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Discount % *</label>
                <input required type="number" min="1" max="99" step="0.5" value={form.discountPct}
                  onChange={e => setForm(f => ({...f, discountPct: e.target.value}))}
                  className="w-full input-field" placeholder="e.g. 20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Starts At *</label>
                  <input required type="datetime-local" value={form.startsAt}
                    onChange={e => setForm(f => ({...f, startsAt: e.target.value}))}
                    className="w-full input-field" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Ends At *</label>
                  <input required type="datetime-local" value={form.endsAt}
                    onChange={e => setForm(f => ({...f, endsAt: e.target.value}))}
                    className="w-full input-field" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={form.isActive}
                  onChange={e => setForm(f => ({...f, isActive: e.target.checked}))}
                  className="w-4 h-4 rounded accent-primary-600" />
                <label htmlFor="isActive" className="text-sm font-bold text-slate-700 dark:text-slate-300">Active</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : sales.length === 0 ? (
        <div className="card py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Zap size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No flash sales yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Title</th>
                <th className="px-6 py-4 text-left font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Discount</th>
                <th className="px-6 py-4 text-left font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Period</th>
                <th className="px-6 py-4 text-left font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Status</th>
                <th className="px-6 py-4 text-right font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sales.map(s => {
                const status = getSaleStatus(s);
                const Icon   = status.icon;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{s.title}</td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-black text-amber-600 dark:text-amber-400">{Number(s.discountPct)}% OFF</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock size={13} />
                        {new Date(s.startsAt).toLocaleDateString('en-IN')} → {new Date(s.endsAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status.cls}`}>
                        <Icon size={11} /> {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-600 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Mail, Download, UserX, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/newsletter');
      const data = await res.json();
      setSubscribers(data);
    } catch { toast.error('Failed to load subscribers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubs(); }, []);

  const handleToggle = async (sub: any) => {
    try {
      await fetch(`/api/admin/newsletter/${sub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !sub.isActive }),
      });
      toast.success(sub.isActive ? 'Unsubscribed' : 'Re-subscribed');
      fetchSubs();
    } catch { toast.error('Failed to update'); }
  };

  const handleExportCSV = () => {
    const header = 'Email,Name,Subscribed At,Status';
    const rows   = subscribers.map(s =>
      `"${s.email}","${s.name || ''}","${new Date(s.subscribedAt).toLocaleDateString('en-IN')}","${s.isActive ? 'Active' : 'Inactive'}"`
    );
    const csv    = [header, ...rows].join('\n');
    const blob   = new Blob([csv], { type: 'text/csv' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href = url; a.download = 'newsletter-subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = subscribers.filter(
    s => s.email.toLowerCase().includes(search.toLowerCase()) ||
         (s.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Mail size={22} className="text-blue-600 dark:text-blue-400" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Newsletter</h1>
            <p className="text-slate-500 text-sm">{subscribers.filter(s => s.isActive).length} active subscribers</p>
          </div>
        </div>
        <button onClick={handleExportCSV} className="btn-outline flex items-center gap-2 text-sm">
          <Download size={15} /> Export CSV
        </button>
      </div>

      <input
        type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search subscribers..."
        className="w-full max-w-sm px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
      />

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Email</th>
                <th className="px-6 py-4 text-left font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Name</th>
                <th className="px-6 py-4 text-left font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Subscribed</th>
                <th className="px-6 py-4 text-left font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Status</th>
                <th className="px-6 py-4 text-right font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-slate-900 dark:text-white">{sub.email}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{sub.name || '—'}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(sub.subscribedAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${
                      sub.isActive
                        ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                    }`}>
                      {sub.isActive ? <UserCheck size={11} /> : <UserX size={11} />}
                      {sub.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggle(sub)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        sub.isActive
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 hover:bg-green-100'
                      }`}
                    >
                      {sub.isActive ? 'Unsubscribe' : 'Re-subscribe'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <Mail size={32} className="mx-auto mb-2 text-slate-300" />
              <p>No subscribers found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

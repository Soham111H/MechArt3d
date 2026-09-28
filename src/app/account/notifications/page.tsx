'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, Box } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/account/notifications');
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/account/notifications/read-all', { method: 'POST' });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const markRead = async (id: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      await fetch(`/api/account/notifications/${id}/read`, { method: 'POST' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="text-primary-500" /> Notifications
        </h1>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="btn-secondary text-sm px-3 py-1.5">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Bell size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No notifications</h3>
          <p className="text-slate-500">You're all caught up! We'll notify you when there's an update.</p>
        </div>
      ) : (
        <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link || '#'}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`flex items-start gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                <Box size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`font-bold ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{n.message}</p>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {!n.isRead && (
                    <div className="w-3 h-3 rounded-full bg-primary-500 shrink-0" />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

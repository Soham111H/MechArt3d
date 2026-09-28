'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/account/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const markAllRead = async () => {
    try {
      await fetch('/api/account/notifications/read-all', { method: 'POST' });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const markRead = async (id: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      await fetch(`/api/account/notifications/${id}/read`, { method: 'POST' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden z-50 flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs font-bold text-primary-600 hover:text-primary-700">
                  Mark all as read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <Bell size={32} className="text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-500">No notifications yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.slice(0, 20).map((n) => (
                    <Link
                      key={n.id}
                      href={n.link || '#'}
                      onClick={() => { if (!n.isRead) markRead(n.id); setOpen(false); }}
                      className={`block p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                          <Box size={14} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold mb-0.5 ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link 
              href="/account/notifications" 
              onClick={() => setOpen(false)}
              className="p-3 text-center text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

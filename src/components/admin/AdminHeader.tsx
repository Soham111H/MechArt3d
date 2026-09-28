"use client";

import { Bell, Search, Sun, Moon, Menu } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useEffect, useState } from "react";

export default function AdminHeader({
  user,
  onMobileMenuToggle,
}: {
  user: { name?: string | null; email?: string | null; role?: string | null };
  onMobileMenuToggle: () => void;
}) {
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  return (
    <header className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center gap-4 px-4 md:px-6 sticky top-0 z-20">
      {/* Mobile menu toggle */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 rounded-xl px-3 py-2 flex-1 max-w-md">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          placeholder="Search orders, products, users…"
          className="bg-transparent text-sm text-slate-900 dark:text-white outline-none w-full placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={mounted && isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {mounted && isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-950" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800 ml-1">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-400 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user?.name}</p>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium leading-tight">
              {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Staff"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

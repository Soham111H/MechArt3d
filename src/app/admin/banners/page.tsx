"use client";

import { Megaphone } from "lucide-react";

export default function BannersPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Megaphone className="text-primary-500" />
          Banners
        </h1>
        <p className="text-slate-500 mt-1">Manage promotional sliders for the home page.</p>
      </div>

      <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
        <Megaphone size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          The banner management feature is currently being configured and will be available in the next update.
        </p>
      </div>
    </div>
  );
}

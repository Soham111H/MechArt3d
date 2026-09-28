"use client";

import { useSettingsStore, defaultSettings } from "@/store/useSettingsStore";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function TermsConditionsPage() {
  const { settings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const s = mounted ? settings : defaultSettings;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 animate-fade-in-up">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="mb-8">
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors">
            &larr; Back to Home
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-slate-500">Rules and guidelines for using our services.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative text-slate-700 dark:text-slate-300 leading-relaxed space-y-6">
            {s.termsOfService ? (
              <p className="whitespace-pre-wrap">{s.termsOfService}</p>
            ) : (
              <div className="text-center py-20 text-slate-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>Our Terms & Conditions are currently being updated.</p>
                <p className="text-sm">Please check back later.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

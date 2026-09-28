'use client';

import { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/ui/Breadcrumb';

interface FaqItem    { id: string; question: string; answer: string; }
interface FaqCategory { id: string; name: string; items: FaqItem[]; }

export default function FaqClient({ categories }: { categories: FaqCategory[] }) {
  const [search, setSearch]     = useState('');
  const [openItem, setOpenItem] = useState<string | null>(null);

  const filtered = categories
    .map(cat => ({
      ...cat,
      items: cat.items.filter(
        item =>
          item.question.toLowerCase().includes(search.toLowerCase()) ||
          item.answer.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="flex justify-center mb-4">
            <Breadcrumb items={[{label:'FAQ'}]} />
          </div>
          <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={28} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-slate-500 text-lg">Can't find what you're looking for? <a href="/contact" className="text-primary-600 hover:underline">Contact us</a></p>
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white shadow-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <HelpCircle size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No results for "{search}"</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filtered.map(cat => (
              <div key={cat.id}>
                <h2 className="text-sm font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-4">{cat.name}</h2>
                <div className="space-y-2">
                  {cat.items.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => setOpenItem(openItem === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <span className="font-bold text-slate-900 dark:text-white">{item.question}</span>
                        <ChevronDown
                          size={18}
                          className={`text-slate-400 shrink-0 transition-transform duration-200 ${openItem === item.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {openItem === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-5 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

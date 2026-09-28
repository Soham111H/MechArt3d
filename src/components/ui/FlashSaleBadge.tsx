'use client';

import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface FlashSaleBadgeProps {
  sale: {
    title: string;
    discountPct: string | number;
    endsAt: string;
  };
  compact?: boolean;
}

export default function FlashSaleBadge({ sale, compact = false }: FlashSaleBadgeProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const end = new Date(sale.endsAt).getTime();
    
    const update = () => {
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [sale.endsAt]);

  if (timeLeft === 'Ended') return null;

  if (compact) {
    return (
      <div className="flex flex-col gap-1 items-start">
        <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded shadow-lg flex items-center gap-1">
          {sale.title} -{Number(sale.discountPct)}%
        </span>
        <span className="px-2 py-1 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold rounded shadow-lg flex items-center gap-1">
          <Timer size={10} /> {timeLeft}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl w-full sm:w-auto">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
          <Timer size={18} />
        </div>
        <div>
          <h4 className="text-sm font-black text-red-700 dark:text-red-400 uppercase tracking-widest">{sale.title}</h4>
          <p className="text-xs font-bold text-red-600/80 dark:text-red-400/80">{Number(sale.discountPct)}% OFF applied</p>
        </div>
      </div>
      <div className="sm:ml-auto bg-white dark:bg-slate-900 px-4 py-2 rounded-lg shadow-sm border border-red-100 dark:border-red-800">
        <span className="text-lg font-mono font-bold text-slate-900 dark:text-white tracking-wider">{timeLeft}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Remaining</span>
      </div>
    </div>
  );
}

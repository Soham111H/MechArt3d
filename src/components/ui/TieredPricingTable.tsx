import { Percent } from 'lucide-react';

interface Tier {
  id: string;
  minQty: number;
  maxQty: number | null;
  discountPct: number | string;
}

interface TieredPricingTableProps {
  tiers: Tier[];
  basePrice: number;
  currentQty?: number;
}

export default function TieredPricingTable({ tiers, basePrice, currentQty = 1 }: TieredPricingTableProps) {
  if (!tiers || tiers.length === 0) return null;

  const getActiveTier = (qty: number) =>
    tiers.find(t => qty >= t.minQty && (t.maxQty === null || qty <= t.maxQty));

  const activeTier = getActiveTier(currentQty);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
        <Percent size={14} className="text-primary-500" />
        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Bulk Discounts</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">Qty</th>
            <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">Discount</th>
            <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase">Price/unit</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map(tier => {
            const pct        = Number(tier.discountPct);
            const discounted = basePrice * (1 - pct / 100);
            const isActive   = activeTier?.id === tier.id;
            return (
              <tr
                key={tier.id}
                className={`border-b border-slate-100 dark:border-slate-800 last:border-0 ${
                  isActive ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
              >
                <td className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                  {tier.minQty}{tier.maxQty ? `–${tier.maxQty}` : '+'} units
                </td>
                <td className="px-4 py-2.5">
                  <span className={`font-black ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-green-600 dark:text-green-400'}`}>
                    -{pct}%
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-black text-slate-900 dark:text-white">
                  ₹{discounted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  {isActive && <span className="ml-1.5 text-[10px] font-bold bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded-full">Active</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Gift, TrendingUp, TrendingDown, Info, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function RewardsPage() {
  const [data, setData] = useState<{ rewards: any[], totalPoints: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await fetch("/api/user/rewards");
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
    } catch (error) {
      toast.error("Could not load your rewards");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Loader2 className="animate-spin mx-auto mb-4" size={32} />
        Loading your rewards...
      </div>
    );
  }

  const { rewards = [], totalPoints = 0 } = data || {};

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Reward Points</h1>
        <p className="text-slate-500 text-sm mt-1">View your earned points and transaction history.</p>
      </div>

      {/* Points Overview */}
      <div className="card p-8 bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <Gift size={36} className="text-white" />
            </div>
            <div>
              <p className="text-primary-100 font-semibold mb-1 uppercase tracking-wider text-sm">Available Points</p>
              <h2 className="text-5xl font-black">{totalPoints.toLocaleString()}</h2>
            </div>
          </div>
          <div className="p-4 bg-black/20 rounded-xl backdrop-blur-sm max-w-xs">
            <p className="text-sm text-primary-50 flex items-start gap-2">
              <Info size={16} className="shrink-0 mt-0.5" />
              <span>You can redeem your points at checkout. 100 points = ₹10 discount.</span>
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Points History</h2>
        </div>
        
        {rewards.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <Gift size={32} className="mx-auto mb-3 opacity-20" />
            <p>You haven't earned any reward points yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {rewards.map((reward) => (
              <div key={reward.id} className="p-4 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reward.points > 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {reward.points > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{reward.reason}</p>
                    <p className="text-xs text-slate-500">{new Date(reward.createdAt).toLocaleDateString()} at {new Date(reward.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className={`font-black text-lg ${reward.points > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {reward.points > 0 ? '+' : ''}{reward.points}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

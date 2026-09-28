"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      toast.error("Could not load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: string, isApproved: boolean) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: id, isApproved }),
      });
      if (!res.ok) throw new Error("Failed to update review");
      toast.success(isApproved ? "Review approved" : "Review rejected");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to update review");
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'ALL') return true;
    if (filter === 'APPROVED') return r.status === 'APPROVED';
    if (filter === 'PENDING') return r.status === 'PENDING';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Star className="text-primary-500" />
            Reviews
          </h1>
          <p className="text-slate-500 mt-1">Moderate customer reviews before they appear publicly.</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {(['ALL', 'PENDING', 'APPROVED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              filter === tab 
                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          No reviews found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">
                      {i < review.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  review.status === 'APPROVED' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' 
                    : review.status === 'REJECTED'
                    ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                }`}>
                  {review.status}
                </span>
              </div>
              
              <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{review.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow line-clamp-3 mb-4">
                {review.body}
              </p>
              
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="font-semibold">{review.user?.name || "Anonymous"}</span>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400">Product: </span>
                  <Link href={`/products/${review.product?.slug}`} className="font-medium text-blue-500 hover:underline">
                    {review.product?.name || "Unknown Product"}
                  </Link>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {review.status !== 'APPROVED' ? (
                  <button 
                    onClick={() => handleModerate(review.id, true)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 rounded-xl text-sm font-bold transition-colors"
                  >
                    <CheckCircle size={16} /> Approve
                  </button>
                ) : null}
                {review.status !== 'REJECTED' ? (
                  <button 
                    onClick={() => handleModerate(review.id, false)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl text-sm font-bold transition-colors"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

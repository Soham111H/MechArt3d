'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

interface WishlistButtonProps {
  productId: string;
  initialWishlisted?: boolean;
  size?: number;
  className?: string;
}

export default function WishlistButton({
  productId,
  initialWishlisted = false,
  size = 18,
  className = '',
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [loading, setLoading]       = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.status === 401) {
        toast.error('Please sign in to save to wishlist');
        return;
      }
      const data = await res.json();
      setWishlisted(data.wishlisted);
      toast.success(data.wishlisted ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`p-2 rounded-xl transition-all duration-200 ${
        wishlisted
          ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20'
          : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10'
      } ${loading ? 'opacity-50 cursor-wait' : ''} ${className}`}
    >
      <Heart
        size={size}
        className={`transition-all duration-200 ${wishlisted ? 'fill-rose-500 scale-110' : 'hover:scale-110'}`}
      />
    </button>
  );
}

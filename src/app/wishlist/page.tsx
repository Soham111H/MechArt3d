'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, Package, ArrowRight, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistPage() {
  const [items, setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/user/wishlist');
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      toast.error('Could not load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (productId: string) => {
    try {
      await fetch(`/api/user/wishlist?productId=${productId}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i.productId !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = (item: any) => {
    const p = item.product;
    if (!p || p.stock === 0) return;
    addItem({
      id: p.id,
      productId: p.id,
      name: p.name,
      price: Number(p.discountPrice || p.basePrice),
      quantity: 1,
      image: p.images?.[0]?.url || '',
      slug: p.slug,
      stock: p.stock,
    });
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Heart size={32} className="text-rose-500 fill-rose-500" />
              My Wishlist
            </h1>
            <p className="text-slate-500 mt-1">
              {items.length} item{items.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          {items.length > 0 && (
            <Link href="/products" className="btn-outline flex items-center gap-2 text-sm">
              Browse More <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="text-center py-24 animate-fade-in-up">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-rose-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Your wishlist is empty</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Save your favourite products here to easily find them later.
            </p>
            <Link href="/products" className="btn-primary inline-flex items-center gap-2">
              Browse Products <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item, i) => {
                const p          = item.product;
                const img        = p?.images?.[0]?.url;
                const inStock    = (p?.stock ?? 0) > 0;
                const hasDiscount = p?.discountPrice && Number(p.discountPrice) < Number(p.basePrice);
                const discountPct = hasDiscount
                  ? Math.round((1 - Number(p.discountPrice) / Number(p.basePrice)) * 100)
                  : 0;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm group ${!inStock ? 'opacity-60' : ''}`}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden">
                      <Link href={`/product/${p?.slug}`}>
                        {img ? (
                          <img
                            src={img}
                            alt={p?.name}
                            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-52 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Package size={36} className="text-slate-300" />
                          </div>
                        )}
                      </Link>
                      {hasDiscount && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1">
                          <Tag size={10} /> -{discountPct}%
                        </div>
                      )}
                      {!inStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white text-slate-900 text-xs font-black px-3 py-1.5 rounded-lg">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{p?.category?.name}</p>
                      <Link href={`/product/${p?.slug}`}>
                        <h3 className="font-black text-slate-900 dark:text-white text-sm line-clamp-2 hover:text-primary-600 transition-colors mb-3">
                          {p?.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{Number(p?.discountPrice || p?.basePrice).toLocaleString('en-IN')}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-slate-400 line-through">
                            ₹{Number(p?.basePrice).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={!inStock}
                          className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart size={14} />
                          {inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-500/30 transition-colors"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

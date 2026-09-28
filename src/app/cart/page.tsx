"use client";

import { useCartStore } from "@/store/useCartStore";
import { useSettingsStore, defaultSettings } from "@/store/useSettingsStore";
import Link from "next/link";
import { Trash2, ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const { settings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch for persisted store
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const s = settings;
  const subtotal = getSubtotal();
  const tax = subtotal * (s.gstRate / 100);
  const isFreeShipping = subtotal >= s.freeShippingAbove;
  const shipping = isFreeShipping ? 0 : s.codFee;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-4">
          <Breadcrumb items={[{label:'Cart'}]} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-8 animate-fade-in-up">
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-24 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Your cart is empty</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Discover our premium 3D models and start printing!</p>
            <Link href="/products" className="btn-primary inline-flex items-center gap-2">
              Explore Products <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in-up">
            
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="card p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-6">
                  
                  {/* Image */}
                  <Link href={`/product/${item.slug}`} className="shrink-0">
                    <img 
                      src={item.image || "/placeholder.jpg"} 
                      alt={item.name} 
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl bg-slate-100" 
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div>
                        <Link href={`/product/${item.slug}`} className="text-lg font-bold text-slate-900 dark:text-white hover:text-primary-500 transition-colors">
                          {item.name}
                        </Link>
                        {item.variantName && (
                          <p className="text-sm text-slate-500 font-medium">Variant: {item.variantName}</p>
                        )}
                      </div>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      
                      {/* Quantity Control */}
                      <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg h-10">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold h-full"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold h-full"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-sm font-bold text-slate-400 hover:text-red-500 flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 size={16} /> <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm sticky top-24">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm font-medium">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-white">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Estimated Tax ({s.gstRate}% GST)</span>
                  <span className="text-slate-900 dark:text-white">₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping (COD)</span>
                  <span className={isFreeShipping ? "text-green-600 font-bold" : "text-slate-900 dark:text-white"}>
                    {isFreeShipping ? "Free 🎉" : `₹${s.codFee}`}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Free shipping progress */}
              {!isFreeShipping && s.freeShippingAbove > 0 && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    <Truck size={14} />
                    Add ₹{(s.freeShippingAbove - subtotal).toLocaleString('en-IN', { maximumFractionDigits: 0 })} more for FREE shipping!
                  </div>
                  <div className="w-full bg-amber-200 dark:bg-amber-800/50 rounded-full h-1.5">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotal / s.freeShippingAbove) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
                Proceed to Checkout <ArrowRight size={20} />
              </Link>

              <div className="mt-4 text-center">
                <Link href="/products" className="text-sm font-semibold text-slate-500 hover:text-primary-500 transition-colors">
                  or Continue Shopping
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

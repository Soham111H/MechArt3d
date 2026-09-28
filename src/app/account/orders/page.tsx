'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package, Truck, CheckCircle2, Clock, Printer, XCircle,
  ShieldCheck, Box, ChevronLeft, ChevronRight, RotateCcw,
  ExternalLink, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/useCartStore';

const TABS = [
  { key: 'ALL',       label: 'All Orders' },
  { key: 'PENDING',   label: 'Pending' },
  { key: 'ACTIVE',    label: 'Active' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: any }> = {
    PENDING:          { label: 'Pending',          className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',     icon: Clock },
    CONFIRMED:        { label: 'Confirmed',         className: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',        icon: CheckCircle2 },
    PRINTING:         { label: 'Printing',          className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400', icon: Printer },
    QUALITY_CHECK:    { label: 'Quality Check',     className: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400', icon: ShieldCheck },
    PACKED:           { label: 'Packed',            className: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',        icon: Box },
    SHIPPED:          { label: 'Shipped',           className: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400', icon: Truck },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery',  className: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400', icon: Truck },
    DELIVERED:        { label: 'Delivered',         className: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',    icon: CheckCircle2 },
    CANCELLED:        { label: 'Cancelled',         className: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',           icon: XCircle },
  };
  const s = map[status] || { label: status, className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: Package };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${s.className}`}>
      <Icon size={11} /> {s.label}
    </span>
  );
}

export default function UserOrdersPage() {
  const [orders, setOrders]           = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('ALL');
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const { addItem } = useCartStore();
  const router = useRouter();

  const fetchOrders = useCallback(async (tab: string, pg: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab !== 'ALL') params.set('status', tab);
      params.set('page', String(pg));
      const res  = await fetch(`/api/user/orders?${params}`);
      if (res.status === 401) { router.push('/auth/login'); return; }
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);
      setTotalOrders(data.pagination.total);
    } catch {
      toast.error('Could not load your orders');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchOrders(activeTab, page); }, [activeTab, page, fetchOrders]);

  const handleTabChange = (tab: string) => { setActiveTab(tab); setPage(1); };

  const handleReorder = (order: any) => {
    const items = order.orderItems || [];
    if (!items.length) return;
    items.forEach((item: any) => {
      if (item.product) {
        addItem({
          id: `${item.productId}-${item.variantId || 'default'}`,
          productId: item.productId,
          variantId: item.variantId,
          name: item.product.name,
          price: Number(item.unitPrice),
          quantity: item.quantity,
          image: item.product.images?.[0]?.url || '',
          slug: item.product.slug,
          stock: 999, // assume in stock for reorder; server will validate
        });
      }
    });
    toast.success('Items added to cart!');
    router.push('/cart');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Order History</h1>
        <p className="text-slate-500 text-sm mt-1">Track and manage your purchases.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No orders found</h3>
          <p className="text-slate-500 mb-6">
            {activeTab === 'ALL' ? "You haven't placed any orders yet." : `No ${activeTab.toLowerCase()} orders.`}
          </p>
          <Link href="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">

              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">Order</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white font-mono">
                      {order.orderNumber || `#${order.id.slice(-8).toUpperCase()}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">Date</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">Total</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">₹{Number(order.total || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">Payment</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.paymentMethod}</p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Item thumbnails + names */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-3 mb-4">
                  {order.orderItems?.slice(0, 5).map((item: any, idx: number) => {
                    const img     = item.product?.images?.[0]?.url;
                    const extra   = order.orderItems.length - 5;
                    return (
                      <div key={item.id} className="relative">
                        {img ? (
                          <img src={img} alt={item.product?.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Package size={20} className="text-slate-400" />
                          </div>
                        )}
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-800 dark:bg-slate-700 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                        {idx === 4 && extra > 0 && (
                          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xs font-bold">+{extra}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                  {order.orderItems?.map((item: any) => (
                    <p key={item.id}>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.product?.name}</span>
                      {item.variant && <span className="text-slate-500"> · {item.variant.color || item.variant.size}</span>}
                      <span className="text-slate-500"> × {item.quantity} — ₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Latest update */}
              {order.statusHistory?.[0] && (
                <div className="px-4 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20">
                  <p className="text-xs text-slate-500">
                    <span className="font-bold">Latest update:</span>{' '}
                    {order.statusHistory[0].comment || order.status}
                    <span className="ml-2 text-slate-400">
                      {new Date(order.statusHistory[0].createdAt).toLocaleString('en-IN')}
                    </span>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-x-6 gap-y-2">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center gap-1.5 text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <ExternalLink size={14} /> View Details
                </Link>

                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Truck size={14} /> Track Order
                  </a>
                )}

                <button
                  onClick={() => handleReorder(order)}
                  className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <RotateCcw size={14} /> Reorder
                </button>

                {order.status === 'DELIVERED' && (
                  <Link
                    href={`/product/${order.orderItems?.[0]?.product?.slug}#reviews`}
                    className="flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Star size={14} /> Write Review
                  </Link>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages} · {totalOrders} orders total
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

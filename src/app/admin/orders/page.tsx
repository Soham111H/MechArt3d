"use client";

import { useEffect, useState } from "react";
import { Package, Truck, Printer, Search, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = filter === "ALL" ? "/api/admin/orders" : `/api/admin/orders?status=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      toast.error("Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders(); // refresh data
    } catch (error) {
      toast.error("Could not update order");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Clock size={12} /> Pending</span>;
      case 'PRINTING': return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Printer size={12} /> Printing</span>;
      case 'SHIPPED': return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Truck size={12} /> Shipped</span>;
      case 'DELIVERED': return <span className="px-2.5 py-1 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 size={12} /> Delivered</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const filteredOrders = search ? orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    (o.user?.name || "").toLowerCase().includes(search.toLowerCase())
  ) : orders;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Package className="text-primary-500" />
            Orders Management
          </h1>
          <p className="text-slate-500 mt-1">Track, process, and ship customer orders.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-xl w-full lg:w-auto">
          {["ALL", "PENDING", "PRINTING", "SHIPPED", "DELIVERED"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Order ID or Name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Orders Found</h3>
            <p className="text-slate-500">No orders match the current filter or search criteria.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col lg:flex-row">
              
              {/* Order Info */}
              <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Order ID</span>
                    <h3 className="font-bold text-slate-900 dark:text-white font-mono">{order.id}</h3>
                    <p className="text-sm text-slate-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Customer</p>
                    <p className="text-slate-900 dark:text-white font-medium">{order.user?.name || 'Unknown'}</p>
                    <p className="text-slate-500">{order.user?.email}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Shipping Address</p>
                    <p className="text-slate-500 line-clamp-2">
                      {order.address?.line1}, {order.address?.city}, {order.address?.state} {order.address?.pincode}
                    </p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-4 overflow-x-auto no-scrollbar">
                  {order.orderItems?.map((item: any) => {
                    const img = item.product?.images?.[0]?.url;
                    return (
                      <div key={item.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2 pr-4 rounded-xl shrink-0 border border-slate-200 dark:border-slate-800">
                        {img ? (
                          <img src={img} alt="Product" className="w-10 h-10 rounded-lg object-cover bg-white" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center"><Package size={16} className="text-slate-400" /></div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white max-w-[120px] truncate">{item.product?.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Panel */}
              <div className="w-full lg:w-72 p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-1">
                    Total Amount ({order.paymentMethod || 'COD'})
                  </p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">₹{Number(order.total || 0).toLocaleString('en-IN')}</p>
                  {order.paymentStatus === 'PAID' ? (
                    <p className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded mt-2 inline-block uppercase">Paid Successfully</p>
                  ) : order.paymentMethod === 'RAZORPAY' ? (
                    <p className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded mt-2 inline-block uppercase">Payment Failed / Abandoned</p>
                  ) : (
                    <p className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded mt-2 inline-block uppercase">To be collected (COD)</p>
                  )}
                </div>
                
                <div className="space-y-2 mt-8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Update Status</p>
                  
                  {order.status === 'PENDING' && (order.paymentMethod === 'COD' || order.paymentStatus === 'PAID') && (
                    <button 
                      disabled={updating === order.id}
                      onClick={() => updateOrderStatus(order.id, 'PRINTING')}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {updating === order.id ? "Updating..." : <><Printer size={16} /> Send to Printer</>}
                    </button>
                  )}
                  
                  {order.status === 'PRINTING' && (order.paymentMethod === 'COD' || order.paymentStatus === 'PAID') && (
                    <button 
                      disabled={updating === order.id}
                      onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {updating === order.id ? "Updating..." : <><Truck size={16} /> Mark as Shipped</>}
                    </button>
                  )}

                  {order.status === 'SHIPPED' && (
                    <button 
                      disabled={updating === order.id}
                      onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {updating === order.id ? "Updating..." : <><CheckCircle2 size={16} /> Mark Delivered</>}
                    </button>
                  )}
                  
                  {(order.status !== 'DELIVERED' && order.status !== 'CANCELLED') && (
                    <button 
                      disabled={updating === order.id}
                      onClick={() => {
                        if(confirm("Cancel this order? This will not refund stock automatically.")) {
                          updateOrderStatus(order.id, 'CANCELLED');
                        }
                      }}
                      className="w-full py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:text-red-500 font-bold rounded-xl text-sm transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  // Form states
  const [code, setCode] = useState("");
  const [type, setType] = useState("PERCENTAGE");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCoupons(data);
    } catch (error) {
      toast.error("Could not load coupons");
    } finally {
      setLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingCoupon(null);
    setCode("");
    setType("PERCENTAGE");
    setValue("");
    setMinOrder("");
    setMaxUses("");
    setExpiresAt("");
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (coupon: any) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value.toString());
    setMinOrder(coupon.minOrder ? coupon.minOrder.toString() : "");
    setMaxUses(coupon.maxUses ? coupon.maxUses.toString() : "");
    setExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : "");
    setIsActive(coupon.isActive);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        minOrderValue: minOrder ? parseFloat(minOrder) : undefined,
        maxUses: maxUses ? parseInt(maxUses) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        isActive,
      };

      const url = editingCoupon 
        ? `/api/admin/coupons/${editingCoupon.id}` 
        : `/api/admin/coupons`;
        
      const method = editingCoupon ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save coupon");
      }

      toast.success(editingCoupon ? "Coupon updated" : "Coupon created");
      setShowModal(false);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Status updated");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete coupon");
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Tag className="text-primary-500" />
            Discounts
          </h1>
          <p className="text-slate-500 mt-1">Manage promotional coupons and discounts.</p>
        </div>
        <button onClick={openNewModal} className="btn-primary whitespace-nowrap">
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Value</th>
                <th className="px-6 py-4 font-semibold">Min Order</th>
                <th className="px-6 py-4 font-semibold">Uses</th>
                <th className="px-6 py-4 font-semibold">Expires</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-900 dark:text-white px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        coupon.type === 'PERCENTAGE' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                      }`}>
                        {coupon.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `₹${coupon.value.toLocaleString('en-IN')}`}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {coupon.minOrder ? `₹${coupon.minOrder.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {coupon.usedCount} / {coupon.maxUses || '∞'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                          coupon.isActive 
                            ? 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(coupon)}
                          className="p-2 text-slate-400 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-5">{editingCoupon ? "Edit Coupon" : "Add Coupon"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Code *</label>
                  <input 
                    type="text" 
                    required 
                    className="input-base w-full p-2 border rounded-xl uppercase font-mono" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Type *</label>
                  <select 
                    className="input-base w-full p-2 border rounded-xl"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Value *</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    step={type === "PERCENTAGE" ? "1" : "0.01"}
                    className="input-base w-full p-2 border rounded-xl" 
                    value={value} 
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Min Order Value (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    className="input-base w-full p-2 border rounded-xl" 
                    value={minOrder} 
                    onChange={(e) => setMinOrder(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Max Uses</label>
                  <input 
                    type="number" 
                    min="1"
                    className="input-base w-full p-2 border rounded-xl" 
                    value={maxUses} 
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Expires At</label>
                  <input 
                    type="date" 
                    className="input-base w-full p-2 border rounded-xl" 
                    value={expiresAt} 
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active (Customers can use it)</label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

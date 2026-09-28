"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error("Could not load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete");
      }
      toast.success("Product deleted");
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Package className="text-primary-500" />
            Products
          </h1>
          <p className="text-slate-500 mt-1">Manage your catalog, stock, and pricing.</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary whitespace-nowrap">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button className="btn-outline flex items-center gap-2 whitespace-nowrap w-full sm:w-auto">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const primaryImage = product.images?.find((img: any) => img.isPrimary)?.url || product.images?.[0]?.url;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-4">
                        {primaryImage ? (
                          <img src={primaryImage} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Package size={20} className="text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{product.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{product.isCustom ? "Custom Request" : product.material}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                        {product.category?.name}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        ₹{parseFloat(product.discountPrice || product.basePrice).toLocaleString('en-IN')}
                        {product.discountPrice && (
                          <span className="ml-2 text-xs line-through text-slate-400">₹{parseFloat(product.basePrice)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                          product.stock > 10 ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                          product.stock > 0 ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          product.status === 'PUBLISHED' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                          product.status === 'DRAFT' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                          'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${product.id}`} className="p-2 text-slate-400 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                            <Edit size={16} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

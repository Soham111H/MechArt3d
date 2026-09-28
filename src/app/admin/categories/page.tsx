"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderTree, Plus, Edit, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error("Could not load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete");
      }
      toast.success("Category deleted");
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <FolderTree className="text-primary-500" />
            Categories
          </h1>
          <p className="text-slate-500 mt-1">Manage your product hierarchy and collections.</p>
        </div>
        <Link href="/admin/categories/new" className="btn-primary whitespace-nowrap">
          <Plus size={18} /> Add Category
        </Link>
      </div>

      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Parent</th>
                <th className="px-6 py-4 font-semibold">Products</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <FolderTree size={16} className="text-slate-400" />
                        </div>
                      )}
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{cat.slug}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {cat.parent ? <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs">{cat.parent.name}</span> : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400 rounded-full text-xs font-bold">
                        {cat._count?.products || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/categories/${cat.id}`} className="p-2 text-slate-400 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(cat.id, cat.name)}
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
    </div>
  );
}

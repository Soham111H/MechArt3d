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

  const [hierarchyFilter, setHierarchyFilter] = useState<"ALL" | "PARENTS" | "CHILDREN">("ALL");

  const filteredCategories = categories.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.slug.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (hierarchyFilter === "PARENTS") return !c.parentId;
    if (hierarchyFilter === "CHILDREN") return Boolean(c.parentId);
    return true;
  });

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
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setHierarchyFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                hierarchyFilter === "ALL"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({categories.length})
            </button>
            <button
              onClick={() => setHierarchyFilter("PARENTS")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                hierarchyFilter === "PARENTS"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Main ({categories.filter(c => !c.parentId).length})
            </button>
            <button
              onClick={() => setHierarchyFilter("CHILDREN")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                hierarchyFilter === "CHILDREN"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Subcategories ({categories.filter(c => c.parentId).length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Hierarchy Level</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Parent Category</th>
                <th className="px-6 py-4 font-semibold">Products</th>
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
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
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
                      <div>
                        <span className="block font-bold">{cat.name}</span>
                        {cat.description && (
                          <span className="text-xs text-slate-400 truncate max-w-xs block font-normal">{cat.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {cat.parentId ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
                          Subcategory
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30">
                          Main Category
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{cat.slug}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {cat.parent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <FolderTree size={12} className="text-primary-500" />
                          {cat.parent.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">None (Root)</span>
                      )}
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

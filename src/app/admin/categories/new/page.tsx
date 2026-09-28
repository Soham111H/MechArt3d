"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    parentId: "",
  });

  useEffect(() => {
    // Fetch categories to populate parent dropdown
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => setParents(data))
      .catch(() => {});
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Auto-generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, name, slug });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    formDataObj.append('folder', 'categories');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });
      const data = await res.json();
      if (data.success) {
        setFormData({ ...formData, imageUrl: data.url });
        toast.success("Image uploaded!");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success("Category created successfully!");
      router.push("/admin/categories");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">New Category</h1>
          <p className="text-sm text-slate-500">Create a new product category</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category Name *</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={handleNameChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              placeholder="e.g. PLA Models"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">URL Slug *</label>
            <input 
              required
              type="text" 
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-mono text-sm" 
              placeholder="pla-models"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Parent Category (Optional)</label>
          <select 
            value={formData.parentId}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          >
            <option value="">None (Top Level)</option>
            {parents.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
          <textarea 
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none" 
            placeholder="Brief description of this category..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category Image</label>
          
          <div className="flex items-center gap-4">
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
            )}
            
            <label className={`flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <UploadCloud size={24} className="text-slate-400 mb-2" />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {uploading ? "Uploading..." : "Click to upload image"}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
            {loading ? "Saving..." : "Save Category"}
          </button>
        </div>

      </form>
    </div>
  );
}

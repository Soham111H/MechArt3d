"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FolderTree } from "lucide-react";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [parentId, setParentId] = useState("");

  useEffect(() => {
    fetchCategories();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCategories(data);

      const current = data.find((c: any) => c.id === id);
      if (current) {
        setName(current.name);
        setSlug(current.slug);
        setDescription(current.description || "");
        setImageUrl(current.imageUrl || "");
        setParentId(current.parentId || "");
      } else {
        toast.error("Category not found");
        router.push("/admin/categories");
      }
    } catch (error) {
      toast.error("Could not load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name,
        slug,
        description,
        imageUrl,
        parentId: parentId || null,
      };

      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update category");
      }

      toast.success("Category updated successfully!");
      router.push("/admin/categories");
    } catch (error: any) {
      toast.error(error.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          &larr; Back to Categories
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <FolderTree className="text-primary-500" />
            Edit Category
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Category Name *</label>
              <input 
                type="text" 
                required
                className="input-base w-full p-2 border rounded-xl"
                value={name}
                onChange={handleNameChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Slug *</label>
              <input 
                type="text" 
                required
                className="input-base w-full p-2 border rounded-xl font-mono text-sm"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea 
              className="input-base w-full p-3 border rounded-xl" 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Image URL</label>
            <input 
              type="url" 
              className="input-base w-full p-2 border rounded-xl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
            {imageUrl && (
              <div className="mt-3 w-32 h-32 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Parent Category</label>
            <select 
              className="input-base w-full p-2 border rounded-xl"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">None (Top-level category)</option>
              {categories.filter(c => c.id !== id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="submit" 
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

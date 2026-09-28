"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, UploadCloud, X, Box } from "lucide-react";
import toast from "react-hot-toast";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    basePrice: "",
    discountPrice: "",
    stock: "10",
    material: "PLA",
    status: "PUBLISHED",
    images: [] as string[],
    models: [] as string[],
    variants: [] as any[],
  });

  const [newVariant, setNewVariant] = useState({ color: "", stock: "0", priceModifier: "0" });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => {});
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, name, slug });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'models') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      const folderName = type === 'images' ? 'products' : 'models';
      formDataObj.append('folder', folderName);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formDataObj,
        });
        const data = await res.json();
        if (res.ok && data.success) {
          uploadedUrls.push(data.url);
        } else {
          toast.error(data.error || `Failed to upload ${file.name}`);
        }
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setFormData({
      ...formData,
      [type]: [...formData[type], ...uploadedUrls]
    });
    setUploading(false);
    if (uploadedUrls.length > 0) toast.success(`Uploaded ${uploadedUrls.length} files`);
  };

  const removeFile = (urlToRemove: string, type: 'images' | 'models') => {
    setFormData({
      ...formData,
      [type]: formData[type].filter(url => url !== urlToRemove)
    });
  };

  const handleAddVariant = () => {
    if (!newVariant.color) return;
    setFormData({
      ...formData,
      variants: [...formData.variants, { ...newVariant, id: `new_${Date.now()}` }]
    });
    setNewVariant({ color: "", stock: "0", priceModifier: "0" });
  };

  const handleRemoveVariant = (id: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter(v => v.id !== id)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) return toast.error("Please select a category");

    setLoading(true);

    const payload = {
      ...formData,
      basePrice: parseFloat(formData.basePrice) || 0,
      discountPrice: formData.discountPrice && parseFloat(formData.discountPrice) > 0 ? parseFloat(formData.discountPrice) : null,
      stock: parseInt(formData.stock) || 0,
      variants: formData.variants.map(v => ({ color: v.color, stock: parseInt(v.stock), priceModifier: parseFloat(v.priceModifier) })),
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      toast.success("Product created successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">New Product</h1>
            <p className="text-sm text-slate-500">Add a new item to your catalog</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push('/admin/products')} className="btn-outline bg-white dark:bg-slate-900">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">General Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Product Name *</label>
                <input required type="text" value={formData.name} onChange={handleNameChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="e.g. Articulated Dragon" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">URL Slug *</label>
                <input required type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-mono text-sm" placeholder="articulated-dragon" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description *</label>
              <textarea required rows={6} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none" placeholder="Write a detailed product description..." />
            </div>
          </div>

          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Media (Images & 3D Models)</h2>
            
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Product Images</label>
              <div className="flex flex-wrap gap-4">
                {formData.images.map(url => (
                  <div key={url} className="relative group w-24 h-24 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100">
                    <img src={url} alt="Product" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeFile(url, 'images')} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white transition-all">
                      <X size={20} />
                    </button>
                  </div>
                ))}
                <label className={`w-24 h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col items-center justify-center cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <UploadCloud size={20} className="text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Upload</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileUpload(e, 'images')} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">3D Models (.glb, .obj)</label>
              <div className="flex flex-wrap gap-4">
                {formData.models.map(url => (
                  <div key={url} className="relative group w-24 h-24 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-blue-50 flex items-center justify-center">
                    <Box size={24} className="text-blue-500" />
                    <button type="button" onClick={() => removeFile(url, 'models')} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white transition-all">
                      <X size={20} />
                    </button>
                  </div>
                ))}
                <label className={`w-24 h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col items-center justify-center cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <UploadCloud size={20} className="text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Upload</span>
                  <input type="file" accept=".glb,.obj" multiple className="hidden" onChange={(e) => handleFileUpload(e, 'models')} disabled={uploading} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Pricing, Stock, Settings) */}
        <div className="space-y-6">
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Pricing & Inventory</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Base Price (₹) *</label>
              <input required type="number" min="0" step="0.01" value={formData.basePrice} onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Discount Price (₹)</label>
              <input type="number" min="0" step="0.01" value={formData.discountPrice} onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Leave empty if no discount" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Stock</label>
                <input required type="number" min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Material</label>
                <select value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="PLA">PLA</option>
                  <option value="Resin">Resin</option>
                  <option value="PETG">PETG</option>
                  <option value="ABS">ABS</option>
                  <option value="Carbon Fiber">Carbon Fiber</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Variants (Colors)</h2>
            
            <div className="space-y-3 mb-4">
              {formData.variants.map((v) => (
                <div key={v.id} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex-1 font-semibold">{v.color}</div>
                  <div className="text-sm text-slate-500">Stock: {v.stock}</div>
                  <div className="text-sm text-slate-500">Modifier: +₹{v.priceModifier}</div>
                  <button type="button" onClick={() => handleRemoveVariant(v.id)} className="text-red-500 hover:text-red-700 p-1">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {formData.variants.length === 0 && <p className="text-sm text-slate-500">No variants added yet.</p>}
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1 flex gap-2">
                <div className="w-10">
                  <label className="block text-xs font-semibold mb-1">Pick</label>
                  <input 
                    type="color" 
                    className="w-10 h-[42px] p-1 border rounded-xl cursor-pointer bg-white dark:bg-slate-900"
                    value={newVariant.color.startsWith('#') ? newVariant.color : "#000000"}
                    onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold mb-1">Color Code</label>
                  <input 
                    type="text" 
                    className="input-base w-full p-2 border rounded-xl"
                    placeholder="#ff0000 or Red"
                    value={newVariant.color}
                    onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                  />
                </div>
              </div>
              <div className="w-24">
                <label className="block text-xs font-semibold mb-1">Stock</label>
                <input 
                  type="number" 
                  className="input-base w-full p-2 border rounded-xl"
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-semibold mb-1">Price Mod (₹)</label>
                <input 
                  type="number" 
                  className="input-base w-full p-2 border rounded-xl"
                  value={newVariant.priceModifier}
                  onChange={(e) => setNewVariant({ ...newVariant, priceModifier: e.target.value })}
                />
              </div>
              <button 
                type="button"
                onClick={handleAddVariant}
                className="btn-secondary h-[42px]"
              >
                Add
              </button>
            </div>
          </div>

          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Organization</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category *</label>
              <select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold">
                <option value="PUBLISHED" className="text-blue-600">🟢 Published</option>
                <option value="DRAFT" className="text-slate-600">⚪ Draft</option>
                <option value="ARCHIVED" className="text-red-600">🔴 Archived</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

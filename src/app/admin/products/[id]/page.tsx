"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Package, Trash2, Plus, UploadCloud } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [categories, setCategories] = useState<any[]>([]);
  
  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [material, setMaterial] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [status, setStatus] = useState("PUBLISHED");
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [variants, setVariants] = useState<any[]>([]);
  const [newVariant, setNewVariant] = useState({ color: "", stock: "0", priceModifier: "0" });

  const [tiers, setTiers] = useState<any[]>([]);
  const [newTier, setNewTier] = useState({ minQty: "", maxQty: "", discountPct: "" });
  const [savingTiers, setSavingTiers] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchProduct()
    ]).finally(() => setLoading(false));
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data);
    } catch {
      // Handle error quietly
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      const product = await res.json();
      
      setName(product.name);
      setSlug(product.slug);
      setDescription(product.description || "");
      setCategoryId(product.categoryId);
      setBasePrice(product.basePrice.toString());
      setDiscountPrice(product.discountPrice ? product.discountPrice.toString() : "");
      setStock(product.stock.toString());
      setMaterial(product.material || "");
      setIsCustom(product.isCustom);
      setStatus(product.status);
      
      if (product.images && product.images.length > 0) {
        setImages(product.images.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((img: any) => img.url));
      }
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
      }
    } catch (error) {
      toast.error("Could not load product");
      router.push("/admin/products");
    }

    try {
      const tierRes = await fetch(`/api/admin/products/${id}/tiers`);
      if (tierRes.ok) {
        const tierData = await tierRes.json();
        setTiers(tierData);
      }
    } catch {}
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    // Auto-generate slug if not manually edited before
    setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleAddImage = () => {
    if (!newImageUrl) return;
    setImages([...images, newImageUrl]);
    setNewImageUrl("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      formDataObj.append('folder', 'products');

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

    setImages([...images, ...uploadedUrls]);
    setUploading(false);
    if (uploadedUrls.length > 0) toast.success(`Uploaded ${uploadedUrls.length} image(s)`);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    if (!newVariant.color) return;
    setVariants([...variants, { ...newVariant, id: `new_${Date.now()}` }]);
    setNewVariant({ color: "", stock: "0", priceModifier: "0" });
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleAddTier = () => {
    if (!newTier.minQty || !newTier.discountPct) return;
    setTiers([...tiers, { 
      id: `new_${Date.now()}`, 
      minQty: parseInt(newTier.minQty), 
      maxQty: newTier.maxQty ? parseInt(newTier.maxQty) : null, 
      discountPct: parseFloat(newTier.discountPct) 
    }].sort((a, b) => a.minQty - b.minQty));
    setNewTier({ minQty: "", maxQty: "", discountPct: "" });
  };

  const handleRemoveTier = (id: string) => {
    setTiers(tiers.filter(t => t.id !== id));
  };

  const handleSaveTiers = async () => {
    setSavingTiers(true);
    try {
      const res = await fetch(`/api/admin/products/${id}/tiers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tiers.map(t => ({ minQty: t.minQty, maxQty: t.maxQty, discountPct: t.discountPct }))),
      });
      if (!res.ok) throw new Error('Failed to save tiers');
      toast.success('Tiered pricing saved!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingTiers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name,
        slug,
        description,
        categoryId,
        basePrice: parseFloat(basePrice),
        discountPrice: discountPrice && parseFloat(discountPrice) > 0 ? parseFloat(discountPrice) : null,
        stock: parseInt(stock),
        material,
        isCustom,
        status,
        images,
        variants: variants.map(v => ({ color: v.color, stock: parseInt(v.stock), priceModifier: parseFloat(v.priceModifier) })),
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update product");
      }

      toast.success("Product updated successfully!");
      router.push("/admin/products");
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
    <div className="space-y-6 animate-fade-in-up max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          &larr; Back to Products
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Package className="text-primary-500" />
            Edit Product
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-2">Basic Info</h3>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Product Name *</label>
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

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea 
                className="input-base w-full p-3 border rounded-xl" 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-2">Pricing & Inventory</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Base Price (₹) *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  className="input-base w-full p-2 border rounded-xl"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Discount Price (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  className="input-base w-full p-2 border rounded-xl"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Stock Level *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  className="input-base w-full p-2 border rounded-xl"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Material</label>
                <input 
                  type="text" 
                  className="input-base w-full p-2 border rounded-xl"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g. PLA, Resin"
                />
              </div>
            </div>
          </div>

          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-2">Images</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 group overflow-hidden">
                  <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded">PRIMARY</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <input 
                  type="url" 
                  className="input-base flex-1 p-2 border rounded-xl"
                  placeholder="https://... image URL"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={handleAddImage}
                  className="btn-secondary"
                >
                  Add URL
                </button>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-slate-500 mx-2">OR</span>
                <label className={`btn-primary flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <UploadCloud size={16} />
                  {uploading ? 'Uploading...' : 'Upload File'}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
            </div>
          </div>

          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-2">Variants (Colors)</h3>
            
            <div className="space-y-3 mb-4">
              {variants.map((v) => (
                <div key={v.id} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex-1 font-semibold">{v.color}</div>
                  <div className="text-sm text-slate-500">Stock: {v.stock}</div>
                  <div className="text-sm text-slate-500">Modifier: +₹{v.priceModifier}</div>
                  <button type="button" onClick={() => handleRemoveVariant(v.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {variants.length === 0 && <p className="text-sm text-slate-500">No variants added yet.</p>}
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

          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold">Tiered Pricing (Bulk Discounts)</h3>
              <button type="button" onClick={handleSaveTiers} disabled={savingTiers} className="btn-primary py-1 px-3 text-xs">
                {savingTiers ? 'Saving...' : 'Save Tiers'}
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              {tiers.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex-1 font-semibold">{t.minQty} to {t.maxQty || '∞'} units</div>
                  <div className="text-sm font-black text-green-600">-{t.discountPct}% OFF</div>
                  <button type="button" onClick={() => handleRemoveTier(t.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {tiers.length === 0 && <p className="text-sm text-slate-500">No tiered pricing rules added.</p>}
            </div>

            <div className="flex gap-2 items-end">
              <div className="w-1/3">
                <label className="block text-xs font-semibold mb-1">Min Qty</label>
                <input 
                  type="number" 
                  className="input-base w-full p-2 border rounded-xl"
                  value={newTier.minQty}
                  onChange={(e) => setNewTier({ ...newTier, minQty: e.target.value })}
                />
              </div>
              <div className="w-1/3">
                <label className="block text-xs font-semibold mb-1">Max Qty (leave blank for ∞)</label>
                <input 
                  type="number" 
                  className="input-base w-full p-2 border rounded-xl"
                  value={newTier.maxQty}
                  onChange={(e) => setNewTier({ ...newTier, maxQty: e.target.value })}
                />
              </div>
              <div className="w-1/3">
                <label className="block text-xs font-semibold mb-1">Discount (%)</label>
                <input 
                  type="number" 
                  className="input-base w-full p-2 border rounded-xl"
                  value={newTier.discountPct}
                  onChange={(e) => setNewTier({ ...newTier, discountPct: e.target.value })}
                />
              </div>
              <button 
                type="button"
                onClick={handleAddTier}
                className="btn-secondary h-[42px]"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-6">
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-800 pb-2">Organization</h3>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Category *</label>
              <select 
                required
                className="input-base w-full p-2 border rounded-xl"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Status</label>
              <select 
                className="input-base w-full p-2 border rounded-xl"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="isCustom" 
                checked={isCustom} 
                onChange={(e) => setIsCustom(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded border-slate-300"
              />
              <label htmlFor="isCustom" className="text-sm font-medium">Accept Customizations</label>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="btn-primary w-full justify-center mt-4"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

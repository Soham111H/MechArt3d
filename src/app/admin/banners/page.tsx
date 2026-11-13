"use client";

import { useState, useEffect } from "react";
import {
  Megaphone, Bell, Globe, Save, UploadCloud,
  CheckCircle, ExternalLink, Sparkles, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { useSettingsStore, StoreSettings } from "@/store/useSettingsStore";

export default function AdminBannersPage() {
  const { settings, setSettings } = useSettingsStore();
  const [local, setLocal] = useState<StoreSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState<"popup" | "announcement" | "hero">("popup");

  useEffect(() => {
    // Fetch fresh database settings
    fetch("/api/settings", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    })
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setLocal(prev => ({ ...prev, ...data }));
          setSettings(data);
        }
      })
      .catch(err => console.error("Could not fetch fresh banner settings:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const val = type === "checkbox" ? target.checked : type === "number" ? parseFloat(value) || 0 : value;
    setLocal(prev => ({ ...prev, [name]: val }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "banners");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setLocal(prev => ({ ...prev, popupImage: data.url }));
        toast.success("Banner image uploaded successfully!");
      } else {
        toast.error(data.error || "Image upload failed");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const loadingToast = toast.loading("Saving banner settings...");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Popup banner
          popupEnabled: local.popupEnabled,
          popupTitle: local.popupTitle,
          popupText: local.popupText,
          popupImage: local.popupImage,
          popupLink: local.popupLink,
          popupLinkText: local.popupLinkText,
          popupDelaySeconds: local.popupDelaySeconds,

          // Announcement bar
          announcementBarEnabled: local.announcementBarEnabled,
          announcementBar: local.announcementBar,
          announcementBarColor: local.announcementBarColor,

          // Hero section
          heroHeadline: local.heroHeadline,
          heroSubheadline: local.heroSubheadline,
        }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok) {
        setSettings(local);
        toast.success("✅ Banner settings saved & active!");
      } else {
        toast.error(data.error || "Failed to save banner settings");
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Failed to save banner settings");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all";
  const textareaCls = `${inputCls} resize-none`;

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Megaphone className="text-primary-500" />
            Banner & Promotion Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Configure homepage promotional popups, site-wide announcement bars, and hero promotional copy.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-md shadow-primary-500/20 whitespace-nowrap"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save All Banners"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSection("popup")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeSection === "popup"
              ? "bg-primary-600 text-white shadow-sm shadow-primary-500/30"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary-400"
          }`}
        >
          <Bell size={16} />
          Homepage Popup Banner
          {local.popupEnabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
          )}
        </button>

        <button
          onClick={() => setActiveSection("announcement")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeSection === "announcement"
              ? "bg-primary-600 text-white shadow-sm shadow-primary-500/30"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary-400"
          }`}
        >
          <Megaphone size={16} />
          Top Announcement Bar
          {local.announcementBarEnabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
          )}
        </button>

        <button
          onClick={() => setActiveSection("hero")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeSection === "hero"
              ? "bg-primary-600 text-white shadow-sm shadow-primary-500/30"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary-400"
          }`}
        >
          <Globe size={16} />
          Hero Promotional Copy
        </button>
      </div>

      {/* ── 1. POPUP BANNER ── */}
      {activeSection === "popup" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell size={18} className="text-purple-500" /> Popup Banner Settings
                </h2>
                <p className="text-xs text-slate-500">Shows once per session to visitors on homepage.</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="popupEnabled"
                  checked={Boolean(local.popupEnabled)}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Popup Title
                </label>
                <input
                  type="text"
                  name="popupTitle"
                  value={local.popupTitle || ""}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="e.g. Special Holiday Sale!"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Delay Before Showing (Seconds)
                </label>
                <input
                  type="number"
                  name="popupDelaySeconds"
                  value={local.popupDelaySeconds ?? 3}
                  onChange={handleChange}
                  min={0}
                  max={60}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Popup Message / Description
                </label>
                <textarea
                  name="popupText"
                  value={local.popupText || ""}
                  onChange={handleChange}
                  rows={3}
                  className={textareaCls}
                  placeholder="e.g. Get 15% off your first custom 3D print order with coupon code MECH15."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Popup Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="popupImage"
                    value={local.popupImage || ""}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="https://... or upload image"
                  />
                  <label className="btn-outline px-4 shrink-0 flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                    <UploadCloud size={16} />
                    {uploading ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    name="popupLinkText"
                    value={local.popupLinkText || "Claim Offer"}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. Claim Offer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Button Destination Link
                  </label>
                  <input
                    type="text"
                    name="popupLink"
                    value={local.popupLink || "/products"}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. /products or /custom-design"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="card bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 self-start flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-500" /> Live Modal Preview
            </p>

            <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
              {local.popupImage ? (
                <div className="h-44 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  <img
                    src={local.popupImage}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-purple-600 to-primary-600 flex items-center justify-center text-white">
                  <Bell size={36} className="opacity-80 animate-bounce" />
                </div>
              )}

              <div className="p-5 text-center">
                <h3 className="font-black text-lg text-slate-900 dark:text-white mb-2">
                  {local.popupTitle || "Special Offer Title"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                  {local.popupText || "Your promotional message appears right here for all new visitors."}
                </p>

                <div className="w-full py-2.5 bg-primary-600 text-white font-bold text-sm rounded-xl shadow-md shadow-primary-500/20">
                  {local.popupLinkText || "Claim Offer"}
                </div>

                <p className="text-[10px] text-slate-400 mt-3">
                  Popup delay: {local.popupDelaySeconds ?? 3}s · Status: {local.popupEnabled ? "Active" : "Disabled"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. ANNOUNCEMENT BAR ── */}
      {activeSection === "announcement" && (
        <div className="space-y-6">
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone size={18} className="text-amber-500" /> Top Announcement Bar Banner
                </h2>
                <p className="text-xs text-slate-500">
                  A high-visibility banner fixed at the very top of all store pages.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="announcementBarEnabled"
                  checked={Boolean(local.announcementBarEnabled)}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Announcement Message
                </label>
                <input
                  type="text"
                  name="announcementBar"
                  value={local.announcementBar || ""}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="🚀 Free delivery across India on orders above ₹999!"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Banner Color Theme
                </label>
                <select
                  name="announcementBarColor"
                  value={local.announcementBarColor || "bg-primary-600"}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="bg-primary-600">Brand Blue (Primary)</option>
                  <option value="bg-emerald-600">Emerald Green</option>
                  <option value="bg-red-600">Crimson Red</option>
                  <option value="bg-amber-500">Amber / Gold</option>
                  <option value="bg-purple-600">Purple</option>
                  <option value="bg-slate-900">Dark Slate</option>
                </select>
              </div>
            </div>

            {/* Live Preview */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Live Announcement Bar Preview
              </p>
              <div
                className={`${local.announcementBarColor || "bg-primary-600"} text-white text-center py-2.5 px-4 text-sm font-semibold rounded-xl shadow-inner transition-colors`}
              >
                {local.announcementBar || "Your announcement message will show here"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. HERO PROMOTIONAL COPY ── */}
      {activeSection === "hero" && (
        <div className="space-y-6">
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Globe size={18} className="text-purple-500" /> Hero Section Promotional Copy
            </h2>

            <div className="grid gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  name="heroHeadline"
                  value={local.heroHeadline || ""}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="e.g. Print the Future."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Supporting Subheadline
                </label>
                <textarea
                  name="heroSubheadline"
                  value={local.heroSubheadline || ""}
                  onChange={handleChange}
                  rows={3}
                  className={textareaCls}
                  placeholder="e.g. Custom 3D prints, premium figurines, and engineering solutions — all in one place."
                />
              </div>
            </div>

            {/* Preview */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Hero Section Preview</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {local.heroHeadline || "Print the Future."}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                {local.heroSubheadline || "Custom 3D prints, premium figurines, and engineering solutions."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

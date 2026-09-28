"use client";

import { useEffect, useState } from "react";
import {
  Settings, Store, IndianRupee, MessageCircle, Shield,
  Globe, Share2, FileText, Megaphone, Search, RotateCcw,
  Save, Eye, EyeOff, Bell
} from "lucide-react";
import toast from "react-hot-toast";
import { useSettingsStore, StoreSettings, defaultSettings } from "@/store/useSettingsStore";

import { LucideIcon } from "lucide-react";

type Tab = "store" | "pricing" | "homepage" | "popup" | "footer" | "seo" | "integrations" | "policies" | "system";

const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "store",        label: "Store Info",    icon: Store },
  { id: "pricing",      label: "Pricing",       icon: IndianRupee },
  { id: "homepage",     label: "Homepage",      icon: Globe },
  { id: "popup",        label: "Popup Banner",  icon: Bell },
  { id: "footer",       label: "Footer & Social", icon: Share2 },
  { id: "seo",          label: "SEO",           icon: Search },
  { id: "integrations", label: "Integrations",  icon: MessageCircle },
  { id: "policies",     label: "Policies",      icon: FileText },
  { id: "system",       label: "System",        icon: Shield },
];

function Toggle({ name, checked, onChange, label, desc }: {
  name: string; checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string; desc: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50">
      <div>
        <p className="font-bold text-slate-900 dark:text-white">{label}</p>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
      </label>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { settings, setSettings, resetSettings } = useSettingsStore();
  const [local, setLocal] = useState<StoreSettings>(settings);
  const [activeTab, setActiveTab] = useState<Tab>("store");
  const [isMounted, setIsMounted] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setLocal(settings);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const val = type === "checkbox" ? target.checked : type === "number" ? parseFloat(value) || 0 : value;
    setLocal(prev => ({ ...prev, [name]: val }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const loadingToast = toast.loading("Saving to database...");
      
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(local)
      });
      
      if (!res.ok) throw new Error("Failed to save settings");
      
      setSettings(local);
      setHasChanges(false);
      
      toast.dismiss(loadingToast);
      toast.success("Settings saved! Changes are now live for all users.");
    } catch (error) {
      toast.error("An error occurred while saving settings.");
    }
  };

  const handleReset = () => {
    if (!confirm("Reset ALL settings to defaults? This cannot be undone.")) return;
    resetSettings();
    setLocal(defaultSettings);
    setHasChanges(false);
    toast.success("Settings reset to defaults.");
  };

  if (!isMounted) return null;

  const inputCls = "w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow";
  const textareaCls = `${inputCls} resize-y min-h-[120px]`;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Settings className="text-primary-500" />
            Settings
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Changes are reflected live on your store for all users.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${hasChanges ? "bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20" : "bg-slate-400 cursor-not-allowed"}`}
            disabled={!hasChanges}
          >
            <Save size={15} /> Save Changes
          </button>
        </div>
      </div>

      {/* Unsaved changes banner */}
      {hasChanges && (
        <div className="mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-semibold">
          <Megaphone size={16} /> You have unsaved changes — click Save to apply them to your store.
        </div>
      )}

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Sidebar Tabs */}
        <div className="lg:w-52 shrink-0">
          <nav className="space-y-1 sticky top-6">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                    activeTab === t.id
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* ── STORE INFO ── */}
          {activeTab === "store" && (
            <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Store size={18} className="text-blue-500" /> Store Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Store Name" hint="Appears in Navbar, Footer, Login page, emails">
                  <input type="text" name="storeName" value={local.storeName} onChange={handleChange} className={inputCls} />
                </Field>
                <Field label="Tagline" hint="Shown in page titles and meta description">
                  <input type="text" name="storeTagline" value={local.storeTagline} onChange={handleChange} className={inputCls} />
                </Field>
                <Field label="Support Email" hint="Shown in footer and contact pages">
                  <input type="email" name="storeEmail" value={local.storeEmail} onChange={handleChange} className={inputCls} />
                </Field>
                <Field label="Support Phone" hint="Shown in footer and contact pages">
                  <input type="text" name="storePhone" value={local.storePhone} onChange={handleChange} className={inputCls} />
                </Field>
                <Field label="Store Address" hint="Shown in footer contact section" >
                  <input type="text" name="storeAddress" value={local.storeAddress} onChange={handleChange} className={inputCls} placeholder="e.g. Mumbai, Maharashtra, India" />
                </Field>
              </div>
            </div>
          )}

          {/* ── PRICING ── */}
          {activeTab === "pricing" && (
            <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <IndianRupee size={18} className="text-green-500" /> Pricing & Delivery
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <Field label="COD Fee (₹)" hint="Added to order total for Cash on Delivery">
                  <input type="number" name="codFee" value={local.codFee} onChange={handleChange} min={0} className={inputCls} />
                </Field>
                <Field label="GST Rate (%)" hint="Applied to order subtotal">
                  <input type="number" name="gstRate" value={local.gstRate} onChange={handleChange} min={0} max={100} className={inputCls} />
                </Field>
                <Field label="Free Shipping Above (₹)" hint="COD fee waived above this amount">
                  <input type="number" name="freeShippingAbove" value={local.freeShippingAbove} onChange={handleChange} min={0} className={inputCls} />
                </Field>
                <Field label="Min Order Amount (₹)" hint="0 = no minimum">
                  <input type="number" name="minOrderAmount" value={local.minOrderAmount} onChange={handleChange} min={0} className={inputCls} />
                </Field>
                <Field label="Currency" hint="Display currency code">
                  <select name="currency" value={local.currency} onChange={handleChange} className={inputCls}>
                    <option value="INR">INR — Indian Rupee (₹)</option>
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                  </select>
                </Field>
              </div>

              {/* Preview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Checkout Preview</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>₹1,000</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">GST ({local.gstRate}%)</span><span>₹{(1000 * local.gstRate / 100).toFixed(0)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">COD Fee</span><span>{1000 >= local.freeShippingAbove ? "Free" : `₹${local.codFee}`}</span></div>
                  <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                    <span>Total</span>
                    <span>₹{(1000 + (1000 * local.gstRate / 100) + (1000 >= local.freeShippingAbove ? 0 : local.codFee)).toFixed(0)}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">* Based on sample order of ₹1,000</p>
              </div>
            </div>
          )}

          {/* ── HOMEPAGE ── */}
          {activeTab === "homepage" && (
            <div className="space-y-6">
              <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Globe size={18} className="text-purple-500" /> Hero Section
                </h2>
                <div className="grid gap-5">
                  <Field label="Hero Headline" hint="Large text on homepage hero section">
                    <input type="text" name="heroHeadline" value={local.heroHeadline} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="Hero Subheadline" hint="Supporting text below the headline">
                    <textarea name="heroSubheadline" value={local.heroSubheadline} onChange={handleChange} rows={3} className={textareaCls} />
                  </Field>
                </div>
              </div>

              <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Megaphone size={18} className="text-amber-500" /> Announcement Bar
                </h2>
                <Toggle
                  name="announcementBarEnabled"
                  checked={local.announcementBarEnabled}
                  onChange={handleChange}
                  label="Enable Announcement Bar"
                  desc="Show a top banner across all pages for promotions or alerts"
                />
                {local.announcementBarEnabled && (
                  <div className="space-y-4">
                    <Field label="Announcement Text" hint="Shown in the bar at the top of every page">
                      <input type="text" name="announcementBar" value={local.announcementBar} onChange={handleChange} className={inputCls} />
                    </Field>
                    <Field label="Bar Color">
                      <select name="announcementBarColor" value={local.announcementBarColor} onChange={handleChange} className={inputCls}>
                        <option value="bg-primary-600">Brand Blue (Primary)</option>
                        <option value="bg-green-600">Green</option>
                        <option value="bg-red-600">Red</option>
                        <option value="bg-amber-500">Amber / Orange</option>
                        <option value="bg-slate-900">Dark</option>
                      </select>
                    </Field>
                    {/* Preview */}
                    <div className={`${local.announcementBarColor} text-white text-center py-2 px-4 text-sm font-semibold rounded-xl`}>
                      {local.announcementBar || "Your announcement text here"}
                    </div>
                  </div>
                )}
                <Toggle name="announcementBarEnabled" checked={local.announcementBarEnabled} onChange={handleChange} label="Enable Announcement Bar" desc="Show a thin banner at the very top of the site" />
              </div>
            </div>
          )}

          {/* ── POPUP BANNER ── */}
          {activeTab === "popup" && (
            <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Bell size={18} className="text-purple-500" /> Homepage Popup Banner
              </h2>
              <Toggle name="popupEnabled" checked={local.popupEnabled} onChange={handleChange} label="Enable Popup Banner" desc="Show a promotional popup on the homepage once per session" />
              
              <div className="grid sm:grid-cols-2 gap-5 mt-4">
                <Field label="Popup Title" hint="Main heading of the popup">
                  <input type="text" name="popupTitle" value={local.popupTitle} onChange={handleChange} className={inputCls} />
                </Field>
                <Field label="Popup Delay (Seconds)" hint="How long to wait before showing">
                  <input type="number" name="popupDelaySeconds" value={local.popupDelaySeconds} onChange={handleChange} className={inputCls} min="0" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Popup Text" hint="The main content description">
                    <textarea name="popupText" value={local.popupText} onChange={handleChange} className={textareaCls} />
                  </Field>
                </div>
                <Field label="Image URL (Optional)" hint="Full URL to an image for the popup">
                  <input type="text" name="popupImage" value={local.popupImage} onChange={handleChange} className={inputCls} placeholder="https://..." />
                </Field>
                <Field label="Button Link" hint="Where the user goes when clicking the button">
                  <input type="text" name="popupLink" value={local.popupLink} onChange={handleChange} className={inputCls} />
                </Field>
                <Field label="Button Text" hint="Label for the action button">
                  <input type="text" name="popupLinkText" value={local.popupLinkText} onChange={handleChange} className={inputCls} />
                </Field>
              </div>
            </div>
          )}

          {/* ── FOOTER & SOCIAL ── */}
          {activeTab === "footer" && (
            <div className="space-y-6">
              <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <FileText size={18} className="text-slate-500" /> Footer Brand Text
                </h2>
                <Field label="Footer About Text" hint="Short brand description shown in the footer brand column">
                  <textarea name="footerAboutText" value={local.footerAboutText} onChange={handleChange} rows={4} className={textareaCls} />
                </Field>
              </div>

              <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Share2 size={18} className="text-blue-500" /> Social Media Links
                </h2>
                <p className="text-xs text-slate-500">Leave blank to hide that social icon from footer.</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Instagram URL">
                    <input type="url" name="socialInstagram" value={local.socialInstagram} onChange={handleChange} className={inputCls} placeholder="https://instagram.com/yourstore" />
                  </Field>
                  <Field label="Twitter / X URL">
                    <input type="url" name="socialTwitter" value={local.socialTwitter} onChange={handleChange} className={inputCls} placeholder="https://x.com/yourstore" />
                  </Field>
                  <Field label="Facebook URL">
                    <input type="url" name="socialFacebook" value={local.socialFacebook} onChange={handleChange} className={inputCls} placeholder="https://facebook.com/yourstore" />
                  </Field>
                  <Field label="YouTube URL">
                    <input type="url" name="socialYouTube" value={local.socialYouTube} onChange={handleChange} className={inputCls} placeholder="https://youtube.com/@yourstore" />
                  </Field>
                  <Field label="LinkedIn URL">
                    <input type="url" name="socialLinkedIn" value={local.socialLinkedIn} onChange={handleChange} className={inputCls} placeholder="https://linkedin.com/company/yourstore" />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── SEO ── */}
          {activeTab === "seo" && (
            <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Search size={18} className="text-emerald-500" /> SEO Defaults
              </h2>
              <div className="grid gap-5">
                <Field label="Default Meta Title" hint="Used when pages don't have their own title. Keep under 60 characters.">
                  <input type="text" name="seoTitle" value={local.seoTitle} onChange={handleChange} className={inputCls} />
                  <p className="text-xs text-slate-400 mt-1">{local.seoTitle.length}/60 characters</p>
                </Field>
                <Field label="Default Meta Description" hint="Shown in Google search results. Keep under 160 characters.">
                  <textarea name="seoDescription" value={local.seoDescription} onChange={handleChange} rows={3} className={textareaCls} />
                  <p className="text-xs text-slate-400 mt-1">{local.seoDescription.length}/160 characters</p>
                </Field>
              </div>

              {/* SERP Preview */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Google Search Preview</p>
                <div className="space-y-1">
                  <p className="text-[#1a0dab] text-lg font-medium leading-tight truncate">{local.seoTitle || "Page Title"}</p>
                  <p className="text-[#006621] text-xs">mechart3d.com</p>
                  <p className="text-[#545454] text-sm leading-relaxed line-clamp-2">{local.seoDescription || "Page description..."}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── INTEGRATIONS ── */}
          {activeTab === "integrations" && (
            <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <MessageCircle size={18} className="text-green-500" /> Integrations
              </h2>
              <Field
                label="WhatsApp Business Number"
                hint="Full number with country code, e.g. +919876543210. Used for the floating chat button on the user side."
              >
                <input type="text" name="whatsappNumber" value={local.whatsappNumber} onChange={handleChange} className={`${inputCls} max-w-sm`} />
              </Field>
              {local.whatsappNumber && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl text-sm text-green-700 dark:text-green-400">
                  ✓ WhatsApp chat widget will use: <strong>{local.whatsappNumber}</strong>
                </div>
              )}

              {/* Test Email */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 mt-8 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Test Email (SMTP)</h3>
                <p className="text-sm text-slate-500 mb-4">Send a test email to verify your SMTP configuration works correctly.</p>
                <div className="flex gap-3 max-w-md">
                  <input
                    type="email"
                    id="testEmailInput"
                    placeholder="recipient@example.com"
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const input = document.getElementById('testEmailInput') as HTMLInputElement;
                      if (!input?.value) return toast.error('Enter a recipient email');
                      const res = await fetch('/api/admin/test-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ to: input.value }),
                      });
                      const data = await res.json();
                      if (res.ok) toast.success(data.message || 'Test email sent!');
                      else toast.error(data.error || 'Failed to send');
                    }}
                    className="btn-primary text-sm px-5 whitespace-nowrap"
                  >
                    Send Test
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ── POLICIES ── */}
          {activeTab === "policies" && (
            <div className="space-y-6">
              {[
                { name: "returnPolicy",    label: "Return Policy",   icon: "↩️" },
                { name: "shippingPolicy",  label: "Shipping Policy", icon: "🚚" },
                { name: "privacyPolicy",   label: "Privacy Policy",  icon: "🔒" },
                { name: "termsOfService",  label: "Terms of Service", icon: "📋" },
              ].map(policy => (
                <div key={policy.name} className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <span>{policy.icon}</span> {policy.label}
                  </h2>
                  <Field label={`${policy.label} Content`} hint="Supports plain text. Displayed on the policy page.">
                    <textarea
                      name={policy.name}
                      value={(local as any)[policy.name]}
                      onChange={handleChange}
                      rows={8}
                      className={textareaCls}
                    />
                  </Field>
                </div>
              ))}
            </div>
          )}

          {/* ── SYSTEM ── */}
          {activeTab === "system" && (
            <div className="space-y-5">
              <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Shield size={18} className="text-red-500" /> System Controls
                </h2>
                <Toggle
                  name="maintenanceMode"
                  checked={local.maintenanceMode}
                  onChange={handleChange}
                  label="Maintenance Mode"
                  desc="Show a maintenance page to all non-admin users. Admin login still works."
                />
                <Toggle
                  name="allowRegistrations"
                  checked={local.allowRegistrations}
                  onChange={handleChange}
                  label="Allow New Registrations"
                  desc="When OFF, new customers cannot create accounts."
                />
                <Toggle
                  name="orderEmailNotifications"
                  checked={local.orderEmailNotifications}
                  onChange={handleChange}
                  label="Order Email Notifications"
                  desc="Send automated emails to customers when order status changes."
                />
              </div>

              <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Bell size={18} className="text-amber-500" /> Alert Thresholds
                </h2>
                <Field label="Low Stock Alert Threshold" hint="Products with stock at or below this number will trigger a dashboard alert">
                  <input type="number" name="lowStockThreshold" value={local.lowStockThreshold} onChange={handleChange} min={1} max={100} className={`${inputCls} max-w-xs`} />
                </Field>
              </div>

              {/* Danger Zone */}
              <div className="card bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-3">
                  ⚠️ Danger Zone
                </h2>
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  Reset all settings back to factory defaults. This cannot be undone.
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={15} /> Reset All Settings to Defaults
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

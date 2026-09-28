"use client";

import { useState, useEffect } from "react";
import { User, Phone, MapPin, Plus, Trash2, Edit2, Check, Loader2 } from "lucide-react";
import { getAvatarUrl } from "@/lib/utils";
import toast from "react-hot-toast";

import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { update } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    id: "", label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, addressRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/address")
      ]);
      
      if (profileRes.ok) setProfile(await profileRes.json());
      if (addressRes.ok) setAddresses(await addressRes.json());
    } catch (err) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "avatars");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setProfile({ ...profile, avatar: data.url });
        toast.success("Avatar uploaded. Click Save Changes to apply.");
      } else {
        toast.error(data.error || "Failed to upload avatar");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, phone: profile.phone, avatar: profile.avatar })
      });
      if (!res.ok) throw new Error("Failed to update profile");
      await update(); // Force NextAuth to reload session data from DB
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Could not save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const isEdit = !!addressFormData.id;
      const res = await fetch("/api/user/address", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressFormData)
      });
      
      if (!res.ok) throw new Error("Failed to save address");
      
      toast.success(isEdit ? "Address updated!" : "Address added!");
      setAddressFormOpen(false);
      fetchData(); // Reload addresses
    } catch (err) {
      toast.error("Could not save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/user/address?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Address deleted");
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      toast.error("Could not delete address");
    }
  };

  const openAddressForm = (addr?: any) => {
    if (addr) {
      setAddressFormData(addr);
    } else {
      setAddressFormData({ id: "", label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false });
    }
    setAddressFormOpen(true);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Loader2 className="animate-spin mx-auto mb-4" size={32} />
        Loading your settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Profile & Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account details and shipping addresses.</p>
      </div>

      {/* Personal Info */}
      <div className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <User size={18} className="text-primary-500" /> Personal Information
        </h2>
        
        <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 flex items-center gap-6 mb-2">
            <div className="relative w-20 h-20 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
              {profile?.avatar ? (
                <img src={getAvatarUrl(profile.avatar)!} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex gap-2">
                <label className={`btn-secondary text-sm cursor-pointer ${uploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                </label>
                {profile?.avatar && (
                  <button 
                    type="button" 
                    onClick={() => setProfile({ ...profile, avatar: null })}
                    className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 text-sm font-semibold transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">Recommended: Square image, max 5MB.</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
            <input 
              required type="text" 
              value={profile?.name || ""} 
              onChange={e => setProfile({...profile, name: e.target.value})} 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
            <input 
              type="email" 
              value={profile?.email || ""} 
              disabled 
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
            <input 
              type="tel" 
              value={profile?.phone || ""} 
              onChange={e => setProfile({...profile, phone: e.target.value})} 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" 
              placeholder="+91 9876543210"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" disabled={savingProfile} className="btn-primary w-full md:w-auto">
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Addresses */}
      <div className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin size={18} className="text-primary-500" /> Shipping Addresses
          </h2>
          <button onClick={() => openAddressForm()} className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1.5">
            <Plus size={16} /> Add New
          </button>
        </div>

        {addressFormOpen && (
          <form onSubmit={handleAddressSave} className="mb-8 p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
            <h3 className="md:col-span-2 font-bold text-slate-900 dark:text-white mb-2">
              {addressFormData.id ? "Edit Address" : "New Address"}
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Label (e.g. Home, Work)</label>
              <input required type="text" value={addressFormData.label} onChange={e => setAddressFormData({...addressFormData, label: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Address Line 1</label>
              <input required type="text" value={addressFormData.line1} onChange={e => setAddressFormData({...addressFormData, line1: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Address Line 2 (Optional)</label>
              <input type="text" value={addressFormData.line2} onChange={e => setAddressFormData({...addressFormData, line2: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">City</label>
              <input required type="text" value={addressFormData.city} onChange={e => setAddressFormData({...addressFormData, city: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">State</label>
              <input required type="text" value={addressFormData.state} onChange={e => setAddressFormData({...addressFormData, state: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Pincode</label>
              <input required type="text" value={addressFormData.pincode} onChange={e => setAddressFormData({...addressFormData, pincode: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-900" />
            </div>
            <div className="md:col-span-2 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={addressFormData.isDefault} onChange={e => setAddressFormData({...addressFormData, isDefault: e.target.checked})} className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                <span className="text-sm font-medium">Set as default address</span>
              </label>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setAddressFormOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
              <button type="submit" disabled={savingAddress} className="btn-primary py-2 px-6">
                {savingAddress ? "Saving..." : "Save Address"}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.length === 0 && !addressFormOpen && (
            <p className="text-slate-500 text-sm md:col-span-2">No addresses saved yet.</p>
          )}
          {addresses.map((addr) => (
            <div key={addr.id} className={`p-5 rounded-xl border ${addr.isDefault ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'} relative`}>
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Check size={12} /> Default
                </span>
              )}
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                {addr.label}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br/>
                {addr.city}, {addr.state} {addr.pincode}<br/>
                {addr.country}
              </p>
              <div className="flex items-center gap-4 border-t border-slate-200 dark:border-slate-800 pt-3">
                <button onClick={() => openAddressForm(addr)} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"><Edit2 size={12} /> Edit</button>
                <button onClick={() => deleteAddress(addr.id)} className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

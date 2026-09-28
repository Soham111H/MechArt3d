"use client";

import { useState, useEffect } from "react";
import { Shield, Key, Lock, Loader2, Monitor, Trash2, LogOut, Download, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SecurityPage() {
  const [loading, setLoading]         = useState(false);
  const [sessions, setSessions]       = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [exporting, setExporting]     = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch("/api/user/sessions");
      if (res.ok) setSessions(await res.json());
    } catch { /* ignore */ }
    finally { setSessionsLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) return toast.error("New passwords do not match");
    if (formData.newPassword.length < 8) return toast.error("Password must be at least 8 characters");

    setLoading(true);
    try {
      const res = await fetch("/api/user/security/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Password updated successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (id: string) => {
    try {
      const res = await fetch(`/api/user/sessions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success(id === "all" ? "All sessions revoked" : "Session revoked");
      fetchSessions();
    } catch {
      toast.error("Could not revoke session");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mechart3d-my-data.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported!");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Security & Privacy</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your password, active sessions, and personal data.</p>
      </div>

      {/* Change Password */}
      <div className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Key size={18} className="text-primary-500" /> Change Password
        </h2>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          {[
            { label: "Current Password", field: "currentPassword" },
            { label: "New Password",     field: "newPassword" },
            { label: "Confirm New Password", field: "confirmPassword" },
          ].map(({ label, field }) => (
            <div key={field} className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</label>
              <input
                required type="password"
                value={(formData as any)[field]}
                onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                autoComplete={field === "currentPassword" ? "current-password" : "new-password"}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
              {field === "newPassword" && <p className="text-xs text-slate-500">At least 8 characters with uppercase, lowercase, number, and symbol.</p>}
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2 mt-2">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Active Sessions */}
      <div className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Monitor size={18} className="text-primary-500" /> Active Sessions
          </h2>
          {sessions.length > 1 && (
            <button
              onClick={() => revokeSession("all")}
              className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <LogOut size={14} /> Revoke All Others
            </button>
          )}
        </div>

        {sessionsLoading ? (
          <div className="text-center py-8 text-slate-400"><Loader2 className="animate-spin mx-auto" size={24} /></div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Monitor size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">No tracked sessions yet. Sessions are recorded on each login.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between py-4 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                    <Monitor size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{s.deviceInfo || "Unknown Device"}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Clock size={11} />
                      Last active: {new Date(s.lastActive).toLocaleString()}
                      {s.ipAddress && ` • IP: ${s.ipAddress}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => revokeSession(s.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Status */}
      <div className="card p-6 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield size={18} className="text-green-500" /> Security Status
        </h2>
        <div className="space-y-3">
          {[
            "Passwords stored with bcrypt (industry standard)",
            "All data transmitted over HTTPS (TLS encrypted)",
            "Account lockout after 5 failed login attempts",
            "Per-device session tracking enabled",
          ].map(item => (
            <div key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle size={16} className="text-green-500 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

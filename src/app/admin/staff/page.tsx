"use client";

import { useEffect, useState } from "react";
import { Shield, Plus, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("STAFF");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStaff(data);
    } catch (error) {
      toast.error("Could not load staff");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add staff");
      }
      toast.success("Staff added/updated successfully");
      setShowModal(false);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      toast.success("Role updated");
      fetchStaff();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove staff access for ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove staff");
      toast.success("Staff access removed");
      fetchStaff();
    } catch (error) {
      toast.error("Failed to remove staff");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Shield className="text-primary-500" />
            Staff & Roles
          </h1>
          <p className="text-slate-500 mt-1">Manage team members and their admin privileges.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary whitespace-nowrap">
          <Plus size={18} /> Invite Staff
        </button>
      </div>

      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No staff found.
                  </td>
                </tr>
              ) : (
                staff.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{user.name || "Unknown"}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' :
                        'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'SUPER_ADMIN' && (
                        <div className="flex items-center justify-end gap-2">
                          <select 
                            className="input-base text-xs py-1"
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                          >
                            <option value="STAFF">STAFF</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <button 
                            onClick={() => handleRemove(user.id, user.name || user.email)}
                            className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove access"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Add Staff Member</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Email *</label>
                <input 
                  type="email" 
                  required 
                  className="input-base w-full p-2 border rounded-xl" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="input-base w-full p-2 border rounded-xl" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Role</label>
                <select 
                  className="input-base w-full p-2 border rounded-xl"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="STAFF">Staff (Limited access)</option>
                  <option value="ADMIN">Admin (Full access)</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

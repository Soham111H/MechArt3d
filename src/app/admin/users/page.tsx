"use client";

import { useEffect, useState } from "react";
import { Users, Search, ShieldAlert, CheckCircle, Ban, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Could not load users");
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (userId: string, currentBanned: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, banned: !currentBanned }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      toast.success(currentBanned ? "User unbanned" : "User banned");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !selectedRole) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, role: selectedRole }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update role");
      }
      toast.success("Role updated");
      setShowRoleModal(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="text-primary-500" />
            Customers
          </h1>
          <p className="text-slate-500 mt-1">Manage user accounts and roles.</p>
        </div>
      </div>

      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Orders</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {user.name || "Unknown"}
                          {user.deletedAt && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-md">
                              BANNED
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' :
                        user.role === 'STAFF' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                      {user._count?.orders || 0}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setSelectedRole(user.role);
                            setShowRoleModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-primary-500 bg-slate-50 hover:bg-primary-50 dark:bg-slate-800 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                          title="Change Role"
                        >
                          <Shield size={16} />
                        </button>
                        <button 
                          onClick={() => handleBanToggle(user.id, !!user.deletedAt)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.deletedAt 
                              ? 'text-green-500 hover:text-green-600 bg-green-50 dark:bg-green-500/10' 
                              : 'text-red-400 hover:text-red-500 bg-red-50 dark:bg-red-500/10'
                          }`}
                          title={user.deletedAt ? "Unban User" : "Ban User"}
                        >
                          {user.deletedAt ? <CheckCircle size={16} /> : <Ban size={16} />}
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

      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Change Role</h3>
            <p className="text-sm text-slate-500 mb-4">
              Update role for <strong>{selectedUser.name || selectedUser.email}</strong>.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Role</label>
                <select 
                  className="input-base w-full p-2 border rounded-xl"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="USER">USER</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button 
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleChangeRole}
                  className="btn-primary"
                >
                  Save Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

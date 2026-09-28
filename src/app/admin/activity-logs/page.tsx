"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Search, Download, RefreshCw, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import toast from "react-hot-toast";

const MODULES = ["", "SECURITY", "PRODUCTS", "ORDERS", "USERS", "SETTINGS", "ADMIN_ACTION"];

const ACTION_COLORS: Record<string, string> = {
  LOGIN_SUCCESS:              "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  LOGIN_FAILED:               "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  LOGIN_LOCKED:               "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  ADMIN_ACTION:               "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  PASSWORD_CHANGED:           "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  PAYMENT_SIGNATURE_MISMATCH: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-300",
  RATE_LIMIT_HIT:             "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  SUSPICIOUS_REQUEST:         "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  PERMISSION_DENIED:          "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};

export default function ActivityLogsPage() {
  const [logs, setLogs]     = useState<any[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [module_, setModule] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (search) params.set("search", search);
      if (module_) params.set("module", module_);
      const res = await fetch(`/api/admin/activity-logs?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error("Could not load logs");
    } finally {
      setLoading(false);
    }
  }, [page, search, module_]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format: "csv", limit: "10000" });
      if (search) params.set("search", search);
      if (module_) params.set("module", module_);
      const res = await fetch(`/api/admin/activity-logs?${params}`);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported!");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield size={22} className="text-primary-500" /> Activity Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">{total.toLocaleString()} events • Append-only security audit trail</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLogs} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
            <RefreshCw size={16} className={loading ? "animate-spin text-primary-500" : "text-slate-500"} />
          </button>
          <button onClick={handleExportCsv} disabled={exporting} className="btn-outline flex items-center gap-2 py-2">
            <Download size={16} /> {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search action, module, IP..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400 shrink-0" />
          <select
            value={module_} onChange={e => { setModule(e.target.value); setPage(1); }}
            className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
          >
            {MODULES.map(m => <option key={m} value={m}>{m || "All Modules"}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {["Timestamp", "User", "Action", "Module", "IP Address", "Details"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No logs found.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white text-xs">{log.user?.name ?? "—"}</p>
                      <p className="text-xs text-slate-400">{log.user?.email ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${ACTION_COLORS[log.action] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{log.module}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{log.ipAddress ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details).slice(0, 80) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Settings, Power, ShieldAlert, CheckCircle2, Terminal, Plus, X, Search } from "lucide-react";
import toast from "react-hot-toast";
import { navStructure } from "@/config/nav";

const BASE_ROUTES = [
  { path: "/products", label: "Products Catalog" },
  { path: "/instant-quote", label: "Instant Quote" },
  { path: "/cart", label: "Shopping Cart" },
  { path: "/checkout", label: "Checkout" },
  { path: "/contact", label: "Contact Us" },
  { path: "/about-us", label: "About Us" },
  { path: "/blog", label: "Blog" },
  { path: "/faq", label: "FAQ" },
  { path: "/search", label: "Global Search" },
];

export default function SystemOperationsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [disabledRoutes, setDisabledRoutes] = useState<string[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customRoute, setCustomRoute] = useState("");
  const [routeSearch, setRouteSearch] = useState("");

  const allAvailableRoutes = useMemo(() => {
    const routes = [...BASE_ROUTES];
    navStructure.forEach((item) => {
      if (item.href) {
        routes.push({ path: item.href, label: item.label });
      }
      if (item.items) {
        item.items.forEach((subItem: any) => {
          if (subItem.href) {
            routes.push({ path: subItem.href, label: subItem.label });
          }
        });
      }
    });
    // Deduplicate
    const unique = new Map();
    routes.forEach(r => unique.set(r.path, r));
    return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const filteredRoutes = allAvailableRoutes.filter(r => 
    r.label.toLowerCase().includes(routeSearch.toLowerCase()) || 
    r.path.toLowerCase().includes(routeSearch.toLowerCase())
  );

  useEffect(() => {
    Promise.allSettled([fetchSettings(), fetchErrors()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const fetchSettings = async () => {
    const res = await fetch("/api/admin/system");
    if (res.ok) {
      const data = await res.json();
      setMaintenanceMode(data.maintenanceMode);
      setDisabledRoutes(data.disabledRoutes || []);
    }
  };

  const fetchErrors = async () => {
    const res = await fetch("/api/admin/errors");
    if (res.ok) {
      setErrors(await res.json());
    }
  };

  const saveSettings = async (newMaintenance: boolean, newDisabled: string[]) => {
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenanceMode: newMaintenance, disabledRoutes: newDisabled }),
      });
      if (res.ok) {
        toast.success("System settings updated");
        setMaintenanceMode(newMaintenance);
        setDisabledRoutes(newDisabled);
      } else {
        toast.error("Failed to update settings");
      }
    } catch (e) {
      toast.error("Error saving settings");
    }
  };

  const toggleRoute = (path: string) => {
    const newRoutes = disabledRoutes.includes(path)
      ? disabledRoutes.filter((r) => r !== path)
      : [...disabledRoutes, path];
    saveSettings(maintenanceMode, newRoutes);
  };

  const handleAddCustomRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoute.trim()) return;
    
    let path = customRoute.trim();
    if (!path.startsWith('/')) path = '/' + path;

    if (disabledRoutes.includes(path)) {
      toast.error("Route is already disabled");
      return;
    }

    toggleRoute(path);
    setCustomRoute("");
  };

  const resolveError = async (id: string) => {
    try {
      const res = await fetch("/api/admin/errors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isResolved: true }),
      });
      if (res.ok) fetchErrors();
    } catch (e) {}
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-slate-500">Loading System Dashboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="text-red-500" size={32} />
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Emergency Operations Center</h1>
          <p className="text-slate-500">Super Admin system controls and error diagnostics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Toggle */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Power className={maintenanceMode ? "text-red-500" : "text-slate-400"} />
                Global Maintenance Mode
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                If enabled, all non-admin users will see a maintenance screen. You (Super Admin) can still browse and test the site normally to verify fixes.
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => saveSettings(!maintenanceMode, disabledRoutes)}
            className={`w-full py-6 mt-auto rounded-2xl font-black text-xl transition-all ${
              maintenanceMode 
                ? "bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20" 
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
            }`}
          >
            {maintenanceMode ? "DISABLE MAINTENANCE MODE" : "ENABLE MAINTENANCE MODE"}
          </button>
        </div>

        {/* Route Manager - Advanced */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-[600px]">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="text-primary-500" />
              Advanced Route Killswitches
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Selectively disable specific pages across the site. If a page is crashing, turn it off here to keep the rest of the site live.
            </p>
          </div>
          
          {/* Custom Route Adder */}
          <form onSubmit={handleAddCustomRoute} className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="e.g., /products/broken-slug" 
              value={customRoute}
              onChange={(e) => setCustomRoute(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
            />
            <button type="submit" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-primary-600 transition-colors">
              <Plus size={16} /> Disable Custom Path
            </button>
          </form>

          {/* Currently Disabled Custom Routes (that aren't in the base list) */}
          {disabledRoutes.filter(r => !allAvailableRoutes.some(ar => ar.path === r)).length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-xs font-bold text-red-500 uppercase">Custom Disabled Routes:</p>
              {disabledRoutes.filter(r => !allAvailableRoutes.some(ar => ar.path === r)).map(route => (
                 <div key={route} className="flex items-center justify-between p-2.5 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                 <div>
                   <span className="font-semibold text-red-700 dark:text-red-400 block text-sm">Custom Path</span>
                   <span className="text-xs text-red-500 font-mono">{route}</span>
                 </div>
                 <button 
                   onClick={() => toggleRoute(route)}
                   className="p-1.5 hover:bg-red-200 dark:hover:bg-red-800 rounded-md text-red-600 dark:text-red-300 transition-colors"
                 >
                   <X size={16} />
                 </button>
               </div>
              ))}
            </div>
          )}

          {/* Filter standard routes */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search site pages to disable..."
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {filteredRoutes.map((route) => {
              const isDisabled = disabledRoutes.includes(route.path);
              return (
                <div key={route.path} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  isDisabled ? "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                }`}>
                  <div>
                    <span className={`font-semibold block text-sm ${isDisabled ? "text-red-700 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>{route.label}</span>
                    <span className={`text-xs font-mono ${isDisabled ? "text-red-500" : "text-slate-400"}`}>{route.path}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isDisabled}
                      onChange={() => toggleRoute(route.path)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-red-500"></div>
                  </label>
                </div>
              );
            })}
            {filteredRoutes.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No pages found matching "{routeSearch}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Terminal className="text-slate-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Error Logs</h2>
        </div>

        {errors.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <CheckCircle2 size={40} className="mx-auto text-green-500 mb-2" />
            <p className="font-bold text-slate-900 dark:text-white">No errors logged!</p>
            <p className="text-sm text-slate-500">Your system is running smoothly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {errors.map((error) => (
              <div key={error.id} className={`p-4 rounded-xl border ${error.isResolved ? "bg-slate-50 border-slate-200 opacity-60 dark:bg-slate-800/50 dark:border-slate-700" : "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                      {new Date(error.createdAt).toLocaleString()} {error.path && `— Path: ${error.path}`}
                    </span>
                    <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">{error.message}</h3>
                    {error.stackTrace && (
                      <details className="text-xs font-mono bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto max-h-40 overflow-y-auto">
                        <summary className="cursor-pointer font-bold text-slate-500 mb-2">View Stack Trace</summary>
                        <pre className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{error.stackTrace}</pre>
                      </details>
                    )}
                  </div>
                  {!error.isResolved && (
                    <button 
                      onClick={() => resolveError(error.id)}
                      className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; role?: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close mobile sidebar when routing changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 lg:relative lg:translate-x-0 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Main column */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AdminHeader user={user} onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

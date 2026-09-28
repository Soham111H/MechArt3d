"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Star,
  Tag, BarChart2, Settings, LogOut, Box, MessageSquare,
  Layers, FileText, Megaphone, ChevronRight, Shield, ClipboardList,
  AlertTriangle,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/admin",            label: "Dashboard",      icon: LayoutDashboard },
      { href: "/admin/analytics",  label: "Analytics",      icon: BarChart2 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products",   label: "Products",       icon: Package },
      { href: "/admin/categories", label: "Categories",     icon: Layers },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders",     label: "Orders",         icon: ShoppingCart },
      { href: "/admin/coupons",    label: "Discounts",      icon: Tag },
      { href: "/admin/custom-requests", label: "Custom Jobs", icon: Box },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/admin/users",      label: "Customers",      icon: Users },
      { href: "/admin/reviews",    label: "Reviews",        icon: Star },
      { href: "/admin/messages",   label: "Messages",       icon: MessageSquare },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blog",       label: "Blog",           icon: FileText },
      { href: "/admin/banners",    label: "Banners",        icon: Megaphone },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/staff",           label: "Staff & Roles",   icon: Shield },
      { href: "/admin/activity-logs",   label: "Activity Logs",   icon: ClipboardList },
      { href: "/admin/settings",        label: "Settings",        icon: Settings },
      { href: "/admin/system",          label: "Operations",      icon: AlertTriangle },
    ],
  },
];

import { useSession } from "next-auth/react";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function AdminSidebar({
  collapsed, setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role as string | undefined;
  
  const { settings } = useSettingsStore();
  const [counts, setCounts] = useState({
    orders: 0,
    messages: 0,
    customRequests: 0,
    systemErrors: 0,
  });

  useEffect(() => {
    fetch('/api/admin/notifications')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setCounts(data);
      })
      .catch(() => {});
  }, []);

  // Filter groups based on role
  const filteredNavGroups = navGroups.map(group => {
    return {
      ...group,
      items: group.items.filter(item => {
        if (role === "STAFF") {
          const allowed = [
            "/admin/products", "/admin/categories", 
            "/admin/orders", "/admin/custom-requests", 
            "/admin/messages", "/admin/reviews"
          ];
          if (item.href !== "/admin" && !allowed.includes(item.href)) return false;
        }
        if (role === "ADMIN") {
          const blocked = [
            "/admin/system", "/admin/staff", 
            "/admin/settings", "/admin/activity-logs"
          ];
          if (blocked.includes(item.href)) return false;
        }
        return true;
      })
    };
  }).filter(group => group.items.length > 0);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300 z-30 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-700 to-primary-500 rounded-lg flex items-center justify-center shadow-glow shrink-0">
          <Box size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <p className="font-black text-slate-900 dark:text-white text-sm leading-tight truncate">{settings.storeName}</p>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight size={16} className={cn("transition-transform duration-300", !collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
        {filteredNavGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                let badgeCount = 0;
                if (item.href === "/admin/orders") badgeCount = counts.orders;
                if (item.href === "/admin/messages") badgeCount = counts.messages;
                if (item.href === "/admin/custom-requests") badgeCount = counts.customRequests;
                if (item.href === "/admin/system") badgeCount = counts.systemErrors;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                      isActive
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100",
                      collapsed && "justify-center"
                    )}
                  >
                    {isActive && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-600 rounded-r-full" />
                    )}
                    <div className="relative shrink-0">
                      <Icon size={18} className={cn(isActive ? "text-primary-600 dark:text-primary-400" : "")} />
                      {badgeCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse" />
                      )}
                    </div>
                    {!collapsed && (
                      <div className="flex-1 flex justify-between items-center truncate">
                        <span className="truncate">{item.label}</span>
                        {badgeCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className={cn("p-3 border-t border-slate-100 dark:border-slate-800", collapsed && "flex justify-center")}>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full",
            collapsed && "justify-center w-auto p-2.5"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
}

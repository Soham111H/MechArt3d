"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Heart, Shield, Settings, Gift, LogOut, PenTool } from "lucide-react";
import { cn, getAvatarUrl } from "@/lib/utils";
import { signOut } from "next-auth/react";

const links = [
  { href: "/account", label: "Overview", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/custom-requests", label: "Custom Requests", icon: PenTool },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/rewards", label: "Rewards", icon: Gift },
  { href: "/account/security", label: "Security", icon: Shield },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountSidebar({ user }: { user: { name?: string | null; email?: string | null; role?: string | null; avatar?: string | null } }) {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-72 shrink-0 gpu">
      <div className="card sticky top-24 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">

        {/* User Profile Header */}
        <div className="relative p-6 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent dark:from-primary-500/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-400 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg shadow-primary-500/20 mb-4 ring-4 ring-white dark:ring-slate-900 overflow-hidden">
              {user.avatar ? (
                <img src={getAvatarUrl(user.avatar)!} alt={user.name || "User"} className="w-full h-full object-cover" />
              ) : (
                user.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 tracking-tight">
              {user.name}
            </h3>
            <p className="text-sm text-slate-500 font-medium truncate w-full px-2">{user.email}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider">
              <Shield size={12} className="text-primary-500" />
              {user.role === "SUPER_ADMIN" ? "Super Admin" : user.role === "STAFF" ? "Staff" : "Member"}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/account"
                ? pathname === "/account"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl group relative transition-colors duration-150 ease-out",
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 dark:bg-primary-500 rounded-r-full" />
                )}
                <Icon size={18} className={cn(
                  "transition-transform duration-200 ease-out gpu",
                  isActive ? "scale-110 text-primary-600 dark:text-primary-400" : "group-hover:scale-110 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold rounded-xl text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors duration-150 ease-out active:scale-[0.98] gpu"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

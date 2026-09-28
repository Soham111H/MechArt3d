// src/components/layout/MobileMenu.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X, Box, ChevronDown, Home, ShoppingBag, Pencil, User, Heart, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui";
import { useSettingsStore, defaultSettings } from "@/store/useSettingsStore";
import { motion, AnimatePresence } from "framer-motion";
import { navStructure } from "@/config/nav";

export default function MobileMenu() {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { settings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const s = mounted ? settings : defaultSettings;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setExpandedItem(null);
  }, [pathname, setMobileMenuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const toggleExpand = (label: string) => {
    setExpandedItem(prev => prev === label ? null : label);
  };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 left-0 h-full w-[300px] z-50 bg-white dark:bg-slate-900 shadow-2xl lg:hidden overflow-y-auto"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-700 to-primary-500 rounded-xl flex items-center justify-center">
                  <Box size={14} className="text-white" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {s.storeName.split(" ")[0]}{" "}
                  <span className="text-primary-700 dark:text-primary-400">
                    {s.storeName.split(" ").slice(1).join(" ")}
                  </span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3">
              {/* Home link */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5",
                  pathname === "/"
                    ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Home size={16} />
                Home
              </Link>

              {/* Nav items */}
              {navStructure.map((nav) => (
                <div key={nav.label} className="mb-0.5">
                  {nav.type === "link" ? (
                    <Link
                      href={nav.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        isActive(nav.href)
                          ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <ShoppingBag size={16} />
                      {nav.label}
                    </Link>
                  ) : (
                    <>
                      {/* Expandable header */}
                      <button
                        onClick={() => toggleExpand(nav.label)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                          isActive(nav.href)
                            ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <ShoppingBag size={16} />
                          {nav.label}
                        </span>
                        <ChevronDown
                          size={14}
                          className={cn("transition-transform duration-200", expandedItem === nav.label && "rotate-180")}
                        />
                      </button>

                      {/* Expanded items */}
                      <AnimatePresence>
                        {expandedItem === nav.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 mt-1 border-l-2 border-primary-100 dark:border-primary-900/50 pl-3 space-y-0.5 pb-1">
                              {/* Parent link (View All) */}
                              <Link
                                href={nav.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                              >
                                View all {nav.label} →
                              </Link>
                              {nav.items.map((item) => (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    "flex flex-col px-3 py-2 rounded-lg text-sm transition-colors",
                                    isActive(item.href)
                                      ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400"
                                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                  )}
                                >
                                  <span className="font-medium">{item.label}</span>
                                  {item.description && (
                                    <span className="text-xs text-slate-400 mt-0.5">{item.description}</span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              ))}

              {/* Account section */}
              <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                  Account
                </p>
                {[
                  { href: "/account", label: "My Profile", icon: User },
                  { href: "/account/orders", label: "My Orders", icon: Layers },
                  { href: "/wishlist", label: "Wishlist", icon: Heart },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-5 p-4 bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl text-white">
                <p className="font-bold text-sm mb-1">Have a 3D File?</p>
                <p className="text-xs text-primary-100 mb-3">Upload your STL/OBJ and get an instant price!</p>
                <Link
                  href="/instant-quote"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-white text-primary-700 text-sm font-bold py-2 px-4 rounded-xl hover:bg-primary-50 transition-colors shadow-sm"
                >
                  Instant Quote →
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

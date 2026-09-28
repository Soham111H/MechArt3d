// src/components/layout/Navbar.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart, Heart, User, Search, Menu, X, Sun, Moon,
  ChevronDown, Box, ArrowRight, Zap
} from "lucide-react";
import { cn, getAvatarUrl } from "@/lib/utils";
import { useUIStore } from "@/store/ui";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useSettingsStore, defaultSettings } from "@/store/useSettingsStore";
import NotificationDropdown from "@/components/layout/NotificationDropdown";
import { navStructure } from "@/config/nav";
import { useDebounce } from "@/hooks/useDebounce";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useSettingsStore();
  const { isDarkMode, toggleDarkMode, toggleMobileMenu, toggleCart } = useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const [searchResults, setSearchResults] = useState<{products: any[], pages: any[]}>({ products: [], pages: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults({ products: [], pages: [] });
      setIsSearching(false);
      return;
    }
    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };
    fetchResults();
  }, [debouncedQuery]);

  const s = mounted ? settings : defaultSettings;
  const profileRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const rawCartCount = useCartStore((state) => state.getTotalItems());
  const cartCount = mounted ? rawCartCount : 0;
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  // Close everything on navigation
  useEffect(() => {
    setOpenMenu(null);
    setProfileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpenMenu(null); setProfileOpen(false); setSearchOpen(false); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleMouseEnter = useCallback((label: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setOpenMenu(label), 100);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setOpenMenu(null), 150);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled ? "glass shadow-md py-2" : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm py-3"
      )}
    >
      <nav
        ref={navRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3"
        aria-label="Main navigation"
      >
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-700 to-primary-500 rounded-xl flex items-center justify-center shadow-glow">
            <Box size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white hidden sm:block">
            {s.storeName.split(" ")[0]}{" "}
            <span className="text-primary-700 dark:text-primary-400">
              {s.storeName.split(" ").slice(1).join(" ")}
            </span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1">
          {navStructure.map((nav) => (
            <div
              key={nav.label}
              className="relative"
              onMouseEnter={() => nav.type !== "link" && handleMouseEnter(nav.label)}
              onMouseLeave={() => nav.type !== "link" && handleMouseLeave()}
            >
              <Link
                href={nav.href}
                onClick={() => nav.type === "link" && setOpenMenu(null)}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive(nav.href)
                    ? "text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                aria-haspopup={nav.type !== "link" ? "true" : undefined}
                aria-expanded={openMenu === nav.label}
              >
                {nav.label}
                {nav.type !== "link" && (
                  <ChevronDown
                    size={13}
                    className={cn("transition-transform duration-150", openMenu === nav.label && "rotate-180")}
                  />
                )}
              </Link>

              {/* ── MEGA MENU (Applications) ── */}
              <AnimatePresence>
                {nav.type === "mega" && openMenu === nav.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[680px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5 z-50"
                    onMouseEnter={() => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); }}
                    onMouseLeave={handleMouseLeave}
                  >
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">
                      Industries We Serve
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {nav.items.map((item) => {
                        const ItemIcon = (item as any).icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenMenu(null)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/30 group transition-colors"
                          >
                            {ItemIcon && (
                              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                                <ItemIcon size={15} className="text-primary-600 dark:text-primary-400" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-700 dark:group-hover:text-primary-400 leading-none mb-0.5">
                                {item.label}
                              </p>
                              <p className="text-xs text-slate-500 leading-tight line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-3">
                      <Link
                        href="/applications"
                        onClick={() => setOpenMenu(null)}
                        className="flex items-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800 px-1"
                      >
                        View All Applications <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── SIMPLE DROPDOWN (Products / Material Guide / Resources) ── */}
              <AnimatePresence>
                {nav.type === "dropdown" && openMenu === nav.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50"
                    onMouseEnter={() => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); }}
                    onMouseLeave={handleMouseLeave}
                  >
                    {nav.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenMenu(null)}
                        className={cn(
                          "flex flex-col px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mx-1 rounded-xl",
                          isActive(item.href) && "bg-primary-50 dark:bg-primary-950/30"
                        )}
                      >
                        <span className={cn(
                          "text-sm font-semibold",
                          isActive(item.href) ? "text-primary-700 dark:text-primary-400" : "text-slate-800 dark:text-slate-200"
                        )}>
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="text-xs text-slate-500 mt-0.5">{item.description}</span>
                        )}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Instant Quote CTA */}
          <Link
            href="/instant-quote"
            className="hidden sm:flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-3 py-1.5 rounded-lg mr-2 transition-colors shadow-sm shadow-primary-500/20"
          >
            <Zap size={14} className="fill-white/20" />
            Instant Quote
          </Link>

          {/* Search */}
          <div className="relative flex items-center justify-end w-9 h-9">
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  key="searchbox"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3 bg-white dark:bg-slate-900 rounded-2xl px-5 py-3 min-h-[52px] overflow-hidden z-50 shadow-[0_0_20px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-slate-800"
                  style={{ outline: 'none' }}
                >
                  <Search size={18} className="text-slate-400 shrink-0" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search anything..."
                    className="bg-transparent text-[16px] text-slate-900 dark:text-white outline-none focus:outline-none focus:ring-0 border-none w-full placeholder:text-slate-400"
                    style={{ outline: 'none', boxShadow: 'none' }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && query.trim()) {
                        router.push(`/search?q=${encodeURIComponent(query)}`);
                        setSearchOpen(false);
                        setQuery("");
                      }
                      if (e.key === "Escape") { setSearchOpen(false); setQuery(""); }
                    }}
                  />
                  <button onClick={() => { setSearchOpen(false); setQuery(""); }} aria-label="Close search" className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                    <X size={13} className="text-slate-500 shrink-0" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="searchbtn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className="absolute right-0 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Search size={17} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Search Dropdown */}
            <AnimatePresence>
              {searchOpen && query && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-[120%] right-0 mt-3 w-[380px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.15)] overflow-hidden z-50 flex flex-col max-h-[70vh] ring-1 ring-black/5 dark:ring-white/5"
                >
                  {isSearching ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-500 font-medium animate-pulse">Searching...</span>
                    </div>
                  ) : (
                    <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                      {searchResults.products.length === 0 && searchResults.pages.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                            <Search size={20} className="text-slate-400" />
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">No results found</p>
                          <p className="text-xs text-slate-500">We couldn't find anything matching "{query}"</p>
                        </div>
                      ) : (
                        <>
                          {searchResults.pages.length > 0 && (
                            <div className="mb-4">
                              <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-full h-px bg-slate-100 dark:bg-slate-800"></span>
                                Pages
                                <span className="w-full h-px bg-slate-100 dark:bg-slate-800"></span>
                              </div>
                              <div className="space-y-1">
                                {searchResults.pages.map(page => (
                                  <Link 
                                    key={page.href} 
                                    href={page.href} 
                                    onClick={() => {setSearchOpen(false); setQuery("");}} 
                                    className="group flex flex-col px-3 py-2.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{page.label}</span>
                                      <ArrowRight size={14} className="text-primary-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </div>
                                    {page.description && <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">{page.description}</span>}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                          {searchResults.products.length > 0 && (
                            <div>
                              <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-full h-px bg-slate-100 dark:bg-slate-800"></span>
                                Products
                                <span className="w-full h-px bg-slate-100 dark:bg-slate-800"></span>
                              </div>
                              <div className="space-y-1">
                                {searchResults.products.map(product => (
                                  <Link 
                                    key={product.id} 
                                    href={`/products/${product.slug}`} 
                                    onClick={() => {setSearchOpen(false); setQuery("");}} 
                                    className="group flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all"
                                  >
                                    {product.image ? (
                                      <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg shadow-sm group-hover:shadow transition-all shrink-0" />
                                    ) : (
                                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                                        <Box size={16} className="text-slate-400" />
                                      </div>
                                    )}
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{product.name}</span>
                                      <span className="text-xs text-slate-500 font-medium mt-0.5">{settings.currency} {product.price}</span>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  {/* Footer hint */}
                  <button 
                    onClick={() => {
                      if (query.trim()) {
                        router.push(`/search?q=${encodeURIComponent(query)}`);
                        setSearchOpen(false);
                        setQuery("");
                      }
                    }}
                    className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
                  >
                    <span>Press <kbd className="font-sans px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md shadow-sm text-[10px] font-bold text-slate-700 dark:text-slate-300">Enter</kbd> to see all results</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-50">Search</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={`Shopping cart (${cartCount} items)`}
            className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ShoppingCart size={17} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-scale-in">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Heart size={17} />
          </Link>

          {/* Notifications */}
          {session?.user && <NotificationDropdown />}

          {/* Dark mode */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mounted && isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Account */}
          {session?.user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={cn(
                  "flex items-center gap-1.5 p-1 rounded-full border transition-all",
                  profileOpen
                    ? "border-primary-500 ring-2 ring-primary-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-primary-400"
                )}
                aria-label="Account menu"
                aria-expanded={profileOpen}
              >
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden">
                  {(session.user as any)?.avatar ? (
                    <img src={getAvatarUrl((session.user as any).avatar)!} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    session.user.name?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.13 }}
                    className="absolute right-0 top-full pt-2 w-56 z-50"
                  >
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-2">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{session.user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                      </div>
                      {(session.user.role === "SUPER_ADMIN" || session.user.role === "STAFF" || session.user.role === "ADMIN") && (
                        <Link href="/admin" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-primary-700 dark:text-primary-400 font-semibold hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-xl">
                          Admin Dashboard
                        </Link>
                      )}
                      <Link href="/account" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                        <User size={14} /> My Profile
                      </Link>
                      <Link href="/account/orders" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                        <Box size={14} /> Orders
                      </Link>
                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                        <button
                          onClick={() => { setProfileOpen(false); signOut({ callbackUrl: "/" }); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-left"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/auth/login" aria-label="Login"
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <User size={17} />
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={toggleMobileMenu}
            aria-label="Open menu"
            className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={19} />
          </button>
        </div>
      </nav>
    </header>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package, Search, Filter, Box, PenTool, Zap, ArrowRight, X, Layers, Star
} from "lucide-react";
import toast from "react-hot-toast";
import WishlistButton from "@/components/ui/WishlistButton";
import FlashSaleBadge from "@/components/ui/FlashSaleBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || ""
  );
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error("Could not fetch categories:", err));
  }, []);

  // Sync category from URL if changed outside
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat !== null && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Fetch products whenever filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, sort, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (sort) params.append("sort", sort);
      if (selectedCategory) params.append("category", selectedCategory);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error("Could not load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (catVal: string) => {
    setSelectedCategory(catVal);
    const params = new URLSearchParams(window.location.search);
    if (catVal) {
      params.set("category", catVal);
    } else {
      params.delete("category");
    }
    const newUrl = params.toString() ? `/products?${params.toString()}` : "/products";
    router.replace(newUrl, { scroll: false });
  };

  const handleClearFilters = () => {
    setSearch("");
    setSort("newest");
    handleSelectCategory("");
  };

  const activeCategoryObj = categories.find(
    (c) => c.slug === selectedCategory || c.id === selectedCategory
  );
  const parentCategories = categories.filter((c) => !c.parentId);
  const activeParent = activeCategoryObj?.parentId
    ? categories.find((c) => c.id === activeCategoryObj.parentId)
    : activeCategoryObj;
  const subcategoriesForActive = activeParent
    ? categories.filter((c) => c.parentId === activeParent.id)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Breadcrumb items={[{ label: "Products" }]} className="mb-4" />
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3 animate-fade-in-up">
            Explore{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-400">
              {activeCategoryObj ? activeCategoryObj.name : "Products"}
            </span>
          </h1>
          <p
            className="text-lg text-slate-500 max-w-2xl animate-fade-in-up mb-8"
            style={{ animationDelay: "0.1s" }}
          >
            {activeCategoryObj?.description ||
              "Browse our catalogue by category, submit a custom brief, or get an instant price from your 3D file."}
          </p>

          {/* 3-choice cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                href: "/products",
                icon: Package,
                badge: "Browse",
                title: "By Category",
                desc: "Shop our ready-made 3D printed products",
                color: "bg-slate-900 text-white",
                active: true,
              },
              {
                href: "/custom-design",
                icon: PenTool,
                badge: "Custom",
                title: "Custom Design",
                desc: "Have an idea or sketch? We'll design & print it",
                color:
                  "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700",
                active: false,
              },
              {
                href: "/instant-quote",
                icon: Zap,
                badge: "Instant",
                title: "Instant Quote",
                desc: "Upload STL/OBJ and get a price estimate in seconds",
                color:
                  "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700",
                active: false,
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`group flex items-start gap-4 p-5 rounded-2xl transition-all hover:shadow-md ${card.color}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    card.active
                      ? "bg-white/20"
                      : "bg-primary-50 dark:bg-primary-950/30"
                  }`}
                >
                  <card.icon
                    size={20}
                    className={
                      card.active
                        ? "text-white"
                        : "text-primary-600 dark:text-primary-400"
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${
                      card.active ? "text-white/60" : "text-slate-400"
                    }`}
                  >
                    {card.badge}
                  </p>
                  <p
                    className={`font-black text-sm mb-1 ${
                      card.active ? "text-white" : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {card.title}
                  </p>
                  <p
                    className={`text-xs leading-snug ${
                      card.active ? "text-white/70" : "text-slate-500"
                    }`}
                  >
                    {card.desc}
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className={`shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform ${
                    card.active ? "text-white/50" : "text-slate-400"
                  }`}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Horizontal Category Pill Bar */}
        {categories.length > 0 && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => handleSelectCategory("")}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  !selectedCategory
                    ? "bg-primary-600 text-white shadow-sm shadow-primary-500/30"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary-400"
                }`}
              >
                All Categories
              </button>
              {parentCategories.map((cat) => {
                const isSelected =
                  selectedCategory === cat.slug ||
                  selectedCategory === cat.id ||
                  activeParent?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.slug || cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary-600 text-white shadow-sm shadow-primary-500/30"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary-400"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat._count?.products > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {cat._count.products}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Subcategories Row (when an active parent category has children) */}
            {activeParent && subcategoriesForActive.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 pl-2 scrollbar-none border-t border-slate-200 dark:border-slate-800/60 pt-2 bg-slate-100/60 dark:bg-slate-900/40 p-2 rounded-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                  {activeParent.name} Subcategories:
                </span>
                <button
                  onClick={() => handleSelectCategory(activeParent.slug || activeParent.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === activeParent.slug || selectedCategory === activeParent.id
                      ? "bg-primary-600 text-white font-bold shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  All {activeParent.name}
                </button>
                {subcategoriesForActive.map((sub) => {
                  const isSubSelected = selectedCategory === sub.slug || selectedCategory === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectCategory(sub.slug || sub.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                        isSubSelected
                          ? "bg-primary-600 text-white font-bold shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span>{sub.name}</span>
                      {sub._count?.products > 0 && (
                        <span className="text-[10px] opacity-80 font-mono">
                          ({sub._count.products})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center gap-2"
            >
              <Filter size={18} /> Filters
            </button>
            <div className="text-sm font-bold text-slate-500">
              {products.length} Products
            </div>
          </div>

          {/* Sidebar Filters */}
          <aside
            className={`lg:w-64 shrink-0 space-y-8 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            {/* Search */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Search
              </h3>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Find something..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                />
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-primary-500" /> Category
                  </h3>
                  {selectedCategory && (
                    <button
                      onClick={() => handleSelectCategory("")}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                  <button
                    type="button"
                    onClick={() => handleSelectCategory("")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                      !selectedCategory
                        ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium"
                    }`}
                  >
                    <span>All Categories</span>
                  </button>
                  {parentCategories.map((parent) => {
                    const isParentSelected =
                      selectedCategory === parent.slug || selectedCategory === parent.id;
                    const children = categories.filter((c) => c.parentId === parent.id);
                    const isChildSelected = children.some(
                      (c) => selectedCategory === c.slug || selectedCategory === c.id
                    );

                    return (
                      <div key={parent.id} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(parent.slug || parent.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                            isParentSelected
                              ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold"
                              : isChildSelected
                              ? "text-primary-600 dark:text-primary-400 font-semibold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium"
                          }`}
                        >
                          <span className="truncate">{parent.name}</span>
                          {parent._count?.products !== undefined && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                isParentSelected
                                  ? "bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-bold"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              }`}
                            >
                              {parent._count.products}
                            </span>
                          )}
                        </button>

                        {/* Indented child subcategories */}
                        {children.length > 0 && (
                          <div className="pl-4 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
                            {children.map((child) => {
                              const isSubSelected =
                                selectedCategory === child.slug || selectedCategory === child.id;
                              return (
                                <button
                                  key={child.id}
                                  type="button"
                                  onClick={() => handleSelectCategory(child.slug || child.id)}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                                    isSubSelected
                                      ? "bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold"
                                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                                  }`}
                                >
                                  <span className="truncate">↳ {child.name}</span>
                                  {child._count?.products !== undefined && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {child._count.products}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sort */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Sort By
              </h3>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm font-semibold"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Active Filters Summary / Reset */}
            {(selectedCategory || search) && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full btn-outline py-2 text-xs flex items-center justify-center gap-1.5 text-slate-500 hover:text-red-500"
                >
                  <X size={14} /> Clear All Filters
                </button>
              </div>
            )}
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {/* Active filter tags */}
            {(selectedCategory || search) && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Active Filters:
                </span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-bold border border-primary-200 dark:border-primary-800">
                    Category: {activeCategoryObj?.name || selectedCategory}
                    <button
                      onClick={() => handleSelectCategory("")}
                      className="hover:text-red-500 ml-1"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700">
                    Search: &ldquo;{search}&rdquo;
                    <button
                      onClick={() => setSearch("")}
                      className="hover:text-red-500 ml-1"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 animate-pulse"
                  >
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-1/3 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 px-4 card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Box size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Try adjusting your category, material filter, or search query.
                </p>
                <button onClick={handleClearFilters} className="mt-6 btn-outline">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => {
                  const primaryImage = product.images?.[0]?.url;

                  // Priority: Flash Sale -> Base Discount -> Base Price
                  const activeFlashSale = product.flashSales?.[0];
                  const hasRegularDiscount =
                    product.discountPrice != null &&
                    parseFloat(product.discountPrice) > 0;

                  let price = parseFloat(product.basePrice);
                  let originalPrice = null;

                  if (activeFlashSale) {
                    originalPrice = price;
                    price =
                      price *
                      (1 - parseFloat(activeFlashSale.discountPct) / 100);
                  } else if (hasRegularDiscount) {
                    originalPrice = price;
                    price = parseFloat(product.discountPrice);
                  }

                  const hasDiscount = originalPrice !== null;

                  return (
                    <Link
                      href={`/product/${product.slug}`}
                      key={product.id}
                      className="group gpu"
                    >
                      <div className="card h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all duration-300 flex flex-col">
                        {/* Image Container */}
                        <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                              <Package size={40} className="mb-2 opacity-50" />
                            </div>
                          )}

                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                            {activeFlashSale ? (
                              <FlashSaleBadge sale={activeFlashSale} compact />
                            ) : hasDiscount ? (
                              <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider rounded shadow-lg w-max">
                                Sale
                              </span>
                            ) : null}
                            {product.stock <= 5 && product.stock > 0 && (
                              <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider rounded shadow-lg w-max">
                                Low Stock
                              </span>
                            )}
                          </div>

                          {/* Wishlist Button */}
                          <div className="absolute top-3 right-3">
                            <WishlistButton productId={product.id} />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                          <p
                            onClick={(e) => {
                              if (product.category?.slug || product.category?.id) {
                                e.preventDefault();
                                handleSelectCategory(
                                  product.category.slug || product.category.id
                                );
                              }
                            }}
                            className="text-[11px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1.5 hover:underline cursor-pointer"
                          >
                            {product.category?.name || "Uncategorized"}
                          </p>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-primary-600 transition-colors">
                            {product.name}
                          </h3>

                          {/* Dynamic Rating with admin control */}
                          <div className="flex items-center gap-1.5 mb-3">
                            <div className="flex items-center text-amber-400">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  size={13}
                                  className={
                                    idx < Math.round(product.averageRating || 0)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200 dark:text-slate-700"
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {product.totalReviews > 0
                                ? `${product.averageRating} (${product.totalReviews})`
                                : "No reviews yet"}
                            </span>
                          </div>

                          <div className="mt-auto pt-4 flex items-center justify-between">
                            <div>
                              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                ₹
                                {price.toLocaleString("en-IN", {
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                              {hasDiscount && originalPrice && (
                                <span className="ml-2 text-sm text-slate-400 line-through font-medium">
                                  ₹
                                  {originalPrice.toLocaleString("en-IN", {
                                    maximumFractionDigits: 0,
                                  })}
                                </span>
                              )}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors text-slate-400">
                              <Box size={18} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductsCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}

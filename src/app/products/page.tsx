"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Search, SlidersHorizontal, ChevronDown, Filter, Box, PenTool, Zap, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import WishlistButton from "@/components/ui/WishlistButton";
import FlashSaleBadge from "@/components/ui/FlashSaleBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function ProductsCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [material, setMaterial] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sort, material]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (sort) params.append("sort", sort);
      if (material) params.append("material", material);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Breadcrumb items={[{ label: 'Products' }]} className="mb-4" />
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3 animate-fade-in-up">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-400">Products</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl animate-fade-in-up mb-8" style={{ animationDelay: '0.1s' }}>
            Browse our catalogue, submit a custom brief, or get an instant price from your 3D file.
          </p>

          {/* 3-choice cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                href: '/products',
                icon: Package,
                badge: 'Browse',
                title: 'By Category',
                desc: 'Shop our ready-made 3D printed products',
                color: 'bg-slate-900 text-white',
                active: true,
              },
              {
                href: '/custom-design',
                icon: PenTool,
                badge: 'Custom',
                title: 'Custom Design',
                desc: "Have an idea or sketch? We'll design & print it",
                color: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700',
                active: false,
              },
              {
                href: '/instant-quote',
                icon: Zap,
                badge: 'Instant',
                title: 'Instant Quote',
                desc: 'Upload STL/OBJ and get a price estimate in seconds',
                color: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700',
                active: false,
              },
            ].map(card => (
              <Link key={card.href} href={card.href}
                className={`group flex items-start gap-4 p-5 rounded-2xl transition-all hover:shadow-md ${card.color}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.active?'bg-white/20':'bg-primary-50 dark:bg-primary-950/30'}`}>
                  <card.icon size={20} className={card.active?'text-white':'text-primary-600 dark:text-primary-400'}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${card.active?'text-white/60':'text-slate-400'}`}>{card.badge}</p>
                  <p className={`font-black text-sm mb-1 ${card.active?'text-white':'text-slate-900 dark:text-white'}`}>{card.title}</p>
                  <p className={`text-xs leading-snug ${card.active?'text-white/70':'text-slate-500'}`}>{card.desc}</p>
                </div>
                <ArrowRight size={16} className={`shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform ${card.active?'text-white/50':'text-slate-400'}`}/>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center gap-2"
            >
              <Filter size={18} /> Filters
            </button>
            <div className="text-sm font-bold text-slate-500">{products.length} Products</div>
          </div>

          {/* Sidebar Filters */}
          <aside className={`lg:w-64 shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            
            {/* Search */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Find something..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Sort By</h3>
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

            {/* Materials */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Material</h3>
              <div className="space-y-2">
                {['', 'PLA', 'Resin', 'PETG', 'Carbon Fiber'].map((mat) => (
                  <label key={mat} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${material === mat ? 'bg-primary-500 border-primary-500' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 group-hover:border-primary-400'}`}>
                      {material === mat && <div className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${material === mat ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                      {mat || 'All Materials'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 animate-pulse">
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
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No products found</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your filters or search query to find what you're looking for.</p>
                <button onClick={() => {setSearch(""); setMaterial("");}} className="mt-6 btn-outline">Clear All Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product, i) => {
                  const primaryImage = product.images?.[0]?.url;
                  
                  // Priority: Flash Sale -> Base Discount -> Base Price
                  const activeFlashSale = product.flashSales?.[0];
                  const hasRegularDiscount = product.discountPrice != null && parseFloat(product.discountPrice) > 0;
                  
                  let price = parseFloat(product.basePrice);
                  let originalPrice = null;
                  
                  if (activeFlashSale) {
                    originalPrice = price;
                    price = price * (1 - parseFloat(activeFlashSale.discountPct) / 100);
                  } else if (hasRegularDiscount) {
                    originalPrice = price;
                    price = parseFloat(product.discountPrice);
                  }
                  
                  const hasDiscount = originalPrice !== null;
                  
                  return (
                    <Link href={`/product/${product.slug}`} key={product.id} className="group gpu">
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
                          <p className="text-[11px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1.5">
                            {product.category?.name || "Uncategorized"}
                          </p>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-primary-600 transition-colors">
                            {product.name}
                          </h3>
                          
                          <div className="mt-auto pt-4 flex items-center justify-between">
                            <div>
                              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">₹{price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                              {hasDiscount && originalPrice && (
                                <span className="ml-2 text-sm text-slate-400 line-through font-medium">₹{originalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
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

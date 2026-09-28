"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Search, Box } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { useSettingsStore } from "@/store/useSettingsStore";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { settings } = useSettingsStore();

  const [results, setResults] = useState<{ products: any[]; pages: any[] }>({ products: [], pages: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setResults(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 min-h-[60vh]">
      <FadeIn>
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Search Results
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            {query ? (
              <>Showing results for <span className="font-bold text-primary-600">"{query}"</span></>
            ) : (
              "Please enter a search query."
            )}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Searching...</p>
          </div>
        ) : (
          <div className="space-y-16">
            {!query ? (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <Search size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Start typing to search</h3>
              </div>
            ) : results.pages.length === 0 && results.products.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <Search size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No results found</h3>
                <p className="text-slate-500">We couldn't find anything matching "{query}". Try checking your spelling or using more general terms.</p>
              </div>
            ) : (
              <>
                {/* Pages Section */}
                {results.pages.length > 0 && (
                  <section>
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">Pages & Categories</h2>
                      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                      <span className="text-sm font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{results.pages.length}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.pages.map((page, i) => (
                        <Link 
                          key={i} 
                          href={page.href}
                          className="group flex flex-col p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl transition-all shadow-sm hover:shadow-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{page.label}</h3>
                            <ArrowRight size={18} className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                          </div>
                          {page.description && (
                            <p className="text-sm text-slate-500 line-clamp-2">{page.description}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Products Section */}
                {results.products.length > 0 && (
                  <section>
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">Products</h2>
                      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                      <span className="text-sm font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{results.products.length}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {results.products.map((product) => (
                        <Link 
                          key={product.id} 
                          href={`/products/${product.slug}`}
                          className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden transition-all hover:shadow-xl hover:border-primary-500"
                        >
                          <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Box size={40} className="text-slate-300 dark:text-slate-700" />
                              </div>
                            )}
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{product.name}</h3>
                            <div className="mt-auto pt-4 flex items-center justify-between">
                              <span className="text-lg font-black text-primary-600 dark:text-primary-400">
                                {settings.currency} {product.price.toLocaleString()}
                              </span>
                              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                <ArrowRight size={14} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}
      </FadeIn>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}

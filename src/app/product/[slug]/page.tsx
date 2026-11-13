"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Box, Check, Star, FileCode, Download, X, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Script from "next/script";
import { useCartStore } from "@/store/useCartStore";
import { useSettingsStore, defaultSettings } from "@/store/useSettingsStore";
import WishlistButton from "@/components/ui/WishlistButton";
import FlashSaleBadge from "@/components/ui/FlashSaleBadge";
import TieredPricingTable from "@/components/ui/TieredPricingTable";
import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/ui/Breadcrumb';

const ModelViewer = dynamic(() => import('@/components/3d/ModelViewer'), { ssr: false });



export default function ProductDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [show3D, setShow3D] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const addItem = useCartStore((state) => state.addItem);
  const { settings } = useSettingsStore();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Digital file purchase request
  const [showDigitalModal, setShowDigitalModal] = useState(false);
  const [digitalEmail, setDigitalEmail] = useState("");
  const [digitalName, setDigitalName] = useState("");
  const [digitalFormat, setDigitalFormat] = useState("STL");
  const [digitalNotes, setDigitalNotes] = useState("");
  const [submittingDigital, setSubmittingDigital] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        
        setProduct(data);
        if (data.images?.length > 0) setActiveImage(data.images[0].url);
        if (data.models?.length > 0) setActiveModel(data.models[0].modelUrl);
        if (data.variants?.length > 0) setSelectedVariant(data.variants[0]);
      } catch (error) {
        toast.error("Product not found");
        router.push("/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, router]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const activeFlashSale = product.flashSales?.[0];
    const hasRegularDiscount = product.discountPrice != null && parseFloat(product.discountPrice) > 0;
    let baseUnit = parseFloat(product.basePrice);
    if (activeFlashSale) {
      baseUnit = baseUnit * (1 - parseFloat(activeFlashSale.discountPct) / 100);
    } else if (hasRegularDiscount) {
      baseUnit = parseFloat(product.discountPrice);
    }
    const variantModifier = selectedVariant ? parseFloat(selectedVariant.priceModifier) : 0;
    const finalPrice = baseUnit + variantModifier;

    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: finalPrice,
      image: product.images?.[0]?.url || "",
      quantity: quantity,
      variantId: selectedVariant?.id,
      variantName: selectedVariant ? (selectedVariant.color || selectedVariant.size) : undefined,
      stock: product.stock,
      tiers: product.tieredPricing || []
    });

    toast.success(`Added ${quantity} to cart!`);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          body: reviewBody
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Review submitted! Waiting for approval.");
      setReviewTitle("");
      setReviewBody("");
      setReviewRating(5);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  const activeFlashSale = product.flashSales?.[0];
  const hasRegularDiscount = product.discountPrice != null && parseFloat(product.discountPrice) > 0;
  
  let basePrice = parseFloat(product.basePrice);
  let originalPrice = null;
  
  if (activeFlashSale) {
    originalPrice = basePrice;
    basePrice = basePrice * (1 - parseFloat(activeFlashSale.discountPct) / 100);
  } else if (hasRegularDiscount) {
    originalPrice = basePrice;
    basePrice = parseFloat(product.discountPrice);
  }
  
  const discountPrice = originalPrice !== null ? basePrice : null;
  const variantModifier = selectedVariant ? parseFloat(selectedVariant.priceModifier) : 0;
  const finalPrice = basePrice + variantModifier;

  const handleDigitalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!digitalEmail) return toast.error("Please enter your email");
    setSubmittingDigital(true);
    try {
      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Digital 3D File: ${product.name}`,
          description: `Requesting original 3D CAD/STL digital file for "${product.name}" (Slug: ${product.slug}).\nFormat: ${digitalFormat}\nUser Notes: ${digitalNotes || 'None'}`,
          requestType: "DIGITAL_FILE",
          email: digitalEmail,
          name: digitalName,
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request");
      toast.success("✅ Digital file request submitted! We will email you a quote shortly.");
      setShowDigitalModal(false);
      setDigitalNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmittingDigital(false);
    }
  };

  return (
    <>
      
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-24 animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb items={[{label:'Products',href:'/products'},{label:product.name}]} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            
            {/* Left: Media Gallery & 3D Viewer */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center group gpu">
                
                {show3D && activeModel ? (
                  <ModelViewer url={activeModel} />
                ) : activeImage ? (
                  <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Box size={64} className="text-slate-300" />
                )}

                {/* 3D Toggle Button */}
                {activeModel && (
                  <button 
                    onClick={() => setShow3D(!show3D)}
                    className="absolute bottom-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform border border-slate-200 dark:border-slate-800"
                  >
                    <Box size={16} className={show3D ? "text-primary-500" : "text-slate-500"} />
                    {show3D ? "View Photo" : "View 3D Model"}
                  </button>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {product.images?.map((img: any) => (
                  <button 
                    key={img.id} 
                    onClick={() => { setActiveImage(img.url); setShow3D(false); }}
                    className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${!show3D && activeImage === img.url ? 'border-primary-500' : 'border-transparent hover:border-slate-300'}`}
                  >
                    <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover bg-white" />
                  </button>
                ))}
                {product.models?.map((model: any) => (
                  <button 
                    key={model.id} 
                    onClick={() => { setActiveModel(model.modelUrl); setShow3D(true); }}
                    className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-500/10 transition-colors ${show3D && activeModel === model.modelUrl ? 'border-primary-500' : 'border-transparent hover:border-blue-200'}`}
                  >
                    <Box size={24} className="text-blue-500 mb-1" />
                    <span className="text-[9px] font-black uppercase text-blue-600">3D View</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="flex flex-col">
              <p className="text-sm font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">
                {product.category?.name || "Uncategorized"}
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < Math.round(product.averageRating || 0) ? "fill-amber-500" : "text-slate-300"} />
                  ))}
                  <span className="text-slate-600 font-semibold ml-1 text-sm">({product.totalReviews || 0} Reviews)</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <span className={`text-sm font-bold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <div className="mb-6 flex flex-col gap-2 items-start">
                {activeFlashSale && (
                  <FlashSaleBadge sale={activeFlashSale} />
                )}
                <div>
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">₹{finalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  {originalPrice && (
                    <span className="ml-3 text-lg text-slate-400 line-through font-medium">₹{(originalPrice + variantModifier).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  )}
                  <span className="block text-xs font-semibold text-slate-500 mt-1">Inclusive of all taxes</span>
                </div>
              </div>

              {/* Variants / Colors */}
              {product.variants?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    Color: 
                    <span className="text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-xs">
                      {selectedVariant?.color || 'Select an option'} 
                      {selectedVariant && parseFloat(selectedVariant.priceModifier) > 0 && ` (+₹${selectedVariant.priceModifier})`}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        title={v.color + (parseFloat(v.priceModifier) > 0 ? ` (+₹${v.priceModifier})` : '')}
                        className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center ${
                          selectedVariant?.id === v.id 
                            ? "border-primary-500 scale-110 shadow-md ring-2 ring-primary-500/20" 
                            : "border-slate-200 dark:border-slate-700 hover:scale-105 hover:border-slate-400"
                        }`}
                        style={{ backgroundColor: v.color?.toLowerCase().replace(/\s/g, '') }}
                      >
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Tiered Pricing */}
              <div className="mb-10 space-y-4">
                {product.tieredPricing?.length > 0 && (
                  <TieredPricingTable 
                    tiers={product.tieredPricing} 
                    basePrice={finalPrice} 
                    currentQty={quantity} 
                  />
                )}
                <div className="flex items-center gap-4 pb-10 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-14">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 text-slate-500 hover:text-slate-900 font-bold h-full">-</button>
                    <span className="w-8 text-center font-bold text-slate-900 dark:text-white">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-4 text-slate-500 hover:text-slate-900 font-bold h-full">+</button>
                  </div>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 btn-primary h-14 text-lg shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={20} />
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>

                  <WishlistButton
                    productId={product.id}
                    size={20}
                    className="w-14 h-14"
                  />
                </div>

                {/* Digital 3D CAD/STL File Purchase Request */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/70 dark:from-slate-900 dark:to-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCode size={18} className="text-primary-600 dark:text-primary-400" />
                      <p className="font-bold text-sm text-slate-900 dark:text-white">Need the 3D Print File (.STL / .CAD)?</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Request the original digital model file for your 3D printer. We will quote a price, and upon payment, email the file directly to you.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDigitalModal(true)}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700/60 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 text-primary-700 dark:text-primary-300 font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0"
                  >
                    <Download size={14} /> Request Digital File
                  </button>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <Check size={18} className="text-green-500" /> Material: {product.material || "PLA"}
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <Check size={18} className="text-green-500" /> Free shipping on orders above ₹{settings.freeShippingAbove.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <Check size={18} className="text-green-500" /> Cash on Delivery available
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <Check size={18} className="text-green-500" /> Secure packaging guaranteed
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Product Description</h3>
                <div 
                  className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-500 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }}
                />
              </div>

            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-20 max-w-5xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-16">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Customer Reviews</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                {product.reviews?.length > 0 ? (
                  product.reviews.map((review: any) => (
                    <div key={review.id} className="pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs uppercase">
                          {review.user?.name?.substring(0,2) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{review.user?.name || "Anonymous User"}</p>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={10} className={i < review.rating ? "fill-amber-500 text-amber-500" : "text-slate-300"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.title && <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{review.title}</h4>}
                      <p className="text-sm text-slate-600 dark:text-slate-400">{review.body}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl text-center">
                    <p className="text-slate-500 font-medium mb-1">No reviews yet.</p>
                    <p className="text-sm text-slate-400">Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>

              {/* Write Review Form */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm h-fit">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Write a Review</h3>
                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button 
                          key={star} 
                          type="button" 
                          onClick={() => setReviewRating(star)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star size={24} className={star <= reviewRating ? "fill-amber-500 text-amber-500" : "text-slate-300"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title</label>
                    <input 
                      type="text" 
                      required
                      value={reviewTitle}
                      onChange={e => setReviewTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" 
                      placeholder="Summarize your experience" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Review</label>
                    <textarea 
                      required
                      rows={4} 
                      value={reviewBody}
                      onChange={e => setReviewBody(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none text-sm" 
                      placeholder="What did you like or dislike?" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={submittingReview}
                    className="w-full btn-primary justify-center"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                  <p className="text-xs text-slate-500 text-center mt-3">Reviews are moderated before publishing.</p>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Digital File Request Modal */}
      {showDigitalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="text-primary-600 dark:text-primary-400" size={20} />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Request Digital 3D File
                </h3>
              </div>
              <button
                onClick={() => setShowDigitalModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDigitalRequest} className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                {activeImage ? (
                  <img src={activeImage} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-white" />
                ) : (
                  <Box size={24} className="text-slate-400" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{product.name}</p>
                  <p className="text-xs text-slate-500">Original 3D Printing Digital Model</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={digitalEmail}
                  onChange={e => setDigitalEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">We will send your quote &amp; download link to this email.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={digitalName}
                    onChange={e => setDigitalName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    File Format
                  </label>
                  <select
                    value={digitalFormat}
                    onChange={e => setDigitalFormat(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="STL">STL (.stl - 3D Printing)</option>
                    <option value="OBJ">OBJ (.obj - Mesh + Textures)</option>
                    <option value="STEP">STEP (.step - CAD Solid)</option>
                    <option value="3MF">3MF (.3mf - Multi-color)</option>
                    <option value="ALL">All Available Formats (ZIP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Special Notes or Requirements (Optional)
                </label>
                <textarea
                  value={digitalNotes}
                  onChange={e => setDigitalNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Intended 3D printer model, custom scale (e.g. 150%), or commercial licensing inquiries..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDigitalModal(false)}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDigital}
                  className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm"
                >
                  {submittingDigital ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
